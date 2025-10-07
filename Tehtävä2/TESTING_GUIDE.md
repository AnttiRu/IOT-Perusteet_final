# IoT Backend Server - Testing Guide

## Server Information
- **URL**: http://localhost:3000
- **Status**: Running ✅

## Available Endpoints

### 1. GET / (Server Status)
- **URL**: `GET http://localhost:3000/`
- **Description**: Check if server is running
- **Expected Response**:
```json
{
    "message": "IoT Backend Server is running",
    "status": "OK",
    "totalReadings": 0
}
```

### 2. POST /temperature (Submit Temperature Data)
- **URL**: `POST http://localhost:3000/temperature`
- **Content-Type**: `application/json`
- **Body Example**:
```json
{
    "temperature": 25.5,
    "timestamp": "2025-10-06T13:30:00.000Z"
}
```
- **Expected Response**:
```json
{
    "message": "Temperature data received successfully",
    "data": {
        "id": 1,
        "temperature": 25.5,
        "timestamp": "2025-10-06T13:30:00.000Z",
        "receivedAt": "2025-10-06T13:30:15.123Z"
    }
}
```

### 3. GET /temperature (Get All Readings)
- **URL**: `GET http://localhost:3000/temperature`
- **Expected Response**:
```json
{
    "readings": [
        {
            "id": 1,
            "temperature": 25.5,
            "timestamp": "2025-10-06T13:30:00.000Z",
            "receivedAt": "2025-10-06T13:30:15.123Z"
        }
    ],
    "count": 1
}
```

### 4. GET /temperature/latest (Get Latest Reading)
- **URL**: `GET http://localhost:3000/temperature/latest`
- **Expected Response**:
```json
{
    "message": "Latest temperature reading",
    "data": {
        "id": 1,
        "temperature": 25.5,
        "timestamp": "2025-10-06T13:30:00.000Z",
        "receivedAt": "2025-10-06T13:30:15.123Z"
    }
}
```

### 5. DELETE /temperature (Clear All Data)
- **URL**: `DELETE http://localhost:3000/temperature`
- **Expected Response**:
```json
{
    "message": "Cleared 1 temperature readings"
}
```

## Testing Steps in Postman

1. **Test Server Status**
   - Method: GET
   - URL: http://localhost:3000/
   - Expected: 200 OK with server status

2. **Send Temperature Data**
   - Method: POST
   - URL: http://localhost:3000/temperature
   - Headers: Content-Type: application/json
   - Body: {"temperature": 23.5}

3. **Retrieve All Data**
   - Method: GET
   - URL: http://localhost:3000/temperature
   - Expected: All temperature readings

4. **Get Latest Reading**
   - Method: GET
   - URL: http://localhost:3000/temperature/latest
   - Expected: Most recent temperature

5. **Clear Data**
   - Method: DELETE
   - URL: http://localhost:3000/temperature
   - Expected: Confirmation of cleared data

## Notes
- The server stores data in memory, so data will be lost when the server restarts
- All timestamps are in ISO 8601 format
- Temperature values should be numeric