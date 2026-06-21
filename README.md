# Punjab Constituency Map

Interactive map of Punjab's **117 Vidhan Sabha (assembly) constituencies**. Click a marker
or list row to open a detail panel, add info (MLA, party, contact, PIN codes, notes), and
save it. Search by name, district, or PIN code.

## Run

`fetch()` needs http, not `file://`. Serve the folder:

```
# Python
python -m http.server 8000
# or Node
npx serve .
```

Then open http://localhost:8000

## Files

- `index.html` — layout (sidebar list, map, detail panel)
- `app.js` — Leaflet map, markers, search/filter, localStorage persistence
- `styles.css` — dark theme
- `data/constituencies.json` — all 117 ACs: `no, name, district, reserved (SC/null), lha (Lok Sabha)`
- `data/pincodes.json` — starter PIN → constituency lookup (expand this)

## How data works

- **Marker positions are approximate** — each AC sits at its district centroid plus a
  deterministic offset so seats in the same district fan out. Replace with real AC
  centroids or drop in a boundary **GeoJSON** for accurate shapes (next step).
- **Saved details** live in browser `localStorage` (key `punjab-ac-details`). No backend yet.
- **PIN search**: typing a 6-digit PIN flies to its mapped constituency. Add entries to
  `data/pincodes.json`, or store comma-separated PINs per seat in the detail panel.

## Next steps (pick up from here)

- [ ] Real AC boundary GeoJSON (color regions, click polygon instead of pin)
- [ ] Full PIN-code dataset for all 117 seats
- [ ] Backend / export so edits sync beyond one browser
- [ ] Toggle layer for 13 Lok Sabha constituencies (data already tagged via `lha`)
