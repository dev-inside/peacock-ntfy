const { log, LogLevel } = require("@peacockproject/core/loggingInterop")  
const { PEACOCKVERSTRING } = require("@peacockproject/core/utils")  
const { readFileSync, existsSync } = require("fs")  
const { join } = require("path")  
  
let lastCheckTime = 0  
const CHECK_COOLDOWN = 14400  
  
function loadConfig() {  
    const configPath = join(process.cwd(), "plugins", "ntfy-config.json")  
      
    if (!existsSync(configPath)) {  
        log(LogLevel.ERROR, "ntfy-config.json not found! Please create it in plugins/ directory", "ntfy-plugin")  
        throw new Error("Configuration file required: plugins/ntfy-config.json")  
    }  
  
    try {  
        const configData = readFileSync(configPath, "utf-8")  
        const config = JSON.parse(configData)  
          
        if (!config.server || !config.topic) {  
            throw new Error("Config must include 'server' and 'topic' fields")  
        }  
          
        return config  
    } catch (error) {  
        log(LogLevel.ERROR, `Failed to load ntfy config: ${error}`, "ntfy-plugin")  
        throw error  
    }  
}  
  
async function checkUpdatesWithNotification(config) {  
    try {  
        const res = await fetch("https://backend.rdil.rocks/peacock/latest-version/data")  
        const data = await res.json()  
  
        const { compare } = require("@peacockproject/core/utils")  
        const current = compare(PEACOCKVERSTRING, data.id)  
        const isOutdated = current === -1  
  
        if (isOutdated) {  
            await sendNtfyNotification(  
                config,  
                "Peacock Update Available!",  
                `Current: ${PEACOCKVERSTRING}\nLatest: ${data.id}\n\nCheck the Discord for the latest release.`  
            )  
            log(LogLevel.INFO, `Update notification sent: ${data.id} available`, "ntfy-plugin")  
        } else {  
            log(LogLevel.DEBUG, "No update available", "ntfy-plugin")  
        }  
    } catch (error) {  
        log(LogLevel.ERROR, `Failed to check updates: ${error}`, "ntfy-plugin")  
    }  
}  
  
async function sendNtfyNotification(config, title, message) {  
    try {  
        const response = await fetch(`${config.server}/${config.topic}`, {  
            method: "POST",  
            headers: {  
                "Title": title,  
                "Priority": "high",  
                "Tags": "rocket",  
            },  
            body: message,  
        })  
  
        if (!response.ok) {  
            throw new Error(`ntfy.sh responded with ${response.status}`)  
        }  
          
        log(LogLevel.INFO, "ntfy notification sent successfully", "ntfy-plugin")  
    } catch (error) {  
        log(LogLevel.ERROR, `Failed to send ntfy notification: ${error}`, "ntfy-plugin")  
    }  
}  
  
module.exports = async function (controller) {  
    let config  
      
    try {  
        config = loadConfig()  
    } catch (error) {  
        log(LogLevel.WARN, "ntfy plugin failed to load - skipping", "ntfy-plugin")  
        return  
    }  
  
    if (!config.enabled) {  
        log(LogLevel.INFO, "ntfy update notifications disabled", "ntfy-plugin")  
        return  
    }  
  
    log(LogLevel.INFO, "Starting ntfy update notifications (triggered on game start)", "ntfy-plugin")  
  
    controller.hooks.onUserLogin.tap("ntfy-updates", async (gameVersion, userId) => {  
        const now = Date.now()  
          
        if (now - lastCheckTime > CHECK_COOLDOWN) {  
            lastCheckTime = now  
            log(LogLevel.DEBUG, `User ${userId} logged in - checking for updates`, "ntfy-plugin")  
            await checkUpdatesWithNotification(config)  
        } else {  
            log(LogLevel.DEBUG, `User ${userId} logged in - skipping update check (cooldown)`, "ntfy-plugin")  
        }  
    })  
  
    await checkUpdatesWithNotification(config)  
}