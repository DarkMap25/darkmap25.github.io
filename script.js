// script.js

// Initialiser la carte
const map = L.map('map').setView([46.6, 2.2], 6); // Centre sur la France

// Ajouter une couche de tuiles (fond de carte)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap',
}).addTo(map);

// Stocker les marqueurs actifs
let currentMarkers = [];

// Fonction pour charger les lieux
async function chargerLieux(categorie = 'all') {
  const response = await fetch('lieux.json');
  const data = await response.json();

  // Nettoyer les anciens marqueurs
  currentMarkers.forEach(marker => map.removeLayer(marker));
  currentMarkers = [];

  data.forEach(lieu => {
    if (categorie === 'all' || lieu.categorie === categorie) {
      const marker = L.marker([lieu.lat, lieu.lng])
        .addTo(map)
        .bindPopup(`<strong>${lieu.nom}</strong><br>${lieu.description}`);
      currentMarkers.push(marker);
    }
  });
}

// Gérer le changement de catégorie
document.getElementById('category-select').addEventListener('change', (e) => {
  const selected = e.target.value;
  chargerLieux(selected);
});

// Charger tous les lieux au départ
chargerLieux();
