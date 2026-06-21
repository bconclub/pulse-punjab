/* Punjab Constituency Map — scaffold
 * Markers placed at district centroid + deterministic jitter so co-district seats
 * fan out instead of stacking. Swap in real AC centroids / GeoJSON boundaries later.
 * User-entered details persist in localStorage (key: punjab-ac-details).
 */

// Inline SVG icon set (stroke-based, consistent 2px stroke). No emoji as UI icons.
const ICON_PATHS = {
  grid:      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  phone:     '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  search:    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  pin:       '<path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  volunteer: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  bell:      '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l9 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M18 8a4 4 0 0 1 0 8"/>',
  calendar:  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check:     '<path d="M20 6 9 17l-5-5"/>',
  party:     '<path d="M3 21 9 9l6 6-12 6zM14 8l2-2M18 4l1-1M16 11l2 1M11 5l1 2"/>',
  back:      '<path d="M15 18l-6-6 6-6"/>',
  restart:   '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  whatsapp:  '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z"/><path d="M8.5 9c0 4 3 6.5 6.5 6.5"/>',
  book:      '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  chart:     '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'
};
function icon(name, cls) {
  const p = ICON_PATHS[name]; if (!p) return "";
  return `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}
const FEATURE_ICON = { volunteer: "volunteer", stay_updated: "bell", share_voice: "megaphone", join_events: "calendar", location: "pin" };

// District centroids [lat, lng]. Replace with per-AC coords when available.
const DISTRICT_COORDS = {
  "Pathankot":        [32.27, 75.65],
  "Gurdaspur":        [32.04, 75.40],
  "Amritsar":         [31.63, 74.87],
  "Tarn Taran":       [31.45, 74.93],
  "Kapurthala":       [31.38, 75.38],
  "Jalandhar":        [31.33, 75.58],
  "Hoshiarpur":       [31.53, 75.91],
  "SBS Nagar":        [31.12, 76.12],
  "Rupnagar":         [30.97, 76.53],
  "SAS Nagar":        [30.70, 76.72],
  "Fatehgarh Sahib":  [30.65, 76.39],
  "Ludhiana":         [30.90, 75.85],
  "Moga":             [30.82, 75.17],
  "Firozpur":         [30.92, 74.61],
  "Fazilka":          [30.40, 74.03],
  "Sri Muktsar Sahib":[30.47, 74.52],
  "Faridkot":         [30.67, 74.75],
  "Bathinda":         [30.21, 74.95],
  "Mansa":            [29.99, 75.39],
  "Sangrur":          [30.25, 75.84],
  "Barnala":          [30.37, 75.55],
  "Malerkotla":       [30.53, 75.88],
  "Patiala":          [30.34, 76.39]
};

const STORE_KEY = "punjab-ac-details";
const loadStore = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } };
const saveStore = (s) => localStorage.setItem(STORE_KEY, JSON.stringify(s));

// Deterministic offset from AC number so markers in same district spread out.
function jitter(no) {
  const a = (no * 137.508) * Math.PI / 180; // golden-angle spiral
  const r = 0.05 + (no % 7) * 0.012;
  return [Math.sin(a) * r, Math.cos(a) * r];
}

function coordsFor(c) {
  const base = DISTRICT_COORDS[c.district] || [31.0, 75.5];
  const [dy, dx] = jitter(c.no);
  return [base[0] + dy, base[1] + dx];
}

let constituencies = [];
let pincodes = {};
let framework = null;
let pulse = {};     // no -> mock pulse metrics (replace with Proxy backend)
let markers = {};   // no -> Leaflet marker
let store = loadStore();
let activeNo = null;
let colorMode = "reserved";

// Deterministic pseudo-random from a seed (stable mock until backend lands).
function seeded(n, salt) {
  const x = Math.sin((n + 1) * 999 + salt * 31.7) * 10000;
  return x - Math.floor(x);
}

// Mock "pulse" per constituency. Proxy backend swaps this out.
function buildPulse(c) {
  const base = 40 + Math.floor(seeded(c.no, 1) * 460);     // interactions captured
  const comments = Math.floor(base * (0.2 + seeded(c.no, 2) * 0.4));
  const volunteers = Math.floor(seeded(c.no, 3) * 120);
  const grievances = Math.floor(seeded(c.no, 4) * 60);
  const resolved = Math.floor(grievances * (0.3 + seeded(c.no, 5) * 0.6));
  const conversion = Math.floor(seeded(c.no, 6) * 100);    // % engaged -> voter intent
  const engagement = Math.min(100, Math.floor((base / 5) + volunteers * 0.3));
  // current focus phase from this AC's position in the program (mock spread)
  const phase = ["P1", "P2", "P3"][c.no % 3];
  return { interactions: base, comments, volunteers, grievances, resolved, conversion, engagement, phase };
}

const map = L.map("map", { zoomControl: true }).setView([30.9, 75.5], 8);
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "© OpenStreetMap © CARTO",
  subdomains: "abcd", maxZoom: 19
}).addTo(map);

const el = (id) => document.getElementById(id);

const PHASE_COLOR = { P1: "#1f6feb", P2: "#ff7a18", P3: "#3fb950" };

function heatColor(v) { // 0..100 -> blue->orange->red
  if (v >= 66) return "#ff4d4d";
  if (v >= 33) return "#ff7a18";
  return "#1f6feb";
}

function markerColor(c) {
  if (colorMode === "priority") return PHASE_COLOR[pulse[c.no]?.phase] || "#888";
  if (colorMode === "pulse") return heatColor(pulse[c.no]?.engagement || 0);
  return c.reserved === "SC" ? "#d4a017" : "#ff7a18";
}

function makeIcon(c) {
  const filled = store[c.no] && Object.values(store[c.no]).some(v => v && String(v).trim());
  return L.divIcon({
    className: "ac-pin",
    html: `<span style="
      display:block;width:14px;height:14px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);background:${markerColor(c)};
      border:2px solid ${filled ? "#fff" : "rgba(255,255,255,.35)"};
      box-shadow:0 0 0 2px rgba(0,0,0,.4);"></span>`,
    iconSize: [14, 14], iconAnchor: [7, 14], popupAnchor: [0, -14]
  });
}

