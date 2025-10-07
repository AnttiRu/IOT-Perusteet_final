// Discord Webhook Integration
// Tehtävä 4 - IoT Discord Webhook and Dashboard

const axios = require('axios');
const config = require('./config');

class DiscordWebhook {
    constructor() {
        this.webhookUrl = config.DISCORD_WEBHOOK_URL;
        this.lastAlerts = new Map(); // Track last alert times to prevent spam
    }

    // Send a formatted message to Discord
    async sendMessage(embed) {
        // Skip if webhook URL is not properly configured
        if (!this.webhookUrl || this.webhookUrl.includes('YOUR_WEBHOOK_ID')) {
            console.log('Discord webhook not configured, skipping message');
            return null;
        }

        try {
            const payload = {
                username: config.WEBHOOK_SETTINGS.username,
                avatar_url: config.WEBHOOK_SETTINGS.avatar_url,
                embeds: [embed]
            };

            const response = await axios.post(this.webhookUrl, payload);
            console.log('Discord message sent successfully');
            return response.data;
        } catch (error) {
            console.error('Error sending Discord message:', error.message);
            // Don't throw error to prevent server crashes
            return null;
        }
    }

    // Create an embed for sensor data
    createSensorEmbed(sensorData, alertType = 'normal') {
        const { device_id, temperature, humidity, timestamp } = sensorData;
        
        const color = config.WEBHOOK_SETTINGS.embed_color[alertType];
        const title = alertType === 'normal' ? 
            '📊 New Sensor Data' : 
            alertType === 'warning' ? 
                '⚠️ Sensor Warning' : 
                '🚨 Sensor Alert';

        const embed = {
            title: title,
            color: color,
            timestamp: new Date(timestamp).toISOString(),
            fields: [
                {
                    name: '🔧 Device ID',
                    value: device_id,
                    inline: true
                },
                {
                    name: '🌡️ Temperature',
                    value: `${temperature}°C`,
                    inline: true
                },
                {
                    name: '💧 Humidity',
                    value: `${humidity}%`,
                    inline: true
                }
            ],
            footer: {
                text: 'IoT Sensor Network',
                icon_url: 'https://cdn-icons-png.flaticon.com/512/4213/4213938.png'
            }
        };

        // Add alert description if it's a warning or critical alert
        if (alertType !== 'normal') {
            const alerts = this.checkThresholds(temperature, humidity);
            if (alerts.length > 0) {
                embed.description = alerts.join('\n');
            }
        }

        return embed;
    }

    // Check if sensor values exceed thresholds
    checkThresholds(temperature, humidity) {
        const alerts = [];
        const tempConfig = config.SENSOR_CONFIG.temperature;
        const humidityConfig = config.SENSOR_CONFIG.humidity;

        if (temperature < tempConfig.min_threshold) {
            alerts.push(`🥶 Temperature too low: ${temperature}°C (min: ${tempConfig.min_threshold}°C)`);
        } else if (temperature > tempConfig.max_threshold) {
            alerts.push(`🔥 Temperature too high: ${temperature}°C (max: ${tempConfig.max_threshold}°C)`);
        }

        if (humidity < humidityConfig.min_threshold) {
            alerts.push(`🏜️ Humidity too low: ${humidity}% (min: ${humidityConfig.min_threshold}%)`);
        } else if (humidity > humidityConfig.max_threshold) {
            alerts.push(`💦 Humidity too high: ${humidity}% (max: ${humidityConfig.max_threshold}%)`);
        }

        return alerts;
    }

    // Determine alert type based on sensor values
    getAlertType(temperature, humidity) {
        const alerts = this.checkThresholds(temperature, humidity);
        
        if (alerts.length === 0) {
            return 'normal';
        }

        // Check for critical conditions
        const tempConfig = config.SENSOR_CONFIG.temperature;
        const humidityConfig = config.SENSOR_CONFIG.humidity;
        
        const tempCritical = temperature < (tempConfig.min_threshold - 5) || 
                           temperature > (tempConfig.max_threshold + 5);
        const humidityCritical = humidity < (humidityConfig.min_threshold - 10) || 
                               humidity > (humidityConfig.max_threshold + 10);

        if (tempCritical || humidityCritical) {
            return 'critical';
        }

        return 'warning';
    }

    // Send sensor data with appropriate alert level
    async sendSensorData(sensorData) {
        const { device_id, temperature, humidity } = sensorData;
        const alertType = this.getAlertType(temperature, humidity);
        
        // Check cooldown for alerts to prevent spam
        if (alertType !== 'normal') {
            const alertKey = `${device_id}_${alertType}`;
            const lastAlert = this.lastAlerts.get(alertKey);
            const now = Date.now();
            
            if (lastAlert && (now - lastAlert) < (config.ALERT_COOLDOWN * 1000)) {
                console.log(`Alert cooldown active for ${device_id}, skipping message`);
                return;
            }
            
            this.lastAlerts.set(alertKey, now);
        }

        const embed = this.createSensorEmbed(sensorData, alertType);
        return await this.sendMessage(embed);
    }

    // Send system status message
    async sendSystemStatus(message, type = 'normal') {
        const embed = {
            title: '🖥️ System Status',
            description: message,
            color: config.WEBHOOK_SETTINGS.embed_color[type],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'IoT Server System',
                icon_url: 'https://cdn-icons-png.flaticon.com/512/4213/4213938.png'
            }
        };

        return await this.sendMessage(embed);
    }

    // Send daily summary
    async sendDailySummary(stats) {
        const embed = {
            title: '📈 Daily Sensor Summary',
            color: config.WEBHOOK_SETTINGS.embed_color.normal,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: '📊 Total Readings',
                    value: stats.totalReadings.toString(),
                    inline: true
                },
                {
                    name: '🌡️ Avg Temperature',
                    value: `${stats.avgTemperature}°C`,
                    inline: true
                },
                {
                    name: '💧 Avg Humidity',
                    value: `${stats.avgHumidity}%`,
                    inline: true
                },
                {
                    name: '📊 Active Devices',
                    value: stats.activeDevices.toString(),
                    inline: true
                },
                {
                    name: '⚠️ Alerts Today',
                    value: stats.alertsToday.toString(),
                    inline: true
                },
                {
                    name: '🕐 Last Update',
                    value: new Date(stats.lastUpdate).toLocaleString(),
                    inline: true
                }
            ],
            footer: {
                text: 'Daily Summary Report',
                icon_url: 'https://cdn-icons-png.flaticon.com/512/4213/4213938.png'
            }
        };

        return await this.sendMessage(embed);
    }
}

module.exports = DiscordWebhook;