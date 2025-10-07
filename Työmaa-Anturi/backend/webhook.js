// Discord Webhook Integration for Construction Site Monitor
const axios = require('axios');
const config = require('./config');

class ConstructionSiteWebhook {
    constructor() {
        this.webhookUrl = config.DISCORD_WEBHOOK_URL;
        this.lastAlerts = new Map();
    }

    // Send formatted message to Discord
    async sendMessage(embed) {
        if (!this.webhookUrl || this.webhookUrl.includes('YOUR_WEBHOOK')) {
            console.log('Discord webhook not configured, skipping message');
            return null;
        }

        try {
            const payload = {
                username: config.WEBHOOK_SETTINGS.username,
                avatar_url: config.WEBHOOK_SETTINGS.avatar_url,
                embeds: [embed]
            };

            await axios.post(this.webhookUrl, payload);
            console.log('✅ Discord message sent');
            return true;
        } catch (error) {
            console.error('❌ Discord webhook error:', error.message);
            return null;
        }
    }

    // Create embed for measurement data
    createMeasurementEmbed(data, alertLevel = 'normal') {
        const color = config.WEBHOOK_SETTINGS.embed_color[alertLevel];
        const title = alertLevel === 'normal' ? 
            '📊 Työmaa-Anturi Mittaus' : 
            alertLevel === 'warning' ? 
                '⚠️ VAROITUS - Työmaa-Anturi' : 
                '🚨 KRIITTINEN HÄLYTYS - Työmaa-Anturi';

        const fields = [
            {
                name: '🏭 Laite',
                value: data.device_id,
                inline: true
            },
            {
                name: '📅 Aika',
                value: new Date(data.timestamp * 1000).toLocaleString('fi-FI'),
                inline: true
            },
            {
                name: '⠀', // Empty field for spacing
                value: '⠀',
                inline: false
            },
            {
                name: '🌡️ Lämpötila (Puhdas)',
                value: `${data.reference.temperature.toFixed(1)}°C`,
                inline: true
            },
            {
                name: '💧 Kosteus (Puhdas)',
                value: `${data.reference.humidity.toFixed(1)}%`,
                inline: true
            },
            {
                name: '📊 Paine (Ref)',
                value: `${(data.reference.pressure / 100).toFixed(2)} hPa`,
                inline: true
            }
        ];

        // Add pressure differences with status indicators
        // Logic: More negative = Better (stronger negative pressure)
        // >= 0 Pa = CRITICAL (no negative pressure)
        // >= -10 Pa = WARNING (weak negative pressure)
        // < -30 Pa = GOOD (strong negative pressure)
        const pressureInfo = [];
        const formatPressureDiff = (diff) => {
            let icon = '✅'; // Good (strong negative pressure)
            if (diff >= 0) {
                icon = '🚨'; // Critical (no negative pressure!)
            } else if (diff >= -10) {
                icon = '⚠️'; // Warning (weak negative pressure)
            } else if (diff >= -30) {
                icon = '📝'; // Monitor (moderate negative pressure)
            }
            return `${icon} ${diff >= 0 ? '+' : ''}${diff.toFixed(1)} Pa`;
        };
        
        if (data.rooms.room1) {
            pressureInfo.push(`**Osasto 1:** ${formatPressureDiff(data.rooms.room1.diff)}`);
        }
        if (data.rooms.room2) {
            pressureInfo.push(`**Osasto 2:** ${formatPressureDiff(data.rooms.room2.diff)}`);
        }
        if (data.rooms.room3) {
            pressureInfo.push(`**Osasto 3:** ${formatPressureDiff(data.rooms.room3.diff)}`);
        }

        fields.push({
            name: '🏢 Paineerot (vs. Puhdas)',
            value: pressureInfo.join('\n') || 'Ei dataa',
            inline: false
        });

        // Add air quality
        if (data.air_quality) {
            fields.push({
                name: '💨 Ilmanlaatu',
                value: `**PM2.5:** ${data.air_quality.pm25.toFixed(1)} µg/m³\n**PM10:** ${data.air_quality.pm10.toFixed(1)} µg/m³`,
                inline: false
            });
        }

        // Add alerts if any
        if (data.alerts && data.alerts.length > 0) {
            fields.push({
                name: '🚨 Hälytykset',
                value: data.alerts.map(a => `• ${a}`).join('\n'),
                inline: false
            });
        }

        const embed = {
            title: title,
            color: color,
            timestamp: new Date().toISOString(),
            fields: fields,
            footer: {
                text: 'Työmaan Olosuhde-Anturi',
                icon_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'
            }
        };

        return embed;
    }

    // Send measurement data with appropriate alert level
    async sendMeasurementData(data) {
        const alertLevel = data.alert_level || 'normal';
        
        // Check cooldown for alerts
        if (alertLevel !== 'normal') {
            const alertKey = `${data.device_id}_${alertLevel}`;
            const lastAlert = this.lastAlerts.get(alertKey);
            const now = Date.now();
            
            if (lastAlert && (now - lastAlert) < (config.ALERT_COOLDOWN * 1000)) {
                console.log(`⏱️ Alert cooldown active for ${data.device_id}`);
                return null;
            }
            
            this.lastAlerts.set(alertKey, now);
        }

        const embed = this.createMeasurementEmbed(data, alertLevel);
        return await this.sendMessage(embed);
    }

    // Send system status message
    async sendSystemStatus(message, type = 'normal') {
        const embed = {
            title: '🖥️ Järjestelmätila',
            description: message,
            color: config.WEBHOOK_SETTINGS.embed_color[type],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Työmaa-Anturi System',
                icon_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'
            }
        };

        return await this.sendMessage(embed);
    }

    // Send daily summary
    async sendDailySummary(stats) {
        const embed = {
            title: '📈 Päiväraportti - Työmaa-Anturi',
            color: config.WEBHOOK_SETTINGS.embed_color.normal,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: '📊 Mittaukset',
                    value: `${stats.totalMeasurements} kpl`,
                    inline: true
                },
                {
                    name: '⚠️ Varoitukset',
                    value: `${stats.warnings} kpl`,
                    inline: true
                },
                {
                    name: '🚨 Kriittiset',
                    value: `${stats.critical} kpl`,
                    inline: true
                },
                {
                    name: '🌡️ Keskim. Lämpötila',
                    value: `${stats.avgTemperature}°C`,
                    inline: true
                },
                {
                    name: '💧 Keskim. Kosteus',
                    value: `${stats.avgHumidity}%`,
                    inline: true
                },
                {
                    name: '📉 Suurin Alipaine',
                    value: `${stats.maxPressureDiff} Pa`,
                    inline: true
                },
                {
                    name: '💨 Max PM2.5',
                    value: `${stats.maxPM25} µg/m³`,
                    inline: true
                },
                {
                    name: '💨 Max PM10',
                    value: `${stats.maxPM10} µg/m³`,
                    inline: true
                },
                {
                    name: '🕐 Raportti luotu',
                    value: new Date().toLocaleString('fi-FI'),
                    inline: false
                }
            ],
            footer: {
                text: 'Päiväraportti',
                icon_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'
            }
        };

        return await this.sendMessage(embed);
    }
}

module.exports = ConstructionSiteWebhook;