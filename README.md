# UCCP Analytics Frontend

Ein modernes React-Frontend für das UCCP Analytics Tool zur Analyse von Work Code Statistiken.

## Features

- **Work Code Analyse**: Optionaler Work Code Input für spezifische Analysen
- **Zeitraum-Filter**: Von/Bis Datum Eingabe für beliebige Zeiträume
- **Gesamtstatistiken**: Analyse ohne Work Code für Gesamtanzahl
- **Modernes UI**: Elegantes, responsives Design
- **Error Handling**: Umfassende Fehlerbehandlung
- **Loading States**: Benutzerfreundliche Ladeanzeigen

## Technologie-Stack

- **React 18** mit Vite
- **Axios** für API-Kommunikation
- **Modern CSS** (kein Framework)
- **Responsive Design**

## Installation

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```

3. **Backend starten:**
   Stellen Sie sicher, dass das Backend auf Port 5000 läuft.

## Verwendung

1. **Work Code eingeben** (optional):
   - Beispiele: PCMO.OC1, PCMO.OCS1, KCPF.BD1, KCPF.BD15, KCPF.BD7
   - Leer lassen für Gesamtstatistiken

2. **Zeitraum auswählen**:
   - Von Datum: Startdatum der Analyse
   - Bis Datum: Enddatum der Analyse

3. **Analysieren klicken**:
   - Die App ruft die Backend-API auf
   - Zeigt das Ergebnis in deutscher Sprache an

## API-Integration

Das Frontend kommuniziert mit dem Backend über:
- **Endpoint**: `GET /api/pcmo-count`
- **Parameter**:
  - `workcode` (optional): Work Code für spezifische Analyse
  - `from`: Startdatum (YYYY-MM-DD)
  - `to`: Enddatum (YYYY-MM-DD)

## Beispiel-Response

```json
{
  "workcode": "PCMO.OC1",
  "from": "2025-01-01",
  "to": "2025-07-23",
  "count": 34587
}
```

## Build für Produktion

```bash
npm run build
```

## Projektstruktur

```
src/
├── App.jsx          # Hauptkomponente
├── main.jsx         # React Entry Point
└── index.css        # Styling
```

## Design-Features

- **Gradient-Hintergrund**: Moderner blau-lila Gradient
- **Karten-Design**: Weiße Karte mit Schatten und Rundungen
- **Animationen**: Sanfte Übergänge und Hover-Effekte
- **Responsive**: Optimiert für Desktop, Tablet und Mobile
- **Accessibility**: Semantische HTML-Struktur und Keyboard-Navigation








