// Basic Tests for IoT Discord Webhook & Dashboard
// Tehtävä 4 - Integration Tests

const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class IoTTestSuite {
    constructor() {
        this.testResults = [];
        this.serverUrl = 'http://localhost:3000';
        this.dbPath = path.join(__dirname, 'iot_data.db');
    }

    // Test utilities
    log(test, status, message) {
        const result = { test, status, message, timestamp: new Date().toISOString() };
        this.testResults.push(result);
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${statusIcon} ${test}: ${message}`);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // HTTP request helper
    makeRequest(options, data = null) {
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    }

    // Test 1: Check if server is running
    async testServerRunning() {
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/api',
                method: 'GET',
                timeout: 5000
            };

            const response = await this.makeRequest(options);
            
            if (response.statusCode === 200) {
                this.log('Server Status', 'PASS', 'Server is running and responding');
                return true;
            } else {
                this.log('Server Status', 'FAIL', `Server responded with status ${response.statusCode}`);
                return false;
            }
        } catch (error) {
            this.log('Server Status', 'FAIL', `Server not responding: ${error.message}`);
            return false;
        }
    }

    // Test 2: Check database file exists
    async testDatabaseExists() {
        try {
            if (fs.existsSync(this.dbPath)) {
                this.log('Database File', 'PASS', 'SQLite database file exists');
                return true;
            } else {
                this.log('Database File', 'FAIL', 'SQLite database file not found');
                return false;
            }
        } catch (error) {
            this.log('Database File', 'FAIL', `Error checking database: ${error.message}`);
            return false;
        }
    }

    // Test 3: Test database connection and table structure
    async testDatabaseStructure() {
        return new Promise((resolve) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    this.log('Database Connection', 'FAIL', `Cannot connect to database: ${err.message}`);
                    resolve(false);
                    return;
                }

                // Check if sensor_data table exists with correct structure
                db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='sensor_data'", (err, row) => {
                    if (err) {
                        this.log('Database Structure', 'FAIL', `Error querying table structure: ${err.message}`);
                        db.close();
                        resolve(false);
                        return;
                    }

                    if (row && row.sql.includes('device_id') && row.sql.includes('temperature') && row.sql.includes('humidity')) {
                        this.log('Database Structure', 'PASS', 'Table sensor_data has correct structure');
                        db.close();
                        resolve(true);
                    } else {
                        this.log('Database Structure', 'FAIL', 'Table sensor_data missing or incorrect structure');
                        db.close();
                        resolve(false);
                    }
                });
            });
        });
    }

    // Test 4: Test API GET endpoints
    async testApiGetEndpoints() {
        const endpoints = [
            { path: '/api', name: 'API Info' },
            { path: '/api/sensors', name: 'Get Sensors' },
            { path: '/api/stats', name: 'Get Stats' }
        ];

        let allPassed = true;

        for (const endpoint of endpoints) {
            try {
                const options = {
                    hostname: 'localhost',
                    port: 3000,
                    path: endpoint.path,
                    method: 'GET',
                    timeout: 5000
                };

                const response = await this.makeRequest(options);
                
                if (response.statusCode === 200) {
                    // Try to parse JSON response
                    const data = JSON.parse(response.body);
                    if (data && typeof data === 'object') {
                        this.log(`API ${endpoint.name}`, 'PASS', `Endpoint responds with valid JSON`);
                    } else {
                        this.log(`API ${endpoint.name}`, 'FAIL', 'Invalid JSON response');
                        allPassed = false;
                    }
                } else {
                    this.log(`API ${endpoint.name}`, 'FAIL', `HTTP ${response.statusCode}`);
                    allPassed = false;
                }
            } catch (error) {
                this.log(`API ${endpoint.name}`, 'FAIL', `Request failed: ${error.message}`);
                allPassed = false;
            }
        }

        return allPassed;
    }

    // Test 5: Test API POST endpoint (create sensor data)
    async testApiPostEndpoint() {
        try {
            const testData = {
                device_id: 'test_device_' + Date.now(),
                temperature: 22.5,
                humidity: 55.0
            };

            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/api/sensors',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(testData))
                },
                timeout: 5000
            };

            const response = await this.makeRequest(options, testData);
            
            if (response.statusCode === 201) {
                const responseData = JSON.parse(response.body);
                if (responseData.success && responseData.id) {
                    this.log('API POST Sensor', 'PASS', `Successfully created sensor data with ID ${responseData.id}`);
                    return { success: true, id: responseData.id };
                } else {
                    this.log('API POST Sensor', 'FAIL', 'Invalid response format');
                    return { success: false };
                }
            } else {
                this.log('API POST Sensor', 'FAIL', `HTTP ${response.statusCode}: ${response.body}`);
                return { success: false };
            }
        } catch (error) {
            this.log('API POST Sensor', 'FAIL', `Request failed: ${error.message}`);
            return { success: false };
        }
    }

    // Test 6: Test dashboard static files
    async testDashboardFiles() {
        const staticFiles = [
            { path: '/', name: 'Dashboard HTML' },
            { path: '/styles.css', name: 'Dashboard CSS' },
            { path: '/dashboard.js', name: 'Dashboard JS' }
        ];

        let allPassed = true;

        for (const file of staticFiles) {
            try {
                const options = {
                    hostname: 'localhost',
                    port: 3000,
                    path: file.path,
                    method: 'GET',
                    timeout: 5000
                };

                const response = await this.makeRequest(options);
                
                if (response.statusCode === 200) {
                    if (response.body && response.body.length > 100) {
                        this.log(`Dashboard ${file.name}`, 'PASS', `File served successfully (${response.body.length} bytes)`);
                    } else {
                        this.log(`Dashboard ${file.name}`, 'WARN', 'File seems too small');
                    }
                } else {
                    this.log(`Dashboard ${file.name}`, 'FAIL', `HTTP ${response.statusCode}`);
                    allPassed = false;
                }
            } catch (error) {
                this.log(`Dashboard ${file.name}`, 'FAIL', `Request failed: ${error.message}`);
                allPassed = false;
            }
        }

        return allPassed;
    }

    // Test 7: Test configuration files
    async testConfigurationFiles() {
        const requiredFiles = [
            { file: 'config.js', name: 'Configuration' },
            { file: 'webhook.js', name: 'Webhook Module' },
            { file: 'package.json', name: 'Package Config' }
        ];

        let allPassed = true;

        for (const item of requiredFiles) {
            const filePath = path.join(__dirname, item.file);
            try {
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    if (stats.size > 0) {
                        this.log(`File ${item.name}`, 'PASS', `${item.file} exists and has content (${stats.size} bytes)`);
                    } else {
                        this.log(`File ${item.name}`, 'FAIL', `${item.file} is empty`);
                        allPassed = false;
                    }
                } else {
                    this.log(`File ${item.name}`, 'FAIL', `${item.file} not found`);
                    allPassed = false;
                }
            } catch (error) {
                this.log(`File ${item.name}`, 'FAIL', `Error checking ${item.file}: ${error.message}`);
                allPassed = false;
            }
        }

        return allPassed;
    }

    // Test 8: Test webhook module (without actual Discord call)
    async testWebhookModule() {
        try {
            const DiscordWebhook = require('./webhook');
            const webhook = new DiscordWebhook();
            
            // Test creating an embed
            const testData = {
                device_id: 'test_device',
                temperature: 25.0,
                humidity: 60.0,
                timestamp: new Date().toISOString()
            };

            const embed = webhook.createSensorEmbed(testData, 'normal');
            
            if (embed && embed.title && embed.fields && embed.color) {
                this.log('Webhook Module', 'PASS', 'Webhook module loads and creates valid embeds');
                return true;
            } else {
                this.log('Webhook Module', 'FAIL', 'Webhook module creates invalid embeds');
                return false;
            }
        } catch (error) {
            this.log('Webhook Module', 'FAIL', `Error loading webhook module: ${error.message}`);
            return false;
        }
    }

    // Main test runner
    async runAllTests() {
        console.log('\n🧪 Starting IoT System Tests...\n');
        
        const tests = [
            { name: 'Server Running', test: () => this.testServerRunning() },
            { name: 'Database File', test: () => this.testDatabaseExists() },
            { name: 'Database Structure', test: () => this.testDatabaseStructure() },
            { name: 'Configuration Files', test: () => this.testConfigurationFiles() },
            { name: 'Webhook Module', test: () => this.testWebhookModule() },
            { name: 'API GET Endpoints', test: () => this.testApiGetEndpoints() },
            { name: 'API POST Endpoint', test: () => this.testApiPostEndpoint() },
            { name: 'Dashboard Files', test: () => this.testDashboardFiles() }
        ];

        let passedTests = 0;
        let totalTests = tests.length;

        for (const testCase of tests) {
            console.log(`\n🔍 Running: ${testCase.name}`);
            const result = await testCase.test();
            if (result === true) {
                passedTests++;
            }
            await this.delay(500); // Small delay between tests
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${totalTests - passedTests}`);
        console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! System is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Check the details above.');
        }

        // Save detailed results to file
        this.saveTestResults();
        
        return passedTests === totalTests;
    }

    // Save test results to JSON file
    saveTestResults() {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.length,
                passed: this.testResults.filter(r => r.status === 'PASS').length,
                failed: this.testResults.filter(r => r.status === 'FAIL').length,
                warnings: this.testResults.filter(r => r.status === 'WARN').length
            },
            results: this.testResults
        };

        try {
            fs.writeFileSync(path.join(__dirname, 'test-results.json'), JSON.stringify(reportData, null, 2));
            console.log('\n📄 Detailed test results saved to test-results.json');
        } catch (error) {
            console.log(`\n⚠️  Could not save test results: ${error.message}`);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new IoTTestSuite();
    testSuite.runAllTests().catch(error => {
        console.error('\n❌ Test suite crashed:', error.message);
        process.exit(1);
    });
}

module.exports = IoTTestSuite;