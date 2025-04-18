// Initialisation de la carte centrée sur la France
const map = L.map('map', {
  maxBounds: [[41, -5], [52, 10]],
  minZoom: 5,
  maxZoom: 15
}).setView([46.5, 2.5], 6);

// Fond de carte sombre
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap, CartoDB',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

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

  return L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon }).bindPopup(popupContent);
}

// Chargement des lieux depuis lieux.json
fetch('lieux.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(lieu => {
      createEmojiMarker(lieu).addTo(map);
    });
  })
  .catch(error => console.error('Erreur lors du chargement des lieux :', error));

// ✅ Affichage de l'intro animée ou non
let showIntro = true; // Déclaration obligatoire

window.addEventListener("load", () => {
  const overlay = document.getElementById("intro-overlay");

  if (showIntro) {
    const line1 = document.querySelector(".line1");
    const line2 = document.querySelector(".line2");

    line1.textContent = "Un territoire. Une carte.";
    line2.textContent = "Un passé sombre.";

    setTimeout(() => {
      overlay.style.transition = "opacity 2s ease";
      overlay.style.opacity = 0;
      setTimeout(() => overlay.remove(), 1000);
    }, 10000); 
  } else {
    overlay.style.display = "none";
  }
});
