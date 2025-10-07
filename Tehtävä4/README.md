# IoT Discord Webhook & Dashboard - Tehtävä 4

Tämä projekti laajentaa Tehtävä 3:n IoT-serveriä Discord webhook -integraatiolla ja reaaliaikaisella web dashboardilla. Järjestelmä kerää sensoridataa, lähettää hälytykset Discordiin ja näyttää tiedot interaktiivisessa dashboardissa.

## 🚀 Ominaisuudet

### 📊 Web Dashboard
- **Reaaliaikainen näyttö** - WebSocket-pohjainen live-päivitys
- **Interaktiiviset kaaviot** - Temperature & humidity trendit Chart.js:llä
- **Yhteenvetokortteja** - Nopeita tilastoja sensoreista
- **Data-taulukko** - Viimeisimmät 20 lukemaa
- **Hälytysosio** - Kriittiset ja varoitus-hälytykset
- **Responsiivinen design** - Toimii mobiilissa ja työpöydällä

### 🔔 Discord Integraatio
- **Automaattiset hälytykset** - Raja-arvojen ylittyessä
- **Värikoodatut viestit** - Vihreä (OK), Keltainen (Varoitus), Punainen (Kriittinen)
- **Spam-suojaus** - Cooldown-ajat samanlaisille hälytyksille
- **Järjestelmätiedotteet** - Käynnistys ja sammutus ilmoitukset
- **Päivittäiset yhteenvedot** - Tilastoraportit

### 🌡️ Sensoridata Hallinta
- **SQLite tietokanta** - Paikallinen datasäilytys
- **RESTful API** - CRUD-operaatiot sensoritiedoille
- **WebSocket broadcasting** - Reaaliaikainen data-välitys
- **Automaattinen validointi** - Tietojen eheys

## 📁 Projektirakenne

```
Tehtävä4/
├── server.js              # Pääserveri Discord & WebSocket -integraatiolla
├── webhook.js              # Discord webhook -integraatio
├── config.js              # Konfiguraatio-asetukset
├── package.json           # Node.js riippuvuudet
├── iot_data.db           # SQLite tietokanta (luodaan automaattisesti)
├── public/               # Web dashboard tiedostot
│   ├── index.html        # Dashboard HTML-rakenne
│   ├── styles.css        # Responsiivinen CSS-design
│   └── dashboard.js      # JavaScript-logiikka & WebSocket
└── README.md             # Tämä dokumentaatio
```

## 🛠️ Asennus ja Käyttöönotto

### 1. Riippuvuuksien Asennus
```bash
cd Tehtävä4
npm install
```

### 2. Discord Webhook Konfigurointi

**a) Luo Discord Webhook:**
1. Mene Discord-palvelimellesi
2. Klikkaa hiiren oikealla painikkeella kanavaa jonne haluat viestit
3. Valitse "Edit Channel" > "Integrations" > "Webhooks"
4. Luo uusi webhook ja kopioi URL

**b) Konfiguroi webhook URL:**

**Vaihtoehtö 1 - Environment Variable (Suositeltu):**
```bash
# Windows PowerShell:
$env:DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN"

# Windows CMD:
set DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN

# Linux/Mac:
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN"
```

**Vaihtoehtö 2 - Suoraan config.js tiedostoon:**
```javascript
// config.js - Muokkaa rivi 8:
DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/YOUR_ACTUAL_WEBHOOK_ID/YOUR_ACTUAL_WEBHOOK_TOKEN"
```

### 3. Serverin Käynnistys
```bash
# Tuotantokäyttö:
npm start

# Kehityskäyttö (automaattinen uudelleenkäynnistys):
npm run dev
```

### 4. Testaus
Server käynnistyy osoitteeseen: `http://localhost:3000`

**Dashboard:** http://localhost:3000  
**API Info:** http://localhost:3000/api  
**API Dokumentaatio:** Katso alla

## 📡 API Endpoints

| Metodi | Endpoint | Kuvaus | Esimerkki |
|--------|----------|--------|-----------|
| `GET` | `/` | Web Dashboard | Avaa dashboardin |
| `GET` | `/api` | API info ja endpoint-lista | Järjestelmätiedot |
| `GET` | `/api/sensors` | Hae kaikki sensorit | Lista kaikista lukemista |
| `GET` | `/api/sensors/:deviceId` | Hae tietyn laitteen data | `esp32_01` laitteen data |
| `POST` | `/api/sensors` | Lähetä uusi sensoridata | Luo uusi lukema |
| `PUT` | `/api/sensors/:id` | Päivitä olemassa oleva data | Muokkaa ID:n mukaan |
| `DELETE` | `/api/sensors/:id` | Poista sensoridata | Poista ID:n mukaan |
| `GET` | `/api/stats` | Hae tilastotiedot | Dashboard-yhteenveto |

