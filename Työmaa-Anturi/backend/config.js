// Configuration for Construction Site Monitor
// Työmaan Olosuhde-Anturi

module.exports = {
    // Discord Webhook URL
    // IMPORTANT: Use environment variable or replace with your webhook URL
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
    
    // Temperature & Humidity Thresholds
    ENVIRONMENT_THRESHOLDS: {
        temperature: {
            min_warning: 15.0,   // °C
            max_warning: 30.0,   // °C
            unit: "°C"
        },
        humidity: {
            min_warning: 30.0,   // %
            max_warning: 70.0,   // %
            unit: "%"
        }
    },
    
    // Discord Webhook Settings
    WEBHOOK_SETTINGS: {
        username: "Työmaa-Anturi Bot",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png",
        embed_color: {
            normal: 0x00ff00,      // Green
            warning: 0xffff00,     // Yellow
            critical: 0xff0000     // Red
        }
    },
    
    // Alert Settings
    ALERT_COOLDOWN: 300,  // 5 minutes between similar alerts
    
    // Data Retention (days)
    DATA_RETENTION_DAYS: 30
};