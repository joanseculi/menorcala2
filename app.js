// ---- Estat ----
let beaches = [];
let activeFilter = "all";
let query = "";
let selectedId = null;
let map;
let markers = {}; // id -> L.circleMarker

init();

async function init() {
  initMap();
  try {
    const ids = await fetch("cales/index.json").then((r) => r.json());
    beaches = await Promise.all(
      ids.map((id) => fetch(`cales/${id}.json`).then((r) => r.json()))
    );
  } catch (err) {
    document.getElementById("detail").innerHTML =
      "<p class='detail-empty'>⚠️ Obre la pàgina amb el servidor local (no amb file://).</p>";
    console.error(err);
    return;
  }

  renderStats();
  drawMarkers();
  bindControls();
  render();
}

// ---- Mapa ----
function initMap() {
  map = L.map("map", { scrollWheelZoom: true }).setView([39.97, 4.05], 11);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap, © CARTO",
    maxZoom: 19,
  }).addTo(map);
}

function crowdColor(c) {
  if (c <= 3) return "#16a34a";
  if (c <= 6) return "#d97706";
  return "#dc2626";
}
function crowdClass(c) {
  if (c <= 3) return "low";
  if (c <= 6) return "mid";
  return "high";
}
function crowdText(c) {
  if (c <= 1) return "Gairebé buida";
  if (c <= 3) return "Tranquil·la";
  if (c <= 6) return "Moderada";
  if (c <= 8) return "Concorreguda";
  return "Plena";
}

function drawMarkers() {
  beaches.forEach((b) => {
    const m = L.circleMarker([b.lat, b.lng], {
      radius: 9,
      color: "#fff",
      weight: 2,
      fillColor: crowdColor(b.crowd),
      fillOpacity: 0.95,
    }).addTo(map);

    m.bindTooltip(b.name, { direction: "top", className: "cala-marker-label", offset: [0, -6] });
    m.bindPopup(mapPopupHTML(b), { maxWidth: 240, className: "cala-popup" });
    m.on("click", () => select(b.id, true));
    markers[b.id] = m;
  });

  // ajustar la vista a tots els marcadors
  const group = L.featureGroup(Object.values(markers));
  map.fitBounds(group.getBounds().pad(0.12));
}

// HTML del popup del mapa (foto petita + nom); la foto obre el lightbox
function mapPopupHTML(b) {
  const img = b.image
    ? `<img class="mp-img" src="${b.image}" alt="${b.name}" onclick="openLightbox('${b.id}')" title="Clica per ampliar" />`
    : `<div class="mp-noimg">${b.emoji}</div>`;
  return `<div class="map-popup">
    ${img}
    <div class="mp-name">${b.emoji} ${b.name}</div>
    <div class="mp-zone">${b.zone}</div>
  </div>`;
}

// ---- Estadístiques ----
function renderStats() {
  animateNumber("statTotal", beaches.length);
  animateNumber("statHidden", beaches.filter((b) => b.crowd <= 3).length);
  animateNumber("statFoot", beaches.filter((b) => !b.access.cotxe && b.access.peu).length);
}
function animateNumber(id, target) {
  const el = document.getElementById(id);
  el.textContent = target;
  let n = 0;
  const step = Math.max(1, Math.round(target / 24));
  const timer = setInterval(() => {
    n = Math.min(target, n + step);
    el.textContent = n;
    if (n >= target) clearInterval(timer);
  }, 28);
}

