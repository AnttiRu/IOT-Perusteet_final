# Postman - Yksityiskohtaiset käyttöohjeet

## 1. Lataa ja asenna Postman
1. Mene: https://www.postman.com/downloads/
2. Lataa ja asenna Postman
3. Luo tili tai kirjaudu sisään

## 2. Luo uusi Collection (valinnainen mutta suositeltava)
1. Avaa Postman
2. Klikkaa "Collections" vasemmalla
3. Klikkaa "Create Collection"
4. Nimeä se esim. "IoT Backend Tests"

## 3. TESTI 1: Tarkista palvelimen tila (GET)

### Vaiheet:
1. **Luo uusi request**
   - Klikkaa "New" → "HTTP Request"
   
2. **Aseta request-tyyppi**
   - Dropdown-valikosta valitse **GET**
   
3. **Syötä URL**
   ```
   http://localhost:3000/
   ```
   
4. **Lähetä request**
   - Klikkaa "Send"
   
5. **Odotettu vastaus** (Status: 200 OK):
   ```json
   {
       "message": "IoT Backend Server is running",
       "status": "OK",
       "totalReadings": 0
   }
   ```

## 4. TESTI 2: Lähetä lämpötiladataa (POST)

### Vaiheet:
1. **Luo uusi request**
   - Klikkaa "New" → "HTTP Request"
   
2. **Aseta request-tyyppi**
   - Dropdown-valikosta valitse **POST**
   
3. **Syötä URL**
   ```
   http://localhost:3000/temperature
   ```
   
4. **Aseta Headers**
   - Klikkaa "Headers" välilehti
   - Lisää: Key: `Content-Type`, Value: `application/json`
   
5. **Aseta Body**
   - Klikkaa "Body" välilehti
   - Valitse "raw"
   - Dropdown-valikosta valitse "JSON"
   - Syötä:
   ```json
   {
       "temperature": 23.5
   }
   ```
   
6. **Lähetä request**
   - Klikkaa "Send"
   
7. **Odotettu vastaus** (Status: 201 Created):
   ```json
   {
       "message": "Temperature data received successfully",
       "data": {
           "id": 1,
           "temperature": 23.5,
           "timestamp": "2025-10-06T...",
           "receivedAt": "2025-10-06T..."
       }
   }
   ```

## 5. TESTI 3: Hae kaikki lämpötilamittaukset (GET)

### Vaiheet:
1. **Luo uusi GET request**
2. **URL**: `http://localhost:3000/temperature`
3. **Lähetä**
4. **Odotettu vastaus**:
   ```json
   {
       "readings": [
           {
               "id": 1,
               "temperature": 23.5,
               "timestamp": "...",
               "receivedAt": "..."
           }
       ],
       "count": 1
   }
   ```

## 6. TESTI 4: Hae viimeisin mittaus (GET)

### Vaiheet:
1. **URL**: `http://localhost:3000/temperature/latest`
2. **Lähetä GET request**

## 7. TESTI 5: Tyhjennä kaikki data (DELETE)

### Vaiheet:
1. **Luo DELETE request**
2. **URL**: `http://localhost:3000/temperature`
3. **Lähetä**

## 📸 Kuvakaappaukset tärkeistä kohdista

### Request-asetusten näkymä:
- **Method dropdown**: Vasemmalla ylhäällä (GET/POST/DELETE)
- **URL kenttä**: Keskellä ylhäällä
- **Headers/Body/etc**: Välilehdet URL:n alla

### POST request Body-asetukset:
1. Body välilehti
2. "raw" valittu
3. "JSON" dropdown valittu
4. JSON data kirjoitettuna

## 🚨 Yleisiä ongelmia ja ratkaisuja

### "Connection refused" tai "Network Error"
- Varmista että palvelin on käynnissä (katso terminaali)
- Tarkista että URL on `http://localhost:3000` (ei https)

### POST request ei toimi
- Varmista että Headers sisältää: `Content-Type: application/json`
- Varmista että Body on asetettu "raw" + "JSON" tilaan
- Tarkista JSON syntaksi

### 404 Not Found
- Tarkista URL polku
- Varmista että käytät oikeaa HTTP metodia

## 💡 Vinkkejä
- Tallenna requests Collectioniin myöhempää käyttöä varten
- Käytä "Tests" välilehteä automaattiseen vastausten tarkistukseen
- Kokeile erilaisia lämpötila-arvoja (negatiivisia, desimaaleja)