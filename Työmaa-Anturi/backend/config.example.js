// Configuration for Construction Site Monitor
// Työmaan Olosuhde-Anturi
// 
// EXAMPLE FILE - Copy to config.js and fill in your values

module.exports = {
    // Discord Webhook URL
    // Get your webhook URL from Discord:
    // Server Settings → Integrations → Webhooks → New Webhook
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN",
    
    // Server Configuration
    SERVER_PORT: process.env.PORT || 3000,
    
    // Pressure Thresholds (Pascal, relative to reference)
    // NOTE: In negative pressure rooms, MORE negative = BETTER
    // -30 Pa or less = GOOD (strong negative pressure)
    // -10 Pa = WARNING (weak negative pressure)
    // 0 Pa or more = CRITICAL (NO negative pressure - DANGER!)
    PRESSURE_THRESHOLDS: {
        good: -30.0,         // Pa (good negative pressure, no alerts)
        warning: -10.0,      // Pa (weak negative pressure, log and monitor)
        critical: 0.0,       // Pa (no negative pressure - ALERT!)
        unit: "Pa"
    },
    
    // Air Quality Thresholds (µg/m³)
    AIR_QUALITY_THRESHOLDS: {
        pm25: {
            warning: 35.0,   // µg/m³
            critical: 55.0,  // µg/m³
            unit: "µg/m³"
        },
        pm10: {
            warning: 50.0,   // µg/m³
            critical: 150.0, // µg/m³
            unit: "µg/m³"
        }
    },
    
    // Environment Thresholds
    ENVIRONMENT_THRESHOLDS: {
        temperature: {
            min: 15.0,       // °C
            max: 30.0,       // °C
            unit: "°C"
        },
        humidity: {
            min: 30.0,       // %
            max: 70.0,       // %
            unit: "%"
        }
    },
    
    // Webhook Settings
    WEBHOOK_SETTINGS: {
        bot_name: "Työmaa Anturi Bot",
        bot_avatar: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png"
    },
    
    // Alert Settings
    ALERT_COOLDOWN: process.env.ALERT_COOLDOWN || 300 // seconds (5 minutes)
};
