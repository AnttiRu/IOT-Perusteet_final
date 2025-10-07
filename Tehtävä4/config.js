// Configuration file for IoT Discord Webhook Integration
// Tehtävä 4 - IoT Discord Webhook and Dashboard

module.exports = {
    // Discord Webhook URL - Replace with your actual webhook URL
    // To get a webhook URL:
    // 1. Go to your Discord server
    // 2. Right-click on the channel where you want to receive messages
    // 3. Select "Edit Channel" > "Integrations" > "Webhooks"
    // 4. Create a new webhook and copy the URL
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN",

    // IoT Sensor Configuration
    SENSOR_CONFIG: {
        temperature: {
            min_threshold: 15.0,  // °C
            max_threshold: 30.0,  // °C
            unit: "°C"
        },
        humidity: {
            min_threshold: 30.0,  // %
            max_threshold: 70.0,  // %
            unit: "%"
        },
        light: {
            min_threshold: 100,   // lux
            max_threshold: 1000,  // lux
            unit: "lux"
        }
    },

    // Webhook Message Settings
    WEBHOOK_SETTINGS: {
        username: "IoT Sensor Bot",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/4213/4213938.png",
        embed_color: {
            normal: 0x00ff00,    // Green
            warning: 0xffff00,   // Yellow
            critical: 0xff0000   // Red
        }
    },

    // Update intervals (seconds)
    MONITORING_INTERVAL: 30,  // How often to check sensors
    ALERT_COOLDOWN: 300       // Minimum time between similar alerts (5 minutes)
};