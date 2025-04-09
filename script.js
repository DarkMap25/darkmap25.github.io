// === Initialiser la carte centrée sur la France ===
const map = L.map('map', {
  minZoom: 5,
  maxZoom: 18,
  maxBounds: [
    [41.0, -5.0], // Sud-Ouest
    [51.5, 10.0]  // Nord-Est
  ]
}).setView([46.6, 2.2], 6);

// === Fond de carte sombre (Stadia Dark) ===
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_dark/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; Stadia Maps, OpenMapTiles & OpenStreetMap'
}).addTo(map);

// === Icônes personnalisées ===
const icons = {
  "Crimes": L.icon({
    iconUrl: 'icons/crime.png',
    iconSize: [30, 30]
  }),
  "Lieux Abandonnés": L.icon({
    iconUrl: 'icons/abandoned.png',
    iconSize: [30, 30]
  }),
  "Lieux Mystérieux": L.icon({
    iconUrl: 'icons/mystery.png',
    iconSize: [30, 30]
  }),
  "Histoires Sombres": L.icon({
    iconUrl: 'icons/darkstory.png',
    iconSize: [30, 30]
  })
};

// === Stockage des marqueurs pour filtrage ===
let currentMarkers = [];

// === Charger les lieux depuis lieux.json ===
async function chargerLieux(categorie = "all") {
  const response = await fetch("lieux.json");
  const data = await response.json();

  // Supprimer les anciens marqueurs
  currentMarkers.forEach(marker => map.removeLayer(marker));
  currentMarkers = [];

  data.forEach(lieu => {
    if (categorie === "all" || lieu.categorie === categorie) {
      const marker = L.marker([lieu.lat, lieu.lng], {
        icon: icons[lieu.categorie] || undefined
      }).addTo(map)
        .bindPopup(`<strong>${lieu.nom}</strong><br>${lieu.description}`);
      currentMarkers.push(marker);
    }
  });
}

// === Gestion du menu déroulant ===
document.getElementById("category-select").addEventListener("change", (e) => {
  const selected = e.target.value;
  chargerLieux(selected);
});

// === Torche au curseur ===
document.addEventListener('mousemove', (e) => {
  document.documentElement.style.setProperty('--cursorX', e.clientX + 'px');
  document.documentElement.style.setProperty('--cursorY', e.clientY + 'px');
});

// === Lancer au démarrage ===
chargerLieux();
