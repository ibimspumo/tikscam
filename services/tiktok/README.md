# TikTok Live Service Documentation

Professionelle, modulare Integration für TikTok Live Streams über EulerStream API.

## 📁 Architektur

```
services/tiktok/
├── types.ts          # TypeScript-Typdefinitionen
├── websocket.ts      # WebSocket-Service für Live-Events
├── api.ts            # REST-API-Client
├── index.ts          # Haupt-Service (kombiniert WebSocket + API)
└── README.md         # Diese Datei
```

## 🚀 Schnellstart

### 1. Installation

Erforderliche Dependencies sind bereits installiert:
- `@eulerstream/euler-websocket-sdk`
- `@eulerstream/euler-api-sdk`

### 2. API-Key konfigurieren

In `.env.local`:
```env
NEXT_PUBLIC_EULERSTREAM_API_KEY=your_api_key_here
```

### 3. Service nutzen

```typescript
import { TikTokLiveService } from '@/services/tiktok';

// Service erstellen
const tiktok = new TikTokLiveService({
  apiKey: process.env.NEXT_PUBLIC_EULERSTREAM_API_KEY!,
  debug: true, // Optional: Debug-Logs aktivieren
});

// Event-Handler registrieren
tiktok.on({
  onConnect: () => console.log('Verbunden!'),
  onDisconnect: (code, reason) => console.log('Getrennt:', reason),
  onChat: (data) => console.log('Chat:', data.comment),
  onGift: (data) => console.log('Geschenk:', data.gift?.name),
  onRoomInfo: (info) => console.log('Room Info:', info),
});

// Mit Stream verbinden
await tiktok.connect('username');

// Zusätzliche Daten abrufen (optional)
const userInfo = await tiktok.fetchUserInfo('username');
const streamInfo = await tiktok.fetchStreamInfo();
```

### 4. React Hook verwenden (empfohlen)

```typescript
import { useTikTokLive } from '@/hooks/useTikTokLive';

function MyComponent() {
  const { connect, disconnect, isConnected, stats, roomInfo, error } = useTikTokLive();

  return (
    <div>
      <button onClick={() => connect('username')}>Connect</button>
      <p>Zuschauer: {stats.viewerCount}</p>
      <p>Likes: {stats.streamTotalLikes}</p>
      <p>Chat-Nachrichten: {stats.chatMessages.length}</p>
    </div>
  );
}
```

## 📚 API-Referenz

### TikTokLiveService

Haupt-Service-Klasse, die WebSocket und API kombiniert.

#### Konstruktor

```typescript
new TikTokLiveService(config: TikTokConfig)
```

**Parameter:**
- `config.apiKey` (string, erforderlich): EulerStream API-Key
- `config.debug` (boolean, optional): Debug-Logs aktivieren (default: false)

#### Verbindung

##### `connect(uniqueId: string): Promise<void>`

Verbindet mit einem TikTok Live Stream.

```typescript
await tiktok.connect('lingualizer');
```

##### `disconnect(): void`

Trennt die Verbindung.

```typescript
tiktok.disconnect();
```

##### `isConnected(): boolean`

Gibt zurück, ob aktuell verbunden.

```typescript
if (tiktok.isConnected()) {
  console.log('Verbunden!');
}
```

#### Event-Handler

##### `on(handlers: EventHandlers): void`

Registriert Event-Handler.

```typescript
tiktok.on({
  // Verbindung
  onConnect: () => void,
  onDisconnect: (code: number, reason: string) => void,
  onError: (error: Error) => void,

  // Stream-Events
  onChat: (data: ChatMessage) => void,
  onGift: (data: GiftMessage) => void,
  onMember: (data: MemberMessage) => void,
  onLike: (data: LikeMessage) => void,
  onSocial: (data: SocialMessage) => void,
  onRoomUser: (data: RoomUserMessage) => void,
  onEmote: (data: EmoteMessage) => void,
  onControl: (data: ControlMessage) => void,

  // Room-Info
  onRoomInfo: (info: RoomInfo) => void,
});
```

#### API-Methoden

