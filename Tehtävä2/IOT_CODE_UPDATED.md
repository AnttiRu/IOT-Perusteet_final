# Updated IoT Code for Your Backend Server

## Modified MicroPython Code
Replace your ThingSpeak code with this version that sends data to your local backend:

```python
import network
import time
import urequests
import dht
from machine import Pin
import ujson

# Wi-Fi credentials
ssid = 'Wokwi-GUEST'
password = ''

# Your Backend Server Configuration
BACKEND_URL = 'http://YOUR_COMPUTER_IP:3000/temperature'  # Replace YOUR_COMPUTER_IP with your actual IP

# Set up Wi-Fi in station mode
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

# Wait until connected
print("Connecting to Wi-Fi...", end="")
while not wlan.isconnected():
    print(".", end="")
    time.sleep(0.5)

print("\nConnected!")
print("IP address:", wlan.ifconfig()[0])

# Initialize the DHT22 sensor on GPIO pin 15
sensor = dht.DHT22(Pin(15))

# Function to send temperature data to your backend
def send_to_backend(temp):
    if temp is None:
        print("No temperature data to send.")
        return
    
    try:
        # Prepare the data payload
        data = {
            "temperature": temp,
            "timestamp": time.time()  # Unix timestamp
        }
        
        # Send HTTP POST request to your backend
        response = urequests.post(
            BACKEND_URL,
            json=data,  # Send as JSON
            headers={'Content-Type': 'application/json'}
        )
        
        print("Backend response status:", response.status_code)
        print("Backend response:", response.text)
        response.close()
        
    except Exception as e:
        print("Failed to send data to backend:", e)

# Main loop: read sensor and send data every 15 seconds
while True:
    try:
        sensor.measure()
        temperature = sensor.temperature()
        print("Temperature:", temperature, "°C")
        send_to_backend(temperature)
        
    except Exception as e:
        print("Error reading sensor or sending data:", e)
    
    time.sleep(15)  # Wait 15 seconds before next reading
```

## Setup Instructions

1. **Find Your Computer's IP Address**
   Run this in PowerShell to find your IP:
   ```powershell
   ipconfig | findstr "IPv4"
   ```

2. **Update the IoT Code**
   Replace `YOUR_COMPUTER_IP` in the `BACKEND_URL` with your actual IP address.

3. **Make Sure Your Server is Running**
   Your Node.js server should be running on port 3000.

4. **Test the Connection**
   The IoT device should now send temperature data every 15 seconds to your backend.

## Example with Real IP
If your computer's IP is 192.168.1.100, the URL would be:
```python
BACKEND_URL = 'http://192.168.1.100:3000/temperature'
```