// ---- Controls ----
function bindControls() {
  document.getElementById("search").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });

  document.querySelectorAll("[data-lbclose]").forEach((el) =>
    el.addEventListener("click", closeLightbox)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function matchesFilter(b) {
  switch (activeFilter) {
    case "hidden": return b.crowd <= 3;
    case "foot": return !b.access.cotxe && b.access.peu;
    case "car": return b.access.cotxe;
    case "boat": return b.access.vaixell;
    case "clear": return b.water === "Turquesa";
    default: return true;
  }
}
function matchesQuery(b) {
  if (!query) return true;
  return (b.name + " " + b.zone).toLowerCase().includes(query);
}
function isVisible(b) { return matchesFilter(b) && matchesQuery(b); }

// ---- Render llista + marcadors visibles ----
function render() {
  const visible = beaches
    .filter(isVisible)
    .sort((a, b) => a.name.localeCompare(b.name, "ca"));

  // mostrar/amagar marcadors segons filtres
  beaches.forEach((b) => {
    const m = markers[b.id];
    if (isVisible(b)) {
      if (!map.hasLayer(m)) m.addTo(map);
    } else {
      if (map.hasLayer(m)) map.removeLayer(m);
    }
  });

  const list = document.getElementById("calaList");
  document.getElementById("listCount").textContent =
    `${visible.length} ${visible.length === 1 ? "cala" : "cales"}`;
  list.innerHTML = visible
    .map(
      (b) => `<li data-id="${b.id}" class="${b.id === selectedId ? "active" : ""}">
        <span class="dot ${crowdClass(b.crowd)}"></span>${b.name}</li>`
    )
    .join("");
  list.querySelectorAll("li").forEach((li) =>
    li.addEventListener("click", () => select(li.dataset.id, true))
  );
}

// ---- Selecció ----
function select(id, fly) {
  selectedId = id;
  const b = beaches.find((x) => x.id === id);
  if (!b) return;

  // ressaltar marcador
  Object.entries(markers).forEach(([mid, m]) => {
    const sel = mid === id;
    m.setStyle({ radius: sel ? 13 : 9, weight: sel ? 3 : 2 });
    if (sel) m.bringToFront();
  });

  if (fly) map.flyTo([b.lat, b.lng], 14, { duration: 0.6 });

  renderDetail(b);
  // actualitzar estat actiu a la llista
  document.querySelectorAll(".cala-list li").forEach((li) =>
    li.classList.toggle("active", li.dataset.id === id)
  );

  // auto-switch to detail view on mobile
  if (window.innerWidth <= 960) {
    document.querySelectorAll(".mobile-tab").forEach(t => t.classList.remove("active"));
    document.querySelector('.mobile-tab[data-view="detail"]').classList.add("active");
    document.getElementById("mapCol").style.display = "none";
    document.getElementById("detail").style.display = "";
  }
}

function fmtWalk(hours) {
  const mins = Math.round(hours * 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
function dAcc(on, emoji, label) {
  return `<span class="d-acc ${on ? "" : "off"}">${emoji} ${label}</span>`;
}

function renderDetail(b) {
  const walkBlock = b.access.peu
    ? `
      <div class="d-stat">
        <div class="label">🥾 Distància a peu</div>
        <div class="value">${b.walkDistance} <small>m</small></div>
      </div>
      <div class="d-stat">
        <div class="label">⏱️ Temps caminant</div>
        <div class="value">${fmtWalk(b.walkHours)}</div>
      </div>`
    : "";

  const photo = b.image
    ? `<div class="d-top has-photo" data-lb="${b.id}" title="Clica per ampliar la imatge">
         <img class="d-photo" src="${b.image}" alt="${b.name}" loading="lazy" />
         <span class="d-zoom">🔍 Ampliar</span>
         <span class="d-crowd-badge"><span class="dot ${crowdClass(b.crowd)}"></span>${b.crowd}/10</span>
       </div>
       ${b.imageCredit ? `<p class="d-credit">📷 ${b.imageCredit}</p>` : ""}`
    : `<div class="d-top">
         <span class="d-emoji">${b.emoji}</span>
         <span class="d-crowd-badge"><span class="dot ${crowdClass(b.crowd)}"></span>${b.crowd}/10</span>
       </div>`;

  document.getElementById("detail").innerHTML = `
    ${photo}
    <div class="d-head">
      <span class="d-zone">${b.zone}</span>
      <h2 class="d-name">${b.name}</h2>
      <p class="d-desc">${b.desc}</p>
    </div>

    <div class="d-grid">
      <div class="d-stat"><div class="label">📏 Llargada</div><div class="value">${b.length} <small>m</small></div></div>
      <div class="d-stat"><div class="label">↔️ Amplada</div><div class="value">${b.width} <small>m</small></div></div>
      <div class="d-stat"><div class="label">💧 Estat de l'aigua</div><div class="value">${b.water}</div></div>
      <div class="d-stat"><div class="label">☀️ Hores de sol</div><div class="value">${b.sunHours} <small>h/dia</small></div></div>
      ${walkBlock}
    </div>

    <div class="d-section">
      <h3>Com s'hi accedeix</h3>
      <div class="d-access">
        ${dAcc(b.access.cotxe, "🚗", "Cotxe")}
        ${dAcc(b.access.peu, "🥾", "A peu")}
        ${dAcc(b.access.bicicleta, "🚲", "Bicicleta")}
        ${dAcc(b.access.moto, "🏍️", "Moto")}
        ${dAcc(b.access.vaixell, "⛵", "Vaixell")}
      </div>
    </div>

    ${b.howToArrive ? `
    <div class="d-section">
      <h3>Com arribar</h3>
      <p class="d-howto">${b.howToArrive}</p>
    </div>
    ` : ''}

    <div class="d-section">
      <h3>Nivell d'afluència</h3>
      <div class="crowd-bar"><div class="crowd-fill" style="width:${b.crowd * 10}%"></div></div>
      <p class="crowd-label"><strong>${b.crowd}/10 · ${crowdText(b.crowd)}</strong> ${
        b.crowd <= 3 ? "— perfecta per desconnectar 🤫" : ""
      }</p>
    </div>

    <div class="d-section d-maps">
      <a class="d-maps-btn" href="https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}" target="_blank" rel="noopener">
        🗺️ Com arribar a <strong>${b.name}</strong>
      </a>
    </div>
  `;

  const photoEl = document.querySelector(".d-top.has-photo");
  if (photoEl) photoEl.addEventListener("click", () => openLightbox(photoEl.dataset.lb));
}

// ---- Lightbox (imatge ampliada) ----
function openLightbox(id) {
  const b = beaches.find((x) => x.id === id);
  if (!b || !b.image) return;
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lbImg");
  img.src = b.imageFull || b.image;
  img.alt = b.name;
  const credit = b.imageCredit ? ` · 📷 ${b.imageCredit}` : "";
  const link = b.imageSource
    ? ` · <a href="${b.imageSource}" target="_blank" rel="noopener">Font</a>`
    : "";
  document.getElementById("lbCaption").innerHTML = `<strong>${b.name}</strong>${credit}${link}`;
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox").hidden = true;
  document.getElementById("lbImg").src = "";
  document.body.style.overflow = "";
}

// ---- Mobile tabs ----
document.getElementById("mobileTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".mobile-tab");
  if (!btn) return;
  document.querySelectorAll(".mobile-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  const view = btn.dataset.view;
  const mapCol = document.getElementById("mapCol");
  const detCol = document.getElementById("detail");
  if (view === "map") {
    mapCol.style.display = "";
    detCol.style.display = "none";
    setTimeout(() => map.invalidateSize(), 100);
  } else {
    mapCol.style.display = "none";
    detCol.style.display = "";
  }
});

// init mobile: hide detail on small screens
function initMobileView() {
  if (window.innerWidth <= 960) {
    document.getElementById("detail").style.display = "none";
  }
}
initMobileView();

// handle resize: reset layout when going desktop
let wasMobile = window.innerWidth <= 960;
window.addEventListener("resize", () => {
  const nowMobile = window.innerWidth <= 960;
  if (wasMobile && !nowMobile) {
    // going desktop: show both columns
    document.getElementById("mapCol").style.display = "";
    document.getElementById("detail").style.display = "";
    document.getElementById("mobileTabs").style.display = "none";
    setTimeout(() => map.invalidateSize(), 100);
  } else if (!wasMobile && nowMobile) {
    // going mobile: hide detail, show tabs
    document.getElementById("detail").style.display = "none";
    document.getElementById("mobileTabs").style.display = "";
    document.querySelectorAll(".mobile-tab").forEach(t => t.classList.remove("active"));
    document.querySelector('.mobile-tab[data-view="map"]').classList.add("active");
    setTimeout(() => map.invalidateSize(), 100);
  }
  wasMobile = nowMobile;
});

// ---- Add beach form ----
let pendingLat = null;
let pendingLng = null;
let addMarker = null;

function showAddModal() {
  document.getElementById("addModal").hidden = false;
  const hasCoords = pendingLat !== null && pendingLng !== null;
  document.getElementById("addSubmit").disabled = !hasCoords;
  const preview = document.getElementById("addPreview");
  if (hasCoords) {
    preview.className = "add-preview has-coords";
    preview.innerHTML = `📍 <strong>${pendingLat.toFixed(5)}, ${pendingLng.toFixed(5)}</strong>`;
    document.getElementById("fLat").value = pendingLat.toFixed(6);
    document.getElementById("fLng").value = pendingLng.toFixed(6);
  } else {
    preview.className = "add-preview";
    preview.innerHTML = '<span class="add-preview-text">📍 Clica al mapa per seleccionar ubicació</span>';
    document.getElementById("fLat").value = "";
    document.getElementById("fLng").value = "";
  }
  if (addMarker) { map.removeLayer(addMarker); addMarker = null; }
}

document.getElementById("addBtn").addEventListener("click", showAddModal);

document.querySelectorAll("[data-addclose]").forEach(el =>
  el.addEventListener("click", closeAddModal)
);

function closeAddModal() {
  document.getElementById("addModal").hidden = true;
  pendingLat = null;
  pendingLng = null;
  if (addMarker) { map.removeLayer(addMarker); addMarker = null; }
}

map.on("click", (e) => {
  const { lat, lng } = e.latlng;
  pendingLat = lat;
  pendingLng = lng;
  if (!document.getElementById("addModal").hidden) {
    document.getElementById("addSubmit").disabled = false;
    document.getElementById("fLat").value = lat.toFixed(6);
    document.getElementById("fLng").value = lng.toFixed(6);
    const preview = document.getElementById("addPreview");
    preview.className = "add-preview has-coords";
    preview.innerHTML = `📍 <strong>${lat.toFixed(5)}, ${lng.toFixed(5)}</strong>`;
  }
  if (addMarker) map.removeLayer(addMarker);
  addMarker = L.circleMarker([lat, lng], {
    radius: 10, color: "#fff", weight: 3,
    fillColor: "#3b82f6", fillOpacity: 0.95,
  }).addTo(map);
});

document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const lat = parseFloat(document.getElementById("fLat").value);
  const lng = parseFloat(document.getElementById("fLng").value);
  if (isNaN(lat) || isNaN(lng)) return;

  const name = document.getElementById("fName").value.trim();
  const id = name.toLowerCase()
    .replace(/[^a-z0-9à-ú]+/g, "-")
    .replace(/^-|-$/g, "");

  const walkDist = parseInt(document.getElementById("fWalk").value) || 500;
  const walkHours = +(walkDist / 3000).toFixed(2);

  const data = {
    id,
    name,
    zone: document.getElementById("fZone").value,
    emoji: document.getElementById("fEmoji").value || "🏖️",
    desc: document.getElementById("fDesc").value.trim(),
    length: parseInt(document.getElementById("fLength").value) || 0,
    width: parseInt(document.getElementById("fWidth").value) || 0,
    access: {
      cotxe: document.getElementById("fCotxe").checked,
      peu: document.getElementById("fPeu").checked,
      bicicleta: document.getElementById("fBici").checked,
      moto: document.getElementById("fMoto").checked,
      vaixell: document.getElementById("fVaixell").checked,
    },
    walkDistance: walkDist,
    walkHours,
    water: document.getElementById("fWater").value,
    sunHours: 8,
    crowd: parseInt(document.getElementById("fCrowd").value) || 3,
    lat,
    lng,
    image: "",
    imageFull: "",
    imageSource: "",
    imageCredit: "",
    howToArrive: document.getElementById("fHowToArrive").value.trim(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${id}.json`;
  a.click();
  URL.revokeObjectURL(url);

  const toast = document.createElement("div");
  toast.className = "add-toast";
  toast.innerHTML = `✅ Fitxer <strong>${id}.json</strong> descarregat!<br><span>📩 Envieu-lo a <strong>joan.seculi@gmail.com</strong> perquè s'actualitzi el web.</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, 5000);

  closeAddModal();
});