function popupHtml(c) {
  const d = store[c.no] || {};
  const lines = [];
  if (d.mla) lines.push(`MLA: ${d.mla}${d.party ? " (" + d.party + ")" : ""}`);
  if (d.contact) lines.push(`☎ ${d.contact}`);
  if (d.pins) lines.push(`PIN: ${d.pins}`);
  return `<b>${c.no}. ${c.name}</b>${c.reserved ? " · " + c.reserved : ""}<br>
    <small>${c.district} district · ${c.lha} (LS)</small>
    ${lines.length ? "<br>" + lines.join("<br>") : ""}`;
}

function renderMarkers() {
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};
  constituencies.forEach(c => {
    const m = L.marker(coordsFor(c), { icon: makeIcon(c) }).addTo(map);
    m.bindPopup(popupHtml(c));
    m.on("click", () => openDetail(c.no));
    markers[c.no] = m;
  });
}

function renderList(items) {
  const list = el("list");
  list.innerHTML = "";
  if (!items.length) {
    list.innerHTML = `<li class="empty">${icon("search")}<br>No constituency matches.<br>Try a name, district, or PIN.</li>`;
    el("count").textContent = `0 of ${constituencies.length} shown`;
    return;
  }
  items.forEach(c => {
    const li = document.createElement("li");
    li.dataset.no = c.no;
    if (c.no === activeNo) li.classList.add("active");
    li.innerHTML = `<span class="nm">${c.name} ${c.reserved ? '<span class="tag-sc">SC</span>' : ""}</span>
                    <span class="no">#${c.no} · ${c.district}</span>`;
    li.addEventListener("click", () => { openDetail(c.no); map.flyTo(coordsFor(c), 11); });
    list.appendChild(li);
  });
  el("count").textContent = `${items.length} of ${constituencies.length} shown`;
}

