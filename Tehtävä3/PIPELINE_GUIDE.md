# IoT Pipeline Documentation

## Overview
This document describes the complete pipeline for sending sensor data from IoT devices to a server, covering different deployment scenarios.

## Pipeline Options

### Option 1: Wokwi Simulator + ThingSpeak
**Best for**: Learning and prototyping without hardware

#### Components:
- **Wokwi Simulator**: Virtual ESP32/Arduino
- **ThingSpeak**: Cloud IoT platform by MathWorks
- **WiFi Connection**: Simulated internet connection

#### Steps:
1. **Setup ThingSpeak Channel**:
   - Create account at https://thingspeak.com
   - Create new channel with fields (temperature, humidity)
   - Note the Write API Key

2. **Wokwi Code Example**:
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* thingspeakServer = "http://api.thingspeak.com/update";
const char* apiKey = "YOUR_WRITE_API_KEY";

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (!isnan(temperature) && !isnan(humidity)) {
    sendToThingSpeak(temperature, humidity);
  }
  
  delay(20000); // Send every 20 seconds
}

void sendToThingSpeak(float temp, float hum) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(thingspeakServer) + "?api_key=" + apiKey + 
                 "&field1=" + String(temp) + "&field2=" + String(hum);
    
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode > 0) {
      Serial.println("Data sent to ThingSpeak");
    } else {
      Serial.println("Error sending data");
    }
    http.end();
  }
}
```

#### Advantages:
- No server setup required
- Built-in visualization
- Cloud storage
- Easy to test

#### Disadvantages:
- Limited customization
- Rate limits (15 seconds minimum)
- Dependency on external service

---

### Option 2: Wokwi Simulator + Deployed Server
**Best for**: Custom server logic with simulated hardware

#### Components:
- **Wokwi Simulator**: Virtual ESP32/Arduino
- **Cloud Server**: Azure, AWS, or other cloud platform
- **Custom API**: Your server.js deployed

#### Deployment Steps:

##### Azure Deployment:
1. **Create Azure Web App**:
   - Go to Azure Portal
   - Create "Web App" resource
   - Choose Node.js runtime
   - Deploy your server.js

2. **Environment Setup**:
   - Set environment variables
   - Configure database (Azure SQL or keep SQLite)

3. **Wokwi Code for Custom Server**:
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* serverURL = "https://your-app.azurewebsites.net/api/sensors";

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (!isnan(temperature) && !isnan(humidity)) {
    sendToServer(temperature, humidity);
  }
  
  delay(30000); // Send every 30 seconds
}

void sendToServer(float temp, float hum) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["device_id"] = "wokwi_esp32";
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpCode = http.POST(jsonString);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error: " + String(httpCode));
    }
    http.end();
  }
}
```

---

### Option 3: Physical Hardware + Local/Cloud Server
**Best for**: Real-world deployment

#### Components:
- **Physical ESP32/Arduino**: Real hardware
- **Real Sensors**: DHT22, BME280, etc.
- **Local or Cloud Server**: Your choice

#### Physical Setup:
1. **Hardware Connections**:
   ```
   ESP32     DHT22
   ------    -----
   3.3V   -> VCC
   GND    -> GND
   GPIO2  -> DATA
   ```

2. **Code for Physical Device**:
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

// Replace with your network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// For local server: "http://192.168.1.100:3000/api/sensors"
// For cloud server: "https://your-app.azurewebsites.net/api/sensors"
const char* serverURL = "http://192.168.1.100:3000/api/sensors";

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (!isnan(temperature) && !isnan(humidity)) {
    Serial.printf("Temperature: %.2f°C, Humidity: %.2f%%\n", temperature, humidity);
    sendToServer(temperature, humidity);
  } else {
    Serial.println("Failed to read from DHT sensor!");
  }
  
  delay(60000); // Send every minute
}

void sendToServer(float temp, float hum) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["device_id"] = WiFi.macAddress(); // Use MAC as unique ID
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpCode = http.POST(jsonString);
    
    if (httpCode > 0) {
      if (httpCode == 201) {
        Serial.println("Data sent successfully");
      }
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.println("Error sending data: " + String(httpCode));
    }
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}
```

## Testing Your Pipeline

### 1. Test Server Locally:
```bash
# Install dependencies
npm install

# Start server
npm start

# Test with curl or Postman
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test_device","temperature":25.5,"humidity":60.2}'
```

### 2. Test with Postman:
- **URL**: `http://localhost:3000/api/sensors`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Body**: 
```json
{
  "device_id": "test_device",
  "temperature": 25.5,
  "humidity": 60.2
}
```

### 3. View Data:
- **GET** `http://localhost:3000/api/sensors` - All data
- **GET** `http://localhost:3000/api/sensors/test_device` - Device-specific data

## Recommended Architecture for Course

For your assignment, I recommend:

1. **Development/Testing**: Wokwi + ThingSpeak (easiest to demonstrate)
2. **Advanced**: Wokwi + Deployed Azure server (shows full stack skills)
3. **Real-world**: Physical ESP32 + Local server (most practical)

Choose based on your comfort level and available resources!