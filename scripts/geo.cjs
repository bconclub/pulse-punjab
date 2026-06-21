/* Build data/punjab-ac.geojson from the raw ECI-derived source:
 * - round coords to 4 decimals (~11 m, plenty for this view)
 * - drop consecutive duplicate points created by rounding
 * - keep only { no, name, district }
 * Run: node scripts/geo.cjs
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const raw = JSON.parse(fs.readFileSync(path.join(root, "data/punjab_AC.raw.json"), "utf8"));

const r = (n) => Math.round(n * 1e4) / 1e4;

function ring(coords) {
  const out = [];
  let prev = null;
  for (const [x, y] of coords) {
    const p = [r(x), r(y)];
    if (!prev || p[0] !== prev[0] || p[1] !== prev[1]) out.push(p);
    prev = p;
  }
  if (out.length < 4) return coords.map(([x, y]) => [r(x), r(y)]); // keep valid ring
  return out;
}

function geom(g) {
  if (g.type === "Polygon") return { type: "Polygon", coordinates: g.coordinates.map(ring) };
  if (g.type === "MultiPolygon") return { type: "MultiPolygon", coordinates: g.coordinates.map(poly => poly.map(ring)) };
  return g;
}

const features = raw.features.map(f => ({
  type: "Feature",
  properties: {
    no: Number(f.properties.AC_NO),
    name: f.properties.AC_NAME,
    district: f.properties.DIST_NAME
  },
  geometry: geom(f.geometry)
})).sort((a, b) => a.properties.no - b.properties.no);

const out = { type: "FeatureCollection", features };
const json = JSON.stringify(out);
fs.writeFileSync(path.join(root, "data/punjab-ac.geojson"), json);
console.log("Wrote data/punjab-ac.geojson —", features.length, "features,", json.length, "bytes");
