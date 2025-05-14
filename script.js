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
  L.latLng(41, -5),
  L.latLng(54, 10)
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

  const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon }).bindPopup(popupContent);

  marker.on('click', () => {
    map.setView([lieu.latitude, lieu.longitude], map.getZoom(), { animate: true });
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
  .catch(error => console.error('Erreur lors du chargement
