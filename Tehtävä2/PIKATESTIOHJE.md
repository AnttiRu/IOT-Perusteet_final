# 🚀 Postman Pikatestiohje - 5 minuutissa

## ✅ Varmista ensin:
- Palvelimesi on käynnissä (näet terminaalissa: "IoT Backend server running at http://localhost:3000")
- Postman on asennettuna ja avoinna

## 🎯 4 nopeaa testiä

### 1️⃣ **Palvelimen tila** (30 sekuntia)
```
Method: GET
URL: http://localhost:3000/
```
**Klikkaa Send** → Pitäisi näyttää "IoT Backend Server is running"

---

### 2️⃣ **Lähetä lämpötiladata** (2 minuuttia)
```
Method: POST
URL: http://localhost:3000/temperature
```
**Headers**: 
- Key: `Content-Type`
- Value: `application/json`

**Body** (valitse raw + JSON):
```json
{
    "temperature": 25.5
}
```
**Klikkaa Send** → Pitäisi palauttaa "Temperature data received successfully"

---

### 3️⃣ **Tarkista tallentunut data** (30 sekuntia)
```
Method: GET
URL: http://localhost:3000/temperature
```
**Klikkaa Send** → Pitäisi näyttää äsken lähettämäsi 25.5°C

---

### 4️⃣ **Hae viimeisin mittaus** (30 sekuntia)
```
Method: GET
URL: http://localhost:3000/temperature/latest
```
**Klikkaa Send** → Saman datan pitäisi tulla

## 🎉 Jos kaikki toimii:
✅ Backend palvelimesi on valmis!
✅ API endpointit toimivat!
✅ Voit nyt yhdistää IoT-laitteesi!

## ❌ Jos jokin ei toimi:
1. Tarkista että palvelin on käynnissä terminaalissa
2. Varmista URL:t ovat oikein kirjoitettu
3. POST requestissa muista Headers ja JSON Body
4. Kysy apua jos tarvitset! 😊