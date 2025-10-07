// Test Discord Webhook Integration
// Quick test script to verify webhook is working

const axios = require('axios');
const config = require('./config');

console.log('🔔 Testing Discord Webhook...\n');

// Test 1: Send a simple test message
async function sendTestMessage() {
    console.log('📤 Sending test message to Discord...');
    
    const embed = {
        title: '🏗️ Työmaan Olosuhde-Anturi - TEST',
        description: '✅ Discord webhook integraatio toimii!',
        color: 0x00FF00, // Green
        fields: [
            {
                name: '📡 Järjestelmä',
                value: 'Raspberry Pi Pico + Node.js Backend',
                inline: true
            },
            {
                name: '⚙️ Status',
                value: 'Webhook configured successfully',
                inline: true
            },
            {
                name: '🎯 Testitiedot',
                value: '• Paineanturi: BMP280 x4\n• Lämpötila: DHT22\n• Ilmanlaatu: PM2.5/PM10',
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Työmaan Olosuhde-Anturi',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'
        }
    };

    try {
        const response = await axios.post(config.DISCORD_WEBHOOK_URL, {
            username: 'Työmaa Anturi Bot',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
            embeds: [embed]
        });
        
        console.log('✅ Test message sent successfully!');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        return true;
    } catch (error) {
        console.log('❌ Failed to send test message');
        if (error.response) {
            console.log(`   Error: ${error.response.status} - ${error.response.statusText}`);
            console.log(`   Details: ${JSON.stringify(error.response.data)}`);
        } else {
            console.log(`   Error: ${error.message}`);
        }
        return false;
    }
}

// Test 2: Send a sample measurement with alert
async function sendSampleMeasurement() {
    console.log('\n📊 Sending sample measurement with warning alert...');
    
    const embed = {
        title: '⚠️ Työmaan Mittausdata - VAROITUS',
        description: 'Uusi mittaus vastaanotettu',
        color: 0xFFAA00, // Orange/Yellow for warning
        fields: [
            {
                name: '🌡️ Lämpötila (Puhdas)',
                value: '22.5°C',
                inline: true
            },
            {
                name: '💧 Kosteus (Puhdas)',
                value: '55.0%',
                inline: true
            },
            {
                name: '📊 Paine (Ref)',
                value: '1013.25 hPa',
                inline: true
            },
            {
                name: '🏢 Paineerot (vs. Puhdas)',
                value: '✅ **Osasto 1:** -45.0 Pa\n📝 **Osasto 2:** -25.0 Pa\n⚠️ **Osasto 3:** -8.0 Pa',
                inline: false
            },
            {
                name: '💨 Ilmanlaatu',
                value: '**PM2.5:** 25.5 µg/m³\n**PM10:** 38.2 µg/m³',
                inline: false
            },
            {
                name: '🚨 Hälytykset',
                value: '• Osasto 3: Varoitus - Heikko alipaine -8.0 Pa',
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Työmaan Olosuhde-Anturi',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'
        }
    };

    try {
        const response = await axios.post(config.DISCORD_WEBHOOK_URL, {
            username: 'Työmaa Anturi Bot',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
            embeds: [embed]
        });
        
        console.log('✅ Sample measurement sent successfully!');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        return true;
    } catch (error) {
        console.log('❌ Failed to send sample measurement');
        if (error.response) {
            console.log(`   Error: ${error.response.status} - ${error.response.statusText}`);
        } else {
            console.log(`   Error: ${error.message}`);
        }
        return false;
    }
}

// Test 3: Send critical alert example
async function sendCriticalAlert() {
    console.log('\n🚨 Sending critical alert example...');
    
    const embed = {
        title: '🚨 KRIITTINEN HÄLYTYS - Työmaa-Anturi',
        description: '**VÄLITÖN TOIMENPIDE VAADITAAN!**',
        color: 0xFF0000, // Red for critical
        fields: [
            {
                name: '🌡️ Lämpötila',
                value: '23.1°C',
                inline: true
            },
            {
                name: '💧 Kosteus',
                value: '58.3%',
                inline: true
            },
            {
                name: '📊 Referenssipaine',
                value: '1013.25 hPa',
                inline: true
            },
            {
                name: '🏢 Paineerot (vs. Puhdas)',
                value: '🚨 **Osasto 1:** +5.0 Pa ⚠️ EI ALIPAINETTA!\n🚨 **Osasto 2:** +2.0 Pa ⚠️ EI ALIPAINETTA!\n✅ **Osasto 3:** -35.0 Pa',
                inline: false
            },
            {
                name: '💨 Ilmanlaatu',
                value: '**PM2.5:** 28.5 µg/m³\n**PM10:** 42.0 µg/m³',
                inline: false
            },
            {
                name: '🚨 KRIITTISET HÄLYTYKSET',
                value: '• **Osasto 1:** KRIITTINEN - Ei alipainetta! +5.0 Pa\n• **Osasto 2:** KRIITTINEN - Ei alipainetta! +2.0 Pa\n\n⚠️ **PÖLY VOI LEVITÄ RAKENNUKSEEN!**',
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Työmaan Olosuhde-Anturi - TOIMENPITEITÄ VAADITAAN',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'
        }
    };

    try {
        const response = await axios.post(config.DISCORD_WEBHOOK_URL, {
            username: 'Työmaa Anturi Bot',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
            embeds: [embed]
        });
        
        console.log('✅ Critical alert sent successfully!');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        return true;
    } catch (error) {
        console.log('❌ Failed to send critical alert');
        if (error.response) {
            console.log(`   Error: ${error.response.status} - ${error.response.statusText}`);
        } else {
            console.log(`   Error: ${error.message}`);
        }
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('Webhook URL:', config.DISCORD_WEBHOOK_URL.substring(0, 50) + '...\n');
    
    const test1 = await sendTestMessage();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between messages
    
    const test2 = await sendSampleMeasurement();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const test3 = await sendCriticalAlert();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 WEBHOOK TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Test Message:        ${test1 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Sample Measurement:  ${test2 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Critical Alert:      ${test3 ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allPassed = test1 && test2 && test3;
    
    if (allPassed) {
        console.log('\n🎉 ALL TESTS PASSED! Discord webhook is working perfectly!');
        console.log('\n💡 Check your Discord channel for the test messages:');
        console.log('   https://discord.gg/F2NPsW5x5J');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the webhook URL in config.js');
    }
    
    console.log('='.repeat(60));
}

runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
