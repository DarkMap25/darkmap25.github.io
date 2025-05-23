// Création du fond de carte Alidade Smooth Dark
const alidadedarkLayer = L.tileLayer(
  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=a1ef2388-4a98-4134-8ffc-d2496230635e',
  {
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    minZoom: 5,
    maxZoom: 18
  }
);

// Création du fond de carte Thunderforest Atlas
const thunderforestAtlasLayer = L.tileLayer(
  'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2f67b0d994104bf69ffcd0cf70f86a08',
  {
    attribution: '&copy; OpenStreetMap contributors, &copy; Thunderforest',
    minZoom: 5,
    maxZoom: 18
  }
);

// Définition des limites géographiques (France métropolitaine + Corse)
const franceBounds = L.latLngBounds(
  L.latLng(40, -12),
  L.latLng(56, 16)
);

// Initialisation de la carte avec le calque sombre par défaut
const map = L.map('map', {
  center: [46.5, 2.5],
  zoom: 6,
  layers: [alidadedarkLayer],
  maxBounds: franceBounds,
  maxBoundsViscosity: 0.5
});

// Ajout du bouton de localisation
L.control.locate({
  position: 'topright',
  strings: { title: "Localiser ma position" },
  drawCircle: true,
  drawMarker: true,
  follow: true,
  stopFollowingOnDrag: true,
  setView: true,
  keepCurrentZoomLevel: true
}).addTo(map);

// Animation pour zoomer doucement lors de la géolocalisation
map.on('locationfound', function(event) {
  const targetLatLng = event.latlng;
  const targetZoom = 9;

  const currentZoom = map.getZoom();
  if (currentZoom > targetZoom - 2) {
    map.setZoom(targetZoom - 2);
  }

  setTimeout(() => {
    map.flyTo(targetLatLng, targetZoom, {
      animate: true,
      duration: 2.5,
      easeLinearity: 0.25
    });
  });
});

// Ajout du contrôle de changement de fond de carte
L.control.layers(
  { 'Dark': alidadedarkLayer, 'Atlas': thunderforestAtlasLayer },
  {},
  { position: 'topleft' }
).addTo(map);

// Définition des emojis par catégorie
const emojiParCategorie = {
  "Affaires Non Résolues": "❓",
  "Crimes": "☠️",
  "Drames": "⚰️",
  "Guerres et Conflits": "⚔️",
  "Lieux Abandonnés": "🏰",
  "Lieux Mystérieux": "👁️"
};

