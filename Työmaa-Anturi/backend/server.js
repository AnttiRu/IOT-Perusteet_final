// Työmaan Olosuhde-Anturi Backend Server
// Construction Site Environmental Monitor

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const ConstructionSiteWebhook = require('./webhook');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = config.SERVER_PORT;

// Initialize Discord webhook
const webhook = new ConstructionSiteWebhook();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'tyomaa_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Create tables
db.serialize(() => {
    // Main measurements table
    db.run(`CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        temperature REAL,
        humidity REAL,
        reference_pressure REAL,
        room1_pressure REAL,
        room1_diff REAL,
        room2_pressure REAL,
        room2_diff REAL,
        room3_pressure REAL,
        room3_diff REAL,
        pm25 REAL,
        pm10 REAL,
        alert_level TEXT,
        alerts TEXT
    )`);
    
    // Statistics table for daily summaries
    db.run(`CREATE TABLE IF NOT EXISTS daily_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        total_measurements INTEGER,
        warnings INTEGER,
        critical INTEGER,
        avg_temperature REAL,
        avg_humidity REAL,
        max_pressure_diff REAL,
        max_pm25 REAL,
        max_pm10 REAL
    )`);
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('📡 Client connected to dashboard');
    
    socket.on('disconnect', () => {
        console.log('📡 Client disconnected');
    });
});

// Send startup notification
webhook.sendSystemStatus('🚀 Työmaa-Anturi Server käynnistetty', 'normal')
    .catch(error => console.log('Discord webhook not configured'));

// ============= API ENDPOINTS =============

// Root - Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Info
app.get('/api', (req, res) => {
    res.json({
        message: 'Työmaan Olosuhde-Anturi API',
        version: '1.0.0',
        features: ['Discord Webhooks', 'Real-time Dashboard', 'Pressure Monitoring', 'Air Quality Monitoring'],
        endpoints: {
            'GET /': 'Dashboard',
            'GET /api': 'API information',
            'GET /api/measurements': 'Get all measurements',
            'GET /api/measurements/latest': 'Get latest measurements',
            'POST /api/measurements': 'Add new measurement',
            'GET /api/stats': 'Get statistics',
            'GET /api/stats/daily': 'Get daily summary'
        }
    });
});

// GET all measurements
app.get('/api/measurements', (req, res) => {
    const limit = req.query.limit || 100;
    const sql = 'SELECT * FROM measurements ORDER BY timestamp DESC LIMIT ?';
    
    db.all(sql, [limit], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ success: false, error: 'Internal server error' });
        } else {
            res.json({
                success: true,
                data: rows,
                count: rows.length
            });
        }
    });
});

// GET latest measurement
app.get('/api/measurements/latest', (req, res) => {
    const sql = 'SELECT * FROM measurements ORDER BY timestamp DESC LIMIT 1';
    
    db.get(sql, [], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ success: false, error: 'Internal server error' });
        } else {
            res.json({
                success: true,
                data: row || null
            });
        }
    });
});

