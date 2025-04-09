// Initialisation de la carte centrée sur la France
const map = L.map('map', {
  minZoom: 5,
  maxBounds: [
    [40.0, -5.0],
    [52.0, 10.0]
  ]
}).setView([46.8, 2.5], 6);

// Fond sombre
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Icônes personnalisées
function getIcon(category) {
  return L.icon({
    iconUrl: `icons/${category}.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
  });
}

// Charger les lieux depuis lieux.json
fetch('lieux.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(lieu => {
      const marker = L.marker([lieu.lat, lieu.lng], {
        icon: getIcon(lieu.categorie)
      }).addTo(map);

      const popupContent = `
        <strong>${lieu.nom}</strong><br>
        ${lieu.resume}
      `;
      marker.bindPopup(popupContent);
    });
  })
  .catch(error => {
    console.error("Erreur lors du chargement de lieux.json :", error);
  });

// Effet torche
document.addEventListener("mousemove", function(e) {
  document.documentElement.style.setProperty('--cursorX', e.clientX + 'px');
  document.documentElement.style.setProperty('--cursorY', e.clientY + 'px');
});
