// === Initialisation des fonds de carte ===

// Fond Alidade Smooth Dark
const alidadedarkLayer = L.tileLayer(
  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=a1ef2388-4a98-4134-8ffc-d2496230635e',
  {
    attribution:
      '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
      '&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    minZoom: 5,
    maxZoom: 18
  }
);

// Fond Thunderforest Atlas
const thunderforestAtlasLayer = L.tileLayer(
  'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2f67b0d994104bf69ffcd0cf70f86a08',
  {
    attribution: '&copy; OpenStreetMap contributors, &copy; Thunderforest',
    minZoom: 5,
    maxZoom: 18
  }
);

// Limites de la France métropolitaine + Corse
const franceBounds = L.latLngBounds(
  L.latLng(41, -5),
  L.latLng(54, 10)
);

// === Création et configuration de la carte ===
const map = L.map('map', {
  center: [46.5, 2.5],
  zoom: 5,
  layers: [alidadedarkLayer],
  maxBounds: franceBounds,
  maxBoundsViscosity: 1.0
});

// === Bouton de localisation ===
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

// === Animation de zoom lors de la géolocalisation ===
map.on('locationfound', function (event) {
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

// === Sélecteur de fonds de carte ===
L.control.layers(
  { Dark: alidadedarkLayer, Atlas: thunderforestAtlasLayer },
  {},
  { position: 'topleft' }
).addTo(map);

// === Emojis par catégorie ===
const emojiParCategorie = {
  "Affaires Non Résolues": "❓",
  "Crimes": "☠️",
  "Drames": "⚰️",
  "Guerres et Conflits": "⚔️",
  "Lieux Abandonnés": "🏰",
  "Lieux Mystérieux": "👁️"
};

// === Création d’un marqueur emoji + popup ===
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
    <a href="${lieu.lien}" target="_blank">Voir plus</a>
  `;

  const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon })
    .bindPopup(popupContent, {
      maxWidth: 600,
      autoPan: false,
      keepInView: false
    })
    .addTo(map);

  // Au clic : on n'ouvre que la popup, pas de zoom
  marker.on('click', () => {
    marker.openPopup();
  });

  return marker;
} // <<< fermeture de createEmojiMarker

// === Chargement des données et ajout des marqueurs ===
fetch('lieux.json')
  .then((response) => response.json())
  .then((data) => {
    const markers = data.map((lieu) => createEmojiMarker(lieu));
    window.allMarkers = markers;
    const group = L.featureGroup(markers);
    group.addTo(map);
    map.fitBounds(group.getBounds());
  })
  .catch((error) =>
    console.error('Erreur lors du chargement des lieux :', error)
  );

// === Légende des catégories ===
function createLegend() {
  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const categories = [
      { name: 'Affaires Non Résolues', emoji: '❓' },
      { name: 'Crimes', emoji: '☠️' },
      { name: 'Drames', emoji: '⚰️' },
      { name: 'Guerres et Conflits', emoji: '⚔️' },
      { name: 'Lieux Abandonnés', emoji: '🏰' },
      { name: 'Lieux Mystérieux', emoji: '👁️' }
    ];
    categories.forEach((cat) => {
      div.innerHTML += `
        <div class="legend-item">
          <span class="emoji">${cat.emoji}</span>
          <span class="category-name">${cat.name}</span>
        </div>
      `;
    });
    return div;
  };
  legend.addTo(map);
}
createLegend();

// === Intro animée ===
let showIntro = true;
window.addEventListener('load', () => {
  const overlay = document.getElementById('intro-overlay');
  if (showIntro) {
    const line1 = document.querySelector('.line1');
    const line2 = document.querySelector('.line2');
    line1.textContent = 'Un territoire. Une carte.';
    line2.textContent = 'Un passé sombre.';
    setTimeout(() => {
      overlay.style.opacity = 0;
      setTimeout(() => overlay.remove(), 1000);
    }, 10000);
  } else {
    overlay.style.display = 'none';
  }
});

// === Bouton "Lieu aléatoire" sous la localisation ===
const randomControl = L.control({ position: 'topright' });
randomControl.onAdd = function () {
  const container = L.DomUtil.create(
    'div',
    'leaflet-bar leaflet-control leaflet-control-custom'
  );
  container.id = 'randomButton';
  container.innerHTML = '🎲';
  container.title = 'Lieu au hasard 🎲';
  container.style.cursor = 'pointer';
  L.DomEvent.disableClickPropagation(container);
  return container;
};
randomControl.addTo(map);

// === Comportement du bouton aléatoire ===
setTimeout(() => {
  const btn = document.getElementById('randomButton');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!window.allMarkers || window.allMarkers.length === 0) return;

    const randomIndex = Math.floor(
      Math.random() * window.allMarkers.length
    );
    const randomMarker = window.allMarkers[randomIndex];
    const latlng = randomMarker.getLatLng();
    const currentZoom = map.getZoom();
    const targetZoom = 10;

    if (currentZoom >= targetZoom) {
      // Dézoom préalable
      map.setView(map.getCenter(), 5, { animate: true });
      setTimeout(() => {
        // Vol vers le marqueur
        map.flyTo(latlng, targetZoom, {
          animate: true,
          duration: 2.5,
          easeLinearity: 0.25
        });
        map.once('moveend', () => {
          randomMarker.openPopup();
        });
      }, 700);
    } else {
      // Vol direct vers le marqueur
      map.flyTo(latlng, targetZoom, {
        animate: true,
        duration: 2.5,
        easeLinearity: 0.25
      });
      map.once('moveend', () => {
        randomMarker.openPopup();
      });
    }
  });
}, 0);