function applyFilter() {
  const q = el("search").value.trim().toLowerCase();
  const dist = el("district-filter").value;

  // PIN lookup: if query is a known pincode, jump to its constituency.
  if (/^\d{6}$/.test(q) && pincodes[q]) {
    const target = constituencies.find(c => c.no === pincodes[q].no);
    if (target) { openDetail(target.no); map.flyTo(coordsFor(target), 11); }
  }

  const items = constituencies.filter(c => {
    if (dist && c.district !== dist) return false;
    if (!q) return true;
    const hay = `${c.no} ${c.name} ${c.district} ${c.lha} ${c.reserved || ""}`.toLowerCase();
    if (hay.includes(q)) return true;
    // match against pincodes mapped to this AC (starter map + user-entered)
    const userPins = (store[c.no]?.pins || "").toLowerCase();
    if (userPins.includes(q)) return true;
    return Object.entries(pincodes).some(([pin, v]) => v.no === c.no && pin.includes(q));
  });
  renderList(items);
}

function openDetail(no) {
  const c = constituencies.find(x => x.no === no);
  if (!c) return;
  activeNo = no;
  el("d-name").textContent = `${c.no}. ${c.name}`;
  el("d-meta").textContent = `${c.district} district · ${c.lha} (Lok Sabha)${c.reserved ? " · " + c.reserved + " reserved" : ""}`;

  renderPulse(no);
  renderScanFeatures();
  renderGrievanceFlow();

  const d = store[no] || {};
  const f = el("detail-form");
  f.mla.value = d.mla || "";
  f.party.value = d.party || "";
  f.office.value = d.office || "";
  f.contact.value = d.contact || "";
  f.pins.value = d.pins || "";
  f.notes.value = d.notes || "";
  el("saved-msg").textContent = "";

  el("detail").classList.remove("hidden");
  markers[no]?.openPopup();
  document.querySelectorAll("#list li").forEach(li =>
    li.classList.toggle("active", Number(li.dataset.no) === no));
}

function metric(cls, v, k, barPct) {
  return `<div class="metric ${cls}"><div class="v">${v}</div><div class="k">${k}</div>${
    barPct != null ? `<div class="bar"><span style="width:${barPct}%"></span></div>` : ""}</div>`;
}

function renderPulse(no) {
  const p = pulse[no]; if (!p) return;
  el("pulse").innerHTML =
    metric("p1", p.interactions, "Interactions") +
    metric("p1", p.comments, "Comments") +
    metric("p1", p.volunteers, "Volunteers") +
    metric("p2", p.grievances, "Grievances") +
    metric("p2", `${p.resolved}/${p.grievances}`, "Resolved") +
    metric("p3", p.conversion + "%", "Conv. intent", p.conversion) +
    metric("p2", p.engagement, "Engagement", p.engagement);
}

function renderScanFeatures() {
  if (!framework) return;
  el("scan-features").innerHTML = framework.scanCard.features
    .map(f => `<span class="chip">${icon(FEATURE_ICON[f.id])} <span><b>${f.label}</b><br><small>${f.desc}</small></span></span>`).join("");
}

function renderGrievanceFlow() {
  if (!framework) return;
  const st = framework.grievancePipeline.stages;
  el("grievance-flow").innerHTML = st
    .map((s, i) => `<span class="node" title="${s.desc}">${s.label}</span>${i < st.length - 1 ? '<span class="arr">→</span>' : ""}`)
    .join("");
}

