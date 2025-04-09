// Initialiser la carte centrée sur la France
const map = L.map('map', {
  minZoom: 5,
  maxZoom: 18,
  maxBounds: [
    [40.0, -5.0],
    [52.0, 10.0]
  ]
}).setView([46.8, 2.5], 6);

// Fond de carte sombre
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Choisir l’icône selon la catégorie
function getIcon(category) {
  return L.icon({
    iconUrl: `icons/${category}.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
  });
}

// Charger les lieux depuis lieux.json
fetch("lieux.json")
  .then(res => res.json())
  .then(data => {
    data.forEach(lieu => {
      const marker = L.marker([lieu.lat, lieu.lng], {
        icon: getIcon(lieu.categorie)
      }).addTo(map);

      marker.bindPopup(`<strong>${lieu.nom}</strong><br>${lieu.resume}`);
    });
  })
  .catch(err => {
    console.error("Erreur de chargement des lieux :", err);
  });
