// IoT Server with Discord Webhook and Dashboard
// Enhanced version for Tehtävä 4

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const DiscordWebhook = require('./webhook');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Initialize Discord webhook
const discordWebhook = new DiscordWebhook();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'iot_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create table for sensor data
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        temperature REAL,
        humidity REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected to dashboard');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected from dashboard');
    });
});

// Send system startup message to Discord
discordWebhook.sendSystemStatus('🚀 IoT Server started successfully', 'normal')
    .catch(error => console.log('Discord webhook not configured or failed:', error.message));

// API Endpoints

// GET - Retrieve all sensor data
app.get('/api/sensors', (req, res) => {
    const sql = 'SELECT * FROM sensor_data ORDER BY timestamp DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({
                success: true,
                data: rows,
                count: rows.length
            });
        }
    });
});

// GET - Retrieve data for specific device
app.get('/api/sensors/:deviceId', (req, res) => {
    const deviceId = req.params.deviceId;
    const sql = 'SELECT * FROM sensor_data WHERE device_id = ? ORDER BY timestamp DESC';
    
    db.all(sql, [deviceId], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({
                success: true,
                device_id: deviceId,
                data: rows,
                count: rows.length
            });
        }
    });
});

// POST - Send sensor data to server
app.post('/api/sensors', (req, res) => {
    const { device_id, temperature, humidity } = req.body;
    
    // Validate required fields
    if (!device_id || temperature === undefined || humidity === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: device_id, temperature, humidity'
        });
    }
    
    const sql = 'INSERT INTO sensor_data (device_id, temperature, humidity) VALUES (?, ?, ?)';
    
    db.run(sql, [device_id, temperature, humidity], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ 
                success: false,
                error: 'Failed to store data' 
            });
        } else {
            const newData = {
                id: this.lastID,
                device_id,
                temperature,
                humidity,
                timestamp: new Date().toISOString()
            };
            
            // Send to Discord webhook
            discordWebhook.sendSensorData(newData)
                .catch(error => console.log('Discord webhook failed:', error.message));
            
            // Broadcast to all connected dashboard clients
            io.emit('newSensorData', newData);
            
            res.status(201).json({
                success: true,
                message: 'Data stored successfully',
                id: this.lastID,
                data: {
                    device_id,
                    temperature,
                    humidity,
                    timestamp: new Date().toISOString()
                }
            });
        }
    });
});

// PUT - Update existing sensor data
app.put('/api/sensors/:id', (req, res) => {
    const id = req.params.id;
    const { device_id, temperature, humidity } = req.body;
    
    if (!device_id || temperature === undefined || humidity === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: device_id, temperature, humidity'
        });
    }
    
    const sql = 'UPDATE sensor_data SET device_id = ?, temperature = ?, humidity = ? WHERE id = ?';
    
    db.run(sql, [device_id, temperature, humidity, id], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ 
                success: false,
                error: 'Failed to update data' 
            });
        } else if (this.changes === 0) {
            res.status(404).json({
                success: false,
                error: 'Data not found'
            });
        } else {
            res.json({
                success: true,
                message: 'Data updated successfully',
                id: parseInt(id)
            });
        }
    });
});

// DELETE - Remove sensor data
app.delete('/api/sensors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM sensor_data WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ 
                success: false,
                error: 'Failed to delete data' 
            });
        } else if (this.changes === 0) {
            res.status(404).json({
                success: false,
                error: 'Data not found'
            });
        } else {
            res.json({
                success: true,
                message: 'Data deleted successfully',
                id: parseInt(id)
            });
        }
    });
});

// Root endpoint - Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'IoT Server API with Discord Integration',
        version: '2.0.0',
        features: ['Discord Webhooks', 'Real-time Dashboard', 'WebSocket Support'],
        endpoints: {
            'GET /': 'IoT Dashboard',
            'GET /api/sensors': 'Get all sensor data',
            'GET /api/sensors/:deviceId': 'Get data for specific device',
            'POST /api/sensors': 'Add new sensor data',
            'PUT /api/sensors/:id': 'Update existing data',
            'DELETE /api/sensors/:id': 'Delete data',
            'GET /api/stats': 'Get sensor statistics'
        }
    });
});

// New endpoint for dashboard statistics
app.get('/api/stats', (req, res) => {
    const queries = [
        'SELECT COUNT(*) as total_readings FROM sensor_data',
        'SELECT COUNT(DISTINCT device_id) as unique_devices FROM sensor_data',
        'SELECT AVG(temperature) as avg_temp, AVG(humidity) as avg_humidity FROM sensor_data WHERE datetime(timestamp) >= datetime("now", "-24 hours")',
        'SELECT device_id, MAX(timestamp) as last_seen FROM sensor_data GROUP BY device_id'
    ];

    Promise.all(queries.map(query => 
        new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        })
    )).then(results => {
        res.json({
            success: true,
            stats: {
                totalReadings: results[0].total_readings,
                uniqueDevices: results[1].unique_devices,
                avgTemperature: results[2].avg_temp ? results[2].avg_temp.toFixed(1) : 0,
                avgHumidity: results[2].avg_humidity ? results[2].avg_humidity.toFixed(1) : 0,
                lastUpdate: new Date().toISOString()
            }
        });
    }).catch(err => {
        console.error('Stats query error:', err);
        res.status(500).json({ success: false, error: 'Failed to get statistics' });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 IoT Server with Dashboard running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}`);
    console.log(`🔗 API available at http://localhost:${PORT}/api`);
    console.log('📡 WebSocket support enabled');
    console.log('🗄️ Connected to SQLite database');
    
    // Send startup notification to Discord
    discordWebhook.sendSystemStatus('🚀 IoT Server with Dashboard started successfully', 'normal')
        .then(() => console.log('✅ Discord startup notification sent'))
        .catch(error => console.log('⚠️ Discord webhook not configured:', error.message));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down server...');
    
    // Send shutdown notification to Discord
    discordWebhook.sendSystemStatus('🛑 IoT Server shutting down', 'warning')
        .catch(error => console.log('Discord shutdown notification failed:', error.message));
    
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});