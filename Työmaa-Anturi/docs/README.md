# Dokumentaatio - Kuvat

Tähän kansioon voit lisätä kuvankaappaukset käyttöliittymästä.

## Tarvittavat kuvankaappaukset

### 1. Dashboard Screenshot (`dashboard-screenshot.png`)

**Kuinka ottaa kuvankaappaus:**
1. Käynnistä backend-palvelin: `npm start`
2. Avaa selain: http://localhost:3000
3. Lähetä testimittaus (katso README:n API-testaus)
4. Ota kuvankaappaus koko dashboardista (F12 DevTools → Ctrl+Shift+P → "Capture full size screenshot")
5. Tallenna kuva nimellä `dashboard-screenshot.png` tähän kansioon

**Suositus:**
- Resoluutio: 1920x1080 tai suurempi
- Näytä: Yhteenvetokortit, osastojen painekortit ja vähintään 2 kaaviota
- Varmista että värikoodaus näkyy (vihreä/keltainen/punainen)

### 2. Discord Notifications (`discord-notifications.png`)

**Kuinka ottaa kuvankaappaus:**
1. Aja webhook-testit: `node backend/test-webhook.js`
2. Avaa Discord-kanava: https://discord.gg/F2NPsW5x5J
3. Ota kuvankaappaus kaikista kolmesta testviestistä:
   - Vihreä testviesti
   - Keltainen varoitusviesti
   - Punainen kriittinen hälytys
4. Tallenna kuva nimellä `discord-notifications.png` tähän kansioon

**Suositus:**
- Näytä kaikki kolme embed-viestiä peräkkäin
- Varmista että värikoodaus ja ikonit näkyvät selkeästi
- Leikkaa pois Discord-käyttöliittymän ylimääräiset osat

---

## Placeholder-kuvat

Jos et halua ottaa kuvankaappauksia heti, voit käyttää placeholder-kuvia:

### Vaihtoehto 1: Via.placeholder.com
```markdown
![Dashboard](https://via.placeholder.com/1200x800/1a1a1a/00ff00?text=Työmaa-Anturi+Dashboard)
![Discord](https://via.placeholder.com/600x800/7289da/ffffff?text=Discord+Notifications)
```

### Vaihtoehto 2: Shields.io badge
```markdown
![Dashboard - Coming Soon](https://img.shields.io/badge/Dashboard-Screenshot_Coming_Soon-blue?style=for-the-badge)
![Discord - Coming Soon](https://img.shields.io/badge/Discord-Screenshot_Coming_Soon-7289da?style=for-the-badge)
```

### Vaihtoehto 3: Luo omat placeholder-kuvat
Käytä esim. Canva, Figma tai Paint.NET:iä luomaan yksinkertaiset placeholder-kuvat.

---

## Lisädokumentaatio

Harkitse myös näiden lisäämistä:

- `wokwi-simulation.png` - Kuva Wokwi-simulaatiosta
- `architecture-diagram.png` - Järjestelmän arkkitehtuurikaavio
- `pressure-logic.png` - Havainnekuva alipainelogiikasta
- `installation-guide.pdf` - Yksityiskohtainen asennusohje

---

**Vinkki:** GitHub README näyttää kuvat automaattisesti kun ne ovat repositoryssä!
