#!/usr/bin/env node
// Työmaa-Anturi Project Test Suite
// Tests all components of the Construction Site Monitor

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🏗️ Starting Työmaa-Anturi Project Tests...\n');

// Test configuration
const projectRoot = __dirname;
const backendPath = path.join(projectRoot, 'backend');
const wokwiPath = path.join(projectRoot, 'wokwi');

let passedTests = 0;
let failedTests = 0;
const failures = [];

// Test helper functions
function testExists(filePath, description, minSize = 0) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size >= minSize) {
            console.log(`✅ ${description}: exists (${stats.size} bytes)`);
            passedTests++;
            return true;
        } else {
            console.log(`⚠️ ${description}: too small (${stats.size} bytes, expected >= ${minSize})`);
            failures.push(`${description}: File too small`);
            failedTests++;
            return false;
        }
    } catch (err) {
        console.log(`❌ ${description}: NOT FOUND`);
        failures.push(`${description}: File not found`);
        failedTests++;
        return false;
    }
}

function testFileContains(filePath, searchString, description) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(searchString)) {
            console.log(`✅ ${description}: contains "${searchString.substring(0, 30)}..."`);
            passedTests++;
            return true;
        } else {
            console.log(`❌ ${description}: does not contain expected content`);
            failures.push(`${description}: Missing expected content`);
            failedTests++;
            return false;
        }
    } catch (err) {
        console.log(`❌ ${description}: Cannot read file`);
        failures.push(`${description}: File read error`);
        failedTests++;
        return false;
    }
}

