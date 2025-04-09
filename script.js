// Initialisation de la carte
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
        ${lieu.resume}<br>
        <a href="${lieu.page}" target="_blank">Lire l’histoire complète →</a>
      `;

      marker.bindPopup(popupContent);
    });
  });

// Formulaire - tu pourras adapter ce code plus tard si tu l’automatises
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

// Effet torche
document.addEventListener("mousemove", function(e) {
  document.documentElement.style.setProperty('--cursorX', e.clientX + 'px');
  document.documentElement.style.setProperty('--cursorY', e.clientY + 'px');
});