### API Käyttöesimerkit

**Lähetä sensoridata:**
```bash
# PowerShell:
Invoke-RestMethod -Uri "http://localhost:3000/api/sensors" -Method POST -ContentType "application/json" -Body '{"device_id":"esp32_01","temperature":23.5,"humidity":45.2}'

# curl:
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32_01","temperature":23.5,"humidity":45.2}'
```

**Hae kaikki data:**
```bash
# PowerShell:
Invoke-RestMethod -Uri "http://localhost:3000/api/sensors" -Method GET

# curl:
curl http://localhost:3000/api/sensors
```

**Hae tilastot:**
```bash
curl http://localhost:3000/api/stats
```

## ⚙️ Konfiguraatio-asetukset

### Sensor Threshold Arvot
```javascript
// config.js - Muokkaa raja-arvoja:
SENSOR_CONFIG: {
    temperature: {
        min_threshold: 15.0,  // °C - Alle tämän = varoitus
        max_threshold: 30.0,  // °C - Yli tämän = varoitus
    },
    humidity: {
        min_threshold: 30.0,  // % - Alle tämän = varoitus  
        max_threshold: 70.0,  // % - Yli tämän = varoitus
    }
}
```

### Hälytys-asetukset
```javascript
// Kuinka usein tarkistetaan (sekuntia):
MONITORING_INTERVAL: 30,

// Vähimmäisaika samankaltaisten hälytysten välillä (sekuntia):
ALERT_COOLDOWN: 300  // 5 minuuttia
```

### Discord-viestien ulkoasu
```javascript
WEBHOOK_SETTINGS: {
    username: "IoT Sensor Bot",           // Bot-nimi
    avatar_url: "https://...",            // Avatar URL
    embed_color: {
        normal: 0x00ff00,    // Vihreä - normaali
        warning: 0xffff00,   // Keltainen - varoitus
        critical: 0xff0000   // Punainen - kriittinen
    }
}
```

## 🎨 Dashboard Ominaisuudet

### Reaaliaikainen Data
- **WebSocket-yhteys** - Automaattiset päivitykset ilman sivun lataamista
- **Yhteystilan näyttö** - Online/Offline indicator
- **Viimeisin päivitys** - Timestamp milloin data viimeksi päivittyi

### Interaktiiviset Kaaviot
- **Chart.js-kirjasto** - Sujuvat animaatiot ja zoom-toiminnot
- **Aikasarja-kaaviot** - Temperature ja humidity trendit
- **Monilaite-tuki** - Eri värit eri laitteille
- **Responsiivinen** - Mukautuu näytön kokoon

### Yhteenvetokortteja
- **Sensori-määrä** - Uniikkien laitteiden lukumäärä
- **Lukema-määrä** - Kaikkien talletettujen lukemien määrä  
- **Keskiarvo-lämpötila** - Viimeisen 24h keskiarvo
- **Keskiarvo-kosteus** - Viimeisen 24h keskiarvo

### Status-indikaattorit
- **Normaali** - Vihreä, arvot rajojen sisällä
- **Varoitus** - Keltainen, arvot lievästi rajojen ulkopuolella
- **Kriittinen** - Punainen, arvot huomattavasti rajojen ulkopuolella

## 🔔 Discord Hälytystyypit

### Normaalit Viestit (Vihreä)
- Uusi sensoridata vastaanotettu
- Arvot normaalien rajojen sisällä
- Järjestelmän käynnistys onnistunut

### Varoitukset (Keltainen)
- Lämpötila: < 15°C tai > 30°C
- Kosteus: < 30% tai > 70%
- Järjestelmän sammutus

### Kriittiset Hälytykset (Punainen)
- Lämpötila: < 10°C tai > 35°C  
- Kosteus: < 20% tai > 80%
- Järjestelmävirheet

### Päivittäiset Yhteenvedot
- Kokonaislukemien määrä
- Keskiarvolämpötila ja -kosteus
- Aktiivisten laitteiden määrä
- Hälytysten määrä päivän aikana

## 🔧 Tekninen Implementaatio

