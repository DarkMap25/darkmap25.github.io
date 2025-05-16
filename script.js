// === Initialisation des fonds de carte ===

// Fond Alidade Smooth Dark
const alidadedarkLayer = L.tileLayer(
  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=a1ef2388-4a98-4134-8ffc-d2496230635e',
  {
    attribution:
      '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
      '&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    minZoom: 5,  // Zoom minimum autorisé
    maxZoom: 18  // Zoom maximum autorisé
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

// Définition des limites géographiques de la France métropolitaine + Corse
const franceBounds = L.latLngBounds(
  L.latLng(41, -5),  // coin Sud-Ouest
  L.latLng(54, 10)   // coin Nord-Est
);

// === Création et configuration de la carte ===
const map = L.map('map', {
  center: [46.5, 2.5],       // centre initial de la carte (France)
  zoom: 5,                   // niveau de zoom initial
  layers: [alidadedarkLayer],// couche de base affichée au démarrage
  maxBounds: franceBounds,   // empêche la carte de sortir des limites
  maxBoundsViscosity: 1.0    // “résistance” aux bords (1 = totalement bloqué)
});

// === Bouton de localisation ===
L.control
  .locate({
    position: 'topright',         // position du bouton
    strings: { title: "Localiser ma position" },  // tooltip
    drawCircle: true,             // dessine un cercle autour de la position
    drawMarker: true,             // dessine un marqueur à la position
    follow: true,                 // suit en temps réel
    stopFollowingOnDrag: true,    // arrête quand l'utilisateur déplace la carte
    setView: true,                // centre la carte sur la position
    keepCurrentZoomLevel: true    // garde le zoom actuel
  })
  .addTo(map);

// === Animation de zoom lors de la géolocalisation ===
map.on('locationfound', function (event) {
  const targetLatLng = event.latlng;
  const targetZoom = 9;                 // niveau de zoom visé
  const currentZoom = map.getZoom();    // zoom actuel de la carte

  // Si on est déjà proche du zoom cible, dézoome légèrement avant
  if (currentZoom > targetZoom - 2) {
    map.setZoom(targetZoom - 2);
  }

  // Attendre un court instant puis animer le vol jusqu'à la position
  setTimeout(() => {
    map.flyTo(targetLatLng, targetZoom, {
      animate: true,
      duration: 2.5,       // durée du vol en secondes
      easeLinearity: 0.25  // linéarité de l'animation
    });
  });
});

// === Contrôle de sélection des fonds de carte ===
L.control.layers(
  {
    Dark: alidadedarkLayer,
    Atlas: thunderforestAtlasLayer
  },
  {},
  { position: 'topleft' }
).addTo(map);

// === Définition des emojis selon la catégorie ===
const emojiParCategorie = {
  "Affaires Non Résolues": "❓",
  Crimes: "☠️",
  Drames: "⚰️",
  "Guerres et Conflits": "⚔️",
  "Lieux Abandonnés": "🏰",
  "Lieux Mystérieux": "👁️"
};

// === Fonction de création d’un marqueur emoji personnalisé ===
function createEmojiMarker(lieu) {
  // Sélection de l’emoji en fonction de la catégorie
  const emoji = emojiParCategorie[lieu.categorie] || "❓";

  // Création de l’icône DIV contenant l’emoji
  const emojiIcon = L.divIcon({
    className: 'emoji-icon',
    html: `<div class="emoji-marker">${emoji}</div>`,
    iconSize: [30, 30],      // taille de l’icône
    iconAnchor: [15, 15],    // point d’ancrage au centre
    popupAnchor: [0, -15]    // position du popup par rapport à l’icône
  });

  // Contenu HTML du popup : titre, résumé et lien “Voir plus”
  const popupContent = `
    <strong>${lieu.nom}</strong><br>
    ${lieu.resume}<br>
    <a href="${lieu.lien}" target="_blank">Voir plus</a>
  `;

  // Création du marqueur avec popup, sans auto-pan/keepInView
  const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon })
    .bindPopup(popupContent, {
      maxWidth: 600,     // largeur maxi du popup
      autoPan: false,    // on gère le pan manuellement
      keepInView: false  // on désactive le keepInView pour éviter la boucle
    })
    .addTo(map);

  // Au clic : logique de dézoom/zoom et ouverture du popup
// À la place de l'ancien marker.on('click', …) :
marker.on('click', () => {
  marker.openPopup();
});

// === Chargement des données et ajout des marqueurs ===
fetch('lieux.json')
  .then(response => response.json())
  .then(data => {
    // Création de tous les marqueurs depuis le JSON
    const markers = data.map(lieu => createEmojiMarker(lieu));
    window.allMarkers = markers;

    // Groupe et ajustement de la vue pour englober tous les marqueurs
    const group = L.featureGroup(markers);
    group.addTo(map);
    map.fitBounds(group.getBounds());
  })
  .catch(error => console.error('Erreur lors du chargement des lieux :', error));

// === Création de la légende des catégories ===
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

// === Animation d’introduction au chargement de la page ===
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

// === Bouton "Lieu aléatoire" dans la colonne topright sous la localisation ===
const randomControl = L.control({ position: 'topright' });
randomControl.onAdd = function () {
  // Création d’un div de contrôle personnalisé
  const container = L.DomUtil.create(
    'div',
    'leaflet-bar leaflet-control leaflet-control-custom'
  );
  container.id = 'randomButton';
  container.innerHTML = '🎲';
  container.title = 'Lieu au hasard 🎲';
  container.style.cursor = 'pointer';
  // Empêche la propagation des clics à la carte sous-jacente
  L.DomEvent.disableClickPropagation(container);
  return container;
};
randomControl.addTo(map);

// === Comportement du bouton aléatoire ===
setTimeout(() => {
  const btn = document.getElementById("randomButton");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!window.allMarkers || window.allMarkers.length === 0) return;

    const randomIndex = Math.floor(Math.random() * window.allMarkers.length);
    const randomMarker = window.allMarkers[randomIndex];
    const latlng = randomMarker.getLatLng();
    const currentZoom = map.getZoom();
    const targetZoom = 10;

    if (currentZoom >= targetZoom) {
      // Si déjà trop zoomé, on dézoom d’abord à 5
      map.setView(map.getCenter(), 5, { animate: true });

      // Puis on vole vers le marqueur
      setTimeout(() => {
        map.flyTo(latlng, targetZoom, {
          animate: true,
          duration: 2.5,
          easeLinearity: 0.25
        });
        // Une fois le vol terminé, on affiche le popup
        map.once('moveend', () => {
          randomMarker.openPopup();
        });
      }, 700);
    } else {
      // Sinon on zoome directement
      map.flyTo(latlng, targetZoom, {
        animate: true,
        duration: 2.5,
        easeLinearity: 0.25
      });
      // Une fois le vol terminé, on affiche le popup
      map.once('moveend', () => {
        randomMarker.openPopup();
      });
    }
  });
}, 0);
