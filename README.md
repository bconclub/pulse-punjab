# Punjab Constituency Map

Interactive map of Punjab's **117 Vidhan Sabha (assembly) constituencies**. Click a marker
or list row to open a detail panel, add info (MLA, party, contact, PIN codes, notes), and
save it. Search by name, district, or PIN code.

## Run

**Easiest: just double-click `index.html`.** Data is bundled into `data.js`, so it
works straight from `file://` — no server needed (you only need internet for the map tiles).

Optional dev server (for live edits / the fetch path):

```
python -m http.server 8000   # then open http://localhost:8000
```

If you edit anything in `data/`, regenerate the inline bundle:

```
node scripts/bundle.cjs
```

## Files

- `index.html` — layout (sidebar list, map, detail panel)
- `app.js` — Leaflet map, markers, search/filter, localStorage persistence
- `styles.css` — dark theme
- `data/constituencies.json` — all 117 ACs: `no, name, district, reserved (SC/null), lha (Lok Sabha)`
- `data/pincodes.json` — starter PIN → constituency lookup (expand this)

## How data works

- **Real boundaries** — `data/punjab-ac.geojson` is a rounded build of the ECI-derived
  AC shapefile (117 polygons, keyed by AC number). Source: HindustanTimesLabs/shapefiles.
  Rebuild it from `data/punjab_AC.raw.json` with `node scripts/geo.cjs`.
- **Color modes** (top-left legend updates per mode):
  - *Engagement heat* — blue ramp from our pulse metrics (mock until Proxy backend)
  - *2022 result* — fills by winning party; **per-seat winners not loaded yet**
    (`data/results-2022.json` → `winners` is empty on purpose; seat/vote aggregates are real)
  - *Priority* — P1/P2/P3 focus · *Seat type* — General / SC
- **Donut** (bottom-left): outer = vote %, inner = seat % (real 2022 aggregates).
- **Urban insets**: buttons zoom to the Amritsar / Jalandhar / Ludhiana seat clusters.
- **Saved details** live in browser `localStorage` (key `punjab-ac-details`). No backend yet.
- **PIN search**: typing a 6-digit PIN flies to its mapped constituency.

## Next steps (pick up from here)

- [ ] Real AC boundary GeoJSON (color regions, click polygon instead of pin)
- [ ] Full PIN-code dataset for all 117 seats
- [ ] Backend / export so edits sync beyond one browser
- [ ] Toggle layer for 13 Lok Sabha constituencies (data already tagged via `lha`)
