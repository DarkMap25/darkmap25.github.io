// Initialisation de la carte centrée sur la France avec MapLibre GL JS
const map = new maplibregl.Map({
  container: 'map', // L'élément HTML où la carte sera affichée
  style: {
    "version": 8,
    "sources": {
      "osm": {
        "type": "raster",
        "tiles": [
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        "tileSize": 256
      }
    },
    "layers": [
      {
        "id": "osm",
        "type": "raster",
        "source": "osm",
        "minzoom": 0,
        "maxzoom": 19
      }
    ]
  }, // Carte OpenStreetMap via MapLibre GL JS
  center: [2.5, 46.5], // Coordonnées du centre de la France (longitude, latitude)
  zoom: 6,
  maxBounds: [[-5, 41], [10, 52]], // Limiter la carte à la France
  pitch: 0, // Pas d'inclinaison par défaut
  bearing: 0, // Pas de rotation par défaut
});

// Ajouter une attribution à MapLibre
map.addControl(new maplibregl.AttributionControl());

// Modifier les zoom et les contrôles de navigation
map.addControl(new maplibregl.NavigationControl(), 'top-right');

// Emoji par catégorie
const emojiParCategorie = {
  "Crimes": "☠️",
  "Histoires Sombres": "⚰️",
  "Lieux Mystérieux": "👁️",
  "Lieux Abandonnés": "🏰"
};

// Fonction pour créer un marqueur avec emoji
function createEmojiMarker(lieu) {
  const emoji = emojiParCategorie[lieu.categorie] || "❓";

  // Créer le marqueur avec l'emoji
  const marker = new maplibregl.Marker({
    element: createMarkerElement(emoji), // Créer un élément HTML pour l'emoji
    anchor: 'bottom'
  })
  .setLngLat([lieu.longitude, lieu.latitude]) // Positionner le marqueur
  .setPopup(new maplibregl.Popup().setHTML(`
    <strong>${lieu.nom}</strong><br>
    ${lieu.resume}<br>
    <a href="${lieu.lien}" target="_blank">Voir plus</a>
  `)) // Afficher un popup avec plus d'infos
  .addTo(map); // Ajouter le marqueur à la carte
}

// Créer un élément HTML pour le marqueur emoji
function createMarkerElement(emoji) {
  const element = document.createElement('div');
  element.className = 'emoji-marker';
  element.textContent = emoji;
  return element;
}

// Exemple de lieux avec coordonnées, résumé et lien
const lieux = [
  {
    nom: "Lieu Mystérieux 1",
    categorie: "Lieux Mystérieux",
    latitude: 48.8566,
    longitude: 2.3522,
    resume: "Un lieu mystérieux avec des événements étranges.",
    lien: "#"
  },
  {
    nom: "Crime Célèbre",
    categorie: "Crimes",
    latitude: 45.75,
    longitude: 4.85,
    resume: "Un crime célèbre qui a marqué la région.",
    lien: "#"
  }
];

// Ajouter les marqueurs pour chaque lieu
lieux.forEach(lieu => createEmojiMarker(lieu));
