
// Création des deux fonds de carte

// Fond Alidade Smooth Dark
const alidadedarkLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=a1ef2388-4a98-4134-8ffc-d2496230635e',{
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>', 
   minZoom: 5,
   maxZoom: 18
});

// Fond Thunderforest Atlas
const thunderforestAtlasLayer = L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2f67b0d994104bf69ffcd0cf70f86a08', {
  attribution: '&copy; OpenStreetMap contributors, &copy; Thunderforest',
  minZoom: 5,
  maxZoom: 18
});

// Limites de la France métropolitaine + Corse
const franceBounds = L.latLngBounds(
  L.latLng(40, -12),
  L.latLng(60, 17)
);

// Initialisation de la carte
const map = L.map('map', {
  center: [46.5, 2.5],
  zoom: 5,
  layers: [alidadedarkLayer],
  maxBounds: franceBounds,
  maxBoundsViscosity: 1.0
});

// Bouton de localisation
L.control.locate({
  position: 'topright',
  strings: {
    title: "Localiser ma position"
  },
  drawCircle: true,
  drawMarker: true,
  follow: true,
  stopFollowingOnDrag: true,
  setView: true,
  keepCurrentZoomLevel: true
}).addTo(map);

// Animation de zoom lors de la géolocalisation
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

// Contrôle des fonds de carte
L.control.layers({
  'Dark' : alidadedarkLayer,
  'Atlas': thunderforestAtlasLayer
}, {}, { position: 'topleft' }).addTo(map);

// Emoji par catégorie
const emojiParCategorie = {
  "Affaires Non Résolues": "❓",
  "Crimes": "☠️",
  "Drames": "⚰️",
  "Guerres et Conflits": "⚔️",
  "Lieux Abandonnés": "🏰",
  "Lieux Mystérieux": "👁️"
};

// Fonction de création des marqueurs emoji
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

let autoPanAttempts = 0; // Compteur global

const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon })
    .bindPopup(popupContent, {
        maxWidth: 600,
        autoPan: true,
        keepInView: true,
        autoPanPadding: [40, 40]
    });

marker.on('popupopen', () => {
    autoPanAttempts = 0; // Réinitialiser le compteur à chaque ouverture de popup
});

map.on('moveend', () => {
    autoPanAttempts = 0; // Réinitialiser le compteur après chaque mouvement de la carte
});

marker.on('click', () => {
    const latlng = marker.getLatLng();
    map.setView(latlng, map.getZoom(), { animate: true });
});

map.on('autopanstart', () => { // Intercepter l'autoPan de Leaflet
    autoPanAttempts++;
    if (autoPanAttempts > 5) { // Limite arbitraire, ajuste selon tes besoins
        map.stop(); // Arrêter l'autoPan
        console.warn("AutoPan stopped to prevent stack overflow.");
    }
});
    return marker;
}

// Chargement des lieux
fetch('lieux.json')
  .then(response => response.json())
  .then(data => {
    const markers = data.map(lieu => createEmojiMarker(lieu));
    window.allMarkers = markers;
    const group = L.featureGroup(markers);
    group.addTo(map);
    map.fitBounds(group.getBounds());
  })
  .catch(error => console.error('Erreur lors du chargement des lieux :', error));

// Légende emoji
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

// Animation d’introduction
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

// === Ajout du bouton 🎲 à l'intérieur de la carte (sous le bouton de localisation) ===
const randomControl = L.control({ position: 'topright' });

randomControl.onAdd = function () {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  container.id = 'randomButton';
  container.innerHTML = '🎲';
  container.title = 'Lieu au hasard 🎲';

  container.style.cursor = 'pointer';

  // Empêche que le clic interfère avec les événements de la carte
  L.DomEvent.disableClickPropagation(container);

  return container;
};

randomControl.addTo(map);

// Ajout de l'écouteur une fois le bouton inséré dans la carte
setTimeout(() => {
  const btn = document.getElementById("randomButton");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!window.allMarkers || window.allMarkers.length === 0) return;

    const randomIndex = Math.floor(Math.random() * window.allMarkers.length);
    const randomMarker = window.allMarkers[randomIndex];
    const latlng = randomMarker.getLatLng();
    const currentZoom = map.getZoom();

    if (currentZoom >= 10) {
      map.setView(map.getCenter(), 5); // dézoom rapide
      setTimeout(() => {
        map.flyTo(latlng, 10, {
          animate: true,
          duration: 2.5,
          easeLinearity: 0.25
        });
    setTimeout(() => randomMarker.openPopup(), 3000); // ✅ ouverture après 1 seconde      
      }, 700);
    } else {
      map.flyTo(latlng, 10, {
        animate: true,
        duration: 2.5,
        easeLinearity: 0.25
      });
         setTimeout(() => randomMarker.openPopup(), 3000); // ✅ ouverture après 1 seconde    
    }
  });
}, 0);
