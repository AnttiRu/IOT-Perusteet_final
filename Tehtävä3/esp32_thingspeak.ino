#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHT_PIN 2        // ESP32: GPIO2
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
    HTTPClient http;
    
    // Rakenna URL parametreilla
    String url = "http://api.thingspeak.com/update?api_key=" + String(apiKey) + 
                 "&field1=" + String(temp, 1) + "&field2=" + String(hum, 1);
    
    Serial.println("Sending to: " + url);
    
    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response: " + String(httpResponseCode));
      Serial.println("ThingSpeak Response: " + response);
      
      if (response.toInt() > 0) {
        Serial.println("✅ Data sent successfully!");
      } else {
        Serial.println("❌ ThingSpeak error");
      }
    } else {
      Serial.println("❌ HTTP Error: " + String(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("❌ WiFi not connected");
  }
}