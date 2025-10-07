#include <WiFi.h>
#include <WiFiClient.h>
// DHT sensor library for Arduino
#include "DHT.h"

#define DHT_PIN 2        // Pico W: GP2 (pin 4)
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* apiKey = "FO4N72M0XP3NAKB0"; // ThingSpeak Write API Key

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  dht.begin();
  
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Tarkista onko lukema onnistunut
  if (!isnan(temperature) && !isnan(humidity)) {
    Serial.printf("Temperature: %.1f°C, Humidity: %.1f%%\n", temperature, humidity);
    sendToThingSpeak(temperature, humidity);
  } else {
    Serial.println("Failed to read from DHT22 sensor!");
  }
  
  delay(20000); // Lähetä 20 sekunnin välein (ThingSpeakin minimiraja)
}

void sendToThingSpeak(float temp, float hum) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    
    // ThingSpeak server details
    const char* server = "api.thingspeak.com";
    const int port = 80;
    
    // Create HTTP request
    String url = "/update?api_key=" + String(apiKey) + 
                 "&field1=" + String(temp, 1) + "&field2=" + String(hum, 1);
    
    Serial.println("Connecting to ThingSpeak...");
    
    if (client.connect(server, port)) {
      // Send HTTP GET request
      client.print("GET " + url + " HTTP/1.1\r\n");
      client.print("Host: api.thingspeak.com\r\n");
      client.print("Connection: close\r\n\r\n");
      
      // Wait for response
      unsigned long timeout = millis() + 5000;
      while (client.available() == 0) {
        if (millis() > timeout) {
          Serial.println("❌ Request timeout");
          client.stop();
          return;
        }
      }
      
      // Read response
      String response = "";
      while (client.available()) {
        response += client.readString();
      }
      
      // Check if successful (response contains entry number > 0)
      int entryNumber = response.substring(response.lastIndexOf('\n')).toInt();
      if (entryNumber > 0) {
        Serial.println("✅ Data sent successfully! Entry: " + String(entryNumber));
      } else {
        Serial.println("❌ ThingSpeak error");
      }
      
      client.stop();
    } else {
      Serial.println("❌ Connection to ThingSpeak failed");
    }
  } else {
    Serial.println("❌ WiFi not connected");
  }
}