function renderProgram() {
  if (!framework) return;
  el("prog-title").textContent = framework.program.name;
  el("prog-tag").textContent = `${framework.program.tagline} · ${framework.program.horizonMonths}-month horizon · backend: ${framework.program.backend}`;

  el("prog-priorities").innerHTML = framework.priorities.map(p => `
    <div class="prio" style="border-top-color:${p.color}">
      <div class="id" style="color:${p.color}">${p.id}</div>
      <div class="nm">${p.name}</div>
      <div class="goal">${p.goal}</div>
      <div class="mods">Modules: ${p.modules.join(", ")}</div>
    </div>`).join("");

  el("prog-timeline").innerHTML = framework.timeline.map(t => {
    const col = PHASE_COLOR[t.focus] || "#888";
    return `<div class="tl" style="border-top-color:${col}">
      <div class="m">M${t.month} · <b style="color:${col}">${t.focus}</b></div>
      <div class="lab">${t.label}</div></div>`;
  }).join("");

  el("prog-scan").innerHTML = framework.scanCard.features
    .map(f => `<span class="chip">${icon(FEATURE_ICON[f.id])} <span><b>${f.label}</b><br><small>${f.desc}</small></span></span>`).join("");

  el("prog-kb").innerHTML = framework.knowledgeBase.taxonomy
    .map(n => `<div class="kb"><div class="node">${n.node}</div><div class="items">${n.items.join(" · ")}</div></div>`).join("");

  el("prog-wa").innerHTML = framework.whatsappFlow.steps
    .map((s, i) => `<span class="node">${s}</span>${i < framework.whatsappFlow.steps.length - 1 ? '<span class="arr">→</span>' : ""}`)
    .join("");
}

el("open-program").addEventListener("click", () => { renderProgram(); el("program").classList.remove("hidden"); });
el("program-close").addEventListener("click", () => el("program").classList.add("hidden"));

/* ---------- Voter journey demo (visible capital, not backend-wired) ---------- */
const journeyState = { selectedSlot: null };

function journeyConstituency() {
  return constituencies.find(c => c.no === activeNo) || constituencies.find(c => c.no === 17) || constituencies[0];
}

function timeSlots() {
  // Next few convenient slots (browser time). Mock — Proxy schedules for real.
  const labels = ["Today 6:00 PM", "Today 7:30 PM", "Tomorrow 11:00 AM", "Tomorrow 5:00 PM", "Sat 10:00 AM", "Sat 4:00 PM"];
  return labels;
}

const screen = (html) => { el("phone-screen").innerHTML = html; };
const tag = `<span class="mock-tag">Demo · Proxy wires backend</span>`;

function jLanding() {
  const c = journeyConstituency();
  screen(`${tag}
    <div class="scr-hd">${icon("pin")} ${c.name} · ${c.district}</div>
    <div class="scr-banner">
      <h3>Pulse of Punjab</h3>
      <p>You scanned in ${c.name}. Pick how you want to take part.</p>
    </div>
    <div class="feat-grid">
      ${framework.scanCard.features.map(f =>
        `<button class="feat" data-f="${f.id}">${icon(FEATURE_ICON[f.id], "big")}<div class="lb">${f.label}</div><div class="ds">${f.desc}</div></button>`
      ).join("")}
    </div>
    <button class="btn-link" id="j-restart">${icon("restart")} restart demo</button>`);
  el("phone-screen").querySelectorAll(".feat").forEach(elm =>
    elm.addEventListener("click", () => jFeature(elm.dataset.f)));
  el("j-restart")?.addEventListener("click", jLanding);
}

function jFeature(id) {
  if (id === "share_voice") return jVoice();
  if (id === "volunteer") return jSimple("volunteer", "Volunteer signed up", "We'll match you to booth-level work in your area. Expect a WhatsApp ping.");
  if (id === "stay_updated") return jSimple("bell", "You're subscribed", "Constituency updates will reach you on WhatsApp.");
  if (id === "join_events") return jEvents();
  if (id === "location") return jSimple("pin", "Near you", "Showing booths, events and volunteers around your PIN.");
}

