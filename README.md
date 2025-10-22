# TikScam

**Echtzeit-Analytics-Plattform für TikTok Live-Streams**

TikScam ist eine hochperformante Web-Anwendung zum Monitoren und Analysieren von TikTok Live-Streams in Echtzeit. Mit Multi-Stream-Support, umfangreichen Analytics und optimiertem Performance-Design.

## ✨ Features

### 🎯 Kern-Funktionen
- **Multi-Stream Monitoring** - Mehrere TikTok-Streams gleichzeitig überwachen
- **Echtzeit-Daten** - Live Chat, Geschenke, Likes, Zuschauerzahlen
- **21 Analytics-Widgets** - Umfassende Statistiken und Visualisierungen
- **Performance-optimiert** - 96% weniger Re-Renders, 75% weniger Datenpunkte
- **Dark Mode Only** - Professionelles, augenschonendes Design
- **Mobile-First** - Responsive Design für alle Bildschirmgrößen

### 📊 Analytics-Dashboard

#### Echtzeit-Metriken
- **Zuschauer-Statistiken** - Live Viewer Count mit Trend-Analyse
- **Like-Rate** - Likes pro Sekunde mit Throttling
- **Geschenke-Tracking** - Diamanten-Werte und Top-Spender
- **Engagement-Rate** - Interaktions-Metriken
- **Follower-Tracking** - Live Follower-Ereignisse

#### Historische Charts (15 Minuten)
- Likes-Verlauf
- Zuschauer-Verlauf
- Follower-Historie
- Diamanten-Historie
- Kombinierter Timeline-Chart
- Engagement-Rate-Chart

#### Live-Feeds
- Chat-Nachrichten mit Avataren
- Geschenke-Feed mit Icons
- Aktivitäts-Feed (Joins, Follows)
- Top-User-Rangliste

## 🚀 Quick Start

### Voraussetzungen
- Node.js 20+
- npm oder yarn

### Installation

```bash
# Repository klonen
cd tikscam

# Dependencies installieren
npm install

# Development-Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

### Ersten Stream hinzufügen

1. Klicke auf **"+ Stream hinzufügen"**
2. Gib den TikTok-Benutzernamen ein (ohne @)
3. Klicke auf **"Stream starten"**
4. Dashboard zeigt Live-Daten in Echtzeit

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.6** - React Framework mit App Router
- **React 19.1.0** - UI-Bibliothek
- **TypeScript 5.9.3** - Type-Safe JavaScript
- **Tailwind CSS 4** - Utility-First CSS
- **Turbopack** - Ultra-schneller Bundler

### Backend / APIs
- **Next.js API Routes** - Server-Side Endpoints
- **Server-Sent Events (SSE)** - Echtzeit-Kommunikation
- **TikTok Live Connector** - Direct TikTok Connection
- **EulerStream WebSocket SDK** - Fallback API

### Performance
- **React.memo** - Memoization aller Komponenten
- **useMemo** - Gecachte Berechnungen
- **Event Throttling** - 500ms Throttle für Like-Events
- **15min Rolling Window** - Optimierte History

## 📁 Projektstruktur

```
tikscam/
├── app/
│   ├── api/
│   │   ├── streams/           # Stream-Management API
│   │   ├── tiktok-live/       # TikTok Live API
│   │   ├── tiktok-livestream/ # Stream Info API
│   │   └── tiktok-user/       # User Info API
│   ├── layout.tsx             # Root Layout (Dark Mode)
│   ├── page.tsx               # Homepage / Dashboard
│   └── globals.css            # Global Styles
├── components/
│   ├── StreamMonitor.tsx      # Haupt-Dashboard
│   ├── StreamTabs.tsx         # Multi-Stream Tabs
│   ├── AddStreamDialog.tsx    # Stream hinzufügen
│   ├── Stats Widgets/         # Statistik-Komponenten
│   ├── Charts/                # Historische Charts
│   └── Feeds/                 # Live-Feed-Komponenten
├── hooks/
│   ├── useTikTokLive.ts       # TikTok Live Hook
│   ├── useEulerStream.ts      # EulerStream WebSocket
│   └── useStreamStats.ts      # Statistik-Processing
├── contexts/
│   └── StreamManagerContext.tsx # Multi-Stream Context
├── services/
│   └── tiktok/                # TikTok Service Layer
│       ├── index.ts           # Main Service
│       ├── websocket.ts       # WebSocket Handler
│       ├── api.ts             # REST API Client
│       └── types.ts           # Type Definitions
└── lib/
    └── streamManager.ts       # Server-Side Manager
