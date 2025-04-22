// Création des deux fonds de carte

// Fond Thunderforest Spinal Map
const thunderforestLayer = L.tileLayer('https://tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=2f67b0d994104bf69ffcd0cf70f86a08', {
  attribution: '&copy; OpenStreetMap contributors, &copy; Thunderforest',
  minZoom: 5,  // Niveau de zoom minimum  
  maxZoom: 18
});

// Fond Thunderforest Atlas (remplace CartoDB Dark)
const thunderforestAtlasLayer = L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2f67b0d994104bf69ffcd0cf70f86a08', {
  attribution: '&copy; OpenStreetMap contributors, &copy; Thunderforest',
  minZoom: 5,  // Niveau de zoom minimum
  maxZoom: 18
});

// ✅ Limites de la France métropolitaine + Corse
const franceBounds = L.latLngBounds(
  L.latLng(41, -5),   // Sud-Ouest
  L.latLng(52, 10)    // Nord-Est
);

// Initialisation de la carte avec le fond de carte Thunderforest par défaut
const map = L.map('map', {
  center: [46.5, 2.5],  // Coordonnées de la France
  zoom: 5,  // Zoom initial
  layers: [thunderforestLayer]  // La couche de carte initiale
  maxBounds: franceBounds, // ⛔ empêche de sortir de la France
  maxBoundsViscosity: 1.0  // 🌪️ "résistance" aux bords (1 = totalement bloqué)
});

// Ajout du contrôle de superposition pour basculer entre les fonds de carte
L.control.layers({
  'Thunderforest Spinal Map': thunderforestLayer,
  'Thunderforest Atlas': thunderforestAtlasLayer
}, {}, {position: 'topleft'}).addTo(map);

// Emoji par catégorie
const emojiParCategorie = {
  "Crimes": "☠️",  // Emoji pour la catégorie Crimes
  "Drames": "⚰️",  // Emoji pour la catégorie Drames
  "Lieux Mystérieux": "👁️",  // Emoji pour la catégorie Lieux Mystérieux
  "Lieux Abandonnés": "🏰",  // Emoji pour la catégorie Lieux Abandonnés
  "Affaires Non Résolues": "❓",  // Emoji pour la catégorie Affaires Non Résolues
  "Guerres et Conflits": "⚔️"  // Emoji pour la catégorie Guerres et Conflits
};

// Fonction pour créer un marqueur avec emoji
function createEmojiMarker(lieu) {
  // Récupère l'emoji associé à la catégorie du lieu, ou un emoji par défaut si la catégorie est inconnue
  const emoji = emojiParCategorie[lieu.categorie] || "❓";

  // Création de l'icône du marqueur avec un emoji
  const emojiIcon = L.divIcon({
    className: 'emoji-icon',  // Classe CSS personnalisée pour l'icône
    html: `<div class="emoji-marker">${emoji}</div>`,  // HTML pour afficher l'emoji dans le marqueur
    iconSize: [30, 30],  // Taille de l'icône
    iconAnchor: [15, 15],  // Point d'ancrage de l'icône pour qu'elle soit bien centrée
    popupAnchor: [0, -15]  // Positionnement du popup par rapport à l'icône
  });

  // Contenu du popup affiché lors du clic sur le marqueur
  const popupContent = `
    <strong>${lieu.nom}</strong><br>  <!-- Nom du lieu en gras -->
    ${lieu.resume}<br>  <!-- Résumé court du lieu -->
    <a href="${lieu.lien}" target="_blank">Voir plus</a>  <!-- Lien pour afficher plus de détails sur le lieu -->
  `;

  // Retourne le marqueur avec son icône emoji et son popup
  return L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon }).bindPopup(popupContent);
}

// Chargement des lieux depuis lieux.json
fetch('lieux.json')  // Effectue une requête pour récupérer les données du fichier JSON contenant les lieux
  .then(response => response.json())  // Parse la réponse en JSON
  .then(data => {
    // Pour chaque lieu dans le fichier JSON
    data.forEach(lieu => {
      // Crée un marqueur pour chaque lieu et l'ajoute à la carte
      createEmojiMarker(lieu).addTo(map);
    });
  })
  .catch(error => console.error('Erreur lors du chargement des lieux :', error));  // Gestion d'erreur en cas de problème de chargement

// Fonction pour créer une légende avec les catégories et les emojis
function createLegend() {
  const legend = L.control({ position: 'bottomleft' }); // Crée un contrôle en bas à gauche

  // Lors de l'ajout du contrôle à la carte
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');  // Crée un conteneur pour la légende
    const categories = [
      { name: 'Crimes', emoji: '☠️' },
      { name: 'Drames', emoji: '⚰️' },
      { name: 'Lieux Mystérieux', emoji: '👁️' },
      { name: 'Lieux Abandonnés', emoji: '🏰' },
      { name: 'Affaires Non Résolues', emoji: '❓' },
      { name: 'Guerres et Conflits', emoji: '⚔️' }
    ];

    // Parcours les catégories et les ajoute à la légende
    categories.forEach(category => {
      div.innerHTML += `
        <div class="legend-item">
          <span class="emoji">${category.emoji}</span>
          <span class="category-name">${category.name}</span>
        </div>
      `;
    });

    return div; // Retourne le conteneur avec la légende
  };

  legend.addTo(map); // Ajoute la légende à la carte
}

// Appeler la fonction pour créer et afficher la légende
createLegend();

// ✅ Affichage de l'intro animée ou non
let showIntro = true;  // Variable pour déterminer si l'intro animée doit être affichée ou non

// Écoute l'événement de chargement de la page pour lancer l'animation
window.addEventListener("load", () => {
  const overlay = document.getElementById("intro-overlay");  // Sélectionne l'élément overlay (couche de superposition de l'intro)

  if (showIntro) {  // Si l'animation est activée
    const line1 = document.querySelector(".line1");  // Sélectionne la première ligne de texte de l'intro
    const line2 = document.querySelector(".line2");  // Sélectionne la deuxième ligne de texte de l'intro

    // Définit le texte pour l'intro
    line1.textContent = "Un territoire. Une carte.";
    line2.textContent = "Un passé sombre.";

    // Démarre l'animation pour l'intro après un délai
    setTimeout(() => {
      //overlay.style.transition = "opacity 2s ease";  // Ajoute une transition de fondu pour l'overlay//enlevé
      overlay.style.opacity = 0;  // Règle l'opacité à 0 pour faire disparaître l'overlay
      setTimeout(() => overlay.remove(), 1000);  // Retire complètement l'overlay après une seconde
    }, 10000);  // Délai de 10 secondes avant de démarrer la transition
  } else {
    overlay.style.display = "none";  // Si l'intro n'est pas activée, masque l'overlay
  }
});
