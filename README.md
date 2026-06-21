# Pulse of Punjab — native app

Android-installable **Expo React Native** app for the *Punjab Yatra 2026 · ਪੰਜਾਬੀਅਤ ਦੀ ਲਹਿਰ*
campaign. Interactive choropleth of all **117 Vidhan Sabha constituencies** with a
premium dark "election-night" UI, voter age analytics, the P1/P2/P3 mobilization
framework, a scan→call voter journey, and push notifications.

> Migrated from the original static `index.html` build to a fully native app
> (mobile-first, installable, push-capable, backend-ready).

## Stack

- **Expo SDK 56 / React Native 0.85**, TypeScript
- **react-native-maps** — choropleth of real ECI boundaries (dark map style)
- **expo-notifications** — permissions, Android channel, push token, local alerts
- **Inter + Sora** type, custom dark design system (`src/theme.ts`)

## Run it (dev)

```bash
npm install
npm start            # Expo dev server (Metro on :8081)
```

Then open on a device:

- **Phone:** install **Expo Go**, same Wi-Fi, scan the QR or open `exp://<LAN-IP>:8081`
- **Android emulator:** press `a` in the Expo terminal (`npm run android`)

The app ships all data inline, so it runs offline against the seeded pulse model.

## Build an installable Android app (APK/AAB)

Uses **EAS Build** (needs a free Expo account — login is interactive):

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview     # APK you can sideload
eas build -p android --profile production   # AAB for Play Store
```

App id: `in.punjabyatra.pulse`. Push notifications: run once on a real device to
mint an Expo push token; set the EAS `projectId` in `app.json → extra.eas.projectId`
for remote push.

## Project structure

```
App.tsx                 # root: fonts, tab nav, brand header, detail sheet
src/theme.ts            # design tokens (dark, saffron/azure)
src/data/               # bundled datasets (117 ACs, 2022 results, geojson)
src/lib/
  api.ts                # the seam to backends — flip USE_LOCAL for live services
  pulse.ts              # seeded per-seat metrics + age model
  geo.ts                # geojson -> polygons + choropleth fill logic
  notifications.ts      # expo-notifications register + local send
src/components/         # MapCanvas, ColorModeBar, Legend, SeatList, DetailSheet, ...
src/screens/            # ProgramScreen, JourneyScreen
```

## Backends / APIs

`src/lib/api.ts` is the single integration point. Today it serves bundled data;
set `EXPO_PUBLIC_API_URL` (or `app.json -> extra.apiBaseUrl`) and flip `USE_LOCAL`
to route every screen to live services:

| Endpoint            | Used by                          |
|---------------------|----------------------------------|
| `GET /constituencies`, `/results`, `/framework` | map, list, program |
| `GET /pulse`, `/pulse/:no`                       | metrics, choropleth |
| `POST /grievances`                              | voter journey       |
| `POST /subscribe`                               | WhatsApp / updates opt-in |
| `POST /devices`                                 | push token registration |
