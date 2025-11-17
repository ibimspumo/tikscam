# TikScam V2 - Migration Guide

## Übersicht

TikScam V2 ist eine komplette UI-Neugestaltung mit **ShadCN UI**, die parallel zur ursprünglichen Version (V1) läuft.

## Zugriff

- **V1 (Original):** http://localhost:3000/
- **V2 (ShadCN):** http://localhost:3000/v2

## Was wurde implementiert?

### ✅ Neue UI-Komponenten (ShadCN)

Alle ShadCN-Komponenten in `components/ui/`:
- `button.tsx` - Button mit Varianten (default, destructive, outline, ghost, link)
- `card.tsx` - Card-Layout mit Header, Content, Footer
- `badge.tsx` - Badge/Tag-Komponente
- `tabs.tsx` - Radix UI Tabs
- `input.tsx` - Input-Feld

### ✅ V2 Widget-Komponenten

Neue Versionen der Haupt-Widgets in `components/v2/`:
- `StatsCardV2.tsx` - Moderne Statistik-Karten mit Icons
- `ChatWidgetV2.tsx` - Verbesserter Live-Chat
- `GiftsWidgetV2.tsx` - Geschenke-Feed mit besserer UX
- `TopUsersWidgetV2.tsx` - Top-User mit Tab-Navigation

### ✅ Layouts & Navigation

- `StreamMonitorV2.tsx` - Haupt-Dashboard für V2
- `StreamTabsV2.tsx` - Multi-Stream Tab-System
- `AddStreamDialogV2.tsx` - Moderner Dialog
- `app/v2/page.tsx` - V2 Route
- `app/v2/layout.tsx` - V2 Layout mit Header & Footer

### ✅ Design-System

- **CSS Variables:** HSL-basierte Farben für Light/Dark Mode
- **Tailwind Config:** Erweitert für ShadCN
- **globals.css:** Aktualisiert mit ShadCN-Theming

## Neue Dependencies

```json
{
  "@radix-ui/react-slot": "^1.1.1",
  "@radix-ui/react-tabs": "^1.1.5",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.7.0",
  "lucide-react": "^0.469.0"
}
```

## Verzeichnisstruktur

```
tikscam/
├── app/
│   ├── page.tsx              # V1 Homepage (Original)
│   └── v2/
│       ├── page.tsx          # V2 Homepage (ShadCN)
│       └── layout.tsx        # V2 Layout
│
├── components/
│   ├── *.tsx                 # V1 Komponenten (Original)
│   │
│   ├── ui/                   # ShadCN UI Komponenten
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   └── input.tsx
│   │
│   └── v2/                   # V2 Widget-Komponenten
│       ├── StatsCardV2.tsx
│       ├── ChatWidgetV2.tsx
│       ├── GiftsWidgetV2.tsx
│       ├── TopUsersWidgetV2.tsx
│       ├── StreamMonitorV2.tsx
│       ├── StreamTabsV2.tsx
│       └── AddStreamDialogV2.tsx
│
├── lib/
│   └── utils.ts              # cn() Utility für Klassen-Merging
│
└── tailwind.config.ts        # Tailwind Config für ShadCN
```

## Features-Vergleich

| Feature | V1 | V2 |
|---------|----|----|
| **Design** | Gaming-Style, Dark | Modern, Clean |
| **UI Framework** | Custom Tailwind | ShadCN UI |
| **Komponenten** | Custom | Radix UI Primitives |
| **Accessibility** | Basic | Full ARIA Support |
| **Theme** | Dark Mode Only | Light/Dark (via CSS vars) |
| **Performance** | Optimiert | Gleich optimiert |
| **Icons** | Emojis | Lucide Icons |
| **Variants** | Manuell | CVA-basiert |

## Gemeinsame Features

Beide Versionen teilen:
- ✅ Gleiche Hooks (`useTikTokLive`, etc.)
- ✅ Gleiche Contexts (`StreamManagerContext`)
- ✅ Gleiche Services (`services/tiktok/`)
- ✅ Gleiche API Routes
- ✅ Gleiche Performance-Optimierungen
- ✅ Gleiche Funktionalität

## Navigation zwischen Versionen

### Von V1 zu V2
- Header-Button "V2 (ShadCN) →" auf Homepage

### Von V2 zu V1
- Header-Link "V1 (Original)" im V2-Layout

## Entwicklung

### Neue V2-Komponente erstellen

```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyWidgetV2Props {
  data: any;
  className?: string;
}

export const MyWidgetV2 = React.memo(({ data, className }: MyWidgetV2Props) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MyIcon className="h-5 w-5" />
          My Widget
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
});

MyWidgetV2.displayName = 'MyWidgetV2';
```

### V1-Feature zu V2 portieren

1. **Kopiere die Logik** aus `components/WidgetName.tsx`
2. **Erstelle** `components/v2/WidgetNameV2.tsx`
3. **Ersetze Custom-Styling** mit ShadCN-Komponenten:
   ```tsx
   // V1
   <div className="bg-gray-900/50 rounded-xl border border-gray-800">

   // V2
   <Card>
   ```
4. **Nutze Lucide Icons** statt Emojis
5. **Teste** beide Versionen

## CSS Variables (Dark Mode)

V2 nutzt CSS-Variablen für Theming:

```css
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --border: 0 0% 14.9%;
  /* etc. */
}
```

Verwendung:
```tsx
<div className="bg-background text-foreground border-border">
```

## Nächste Schritte

### Geplante V2-Features

- [ ] Chart-Komponenten (Recharts)
- [ ] Data Tables
- [ ] Skeleton Loaders
- [ ] Toast Notifications
- [ ] Command Palette (⌘K)
- [ ] Theme Switcher (Light/Dark Toggle)
- [ ] Settings Panel
- [ ] Export-Funktionen

### Migration von V1 → V2

Phase 1 (Aktuell):
- ✅ Core UI-Komponenten
- ✅ Haupt-Widgets
- ✅ Navigation & Tabs

Phase 2 (TODO):
- [ ] Charts-Komponenten
- [ ] Activity-Widget
- [ ] Debug-Widget
- [ ] Gift-Katalog

Phase 3 (TODO):
- [ ] Erweiterte Features
- [ ] Bessere Animationen
- [ ] Responsive Improvements

## Testing

Beide Versionen laufen parallel. Zum Testen:

1. Starte Dev-Server: `npm run dev`
2. Öffne V1: http://localhost:3000/
3. Öffne V2: http://localhost:3000/v2
4. Teste gleiche Features in beiden Versionen

## Bekannte Unterschiede

| Aspekt | V1 | V2 |
|--------|----|----|
| Farbschema | Lila/Pink Gradient | Neutral Grau |
| Header | Gaming-Style | Clean & Minimal |
| Buttons | Custom Glow | ShadCN Variants |
| Cards | Backdrop Blur | Solid Border |
| Spacing | Kompakt | Luftiger |

## Support

Bei Fragen oder Problemen:
- Siehe `components/v2/README.md` für Details
- Siehe `CLAUDE.md` für Architektur
- Vergleiche mit V1-Implementierung

---

**Made with Claude AI** 🤖