// Fonction pour créer un marqueur emoji pour chaque lieu
function createEmojiMarker(lieu) {
  const emoji = emojiParCategorie[lieu.categorie] || "❓";

  const emojiIcon = L.divIcon({
    className: 'emoji-icon',
    html: `<div class="emoji-marker">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });

  const popupContent = `
    <strong>${lieu.nom}</strong><br>
    ${lieu.resume}<br>
    <a href="#" class="voir-plus" data-id="${lieu.ID}">Voir plus</a>
  `;

  const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon })
    .bindPopup(popupContent, {
      maxWidth: 600,
      autoPan: false,
      keepInView: false
    });

  marker.on('click', () => {
    const latlng = marker.getLatLng();
    map.setView(latlng, map.getZoom(), { animate: true });
    marker.openPopup();
  });

  return marker;
}

// Chargement du fichier lieux.json et création des marqueurs
fetch('lieux.json')
  .then(response => response.json())
  .then(data => {
    window.lieuxData = data;

    const markers = data.map(lieu => createEmojiMarker(lieu));
    window.allMarkers = markers;

    const group = L.featureGroup(markers);
    group.addTo(map);
    map.fitBounds(group.getBounds());
  })
  .catch(error => console.error('Erreur lors du chargement des lieux :', error));

// Création de la légende emoji
function createLegend() {
  const legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const categories = [
      { name: 'Affaires Non Résolues', emoji: '❓' },
      { name: 'Crimes', emoji: '☠️' },
      { name: 'Drames', emoji: '⚰️' },
      { name: 'Guerres et Conflits', emoji: '⚔️' },
      { name: 'Lieux Abandonnés', emoji: '🏰' },
      { name: 'Lieux Mystérieux', emoji: '👁️' }
    ];

    categories.forEach(category => {
      div.innerHTML += `
        <div class="legend-item">
          <span class="emoji">${category.emoji}</span>
          <span class="category-name">${category.name}</span>
        </div>
      `;
    });

    return div;
  };

  legend.addTo(map);
}
createLegend();

// 1) Handler pour ouvrir le panneau "Voir plus"
document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("voir-plus")) return;
  e.preventDefault();

  const mapContainer  = document.getElementById("map");
  const detailPanel   = document.getElementById("detailPanel");
  const detailContent = document.getElementById("detailContent");

  // → Sauvegarde de la vue actuelle (centre + zoom)
  window._prevMapView = {
    center: map.getCenter(),
    zoom:   map.getZoom()
  };

  // → Masquer la carte et afficher le panneau
  mapContainer.style.display = "none";
  detailPanel.classList.add("visible", "full-view");

  // … construction du HTML comme avant …
  const id   = e.target.getAttribute("data-id");
  const lieu = window.lieuxData.find(l => l.ID == id);
  if (!lieu) return;

  let html = `<h2>${lieu.nom}</h2>`;
  html += `<p>${lieu.resume_long || lieu.resume}</p>`;
  if (lieu.date_debut || lieu.date_fin) {
    const d = lieu.date_debut||"", f = lieu.date_fin||"";
    html += `<p><strong>Période :</strong> ${d}${d&&f?" – "+f:""}</p>`;
  }

  const ignore = ["ID","nom","resume","resume_long","latitude","longitude","date_debut","date_fin"];
  function formatLabel(k){
    return k.split("_").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ");
  }

  for (const [key,value] of Object.entries(lieu)) {
    if (ignore.includes(key)||!value) continue;
    if (typeof value==="string" && /^https?:\/\//.test(value)) {
      html += `<p><strong>${formatLabel(key)} :</strong> <a href="${value}" target="_blank">${value}</a></p>`;
    } else {
      html += `<p><strong>${formatLabel(key)} :</strong> ${value}</p>`;
    }
  }

  detailContent.innerHTML = html;
  // (le CSS fera apparaître automatiquement #closeDetailPanel via #detailPanel.visible)
});

// 2) Handler pour fermer le panneau (croix)
document.getElementById("closeDetailPanel").addEventListener("click", function(e) {
  e.preventDefault();
  e.stopPropagation();

  const mapContainer  = document.getElementById("map");
  const detailPanel   = document.getElementById("detailPanel");
  const detailContent = document.getElementById("detailContent");

  // → Cacher le panneau
  detailPanel.classList.remove("visible", "full-view");
  // → Vider le contenu
  detailContent.innerHTML = "";

  // → Réafficher la carte
  mapContainer.style.display = "block";
  // → Forcer Leaflet à redimensionner
  map.invalidateSize();

  // → Revenir exactement à la vue précédente
  if (window._prevMapView) {
    map.setView(window._prevMapView.center, window._prevMapView.zoom, { animate: false });
    delete window._prevMapView;
  }
});

// Animation d’introduction au chargement de la page
let showIntro = true;
window.addEventListener("load", () => {
  const overlay = document.getElementById("intro-overlay");
  if (showIntro) {
    const line1 = document.querySelector(".line1");
    const line2 = document.querySelector(".line2");

    line1.textContent = "Un territoire. Une carte.";
    line2.textContent = "Un passé sombre.";

    setTimeout(() => {
      overlay.style.opacity = 0;
      setTimeout(() => overlay.remove(), 1000);
    }, 10000);
  } else {
    overlay.style.display = "none";
  }
});

// Ajout du bouton plein écran à la carte
const fullscreenControl = L.control({ position: 'bottomright' });
fullscreenControl.onAdd = function(map) {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  container.id = 'fullscreenButton';
  container.innerHTML = '&#x2194;&#xFE0F;';
  container.title = 'Passer en plein écran';
  container.style.cursor = 'pointer';
  L.DomEvent.disableClickPropagation(container);
  container.addEventListener('click', toggleFullscreen);
  return container;
};
fullscreenControl.addTo(map);

// Fonction pour basculer en plein écran et sortir
function toggleFullscreen() {
  const mapElement = document.getElementById('map');
  if (!document.fullscreenElement) {
    mapElement.requestFullscreen?.() ??
      mapElement.mozRequestFullScreen?.() ??
      mapElement.webkitRequestFullscreen?.() ??
      mapElement.msRequestFullscreen?.();
  } else {
    document.exitFullscreen?.() ??
      document.mozCancelFullScreen?.() ??
      document.webkitExitFullscreen?.() ??
      document.msExitFullscreen?.();
  }
}

// Mise à jour de l’icône et du titre du bouton plein écran
['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange']
  .forEach(evt => document.addEventListener(evt, updateFullscreenButton));

function updateFullscreenButton() {
  const btn = document.getElementById('fullscreenButton');
  if (!btn) return;
  btn.title = document.fullscreenElement ? 'Quitter le plein écran' : 'Passer en plein écran';
}

// Ajout du bouton "Lieu au hasard 🎲"
const randomControl = L.control({ position: 'topright' });
randomControl.onAdd = function() {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  container.id = 'randomButton';
  container.innerHTML = '🎲';
  container.title = 'Lieu au hasard 🎲';
  L.DomEvent.disableClickPropagation(container);
  return container;
};
randomControl.addTo(map);

// Écoute du clic sur 🎲 pour afficher un lieu aléatoire
setTimeout(() => {
  const btn = document.getElementById("randomButton");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!window.allMarkers?.length) return;
    const randomIndex = Math.floor(Math.random() * window.allMarkers.length);
    const randomMarker = window.allMarkers[randomIndex];
    const latlng = randomMarker.getLatLng();
    const currentZoom = map.getZoom();

    map.closePopup();

    if (currentZoom >= 10) {
      map.setView(map.getCenter(), 5);
      setTimeout(() => {
        map.flyTo(latlng, 10, { animate: true, duration: 2.5, easeLinearity: 0.25 });
        setTimeout(() => randomMarker.openPopup(), 3000);
      }, 700);
    } else {
      map.flyTo(latlng, 10, { animate: true, duration: 2.5, easeLinearity: 0.25 });
      setTimeout(() => randomMarker.openPopup(), 3000);
    }
  });
}, 0);
