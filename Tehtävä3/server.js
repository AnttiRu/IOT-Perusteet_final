// IoT Server with API endpoints and SQLite database
// Based on course requirements for Tehtävä 3

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'IoT Server API',
        version: '1.0.0',
        endpoints: {
            'GET /api/sensors': 'Get all sensor data',
            'GET /api/sensors/:deviceId': 'Get data for specific device',
            'POST /api/sensors': 'Add new sensor data',
            'PUT /api/sensors/:id': 'Update existing data',
            'DELETE /api/sensors/:id': 'Delete data'
        }
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
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Connected to SQLite database');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});