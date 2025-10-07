const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Store temperature data in memory (in a real application, you'd use a database)
let temperatureData = [];

// GET endpoint - retrieve all temperature data
app.get('/', (req, res) => {
    res.json({
        message: "IoT Backend Server is running",
        status: "OK",
        totalReadings: temperatureData.length
    });
});

// GET endpoint - retrieve all temperature readings
app.get('/temperature', (req, res) => {
    res.json({
        readings: temperatureData,
        count: temperatureData.length
    });
});

// POST endpoint - receive temperature data from IoT device
app.post('/temperature', (req, res) => {
    const { temperature, timestamp } = req.body;
    
    // Validate the received data
    if (temperature === undefined || temperature === null) {
        return res.status(400).json({
            error: "Temperature value is required"
        });
    }
    
    // Create new temperature reading
    const newReading = {
        id: temperatureData.length + 1,
        temperature: parseFloat(temperature),
        timestamp: timestamp || new Date().toISOString(),
        receivedAt: new Date().toISOString()
    };
    
    // Store the reading
    temperatureData.push(newReading);
    
    // Log the received data
    console.log(`Received temperature: ${temperature}°C at ${newReading.timestamp}`);
    
    // Send confirmation response
    res.status(201).json({
        message: "Temperature data received successfully",
        data: newReading
    });
});

// GET endpoint - get latest temperature reading
app.get('/temperature/latest', (req, res) => {
    if (temperatureData.length === 0) {
        return res.status(404).json({
            message: "No temperature data available"
        });
    }
    
    const latest = temperatureData[temperatureData.length - 1];
    res.json({
        message: "Latest temperature reading",
        data: latest
    });
});

// DELETE endpoint - clear all temperature data
app.delete('/temperature', (req, res) => {
    const count = temperatureData.length;
    temperatureData = [];
    res.json({
        message: `Cleared ${count} temperature readings`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: err.message
    });
});

// Handle 404 for undefined routes
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Start the server
app.listen(port, () => {
    console.log(`IoT Backend server running at http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('  GET  /                    - Server status');
    console.log('  GET  /temperature         - Get all readings');
    console.log('  POST /temperature         - Submit new reading');
    console.log('  GET  /temperature/latest  - Get latest reading');
    console.log('  DELETE /temperature       - Clear all readings');
});