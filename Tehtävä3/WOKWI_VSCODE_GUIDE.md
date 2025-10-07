# Wokwi VS Code Project

## 📋 **Mitä on tehty:**

1. ✅ **Wokwi Simulator** asennettu VS Codeen
2. ✅ **Arduino-koodi** luotu (`wokwi_thingspeak.ino`)
3. ✅ **Piirikaavio** luotu (`diagram.json`)
4. ✅ **Kytkennät** määritelty: Pico W + DHT22

## 🔧 **Kytkennät:**
- DHT22 VCC → Pico 3V3
- DHT22 DATA → Pico GP2 (pin 4)  
- DHT22 GND → Pico GND

## 🎯 **Seuraavat vaiheet:**

### 1. **ThingSpeak setup** (jos et ole vielä tehnyt):
- Luo tili: https://thingspeak.com
- Luo Channel kahteen kenttään: Temperature, Humidity
- Kopioi Write API Key

### 2. **Muokkaa koodi:**
- Avaa `wokwi_thingspeak.ino`
- Korvaa `"TÄHÄN_SINUN_API_KEY"` omalla API-avaimellasi

### 3. **Käynnistä simulaatio:**
- Avaa VS Coden Command Palette (Ctrl+Shift+P)
- Hae: "Wokwi: Start Simulator"
- TAI klikkaa F1 ja hae "Wokwi"

### 4. **Seuraa tuloksia:**
- Serial Monitor näyttää WiFi-yhteyden ja data-lähetyksen
- Tarkista ThingSpeak että data saapuu

## 🔧 **VS Code Wokwi-komennot:**
- **F1** → "Wokwi: Start Simulator" = Käynnistä simulaatio
- **F1** → "Wokwi: Stop Simulator" = Pysäytä simulaatio  
- **F1** → "Wokwi: Request new license" = Lisenssi (jos tarvitaan)

## 🎯 **Edut VS Code + Wokwi:**
- Kaikki samassa ympäristössä
- IntelliSense-tuki
- Git-integraatio
- Helppo debuggaus
- Projektinhallinta

Kerro kun olet saanut ThingSpeak API Key:n, niin voit testata simulaatiota! 🚀