```

## 🔧 Verfügbare Scripts

```bash
# Development-Server (mit Turbopack)
npm run dev

# Production-Build (mit Turbopack)
npm run build

# Production-Server starten
npm start

# Linting
npm run lint
```

## ⚠️ Rate Limits & API-Keys

### Problem
TikTok-Verbindungen nutzen einen externen Signature-Service:
- **Kostenlos:** ~10-20 Verbindungen/Tag
- **Mit API-Key:** 100+ Verbindungen/Tag (kostenlos)

### Lösung bei Rate-Limit-Fehler

1. **Warten** - Limit wird täglich zurückgesetzt
2. **API-Key holen** (empfohlen):
   - Gehe zu [eulerstream.com/pricing](https://www.eulerstream.com/pricing)
   - Registriere dich (kostenlos)
   - Kopiere deinen API-Key
   - Erstelle `.env.local`:
     ```bash
     EULERSTREAM_API_KEY=dein_api_key_hier
     ```
   - Server neu starten

## 📈 Performance-Metriken

| Metrik | Vorher | Nachher | Verbesserung |
|--------|--------|---------|--------------|
| Re-Renders/Sek | 50+ | 2 | **96% weniger** |
| Chart-Datenpunkte | 240 | 60 | **75% weniger** |
| CPU-Last | Sehr hoch | Niedrig | **~70% weniger** |
| RAM-Nutzung | Hoch | Mittel | **~50% weniger** |

Details siehe [CHANGELOG.md](./CHANGELOG.md)

## 🎨 Features im Detail

### Multi-Stream-Management
- Tab-basiertes Interface
- Unabhängige Verbindungen pro Stream
- Session Persistence
- Stream-Switching ohne Unterbrechung

### Automatische Reconnects
- Bei Verbindungsabbruch
- Bei TikTok-Fehlern
- Mit Exponential Backoff

### Error-Handling
- Klare Fehlermeldungen
- Lösungsvorschläge
- Direkte Links zur Problemlösung

### Dual-API-Architektur
1. **Primary:** Direct TikTok Connection
   - Schneller
   - Direkte WebSocket-Verbindung
   - Rate-Limit: ~10-20/Tag

2. **Fallback:** EulerStream API
   - Bei Rate-Limits
   - Mit API-Key: unbegrenzt
   - Gleiche Datenqualität

## 🐛 Troubleshooting

### "Rate limit exceeded"
→ Siehe [Rate Limits & API-Keys](#%EF%B8%8F-rate-limits--api-keys)

### "Stream not found"
- Überprüfe Benutzername (ohne @)
- Stream muss LIVE sein
- TikTok-Account muss öffentlich sein

### Performance-Probleme
- Browser-Cache leeren
- Development-Mode: `npm run dev`
- Production-Build: `npm run build && npm start`

### TypeScript-Fehler
- Dependencies neu installieren: `npm install`
- TypeScript-Cache löschen: `rm -rf .next`

## 🔮 Roadmap

### Geplante Features
- [ ] Stream-Recording
- [ ] Export-Funktionen (CSV, JSON)
- [ ] Historische Daten-Speicherung (IndexedDB)
- [ ] Notifications bei Events
- [ ] Webhook-Integration
- [ ] Vergleichs-Modus (mehrere Streams nebeneinander)

### Performance-Optimierungen (optional)
- [ ] React-Window für Virtualisierung
- [ ] Lazy Loading für Komponenten
- [ ] WebWorker für Berechnungen
- [ ] Service-Worker für Offline-Support

## 📄 Lizenz

Dieses Projekt ist privat und nicht für kommerzielle Nutzung vorgesehen.

## 🙏 Credits

### Technologien
- [Next.js](https://nextjs.org) - React Framework
- [TikTok Live Connector](https://github.com/zerodytrash/TikTok-Live-Connector) - TikTok API
- [EulerStream](https://www.eulerstream.com) - WebSocket SDK
- [Tailwind CSS](https://tailwindcss.com) - CSS Framework

### Performance-Optimierungen
Basierend auf:
- React Best Practices
- Chrome DevTools Performance Profiling
- Real-world Testing mit High-Traffic Streams

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfe [CHANGELOG.md](./CHANGELOG.md) für bekannte Probleme
2. Überprüfe Konsole auf Fehlermeldungen
3. Prüfe ob Stream wirklich LIVE ist

---

**Version:** 0.1.0
**Last Updated:** 2025-10-22
**Status:** ✅ Production Ready
