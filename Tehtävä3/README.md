# IoT Project Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Server
```bash
npm start
```
Server will be available at: `http://localhost:3000`

### 3. Test the API
Use Postman or curl to test:
```bash
# Add sensor data
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32_01","temperature":23.5,"humidity":45.2}'

# Get all data
curl http://localhost:3000/api/sensors

# Get data for specific device
curl http://localhost:3000/api/sensors/esp32_01
```

## Project Structure
```
Tehtävä3/
├── server.js          # Main server file with API endpoints
├── package.json       # Node.js dependencies
├── iot_data.db        # SQLite database (created automatically)
├── PIPELINE_GUIDE.md  # Complete pipeline documentation
└── README.md          # This file
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sensors` | Get all sensor data |
| GET | `/api/sensors/:deviceId` | Get data for specific device |
| POST | `/api/sensors` | Add new sensor data |
| PUT | `/api/sensors/:id` | Update existing data |
| DELETE | `/api/sensors/:id` | Delete data |

## JSON Format for Sensor Data
```json
{
  "device_id": "esp32_01",
  "temperature": 23.5,
  "humidity": 45.2
}
```

## Database Schema
```sql
CREATE TABLE sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    temperature REAL,
    humidity REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## For Course Submission

1. **server.js**: ✅ Ready for GitHub
2. **Week Test**: Complete the API and database concepts
3. **Pipeline**: Choose from PIPELINE_GUIDE.md options:
   - Wokwi + ThingSpeak (recommended for beginners)
   - Wokwi + Deployed server (for advanced users)
   - Physical hardware + Local/cloud server

## Next Steps

1. Push this code to GitHub
2. Choose your pipeline architecture
3. Implement the sensor-to-server communication
4. Test with real or simulated data

Good luck with your IoT project! 🚀