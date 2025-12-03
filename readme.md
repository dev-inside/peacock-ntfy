# Peacock ntfy-Plugin

A simple Peacock plugin that checks if the current version is installed when the server starts or when the user logs into "Hitman WOA." If the installed version of Peacock is up to date, a message is printed in the server log. If a new version is available, the plugin sends a notification to the chosen ntfy instance (f.a. https://ntfy.sh), so the user doesn't have to check manually!

## Installation

The installation process is straightforward. Unpack the files `ntfy-updates.js` and `ntfy-config.json` into the `plugins` folder.

Next, edit the `ntfy-config.json` file and add your ntfy instance:

```JSON
{
    "enabled": true,
    "server": "https://ntfy.sh",
    "topic": "<YOUR NTFY-TOPIC/URI>"
}
```

### Values
- `enabled` Enables/Disabled the plugin
- `server` Your ntfy-instance
- `topic` Your Topic/URI you're subscribed to

The examples uses the public instance, which you could use of course aswell. But you can of course set via `server` any ntfy-instance.

## Notification
If a new Version is available, the notification will look like this:

```
🚀 Peacock Update Available!
Current: 8.3.0
Latest: 8.4.0

Check the Discord for the latest release.
```