##### `fetchStreamInfo(uniqueId?: string): Promise<ApiResponse<StreamInfo>>`

Ruft Stream-Informationen ab.

```typescript
const result = await tiktok.fetchStreamInfo('username');
if (result.success) {
  console.log('Is live:', result.data.isLive);
}
```

##### `fetchRoomInfo(uniqueId?: string): Promise<ApiResponse<RoomInfo>>`

Ruft detaillierte Room-Informationen ab.

```typescript
const result = await tiktok.fetchRoomInfo();
if (result.success) {
  console.log('Title:', result.data.title);
  console.log('Viewers:', result.data.userCount);
}
```

##### `fetchUserInfo(uniqueId: string): Promise<ApiResponse<TikTokUser>>`

Ruft Benutzer-Profilinformationen ab.

```typescript
const result = await tiktok.fetchUserInfo('username');
if (result.success) {
  console.log('Followers:', result.data.followerCount);
  console.log('Avatar:', result.data.avatarThumb);
}
```

##### `isLive(uniqueId: string): Promise<boolean>`

Prüft, ob ein Stream live ist.

```typescript
const live = await tiktok.isLive('username');
console.log('Stream is live:', live);
```

##### `validateApiKey(): Promise<boolean>`

Validiert den API-Key.

```typescript
const valid = await tiktok.validateApiKey();
console.log('API key valid:', valid);
```

##### `getUsageStats(): Promise<ApiResponse<any>>`

Ruft API-Nutzungsstatistiken ab.

```typescript
const result = await tiktok.getUsageStats();
console.log('Requests remaining:', result.data);
```

#### Utility-Methoden

##### `getRoomInfo(): RoomInfo | null`

Gibt aktuell gecachte Room-Info zurück.

```typescript
const info = tiktok.getRoomInfo();
console.log('Current title:', info?.title);
```

##### `getCurrentUsername(): string | null`

Gibt aktuellen verbundenen Username zurück.

```typescript
const username = tiktok.getCurrentUsername();
```

##### `setDebug(enabled: boolean): void`

Aktiviert/deaktiviert Debug-Logging.

```typescript
tiktok.setDebug(true);
```

## 🎯 Event-Typen

### Chat-Nachricht (WebcastChatMessage)

```typescript
{
  uniqueId: string;        // Username
  nickname: string;        // Anzeigename
  comment: string;         // Nachricht
  user: {
    avatarThumb: string;   // Profilbild (klein)
    avatarMedium: string;  // Profilbild (mittel)
    avatarLarge: string;   // Profilbild (groß)
    followerCount: number;
  };
}
```

### Geschenk (WebcastGiftMessage)

```typescript
{
  uniqueId: string;
  gift: {
    id: number;
    name: string;          // Geschenkname
    diamondCount: number;  // Wert in Diamanten
  };
  repeatCount: number;     // Anzahl (bei Streaks)
}
```

### Benutzer tritt bei (WebcastMemberMessage)

```typescript
{
  uniqueId: string;
  nickname: string;
  user: TikTokUser;
}
```

### Likes (WebcastLikeMessage)

```typescript
{
  uniqueId: string;
  likeCount: number;       // Anzahl der Likes
  totalLikeCount: number;  // Gesamt-Likes (optional)
}
```

### Follow/Share (WebcastSocialMessage)

```typescript
{
  uniqueId: string;
  action: number;          // 1 = Follow, 2 = Share
}
```

### Room-Statistiken (WebcastRoomUserSeqMessage)

```typescript
{
  viewerCount: number;
  totalViewerCount: number;
}
```

## 🔧 Room Info Struktur

```typescript
{
  id: string;
  title: string;                    // Stream-Titel
  owner: {
    uniqueId: string;
    displayName: string;
    avatarThumb: string;
    followerCount: number;
  };
  userCount: number;                // Aktuelle Zuschauer
  liveRoomStats: {
    totalLikeCount: number;         // ⭐ Gesamt-Likes des Streams
    viewerCount: number;
  };
  startTime: number;                // Stream-Startzeit (Timestamp)
}
```

## 🐛 Debugging

