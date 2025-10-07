# 🎓 IoT-perusteet - Kurssin Projektit

**IoT-perusteet kurssin harjoitustyöt ja projektit**  
LUT University - Syksy 2025

---

## 📚 Sisältö

Tämä repository sisältää IoT-perusteet kurssin tehtävät ja projektit:

### 📁 Tehtävä 1 - Wokwi IoT Simulaatiot
**MicroPython-pohjaiset IoT-laitteet Wokwi-simulaattorissa**

Projektit:
- **Interrup** - Keskeytyslogiikka
- **led_vilkutus** - Perus LED-ohjaus
- **Liikennevalo** - Liikennevalojen simulaatio
- **Sääasema** - Sääantureiden lukeminen (DHT22)
- **Sääasema_backend** - Säädata backend-integraatiolla
- **Varashälytin** - PIR-sensoripohjainen hälytin

### 📁 Tehtävä 2 - Node.js API Server
**Express.js-pohjainen REST API**

Ominaisuudet:
- RESTful API endpoints
- Datan käsittely ja tallennus
- Postman-testaus
- Dokumentaatio

### 📁 Tehtävä 3 - Laajennettu IoT Server
**ThingSpeak-integraatio ja kehittyneet ominaisuudet**

Ominaisuudet:
- ESP32/Wokwi ThingSpeak-yhteys
- Arduino-tuki (.ino)
- CI/CD Pipeline
- Laajennettu dokumentaatio

### 🏗️ Työmaa-Anturi (Pääteprojekti)
**Rakennustyömaan alipaine- ja ilmanlaadunvalvontajärjestelmä**

Kattava IoT-järjestelmä joka yhdistää:
- Raspberry Pi Pico + MicroPython
- Node.js backend + SQLite
- Reaaliaikainen WebSocket-dashboard
- Discord webhook -hälytykset
- Useita sensoreita (DHT22, BMP280, PM2.5/PM10)

👉 **[Katso Työmaa-Anturi dokumentaatio →](./Työmaa-Anturi/README.md)**

---

## 🚀 Pika-aloitus

### Vaatimukset
- Node.js v16+ (Tehtävät 2-3, Työmaa-Anturi)
- Python 3.x (MicroPython simulointiin)
- Wokwi-tili (Tehtävä 1)

### Asennus

#### 1. Kloonaa repository
```bash
git clone https://github.com/AnttiRu/Iot-perusteet.git
cd Iot-perusteet
```

#### 2. Tehtävä 2 - Node.js API
```bash
cd Tehtävä2
npm install
npm start
```

#### 3. Tehtävä 3 - ThingSpeak Server
```bash
cd Tehtävä3
npm install
npm start
```

#### 4. Työmaa-Anturi
```bash
cd Työmaa-Anturi/backend
npm install
cp .env.example .env  # Muokkaa Discord webhook URL
npm start
```

---

## 🧪 Testaus

### Automaattiset testit
```bash
# Testaa tehtävät 1-3
cd Tehtävä4
node course-tests.js

# Testaa Työmaa-Anturi
cd Työmaa-Anturi
node test-tyomaa-anturi.js
```

### API-testaus
- **Postman**: Katso `Tehtävä2/POSTMAN_OHJEET.md`
- **cURL**: Katso esimerkit README-tiedostoista

---

## 📊 Projektin Status

| Tehtävä | Status | Testikattavuus |
|---------|--------|----------------|
| Tehtävä 1 | ✅ Valmis | 96.9% (31/32) |
| Tehtävä 2 | ✅ Valmis | 100% (10/10) |
| Tehtävä 3 | ✅ Valmis | 92.3% (12/13) |
| Työmaa-Anturi | ✅ Valmis | 97.5% (39/40) |
| **Kokonais** | **✅ Valmis** | **96.4% (53/55)** |

---

## 📖 Dokumentaatio

### Tehtäväkohtaiset README:t
- [Tehtävä 1 - Wokwi Projektit](./Tehtävä1/)
- [Tehtävä 2 - Node.js API](./Tehtävä2/README.md)
- [Tehtävä 3 - ThingSpeak Server](./Tehtävä3/README.md)
- [Työmaa-Anturi - Pääteprojekti](./Työmaa-Anturi/README.md)

### Ohjeet
- [Postman Testaus](./Tehtävä2/POSTMAN_OHJEET.md)
- [Pipeline Guide](./Tehtävä3/PIPELINE_GUIDE.md)
- [Wokwi VS Code](./Tehtävä3/WOKWI_VSCODE_GUIDE.md)

---

## 🛠️ Teknologiat

### Hardware & Simulaatio
- Raspberry Pi Pico
- ESP32
- Wokwi Simulator
- Arduino IDE

### Backend
- Node.js + Express
- SQLite3
- Socket.IO
- Discord Webhooks

### IoT Protocols & Services
- HTTP/REST
- WebSockets
- ThingSpeak API
- MQTT (tulevaisuudessa)

### Sensorit
- DHT22 (Lämpötila & Kosteus)
- BMP280 (Ilmanpaine)
- PM2.5/PM10 (Pienhiukkaset)
- PIR (Liikeanturi)

---

## 🔒 Turvallisuus

⚠️ **Tärkeää:**
- **EI webhook URL:eja koodissa**
- **EI API-avaimia repositoryssä**
- **EI salasanoja tai tokeneita**
- Käytä `.env`-tiedostoja (ei versionhallinnassa)
- Katso `.gitignore` ja `GITHUB_CHECKLIST.md`

---

## 📚 Lähteet

Projekteissa käytetyt resurssit:
- [Wokwi Documentation](https://docs.wokwi.com/)
- [Raspberry Pi Forums](https://forums.raspberrypi.com/)
- [Arduino Forum](https://forum.arduino.cc/)
- [Stack Overflow](https://stackoverflow.com/)
- [ThingSpeak Documentation](https://www.mathworks.com/help/thingspeak/)
- AI-avustajat: Claude, ChatGPT

---

## 👥 Tekijä

**Antti Ruha**  
IoT-perusteet kurssi  
LUT University - Syksy 2025

---

## 📄 Lisenssi

MIT License - Vapaa käyttö opetus- ja oppimstarkoituksiin

---

## 🤝 Yhteistyö

Kysymyksiä tai ehdotuksia?
- 🐛 [Raportoi bugi](https://github.com/AnttiRu/Iot-perusteet/issues)
- 💡 [Ehdota parannusta](https://github.com/AnttiRu/Iot-perusteet/issues)
- 📧 Ota yhteyttä kurssin kautta

---

**🎓 Onnea oppimiseen ja rakentamiseen!**