// POST new measurement
app.post('/api/measurements', (req, res) => {
    const data = req.body;
    
    // Validate required fields
    if (!data.device_id || !data.reference || !data.rooms) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }
    
    const sql = `INSERT INTO measurements (
        device_id, temperature, humidity, reference_pressure,
        room1_pressure, room1_diff, room2_pressure, room2_diff,
        room3_pressure, room3_diff, pm25, pm10, alert_level, alerts
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const alertsJSON = data.alerts ? JSON.stringify(data.alerts) : null;
    
    db.run(sql, [
        data.device_id,
        data.reference.temperature,
        data.reference.humidity,
        data.reference.pressure,
        data.rooms.room1?.pressure || null,
        data.rooms.room1?.diff || null,
        data.rooms.room2?.pressure || null,
        data.rooms.room2?.diff || null,
        data.rooms.room3?.pressure || null,
        data.rooms.room3?.diff || null,
        data.air_quality?.pm25 || null,
        data.air_quality?.pm10 || null,
        data.alert_level || 'normal',
        alertsJSON
    ], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ success: false, error: 'Failed to store data' });
        } else {
            console.log(`✅ New measurement stored (ID: ${this.lastID})`);
            
            // Send to Discord webhook
            webhook.sendMeasurementData(data)
                .catch(error => console.log('Discord webhook failed:', error.message));
            
            // Broadcast to all connected dashboard clients
            io.emit('newMeasurement', {
                id: this.lastID,
                ...data,
                timestamp: Date.now() / 1000
            });
            
            // Update daily stats
            updateDailyStats();
            
            res.status(201).json({
                success: true,
                message: 'Measurement stored successfully',
                id: this.lastID
            });
        }
    });
});

// GET statistics
app.get('/api/stats', (req, res) => {
    const queries = [
        'SELECT COUNT(*) as total FROM measurements',
        'SELECT AVG(temperature) as avg_temp, AVG(humidity) as avg_humidity FROM measurements WHERE date(timestamp) = date("now")',
        'SELECT MIN(room1_diff) as min_diff1, MIN(room2_diff) as min_diff2, MIN(room3_diff) as min_diff3 FROM measurements WHERE date(timestamp) = date("now")',
        'SELECT MAX(pm25) as max_pm25, MAX(pm10) as max_pm10 FROM measurements WHERE date(timestamp) = date("now")',
        'SELECT COUNT(*) as warnings FROM measurements WHERE alert_level = "warning" AND date(timestamp) = date("now")',
        'SELECT COUNT(*) as critical FROM measurements WHERE alert_level = "critical" AND date(timestamp) = date("now")'
    ];

    Promise.all(queries.map(query => 
        new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        })
    )).then(results => {
        const minDiff = Math.min(
            results[2].min_diff1 || 0,
            results[2].min_diff2 || 0,
            results[2].min_diff3 || 0
        );
        
        res.json({
            success: true,
            stats: {
                totalMeasurements: results[0].total,
                avgTemperature: results[1].avg_temp ? results[1].avg_temp.toFixed(1) : 0,
                avgHumidity: results[1].avg_humidity ? results[1].avg_humidity.toFixed(1) : 0,
                maxPressureDiff: minDiff.toFixed(1),
                maxPM25: results[3].max_pm25 ? results[3].max_pm25.toFixed(1) : 0,
                maxPM10: results[3].max_pm10 ? results[3].max_pm10.toFixed(1) : 0,
                warnings: results[4].warnings,
                critical: results[5].critical,
                lastUpdate: new Date().toISOString()
            }
        });
    }).catch(err => {
        console.error('Stats query error:', err);
        res.status(500).json({ success: false, error: 'Failed to get statistics' });
    });
});

// GET daily summary
app.get('/api/stats/daily', (req, res) => {
    const sql = 'SELECT * FROM daily_stats ORDER BY date DESC LIMIT 30';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ success: false, error: 'Internal server error' });
        } else {
            res.json({
                success: true,
                data: rows,
                count: rows.length
            });
        }
    });
});

// Update daily statistics
function updateDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const sql = `
        INSERT OR REPLACE INTO daily_stats (
            date, total_measurements, warnings, critical,
            avg_temperature, avg_humidity, max_pressure_diff, max_pm25, max_pm10
        )
        SELECT 
            date(timestamp) as date,
            COUNT(*) as total_measurements,
            SUM(CASE WHEN alert_level = 'warning' THEN 1 ELSE 0 END) as warnings,
            SUM(CASE WHEN alert_level = 'critical' THEN 1 ELSE 0 END) as critical,
            AVG(temperature) as avg_temperature,
            AVG(humidity) as avg_humidity,
            MIN(LEAST(room1_diff, room2_diff, room3_diff)) as max_pressure_diff,
            MAX(pm25) as max_pm25,
            MAX(pm10) as max_pm10
        FROM measurements
        WHERE date(timestamp) = ?
        GROUP BY date(timestamp)
    `;
    
    db.run(sql, [today], (err) => {
        if (err) {
            console.error('Error updating daily stats:', err.message);
        }
    });
}

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
    console.log('\n' + '='.repeat(60));
    console.log('🏗️  TYÖMAAN OLOSUHDE-ANTURI SERVER');
    console.log('='.repeat(60));
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log('📡 WebSocket: Enabled');
    console.log('🗄️  Database: Connected');
    console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down server...');
    
    webhook.sendSystemStatus('🛑 Työmaa-Anturi Server sammutettu', 'warning')
        .catch(error => console.log('Discord shutdown notification failed'));
    
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});

module.exports = { app, server, db };