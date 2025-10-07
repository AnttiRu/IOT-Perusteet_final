// Comprehensive Test Suite for IoT Course Tasks 1-3
// Tests project structure, files, and functionality

const fs = require('fs');
const path = require('path');
const http = require('http');

class IoTCourseTestSuite {
    constructor() {
        this.baseDir = path.join(__dirname, '..');
        this.results = {
            'Tehtävä1': { tests: [], passed: 0, total: 0 },
            'Tehtävä2': { tests: [], passed: 0, total: 0 },
            'Tehtävä3': { tests: [], passed: 0, total: 0 }
        };
    }

    log(task, testName, status, message) {
        const result = { test: testName, status, message, timestamp: new Date().toISOString() };
        this.results[task].tests.push(result);
        this.results[task].total++;
        if (status === 'PASS') this.results[task].passed++;
        
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${statusIcon} ${task.toUpperCase()} - ${testName}: ${message}`);
    }

    // Test if directory exists
    testDirectoryExists(task, dirName, expectedPath) {
        const fullPath = path.join(this.baseDir, task, expectedPath);
        const exists = fs.existsSync(fullPath);
        this.log(task, `Directory ${dirName}`, exists ? 'PASS' : 'FAIL', 
                exists ? `${expectedPath} exists` : `${expectedPath} not found`);
        return exists;
    }

    // Test if file exists and has content
    testFileExists(task, fileName, expectedPath, minSize = 50) {
        const fullPath = path.join(this.baseDir, task, expectedPath);
        
        if (!fs.existsSync(fullPath)) {
            this.log(task, `File ${fileName}`, 'FAIL', `${expectedPath} not found`);
            return false;
        }

        const stats = fs.statSync(fullPath);
        if (stats.size < minSize) {
            this.log(task, `File ${fileName}`, 'WARN', `${expectedPath} too small (${stats.size} bytes)`);
            return false;
        }

        this.log(task, `File ${fileName}`, 'PASS', `${expectedPath} exists (${stats.size} bytes)`);
        return true;
    }

    // Test Python file syntax (basic check)
    testPythonFile(task, fileName, filePath) {
        const fullPath = path.join(this.baseDir, task, filePath);
        
        if (!fs.existsSync(fullPath)) {
            this.log(task, `Python ${fileName}`, 'FAIL', `${filePath} not found`);
            return false;
        }

        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Basic Python syntax checks
            const hasImports = content.includes('import ') || content.includes('from ');
            const hasFunctions = content.includes('def ') || content.includes('class ');
            const hasComments = content.includes('#');
            
            if (hasImports && (hasFunctions || content.length > 200)) {
                this.log(task, `Python ${fileName}`, 'PASS', 'Valid Python structure detected');
                return true;
            } else {
                this.log(task, `Python ${fileName}`, 'WARN', 'Basic Python file but may be incomplete');
                return false;
            }
        } catch (error) {
            this.log(task, `Python ${fileName}`, 'FAIL', `Error reading file: ${error.message}`);
            return false;
        }
    }

    // Test package.json structure
    testPackageJson(task, filePath) {
        const fullPath = path.join(this.baseDir, task, filePath);
        
        if (!fs.existsSync(fullPath)) {
            this.log(task, 'Package JSON', 'FAIL', 'package.json not found');
            return false;
        }

        try {
            const packageData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            
            const hasName = packageData.name;
            const hasDependencies = packageData.dependencies && Object.keys(packageData.dependencies).length > 0;
            const hasScripts = packageData.scripts;
            
            if (hasName && hasDependencies) {
                this.log(task, 'Package JSON', 'PASS', 
                        `Valid package.json with ${Object.keys(packageData.dependencies).length} dependencies`);
                return true;
            } else {
                this.log(task, 'Package JSON', 'WARN', 'package.json exists but may be incomplete');
                return false;
            }
        } catch (error) {
            this.log(task, 'Package JSON', 'FAIL', `Invalid JSON: ${error.message}`);
            return false;
        }
    }

    // Test Node.js server file
    testNodeServerFile(task, filePath) {
        const fullPath = path.join(this.baseDir, task, filePath);
        
        if (!fs.existsSync(fullPath)) {
            this.log(task, 'Node Server', 'FAIL', 'server.js not found');
            return false;
        }

        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            const hasExpress = content.includes('express');
            const hasRoutes = content.includes('app.get') || content.includes('app.post');
            const hasListen = content.includes('.listen');
            
            if (hasExpress && hasRoutes && hasListen) {
                this.log(task, 'Node Server', 'PASS', 'Valid Express.js server structure');
                return true;
            } else {
                this.log(task, 'Node Server', 'WARN', 'Server file exists but may be incomplete');
                return false;
            }
        } catch (error) {
            this.log(task, 'Node Server', 'FAIL', `Error reading server: ${error.message}`);
            return false;
        }
    }

    // Test if node_modules exists (dependencies installed)
    testNodeModules(task) {
        const fullPath = path.join(this.baseDir, task, 'node_modules');
        const exists = fs.existsSync(fullPath);
        
        if (exists) {
            const moduleCount = fs.readdirSync(fullPath).length;
            this.log(task, 'Dependencies', 'PASS', `node_modules exists with ${moduleCount} modules`);
        } else {
            this.log(task, 'Dependencies', 'FAIL', 'node_modules not found - run npm install');
        }
        return exists;
    }

    // Test server connectivity (if running)
    async testServerConnectivity(task, port = 3000) {
        return new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: port,
                path: '/',
                method: 'GET',
                timeout: 2000
            };

            const req = http.request(options, (res) => {
                this.log(task, 'Server Running', 'PASS', `Server responds on port ${port}`);
                resolve(true);
            });

            req.on('error', () => {
                this.log(task, 'Server Running', 'INFO', `Server not running on port ${port} (expected if not started)`);
                resolve(false);
            });

            req.on('timeout', () => {
                this.log(task, 'Server Running', 'INFO', `Server timeout on port ${port}`);
                resolve(false);
            });

            req.end();
        });
    }

    // TEHTÄVÄ 1 TESTS - Wokwi IoT Simulations
    async testTehtava1() {
        console.log('\n🔧 Testing Tehtävä 1 - Wokwi IoT Simulations...\n');

        const projects = [
            'Interrup',
            'led_vilkutus', 
            'Liikennevalo',
            'Sääasema',
            'Sääasema_backend',
            'Varashälytin'
        ];

        // Test project directories exist
        projects.forEach(project => {
            this.testDirectoryExists('Tehtävä1', project, project);
        });

        // Test each project has required files
        projects.forEach(project => {
            this.testFileExists('Tehtävä1', `${project} main.py`, `${project}/main.py`);
            this.testFileExists('Tehtävä1', `${project} diagram.json`, `${project}/diagram.json`);
            this.testFileExists('Tehtävä1', `${project} wokwi-project.txt`, `${project}/wokwi-project.txt`);
        });

        // Test Python files have valid content
        projects.forEach(project => {
            this.testPythonFile('Tehtävä1', project, `${project}/main.py`);
        });

        // Special check for led_vilkutus README
        this.testFileExists('Tehtävä1', 'led_vilkutus README', 'led_vilkutus/README.md');

        // Special check for Sääasema_backend secret file
        this.testFileExists('Tehtävä1', 'Sääasema_backend secret', 'Sääasema_backend/secred.py');
    }

    // TEHTÄVÄ 2 TESTS - Node.js API Server
    async testTehtava2() {
        console.log('\n🌐 Testing Tehtävä 2 - Node.js API Server...\n');

        // Test basic file structure
        this.testFileExists('Tehtävä2', 'server.js', 'server.js');
        this.testPackageJson('Tehtävä2', 'package.json');
        this.testFileExists('Tehtävä2', 'README', 'README.md');

        // Test documentation files
        this.testFileExists('Tehtävä2', 'IoT Code Updated', 'IOT_CODE_UPDATED.md');
        this.testFileExists('Tehtävä2', 'Quick Test Guide', 'PIKATESTIOHJE.md');
        this.testFileExists('Tehtävä2', 'Postman Guide', 'POSTMAN_OHJEET.md');
        this.testFileExists('Tehtävä2', 'Testing Guide', 'TESTING_GUIDE.md');

        // Test Node.js server structure
        this.testNodeServerFile('Tehtävä2', 'server.js');
        this.testNodeModules('Tehtävä2');

        // Test if server is running (optional)
        await this.testServerConnectivity('Tehtävä2', 3000);
    }

    // TEHTÄVÄ 3 TESTS - Extended IoT Server with Database
    async testTehtava3() {
        console.log('\n🗄️ Testing Tehtävä 3 - Extended IoT Server...\n');

        // Test basic file structure
        this.testFileExists('Tehtävä3', 'server.js', 'server.js');
        this.testPackageJson('Tehtävä3', 'package.json');
        this.testFileExists('Tehtävä3', 'README', 'README.md');

        // Test Node.js server structure
        this.testNodeServerFile('Tehtävä3', 'server.js');

        // Test Wokwi files
        this.testFileExists('Tehtävä3', 'diagram.json', 'diagram.json');
        this.testFileExists('Tehtävä3', 'ESP32 diagram', 'diagram_esp32.json');
        this.testFileExists('Tehtävä3', 'wokwi.toml', 'wokwi.toml');

        // Test Arduino files
        this.testFileExists('Tehtävä3', 'ESP32 ThingSpeak', 'esp32_thingspeak.ino', 100);
        this.testFileExists('Tehtävä3', 'Wokwi ThingSpeak', 'wokwi_thingspeak.ino', 100);

        // Test documentation
        this.testFileExists('Tehtävä3', 'Pipeline Guide', 'PIPELINE_GUIDE.md');
        this.testFileExists('Tehtävä3', 'Wokwi VS Code Guide', 'WOKWI_VSCODE_GUIDE.md');

        // Test if dependencies are installed (optional for Tehtävä3)
        const nodeModulesPath = path.join(this.baseDir, 'Tehtävä3', 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
            this.testNodeModules('Tehtävä3');
        } else {
            this.log('Tehtävä3', 'Dependencies', 'INFO', 'node_modules not found (may not be needed)');
        }

        // Test if server is running (optional)
        await this.testServerConnectivity('Tehtävä3', 3000);
    }

    // Generate summary report
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 IoT COURSE TASKS 1-3 TEST REPORT');
        console.log('='.repeat(80));

        let overallPassed = 0;
        let overallTotal = 0;

        ['Tehtävä1', 'Tehtävä2', 'Tehtävä3'].forEach(task => {
            const taskData = this.results[task];
            const successRate = taskData.total > 0 ? ((taskData.passed / taskData.total) * 100).toFixed(1) : '0.0';
            
            console.log(`\n${task.toUpperCase()}:`);
            console.log(`  ✅ Passed: ${taskData.passed}`);
            console.log(`  ❌ Failed: ${taskData.total - taskData.passed}`);
            console.log(`  📈 Success Rate: ${successRate}%`);
            
            overallPassed += taskData.passed;
            overallTotal += taskData.total;
        });

        const overallSuccessRate = overallTotal > 0 ? ((overallPassed / overallTotal) * 100).toFixed(1) : '0.0';
        
        console.log(`\n📊 OVERALL SUMMARY:`);
        console.log(`  ✅ Total Passed: ${overallPassed}`);
        console.log(`  ❌ Total Failed: ${overallTotal - overallPassed}`);
        console.log(`  📈 Overall Success Rate: ${overallSuccessRate}%`);

        // Recommendations
        console.log('\n🎯 RECOMMENDATIONS:');
        
        ['Tehtävä1', 'Tehtävä2', 'Tehtävä3'].forEach(task => {
            const taskData = this.results[task];
            const failedTests = taskData.tests.filter(t => t.status === 'FAIL');
            const warningTests = taskData.tests.filter(t => t.status === 'WARN');
            
            if (failedTests.length > 0 || warningTests.length > 0) {
                console.log(`\n${task.toUpperCase()} needs attention:`);
                
                failedTests.forEach(test => {
                    console.log(`  ❌ ${test.test}: ${test.message}`);
                });
                
                warningTests.forEach(test => {
                    console.log(`  ⚠️  ${test.test}: ${test.message}`);
                });
            } else {
                console.log(`\n${task.toUpperCase()}: ✅ All tests passed - Good to go!`);
            }
        });

        return {
            overall: { passed: overallPassed, total: overallTotal, rate: overallSuccessRate },
            details: this.results
        };
    }

    // Main test runner
    async runAllTests() {
        console.log('🧪 Starting IoT Course Tasks 1-3 Comprehensive Tests...');
        
        await this.testTehtava1();
        await this.testTehtava2();
        await this.testTehtava3();
        
        const report = this.generateReport();
        
        // Save detailed report
        this.saveDetailedReport(report);
        
        return report;
    }

    // Save detailed test results
    saveDetailedReport(report) {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: report.overall,
            taskResults: report.details,
            recommendations: this.generateRecommendations()
        };

        try {
            const reportPath = path.join(__dirname, 'course-test-results.json');
            fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
            console.log(`\n📄 Detailed test results saved to: ${reportPath}`);
        } catch (error) {
            console.log(`\n⚠️  Could not save detailed report: ${error.message}`);
        }
    }

    generateRecommendations() {
        const recommendations = [];
        
        ['Tehtävä1', 'Tehtävä2', 'Tehtävä3'].forEach(task => {
            const taskData = this.results[task];
            const failedTests = taskData.tests.filter(t => t.status === 'FAIL');
            
            if (failedTests.length > 0) {
                recommendations.push({
                    task: task,
                    priority: 'high',
                    issues: failedTests.map(t => t.message),
                    actions: this.getTaskSpecificActions(task, failedTests)
                });
            }
        });
        
        return recommendations;
    }

    getTaskSpecificActions(task, failedTests) {
        const actions = [];
        
        if (task === 'Tehtävä1') {
            actions.push('Check Wokwi project files are properly saved');
            actions.push('Ensure main.py files contain valid MicroPython code');
            actions.push('Verify all project directories are complete');
        } else if (task === 'Tehtävä2') {
            actions.push('Run "npm install" to install dependencies');
            actions.push('Check server.js has proper Express.js structure');
            actions.push('Ensure API endpoints are implemented');
        } else if (task === 'Tehtävä3') {
            actions.push('Check Arduino .ino files have valid code');
            actions.push('Verify Wokwi configuration files are present');
            actions.push('Ensure documentation files are complete');
        }
        
        return actions;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new IoTCourseTestSuite();
    testSuite.runAllTests().catch(error => {
        console.error('\n❌ Test suite crashed:', error.message);
        process.exit(1);
    });
}

module.exports = IoTCourseTestSuite;