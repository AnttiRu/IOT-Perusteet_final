# 🚀 GitHub Siirto-ohje

## Pikaohjeet - GitHub Upload

### Vaihe 1: Valmistele Repository

```powershell
# Navigoi projektin juureen
cd "c:\Users\Aruha\OneDrive - LUT University\Koulu\Syksy 2025\Iot-perusteet"

# Aja valmisteluskripti
.\prepare-github.ps1
```

### Vaihe 2: Tarkista Tiedostot

**Tarkista että nämä EIVÄT ole mukana:**
```powershell
# Listaa ignored tiedostot
git status --ignored

# Pitäisi näkyä:
# - node_modules/
# - *.db
# - .env
# - secret.py
```

### Vaihe 3: Luo GitHub Repository

1. Mene: https://github.com/new
2. Repository name: `Iot-perusteet`
3. Description: "IoT-perusteet kurssin projektit - LUT University"
4. **Public** tai **Private** (valitse)
5. **EI** Initialize with README (meillä on jo)
6. Create repository

### Vaihe 4: Yhdistä ja Lähetä

```powershell
# Alusta git (jos ei jo tehty)
git init

# Lisää kaikki tiedostot
git add .

# Tarkista mitä lisätään
git status

# Committaa
git commit -m "Initial commit: IoT-perusteet course projects"

# Lisää GitHub remote (korvaa YOUR_USERNAME)
git remote add origin https://github.com/AnttiRu/Iot-perusteet.git

# Lähetä GitHubiin
git push -u origin main
```

---

## 🔒 Turvallisuus Checklist

Ennen pushausta, varmista:

### ✅ Pakolliset Tarkistukset
- [ ] `.gitignore` on paikallaan
- [ ] Ei Discord webhook URL:eja koodissa
- [ ] Ei API-avaimia
- [ ] Ei salasanoja
- [ ] Ei `.db` tai `.sqlite` tiedostoja
- [ ] Ei `node_modules/` kansioita
- [ ] Ei `.env` tiedostoja (vain `.env.example`)

### ✅ Suositellut Tarkistukset
- [ ] README.md on ajantasalla
- [ ] Kaikki linkit toimivat
- [ ] Dokumentaatio on täydellinen
- [ ] Testit dokumentoitu

---

## 📁 Mitä Siirretään GitHubiin?

### ✅ Siirretään (Pitäisi olla mukana)
```
✅ README.md files
✅ Source code (.js, .py, .ino)
✅ Configuration examples (.example.js, .env.example)
✅ Documentation (docs/)
✅ Tests (*.test.js, test-*.js)
✅ Package.json files
✅ Wokwi diagrams (diagram.json)
✅ SVG images (dashboard-screenshot.svg)
✅ .gitignore
```

### ❌ EI Siirretä (Ignoroitu)
```
❌ node_modules/
❌ *.db, *.sqlite files
❌ .env files (vain .env.example OK)
❌ secret.py, secred.py
❌ *.log files
❌ __pycache__/
❌ .vscode/ (ellei tarkoituksella)
❌ Personal screenshots with sensitive data
```

---

## 🔧 Ongelmatilanteita

### Ongelma 1: "Discord webhook näkyy historiassa"

**Jos olet jo committannut webhookin:**

```powershell
# VAIHTOEHTO A: Soft reset (säilytä muutokset)
git reset --soft HEAD~1

# Poista webhook config.js:stä
# Committaa uudelleen
git commit -m "Initial commit: IoT-perusteet projects"

# VAIHTOEHTO B: Rewrite history (VAROITUS!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/config.js" \
  --prune-empty --tag-name-filter cat -- --all
```

**Sitten:**
1. Regeneroi Discord webhook (vanha on vaarantunut!)
2. Päivitä `.env` tai `config.js` (lokaalisti)
3. Pushaa puhdas repository

### Ongelma 2: "node_modules siirtyi GitHubiin"

```powershell
# Poista GitHubista
git rm -r --cached node_modules
git commit -m "Remove node_modules from repository"
git push
```

### Ongelma 3: "Database tiedosto siirtyi"

```powershell
# Poista database
git rm --cached *.db
git commit -m "Remove database files from repository"
git push
```

---

## 🎯 Suositeltu Commit-viesti

```
Initial commit: IoT-perusteet course projects

Includes:
- Tehtävä 1: Wokwi IoT simulations (6 projects)
- Tehtävä 2: Node.js REST API server
- Tehtävä 3: ThingSpeak integration
- Työmaa-Anturi: Construction site monitoring system

Features:
- Raspberry Pi Pico + MicroPython
- Express.js backend with SQLite
- Real-time WebSocket dashboard
- Discord webhook alerts
- Comprehensive testing suite (96.4% pass rate)

Documentation:
- Full README with setup instructions
- API documentation
- Testing guides
- Safety and legal references
```

---

## 📝 GitHub README Badges (Valinnainen)

Lisää nämä README:n alkuun:

```markdown
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![Python Version](https://img.shields.io/badge/python-3.x-blue)
![Tests](https://img.shields.io/badge/tests-96.4%25%20passing-success)
```

---

## ✅ Valmis!

Kun olet saanut projektin GitHubiin:

1. **Tarkista GitHub-sivulla** että kaikki näyttää hyvältä
2. **Testaa kloonaus** toisella koneella:
   ```bash
   git clone https://github.com/AnttiRu/Iot-perusteet.git
   cd Iot-perusteet
   # Testaa että projektit toimivat
   ```
3. **Päivitä Dependencies**:
   ```bash
   cd Tehtävä2 && npm install
   cd ../Tehtävä3 && npm install
   cd ../Työmaa-Anturi/backend && npm install
   ```

---

## 📧 Tuki

Ongelmia? Tarkista:
- [GitHub Git Guides](https://github.com/git-guides)
- [Git Documentation](https://git-scm.com/doc)
- [.gitignore Generator](https://www.toptal.com/developers/gitignore)

---

**🎉 Onnea GitHub-siirtoon!**
