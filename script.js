// Initialisation de la carte
const map = L.map('map', {
  minZoom: 5,
  maxBounds: [
    [40.0, -5.0],  // sud-ouest
    [52.0, 10.0]   // nord-est
  ]
}).setView([46.8, 2.5], 6); // Centre France

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Fonction pour choisir l'icône selon la catégorie
function getIcon(category) {
  return L.icon({
    iconUrl: `icons/${category}.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
  });
}

// Charger les lieux depuis le fichier lieux.json
fetch('lieux.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(lieu => {
      const marker = L.marker([lieu.lat, lieu.lng], {
        icon: getIcon(lieu.categorie)
      }).addTo(map);
      marker.bindPopup(`<strong>${lieu.nom}</strong><br>${lieu.description}`);
    });
  });

// Formulaire de proposition de lieu
document.getElementById("lieuForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const nom = document.getElementById("nom").value;
  const description = document.getElementById("description").value;
  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);
  const categorie = document.getElementById("categorie").value;

  const message = `
Nouvelle proposition de lieu :
Nom : ${nom}
Description : ${description}
Latitude : ${lat}
Longitude : ${lng}
Catégorie : ${categorie}
  `;

  const mailtoLink = `mailto:tonadresse@mail.com?subject=Nouvelle proposition de lieu DarkMap&body=${encodeURIComponent(message)}`;
  window.location.href = mailtoLink;
});

// 🌒 Effet torche (curseur)
document.addEventListener("mousemove", function(e) {
  const torch = document.querySelector(".torch");
  torch.style.left = `${e.clientX}px`;
  torch.style.top = `${e.clientY}px`;
});