function jVoice() {
  screen(`${tag}
    <div class="scr-hd">${icon("megaphone")} Share Voice · raise a grievance</div>
    <div class="scr-title">What's the issue?</div>
    <div class="scr-field">Category
      <select id="g-cat"><option>Water</option><option>Jobs</option><option>Agriculture</option><option>Roads</option><option>Power</option><option>Drugs</option><option>Other</option></select></div>
    <div class="scr-field">Describe it
      <textarea rows="3" placeholder="Tell us what's wrong…"></textarea></div>
    <div class="scr-field">Your name<input placeholder="Name" /></div>
    <div class="scr-field">Phone<input placeholder="+91…" /></div>
    <button class="btn-cta" id="g-next">Continue to schedule a call</button>
    <button class="btn-link" id="g-back">${icon("back")} back</button>`);
  el("g-next").addEventListener("click", jSchedule);
  el("g-back").addEventListener("click", jLanding);
}

function jSchedule() {
  journeyState.selectedSlot = null;
  screen(`${tag}
    <div class="scr-hd">${icon("clock")} Raise at your convenience</div>
    <div class="scr-title">When suits you?</div>
    <button class="btn-cta" id="call-now">${icon("phone")} Call me now</button>
    <button class="btn-alt" id="call-later">${icon("clock")} Schedule for later</button>
    <div id="slot-wrap" style="margin-top:14px"></div>
    <button class="btn-link" id="s-back">${icon("back")} back</button>`);
  el("call-now").addEventListener("click", () => jCalling("now"));
  el("call-later").addEventListener("click", () => {
    el("slot-wrap").innerHTML = `<div class="scr-hd">Pick a slot</div>
      <div class="slot-grid">${timeSlots().map((s,i) => `<div class="slot" data-i="${i}">${s}</div>`).join("")}</div>
      <button class="btn-cta" id="s-confirm">Confirm slot</button>`;
    el("phone-screen").querySelectorAll(".slot").forEach(sl =>
      sl.addEventListener("click", () => {
        el("phone-screen").querySelectorAll(".slot").forEach(x => x.classList.remove("sel"));
        sl.classList.add("sel"); journeyState.selectedSlot = sl.textContent;
      }));
    el("s-confirm").addEventListener("click", () => {
      if (!journeyState.selectedSlot) return;
      jCalling("scheduled");
    });
  });
  el("s-back").addEventListener("click", jVoice);
}

function jCalling(mode) {
  if (mode === "now") {
    screen(`${tag}
      <div class="confirm-ic accent">${icon("phone", "xl")}</div>
      <div class="scr-title" style="text-align:center">Connecting your call…</div>
      <p style="text-align:center;color:var(--muted);font-size:13px">Auto-call is dialing a volunteer to reach you now.</p>
      <div style="text-align:center;margin:18px 0"><span class="callpill"><span class="dot"></span>Auto-call in progress</span></div>
      <button class="btn-alt" id="c-done">Mark resolved</button>
      <button class="btn-link" id="c-home">${icon("restart")} restart demo</button>`);
  } else {
    screen(`${tag}
      <div class="confirm-ic ok">${icon("check", "xl")}</div>
      <div class="scr-title" style="text-align:center">Call scheduled</div>
      <p style="text-align:center;color:var(--muted);font-size:13px">Auto-call will dial you at<br><b style="color:var(--text)">${journeyState.selectedSlot}</b></p>
      <div style="text-align:center;margin:18px 0"><span class="callpill"><span class="dot"></span>Queued · grievance logged</span></div>
      <button class="btn-alt" id="c-done">Add to WhatsApp updates</button>
      <button class="btn-link" id="c-home">${icon("restart")} restart demo</button>`);
  }
  el("c-done").addEventListener("click", () => jSimple("check", "All set", "Grievance is in the pipeline: Raised, Call, Resolve, Convert. You'll get WhatsApp updates."));
  el("c-home").addEventListener("click", jLanding);
}

function jEvents() {
  const c = journeyConstituency();
  screen(`${tag}
    <div class="scr-hd">${icon("calendar")} Events in ${c.name}</div>
    <div class="scr-title">Join an event</div>
    ${["Booth meet · Sat 10 AM","Youth rally · Sun 5 PM","Door-to-door drive · Mon 9 AM"].map(e =>
      `<button class="btn-alt">${e}</button>`).join("")}
    <button class="btn-link" id="e-back">${icon("back")} back</button>`);
  el("e-back").addEventListener("click", jLanding);
  el("phone-screen").querySelectorAll(".btn-alt").forEach(b =>
    b.addEventListener("click", () => jSimple("calendar", "RSVP confirmed", "See you there. Reminder coming on WhatsApp.")));
}

