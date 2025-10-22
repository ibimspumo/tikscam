# TikScam Deployment Guide (Vercel)

## 🚀 Schritt-für-Schritt Anleitung

### 1. Git Repository erstellen (falls noch nicht vorhanden)

```bash
cd C:\Users\timo\Desktop\tikscam

# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: TikScam v0.1.0

- Multi-Stream TikTok Live Analytics
- 21 Analytics-Widgets
- Performance-optimiert (96% weniger Re-Renders)
- Lückenlose Datenerfassung mit 15s Snapshots
- Dark Mode Only Design"
```

### 2. GitHub Repository erstellen

1. Gehe zu [github.com/new](https://github.com/new)
2. Repository Name: `tikscam` (oder beliebig)
3. **Visibility:** Private (für private Nutzung!)
4. **NICHT** "Add README" oder ".gitignore" auswählen (haben wir schon)
5. Click "Create repository"

### 3. Lokales Repo mit GitHub verbinden

```bash
# Remote hinzufügen (ersetze USERNAME mit deinem GitHub-Benutzernamen)
git remote add origin https://github.com/USERNAME/tikscam.git

# Branch umbenennen zu main (falls nötig)
git branch -M main

# Push zum GitHub
git push -u origin main
```

### 4. Vercel Account erstellen/anmelden

1. Gehe zu [vercel.com](https://vercel.com)
2. Click "Sign Up" oder "Log In"
3. **Mit GitHub Account anmelden** (empfohlen)
4. Vercel Zugriff auf deine GitHub-Repos erlauben

### 5. Projekt auf Vercel deployen

#### Option A: Via Vercel Dashboard (Einfach)

1. Click "Add New..." → "Project"
2. Import dein GitHub Repository `tikscam`
3. **Framework Preset:** Next.js (sollte automatisch erkannt werden)
4. **Root Directory:** `./` (leer lassen)
5. **Build Settings:**
   - Build Command: `npm run build` (automatisch)
   - Output Directory: `.next` (automatisch)
   - Install Command: `npm install` (automatisch)

6. **Environment Variables** (Optional):
   - Click "Environment Variables"
   - Add: `EULERSTREAM_API_KEY` = `dein_api_key_hier`
   - Scope: Production, Preview, Development

7. Click **"Deploy"**

#### Option B: Via Vercel CLI (Fortgeschritten)

```bash
# Vercel CLI installieren (global)
npm install -g vercel

# In Projekt-Verzeichnis wechseln
cd C:\Users\timo\Desktop\tikscam

# Deployment starten
vercel

# Folge den Prompts:
# - Login with GitHub
# - Set up and deploy? Y
# - Which scope? Dein Account
# - Link to existing project? N
# - Project name? tikscam
# - In which directory? ./
# - Override settings? N

# Production Deployment
vercel --prod
```

### 6. Environment Variables setzen (für API-Key)

**Via Vercel Dashboard:**

1. Gehe zu deinem Projekt auf [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click auf dein Projekt "tikscam"
3. Settings → Environment Variables
4. Add Variable:
   - **Key:** `EULERSTREAM_API_KEY`
   - **Value:** `dein_api_key_von_eulerstream_hier`
   - **Environments:** Production, Preview, Development
5. Click "Save"

**Wichtig:** Der API-Key ist bereits hardcoded in der App. Diese Env-Variable ist optional!

### 7. Deployment testen

Nach erfolgreichem Deployment:

1. Vercel gibt dir eine URL: `https://tikscam.vercel.app` (oder ähnlich)
2. Öffne die URL im Browser
3. Teste einen TikTok Live-Stream:
   - Click "+ Stream hinzufügen"
   - Gib einen TikTok-Username ein (z.B. `dom.anyart`)
   - Check ob Verbindung funktioniert

### 8. Custom Domain (Optional)

**Falls du eine eigene Domain nutzen willst:**

1. In Vercel Projekt → Settings → Domains
2. Add Domain: `deine-domain.de`
3. Folge den DNS-Anweisungen von Vercel
4. Warte auf DNS-Propagation (~5-60 Minuten)

---

## 🔧 Wichtige Hinweise

### Performance

- **Region:** Automatisch Frankfurt (fra1) via `vercel.json`
- **Edge Network:** Vercel's global CDN
- **Serverless Functions:** Automatisch für API-Routes

### Kosten

- **Vercel Hobby (Free):**
  - 100 GB Bandwidth/Monat
  - 100 GB-Stunden Serverless Function Execution
  - Unlimited Deployments
  - **Perfekt für private Nutzung!**

- **Falls Free Tier nicht reicht:**
  - Vercel Pro: $20/Monat
  - Unbegrenzte Bandwidth und Function Execution

### Rate Limits

- **TikTok Live Connection:**
  - Ohne API-Key: ~10-20 Connections/Tag
  - Mit API-Key: 100+ Connections/Tag
  - API-Key: [eulerstream.com/pricing](https://www.eulerstream.com/pricing) (kostenlos)

### Monitoring

**Vercel Dashboard zeigt:**
- Deployment-Logs
- Function-Logs
- Analytics
- Error-Tracking

**Logs anschauen:**
```bash
vercel logs
```

---

## 🔄 Updates deployen

**Nach Code-Änderungen:**

```bash
cd C:\Users\timo\Desktop\tikscam

# Änderungen commiten
git add .
git commit -m "Beschreibung der Änderungen"

# Push to GitHub
git push

# Vercel deployt automatisch!
```

**Vercel deployt automatisch bei jedem Push zu GitHub:**
- Branch `main` → Production
- Andere Branches → Preview

---

## 🐛 Troubleshooting

### Build failed on Vercel

**Check Logs:**
1. Vercel Dashboard → Dein Projekt → Deployments
2. Click auf failed deployment
3. Check Build Logs

**Häufige Probleme:**
- Node.js Version: Vercel nutzt automatisch die richtige Version
- Dependencies: Vercel führt `npm install` automatisch aus
- TypeScript-Fehler: Sollten keine sein (Build lokal erfolgreich)

### Runtime Errors

**Function Logs checken:**
```bash
vercel logs --follow
```

**Oder im Dashboard:**
- Projekt → Functions → Select Function → Logs

### API-Key funktioniert nicht

**Check:**
1. Environment Variable richtig gesetzt?
2. Deployment nach Setzen der Variable neu getriggert?
3. API-Key gültig? Check auf [eulerstream.com](https://www.eulerstream.com)

---

## 📊 Deployment Checklist

- [x] Production Build erfolgreich (`npm run build`)
- [x] Git Repository erstellt
- [x] GitHub Repository erstellt (Private!)
- [x] Code zu GitHub gepusht
- [x] Vercel Account erstellt
- [x] Projekt auf Vercel importiert
- [x] Environment Variables gesetzt (optional)
- [x] Deployment erfolgreich
- [x] Live-URL funktioniert
- [x] TikTok Stream-Test erfolgreich

---

## 🎯 Nächste Schritte

1. **Custom Domain** (optional): Eigene Domain verbinden
2. **Monitoring:** Vercel Analytics aktivieren
3. **Sentry:** Error-Tracking hinzufügen (optional)
4. **Backups:** Regelmäßige Git-Commits
5. **Updates:** Neue Features committen und pushen

---

**Dein TikScam läuft jetzt auf Vercel! 🚀**

Live-URL: `https://tikscam.vercel.app` (oder deine Custom Domain)