### Backend (Node.js)
- **Express.js** - Web server ja API
- **SQLite3** - Tietokantahallinta
- **Socket.IO** - Reaaliaikainen kommunikaatio
- **Axios** - HTTP-pyynnöt Discord webhookille
- **CORS** - Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript** - Ei frameworkeja, kevyt toteutus
- **Chart.js** - Data-visualisointi
- **Socket.IO Client** - Reaaliaikainen data-päivitys
- **Responsive CSS** - Mobiiliystävällinen design
- **CSS Grid & Flexbox** - Moderni layout

### Tietokanta (SQLite)
```sql
CREATE TABLE sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    temperature REAL,
    humidity REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚨 Vianmääritys

### Server ei käynnisty
```
Error: Cannot find module './config'
```
**Ratkaisu:** Varmista että `config.js` tiedosto on luotu ja sijaitsee oikeassa hakemistossa.

### Discord-viestit eivät lähetä
```
Discord webhook not configured
```
**Ratkaisu:** 
1. Tarkista että webhook URL on asetettu oikein
2. Testaa webhook URL suoraan selaimessa
3. Varmista että bot-oikeudet ovat kunnossa Discord-kanavalla

### Dashboard ei lataudu
**Ratkaisu:**
1. Tarkista että server on käynnissä portissa 3000
2. Avaa `http://localhost:3000` selaimessa
3. Tarkista konsoli-virheet (F12)

### WebSocket ei toimi  
**Ratkaisu:**
1. Tarkista että Socket.IO on asennettu: `npm list socket.io`
2. Varmista että firewall ei estä websocket-yhteyksiä
3. Kokeile päivittää sivu (F5)

### Tietokanta-virheet
```
Database locked
```
**Ratkaisu:**
1. Sulje kaikki avoinna olevat tietokantayhteydet
2. Poista `iot_data.db` ja anna serverin luoda se uudelleen
3. Varmista että ei ole useita server-instansseja käynnissä

## 📝 Kehitysehdotukset

### Lähitulevaisuus
- [ ] **Käyttäjäautentikaatio** - Login/logout dashboard
- [ ] **Data-eksportti** - CSV/JSON latausmahdollisuus
- [ ] **Hälytysten hallinta** - Käyttäjä voi mute/unmute hälytyksiä
- [ ] **Historiadata** - Pidempi data-säilytys ja -näyttö
- [ ] **Laajennetut sensorit** - Tuki valoisuus, paine, jne.

### Pitkäaikainen
- [ ] **Multi-tenant tuki** - Useita käyttäjiä/organisaatioita
- [ ] **Cloud deployment** - Heroku/AWS hosting
- [ ] **Machine Learning** - Anomaliadetektio sensordatasta  
- [ ] **Mobile app** - React Native/Flutter sovellus
- [ ] **MQTT protokolla** - Parempi IoT-protokolla tuki

## 📞 Tuki ja Kehitys

### Loggitiedostot
Server tulostaa lokitietoja konsoliin:
- **Vihreät ✅** - Onnistuneet operaatiot
- **Keltaiset ⚠️** - Varoitukset 
- **Punaiset ❌** - Virheet

### Debug-tilat
```bash
# Aja debug-tilassa:
DEBUG=* node server.js

# Tai ainoastaan socket.io debug:
DEBUG=socket.io* node server.js
```

### API-testaus
Käytä työkaluja kuten:
- **Postman** - GUI API testing
- **curl** - Command line testing  
- **ThunderClient** - VS Code extension

---

## 🎯 Projektin Yhteenveto

Tämä Tehtävä 4 laajentaa onnistuneesti Tehtävä 3:n IoT-serveriä merkittävästi:

✅ **Discord Webhook Integration** - Automaattiset hälytykset ja tilastoraportit  
✅ **Real-time Web Dashboard** - Interaktiivinen käyttöliittymä WebSocket-tuella  
✅ **Enhanced API** - Laajennetut endpointit ja parempi error handling  
✅ **Responsive Design** - Toimii kaikilla laitteilla  
✅ **Professional Documentation** - Kattava käyttö- ja kehitysohjeistus  

Järjestelmä on valmis tuotantokäyttöön pienissä IoT-projekteissa ja soveltuu erinomaisesti oppimis- ja kehitysympäristöksi.

**Tekijä:** IoT-perusteet Kurssi - Tehtävä 4  
**Päivämäärä:** Lokakuu 2025  
**Versio:** 2.0.0