### Debug-Logs aktivieren

```typescript
const tiktok = new TikTokLiveService({
  apiKey: 'YOUR_KEY',
  debug: true,  // ⭐ Aktiviert Console-Logs
});
```

### Was wird geloggt?

- WebSocket-Verbindungsaufbau
- Eingehende Nachrichten (vollständig)
- Room-Info-Updates
- Event-Routing
- Fehler und Disconnects
- API-Anfragen

### Browser-Console überwachen

```
[TikTokWebSocket] Connecting to: wss://ws.eulerstream.com?uniqueId=...
[TikTokWebSocket] WebSocket connected successfully
[TikTokWebSocket] Room info received: { title: "...", ... }
[TikTokWebSocket] Received message: { messages: [...] }
```

## 🔐 Fehlerbehandlung

### WebSocket Close Codes

| Code | Bedeutung |
|------|-----------|
| 1000 | Normale Trennung |
| 1003 | Ungültige Daten/Parameter |
| 1008 | Stream nicht live / Username nicht gefunden |
| 1011 | Interner Server-Fehler |

### Fehler abfangen

```typescript
tiktok.on({
  onError: (error) => {
    console.error('Fehler:', error.message);
  },
  onDisconnect: (code, reason) => {
    if (code === 1008) {
      alert('Stream ist offline!');
    }
  },
});
```

## 📊 Best Practices

### 1. Immer Event-Handler vor connect() registrieren

```typescript
// ✅ Richtig
tiktok.on({ onChat: (data) => ... });
await tiktok.connect('username');

// ❌ Falsch - Events könnten verloren gehen
await tiktok.connect('username');
tiktok.on({ onChat: (data) => ... });
```

### 2. Cleanup bei Component Unmount

```typescript
useEffect(() => {
  return () => {
    tiktok.disconnect();
  };
}, []);
```

### 3. Room-Info persistent cachen

Room-Info wird automatisch im Service gecacht und bleibt persistent:

```typescript
const info = tiktok.getRoomInfo(); // Gibt gecachte Info zurück
```

### 4. API-Calls sparsam nutzen

WebSocket liefert die meisten Daten. API nur für initiale Daten oder Validierung nutzen:

```typescript
// Vor Verbindung prüfen ob live
if (await tiktok.isLive('username')) {
  await tiktok.connect('username');
}
```

## 🔄 Migration von altem Code

### Vorher (alter Hook)

```typescript
const { events, isConnected, error, roomInfo, connect } = useEulerStream();
const stats = useStreamStats(events);
```

### Nachher (neuer Hook)

```typescript
const { connect, isConnected, error, stats, roomInfo } = useTikTokLive();
```

Alle Stats sind direkt verfügbar, keine separate Verarbeitung nötig!

## 📝 TypeScript Support

Alle Typen sind vollständig dokumentiert und exportiert:

```typescript
import type {
  RoomInfo,
  TikTokUser,
  ChatMessage,
  GiftMessage,
  StreamStats,
  EventHandlers,
  // ... alle anderen
} from '@/services/tiktok';
```

## 🆘 Troubleshooting

### "API Key nicht gefunden"

Stelle sicher, dass `.env.local` korrekt konfiguriert ist:
```env
NEXT_PUBLIC_EULERSTREAM_API_KEY=your_key_here
```

### "Stream nicht live"

- Prüfe, ob der Username korrekt ist
- Prüfe, ob der Stream tatsächlich live ist
- Nutze `tiktok.isLive('username')` zur Validierung

### Keine Profilbilder

Profilbilder sind möglicherweise in der Free-Version eingeschränkt. Pro-Version sollte alle Daten liefern.

### Room-Info verschwindet

Mit dem neuen Service bleibt Room-Info persistent gecacht. Falls Probleme auftreten, Debug-Logs prüfen.

## 📖 Weitere Ressourcen

- [EulerStream Dokumentation](https://www.eulerstream.com/docs)
- [WebSocket Server Docs](https://www.eulerstream.com/docs/sign-server/websockets)
- [GitHub Repository](https://github.com/eulerstream)
