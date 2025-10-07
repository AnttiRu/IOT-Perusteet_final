// Simple Tests for IoT System Components
// Tests that don't require server connection

const fs = require('fs');
const path = require('path');

console.log('\n🧪 Running Simple Component Tests...\n');

let passedTests = 0;
let totalTests = 0;

function test(name, condition, message) {
    totalTests++;
    if (condition) {
        console.log(`✅ ${name}: ${message}`);
        passedTests++;
    } else {
        console.log(`❌ ${name}: ${message}`);
    }
}

// Test 1: Check all required files exist
console.log('📁 Testing File Structure...');
test('Server File', fs.existsSync('server.js'), 'server.js exists');
test('Webhook File', fs.existsSync('webhook.js'), 'webhook.js exists');
test('Config File', fs.existsSync('config.js'), 'config.js exists');
test('Package File', fs.existsSync('package.json'), 'package.json exists');
test('HTML File', fs.existsSync('public/index.html'), 'public/index.html exists');
test('CSS File', fs.existsSync('public/styles.css'), 'public/styles.css exists');
test('JS File', fs.existsSync('public/dashboard.js'), 'public/dashboard.js exists');
test('README File', fs.existsSync('README.md'), 'README.md exists');

// Test 2: Check file sizes (not empty)
console.log('\n📏 Testing File Sizes...');
const files = [
    'server.js', 'webhook.js', 'config.js', 'package.json',
    'public/index.html', 'public/styles.css', 'public/dashboard.js', 'README.md'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        const size = fs.statSync(file).size;
        test(`${file} Size`, size > 100, `${size} bytes (>100 bytes expected)`);
    } else {
        test(`${file} Size`, false, 'File not found');
    }
});

// Test 3: Test webhook module functionality
console.log('\n🔗 Testing Webhook Module...');
try {
    const DiscordWebhook = require('./webhook');
    test('Webhook Import', true, 'Webhook module imports successfully');
    
    const webhook = new DiscordWebhook();
    test('Webhook Creation', true, 'Webhook instance created');
    
    // Test creating an embed
    const testData = {
        device_id: 'test_device',
        temperature: 25.0,
        humidity: 60.0,
        timestamp: new Date().toISOString()
    };
    
    const embed = webhook.createSensorEmbed(testData, 'normal');
    test('Embed Creation', embed && embed.title && embed.fields, 'Can create sensor embed');
    
    // Test threshold checking
    const alerts = webhook.checkThresholds(35, 80); // Should trigger alerts
    test('Threshold Check', alerts.length > 0, `Detects ${alerts.length} threshold violations`);
    
    const alertType = webhook.getAlertType(35, 80);
    test('Alert Type', alertType === 'warning' || alertType === 'critical', `Returns alert type: ${alertType}`);
    
} catch (error) {
    test('Webhook Module', false, `Error: ${error.message}`);
}

// Test 4: Test config module
console.log('\n⚙️ Testing Configuration...');
try {
    const config = require('./config');
    test('Config Import', true, 'Config module imports successfully');
    test('Config Structure', config.SENSOR_CONFIG && config.WEBHOOK_SETTINGS, 'Has required config sections');
    test('Temperature Config', config.SENSOR_CONFIG.temperature && config.SENSOR_CONFIG.temperature.min_threshold, 'Temperature thresholds configured');
    test('Humidity Config', config.SENSOR_CONFIG.humidity && config.SENSOR_CONFIG.humidity.min_threshold, 'Humidity thresholds configured');
    test('Discord Config', config.DISCORD_WEBHOOK_URL, 'Discord webhook URL configured');
} catch (error) {
    test('Config Module', false, `Error: ${error.message}`);
}

// Test 5: Test package.json dependencies
console.log('\n📦 Testing Dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    test('Package JSON', true, 'package.json is valid JSON');
    
    const requiredDeps = ['express', 'sqlite3', 'axios', 'cors', 'socket.io'];
    requiredDeps.forEach(dep => {
        test(`Dependency ${dep}`, packageJson.dependencies && packageJson.dependencies[dep], 
             packageJson.dependencies[dep] ? `Version: ${packageJson.dependencies[dep]}` : 'Missing');
    });
} catch (error) {
    test('Package JSON', false, `Error: ${error.message}`);
}

// Test 6: Check if node_modules exists (dependencies installed)
console.log('\n🔧 Testing Installation...');
test('Node Modules', fs.existsSync('node_modules'), 'node_modules directory exists (dependencies installed)');

if (fs.existsSync('node_modules')) {
    const requiredModules = ['express', 'sqlite3', 'axios', 'cors', 'socket.io'];
    requiredModules.forEach(module => {
        test(`Module ${module}`, fs.existsSync(path.join('node_modules', module)), `${module} installed`);
    });
}

// Test 7: Test HTML content structure
console.log('\n🌐 Testing HTML Structure...');
try {
    if (fs.existsSync('public/index.html')) {
        const htmlContent = fs.readFileSync('public/index.html', 'utf8');
        test('HTML Chart.js', htmlContent.includes('chart.js'), 'Chart.js library included');
        test('HTML Socket.io', htmlContent.includes('socket.io'), 'Socket.io client included');
        test('HTML Dashboard', htmlContent.includes('Dashboard'), 'Contains dashboard elements');
        test('HTML Canvas', htmlContent.includes('<canvas'), 'Has canvas elements for charts');
    }
} catch (error) {
    test('HTML Content', false, `Error reading HTML: ${error.message}`);
}

// Test 8: Test CSS structure
console.log('\n🎨 Testing CSS Structure...');
try {
    if (fs.existsSync('public/styles.css')) {
        const cssContent = fs.readFileSync('public/styles.css', 'utf8');
        test('CSS Responsive', cssContent.includes('@media'), 'Contains responsive design rules');
        test('CSS Grid', cssContent.includes('grid'), 'Uses CSS Grid layout');
        test('CSS Flexbox', cssContent.includes('flex'), 'Uses Flexbox layout');
        test('CSS Animations', cssContent.includes('animation') || cssContent.includes('transition'), 'Has animations/transitions');
    }
} catch (error) {
    test('CSS Content', false, `Error reading CSS: ${error.message}`);
}

// Print final summary
console.log('\n' + '='.repeat(60));
console.log('📊 COMPONENT TEST SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}`);
console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
    console.log('\n🎉 ALL COMPONENT TESTS PASSED!');
    console.log('✨ System components are properly structured and functional.');
} else if (passedTests / totalTests >= 0.8) {
    console.log('\n🟢 MOSTLY WORKING!');
    console.log('✨ Most components are working. Minor issues detected.');
} else {
    console.log('\n🟡 PARTIAL SUCCESS');
    console.log('⚠️  Some components need attention. Check failed tests above.');
}

console.log('\n💡 To test server functionality:');
console.log('   1. Start server: node server.js');
console.log('   2. Open browser: http://localhost:3000');
console.log('   3. Test API manually with Postman or curl');
console.log('\n✅ Component testing completed!');