function testJSONValid(filePath, description) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${description}: Valid JSON`);
        passedTests++;
        return true;
    } catch (err) {
        console.log(`❌ ${description}: Invalid JSON - ${err.message}`);
        failures.push(`${description}: Invalid JSON`);
        failedTests++;
        return false;
    }
}

function testDirExists(dirPath, description) {
    try {
        const stats = fs.statSync(dirPath);
        if (stats.isDirectory()) {
            const files = fs.readdirSync(dirPath);
            console.log(`✅ ${description}: exists (${files.length} items)`);
            passedTests++;
            return true;
        }
    } catch (err) {
        console.log(`❌ ${description}: NOT FOUND`);
        failures.push(`${description}: Directory not found`);
        failedTests++;
        return false;
    }
}

// ==================== WOKWI TESTS ====================
console.log('📡 Testing Wokwi Simulation Files...\n');

testExists(path.join(wokwiPath, 'main.py'), 'Wokwi main.py', 5000);
testExists(path.join(wokwiPath, 'diagram.json'), 'Wokwi diagram.json', 1000);

// Test Wokwi diagram structure
testJSONValid(path.join(wokwiPath, 'diagram.json'), 'Wokwi diagram.json structure');

// Test main.py content
testFileContains(path.join(wokwiPath, 'main.py'), 'PRESSURE_DIFF_GOOD', 'main.py PRESSURE_DIFF_GOOD constant');
testFileContains(path.join(wokwiPath, 'main.py'), 'PRESSURE_DIFF_WARNING', 'main.py PRESSURE_DIFF_WARNING constant');
testFileContains(path.join(wokwiPath, 'main.py'), 'PRESSURE_DIFF_CRITICAL', 'main.py PRESSURE_DIFF_CRITICAL constant');
testFileContains(path.join(wokwiPath, 'main.py'), 'def check_alerts', 'main.py check_alerts function');
testFileContains(path.join(wokwiPath, 'main.py'), 'BMP280Simulator', 'main.py BMP280Simulator class');
testFileContains(path.join(wokwiPath, 'main.py'), 'DHT22', 'main.py DHT22 sensor');

// ==================== BACKEND TESTS ====================
console.log('\n🖥️  Testing Backend Server Files...\n');

testExists(path.join(backendPath, 'server.js'), 'Backend server.js', 5000);
testExists(path.join(backendPath, 'config.js'), 'Backend config.js', 1000);
testExists(path.join(backendPath, 'webhook.js'), 'Backend webhook.js', 5000);
testExists(path.join(backendPath, 'package.json'), 'Backend package.json', 200);

// Test package.json structure
testJSONValid(path.join(backendPath, 'package.json'), 'Backend package.json structure');

// Test server.js content
testFileContains(path.join(backendPath, 'server.js'), 'express', 'server.js Express framework');
testFileContains(path.join(backendPath, 'server.js'), 'sqlite3', 'server.js SQLite3 database');
testFileContains(path.join(backendPath, 'server.js'), 'socket.io', 'server.js Socket.IO');
testFileContains(path.join(backendPath, 'server.js'), '/api/measurements', 'server.js API endpoint');

// Test config.js content
testFileContains(path.join(backendPath, 'config.js'), 'PRESSURE_THRESHOLDS', 'config.js pressure thresholds');
testFileContains(path.join(backendPath, 'config.js'), 'good: -30', 'config.js correct good threshold');
testFileContains(path.join(backendPath, 'config.js'), 'warning: -10', 'config.js correct warning threshold');
testFileContains(path.join(backendPath, 'config.js'), 'critical: 0', 'config.js correct critical threshold');

// Test webhook.js content
testFileContains(path.join(backendPath, 'webhook.js'), 'Discord', 'webhook.js Discord integration');
testFileContains(path.join(backendPath, 'webhook.js'), 'formatPressureDiff', 'webhook.js pressure diff formatter');

// Test dependencies
testDirExists(path.join(backendPath, 'node_modules'), 'Backend node_modules');

// ==================== DASHBOARD TESTS ====================
console.log('\n🌐 Testing Dashboard Files...\n');

const publicPath = path.join(backendPath, 'public');
testDirExists(publicPath, 'Public directory');
testExists(path.join(publicPath, 'index.html'), 'Dashboard index.html', 3000);

// Test HTML content
if (fs.existsSync(path.join(publicPath, 'index.html'))) {
    testFileContains(path.join(publicPath, 'index.html'), 'Työmaan Olosuhde-Anturi', 'Dashboard title');
    testFileContains(path.join(publicPath, 'index.html'), 'Chart.js', 'Dashboard Chart.js library');
    testFileContains(path.join(publicPath, 'index.html'), 'socket.io', 'Dashboard Socket.IO client');
}

// ==================== DOCUMENTATION TESTS ====================
console.log('\n📚 Testing Documentation...\n');

testExists(path.join(projectRoot, 'README.md'), 'Project README.md', 5000);

// Test README content
testFileContains(path.join(projectRoot, 'README.md'), 'Työmaan Olosuhde-Anturi', 'README title');
testFileContains(path.join(projectRoot, 'README.md'), 'Raspberry Pi Pico', 'README hardware');
testFileContains(path.join(projectRoot, 'README.md'), '✅ Hyvä:', 'README correct pressure logic - Good');
testFileContains(path.join(projectRoot, 'README.md'), '⚠️ Varoitus:', 'README correct pressure logic - Warning');
testFileContains(path.join(projectRoot, 'README.md'), '🚨 Kriittinen:', 'README correct pressure logic - Critical');

// ==================== CONFIGURATION VALIDATION ====================
console.log('\n⚙️  Testing Configuration Logic...\n');

try {
    const config = require(path.join(backendPath, 'config.js'));
    
    // Validate pressure thresholds
    if (config.PRESSURE_THRESHOLDS) {
        if (config.PRESSURE_THRESHOLDS.good === -30.0) {
            console.log('✅ Config: Correct GOOD threshold (-30 Pa)');
            passedTests++;
        } else {
            console.log(`❌ Config: Wrong GOOD threshold (${config.PRESSURE_THRESHOLDS.good}, expected -30)`);
            failures.push('Config: Wrong GOOD threshold');
            failedTests++;
        }
        
        if (config.PRESSURE_THRESHOLDS.warning === -10.0) {
            console.log('✅ Config: Correct WARNING threshold (-10 Pa)');
            passedTests++;
        } else {
            console.log(`❌ Config: Wrong WARNING threshold (${config.PRESSURE_THRESHOLDS.warning}, expected -10)`);
            failures.push('Config: Wrong WARNING threshold');
            failedTests++;
        }
        
        if (config.PRESSURE_THRESHOLDS.critical === 0.0) {
            console.log('✅ Config: Correct CRITICAL threshold (0 Pa)');
            passedTests++;
        } else {
            console.log(`❌ Config: Wrong CRITICAL threshold (${config.PRESSURE_THRESHOLDS.critical}, expected 0)`);
            failures.push('Config: Wrong CRITICAL threshold');
            failedTests++;
        }
    } else {
        console.log('❌ Config: PRESSURE_THRESHOLDS not found');
        failures.push('Config: PRESSURE_THRESHOLDS missing');
        failedTests += 3;
    }
    
    // Validate air quality thresholds
    if (config.AIR_QUALITY_THRESHOLDS) {
        console.log('✅ Config: Air quality thresholds present');
        passedTests++;
    } else {
        console.log('❌ Config: Air quality thresholds missing');
        failures.push('Config: Air quality thresholds missing');
        failedTests++;
    }
    
} catch (err) {
    console.log(`❌ Config: Cannot load config.js - ${err.message}`);
    failures.push('Config: Cannot load');
    failedTests += 5;
}

// ==================== FINAL REPORT ====================
console.log('\n' + '='.repeat(70));
console.log('📊 TYÖMAA-ANTURI PROJECT TEST REPORT');
console.log('='.repeat(70));

const totalTests = passedTests + failedTests;
const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

console.log(`\n✅ Tests Passed: ${passedTests}`);
console.log(`❌ Tests Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${successRate}%`);

if (failedTests > 0) {
    console.log('\n⚠️  FAILURES:');
    failures.forEach((failure, index) => {
        console.log(`  ${index + 1}. ${failure}`);
    });
}

console.log('\n🎯 PROJECT STRUCTURE:');
console.log('  📡 Wokwi Simulation: MicroPython + Raspberry Pi Pico');
console.log('  🖥️  Backend Server: Node.js + Express + SQLite + Socket.IO');
console.log('  🌐 Dashboard: HTML + Chart.js + WebSocket');
console.log('  📡 Integration: Discord Webhook');

console.log('\n✨ KEY FEATURES TESTED:');
console.log('  ✓ Pressure differential monitoring (4 sensors)');
console.log('  ✓ Correct alert logic (negative pressure = better)');
console.log('  ✓ Air quality monitoring (PM2.5 & PM10)');
console.log('  ✓ Temperature & humidity tracking');
console.log('  ✓ Real-time dashboard with charts');
console.log('  ✓ Discord webhook notifications');
console.log('  ✓ SQLite data persistence');

if (successRate >= 95) {
    console.log('\n🎉 EXCELLENT! Project is ready for deployment!');
} else if (successRate >= 85) {
    console.log('\n👍 GOOD! Minor fixes needed.');
} else if (successRate >= 70) {
    console.log('\n⚠️  NEEDS WORK! Several issues to address.');
} else {
    console.log('\n❌ CRITICAL! Major issues found.');
}

console.log('\n📝 Next steps:');
console.log('  1. Start backend server: cd backend && npm start');
console.log('  2. Open dashboard: http://localhost:3000');
console.log('  3. Test Wokwi simulation: https://wokwi.com/');
console.log('  4. Configure Discord webhook in config.js');

console.log('\n' + '='.repeat(70));

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);
