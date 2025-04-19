// Si la carte n'est pas encore initialisée, on la crée
if (!window.map) {
  // Création de la carte centrée sur la France
  window.map = L.map('map', {
    center: [46.5, 2.5],  // Coordonnées de la France
    zoom: 5,  // Zoom initial
    maxBounds: [[41, -5], [52, 10]],  // Limites géographiques minimales et maximales pour éviter de sortir de la France
    minZoom: 5,  // Niveau de zoom minimum
    maxZoom: 18,  // Niveau de zoom maximum
    layers: [thunderforestLayer]  // La couche de carte initiale (Thunderforest Spinal Map)
  });
}

// Variables pour les filtres
const filters = {
  crime: true,
  mystery: true,
  unsolved: true,
  abandoned: true,
  drama: true,
  war: true
};

// Ajouter des événements pour les filtres
document.getElementById('crimeFilter').addEventListener('change', updateMap);
document.getElementById('mysteryFilter').addEventListener('change', updateMap);
document.getElementById('unsolvedFilter').addEventListener('change', updateMap);
document.getElementById('abandonedFilter').addEventListener('change', updateMap);
document.getElementById('dramaFilter').addEventListener('change', updateMap);
document.getElementById('warFilter').addEventListener('change', updateMap);

// Fonction qui met à jour l'affichage des marqueurs en fonction des filtres
function updateMap() {
  filters.crime = document.getElementById('crimeFilter').checked;
  filters.mystery = document.getElementById('mysteryFilter').checked;
  filters.unsolved = document.getElementById('unsolvedFilter').checked;
  filters.abandoned = document.getElementById('abandonedFilter').checked;
  filters.drama = document.getElementById('dramaFilter').checked;
  filters.war = document.getElementById('warFilter').checked;

  // Rafraîchir les marqueurs affichés
  updateMarkers();
}

// Fonction pour mettre à jour la visibilité des marqueurs
function updateMarkers() {
  // Boucle sur tous les marqueurs et vérifie si la catégorie doit être affichée
  markers.forEach(marker => {
    const shouldShow = filters[marker.categorie.toLowerCase()];
    if (shouldShow) {
      map.addLayer(marker.layer); // Ajouter la couche (marqueur) à la carte
    } else {
      map.removeLayer(marker.layer); // Retirer la couche (marqueur) de la carte
    }
  });
}

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

// Initialisation de la carte avec le fond de carte Thunderforest par défaut
const map = L.map('map', {
  center: [46.5, 2.5],  // Coordonnées de la France
  zoom: 5,  // Zoom initial
  layers: [thunderforestLayer]  // La couche de carte initiale
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

// Tableau pour stocker les marqueurs afin de pouvoir les filtrer
let markers = [];

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

  // Création du marqueur avec l'icône et le popup
  const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon }).bindPopup(popupContent);

  // Enregistrer ce marqueur dans le tableau 'markers'
  markers.push({
    categorie: lieu.categorie,
    layer: marker  // Le marqueur est enregistré dans le tableau
  });

  // Retourne le marqueur sans l'ajouter à la carte pour l'instant
  return marker;
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