function jSimple(ic, title, body) {
  screen(`${tag}
    <div class="confirm-ic ok">${icon(ic, "xl")}</div>
    <div class="scr-title" style="text-align:center">${title}</div>
    <p style="text-align:center;color:var(--muted);font-size:13px">${body}</p>
    <button class="btn-cta" id="x-home" style="margin-top:24px">${icon("restart")} Restart demo</button>`);
  el("x-home").addEventListener("click", jLanding);
}

el("open-journey").addEventListener("click", () => { jLanding(); el("journey").classList.remove("hidden"); });
el("journey-close").addEventListener("click", () => el("journey").classList.add("hidden"));

// Inject SVG icons into static chrome buttons (no emoji as UI icons).
el("open-program").innerHTML = icon("chart") + "<span>Program overview</span><small>P1 · P2 · P3</small>";
el("open-journey").innerHTML = icon("phone") + "<span>Voter journey demo</span><small>scan → call</small>";

// Close overlays on Escape; close on backdrop click.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    el("program").classList.add("hidden");
    el("journey").classList.add("hidden");
    el("detail").classList.add("hidden");
  }
});
["program", "journey"].forEach(id =>
  el(id).addEventListener("click", (e) => { if (e.target.id === id) el(id).classList.add("hidden"); }));

el("color-mode").addEventListener("change", (e) => { colorMode = e.target.value; renderMarkers(); });

el("detail-close").addEventListener("click", () => el("detail").classList.add("hidden"));

el("detail-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  store[activeNo] = {
    mla: f.mla.value, party: f.party.value, office: f.office.value,
    contact: f.contact.value, pins: f.pins.value, notes: f.notes.value
  };
  saveStore(store);
  const c = constituencies.find(x => x.no === activeNo);
  markers[activeNo].setIcon(makeIcon(c));
  markers[activeNo].setPopupContent(popupHtml(c));
  el("saved-msg").textContent = "Saved ✓";
  setTimeout(() => el("saved-msg").textContent = "", 1800);
});

el("detail-reset").addEventListener("click", () => {
  if (!confirm("Clear saved details for this constituency?")) return;
  delete store[activeNo];
  saveStore(store);
  const c = constituencies.find(x => x.no === activeNo);
  markers[activeNo].setIcon(makeIcon(c));
  markers[activeNo].setPopupContent(popupHtml(c));
  openDetail(activeNo);
});

el("search").addEventListener("input", applyFilter);
el("district-filter").addEventListener("change", applyFilter);

async function loadData() {
  // Prefer inline bundle (data.js) so the app runs on file:// with no server.
  if (window.PUNJAB) {
    const d = window.PUNJAB;
    return [d.constituencies, { ...d.pincodes }, d.framework];
  }
  // Fallback to fetch when served over http and bundle absent.
  return Promise.all([
    fetch("data/constituencies.json").then(r => r.json()),
    fetch("data/pincodes.json").then(r => r.json()),
    fetch("data/framework.json").then(r => r.json())
  ]);
}

async function init() {
  [constituencies, pincodes, framework] = await loadData();
  delete pincodes._comment;

  constituencies.forEach(c => { pulse[c.no] = buildPulse(c); });

  const dists = [...new Set(constituencies.map(c => c.district))].sort();
  const sel = el("district-filter");
  dists.forEach(d => {
    const o = document.createElement("option");
    o.value = o.textContent = d; sel.appendChild(o);
  });

  renderMarkers();
  renderList(constituencies);
}

init().catch(err => {
  console.error(err);
  document.getElementById("map").innerHTML =
    '<p style="color:#fff;padding:20px">Failed to load data. Open index.html directly (data is bundled in data.js), or run <code>node scripts/bundle.cjs</code>.</p>';
});
