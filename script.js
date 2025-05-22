// Création du fond de carte Alidade Smooth Dark
const alidadedarkLayer = L.tileLayer(                                          // Initialise le calque de tuiles sombre
  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=a1ef2388-4a98-4134-8ffc-d2496230635e', // URL et clef API
  {
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>', // Crédits
    minZoom: 5,                                                              // Zoom minimum autorisé
    maxZoom: 18                                                              // Zoom maximum autorisé
  }
);

// Création du fond de carte Thunderforest Atlas
const thunderforestAtlasLayer = L.tileLayer(                                  // Initialise le calque Thunderforest
  'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2f67b0d994104bf69ffcd0cf70f86a08', // URL et clef API
  {
    attribution: '&copy; OpenStreetMap contributors, &copy; Thunderforest', // Crédits
    minZoom: 5,                                                             // Zoom minimum autorisé
    maxZoom: 18                                                             // Zoom maximum autorisé
  }
);

// Définition des limites géographiques (France métropolitaine + Corse)
const franceBounds = L.latLngBounds(                                         // Crée un rectangle englobant
  L.latLng(41, -10),                                                         // Coin sud-ouest
  L.latLng(60, 15)                                                           // Coin nord-est
);

// Initialisation de la carte avec le calque sombre par défaut
const map = L.map('map', {                                                   // Lie la carte à l’élément #map
  center: [46.5, 2.5],                                                        // Position centrale (France)
  zoom: 5,                                                                    // Zoom initial
  layers: [alidadedarkLayer],                                                // Calque de base
  maxBounds: franceBounds,                                                   // Limites de navigation
  maxBoundsViscosity: 1.0                                                     // Empêche de sortir des limites
});

// Ajout du bouton de localisation
L.control.locate({                                                            // Configuration du plugin LocateControl
  position: 'topright',                                                       // Position à droite en haut
  strings: { title: "Localiser ma position" },                               // Texte de l’info-bulle
  drawCircle: true,                                                           // Dessine un cercle d’erreur
  drawMarker: true,                                                           // Dessine le marqueur
  follow: true,                                                               // Suit l’utilisateur
  stopFollowingOnDrag: true,                                                  // Stop le suivi si l’utilisateur déplace la carte
  setView: true,                                                              // Recentre la carte sur la position
  keepCurrentZoomLevel: true                                                  // Conserve le niveau de zoom
}).addTo(map);                                                                // Ajoute le contrôle à la carte

// Animation pour zoomer doucement lors de la géolocalisation
map.on('locationfound', function(event) {                                      // Événement lorsque la position est trouvée
  const targetLatLng = event.latlng;                                          // Coordonnées détectées
  const targetZoom = 9;                                                        // Zoom cible

  const currentZoom = map.getZoom();                                          // Zoom actuel
  if (currentZoom > targetZoom - 2) {                                         // Si on est déjà près du zoom cible
    map.setZoom(targetZoom - 2);                                              // Ajuste doucement
  }

  setTimeout(() => {                                                          // Délai avant l’animation
    map.flyTo(targetLatLng, targetZoom, {                                      // Animation de vol vers la position
      animate: true,
      duration: 2.5,                                                           // Durée de l’animation
      easeLinearity: 0.25                                                      // Courbe d’accélération
    });
  });
});

// Ajout du contrôle de changement de fond de carte
L.control.layers(                                                             // Sélecteur de calques
  { 'Dark': alidadedarkLayer, 'Atlas': thunderforestAtlasLayer },             // Calques disponibles
  {},                                                                          // Calques de superposition (aucun ici)
  { position: 'topleft' }                                                     // Position en haut à gauche
).addTo(map);

// Définition des emojis par catégorie
const emojiParCategorie = {                                                   
  "Affaires Non Résolues": "❓",
  "Crimes": "☠️",
  "Drames": "⚰️",
  "Guerres et Conflits": "⚔️",
  "Lieux Abandonnés": "🏰",
  "Lieux Mystérieux": "👁️"
};

// Fonction pour créer un marqueur emoji pour chaque lieu
function createEmojiMarker(lieu) {                                             // Prend un objet lieu en paramètre
  const emoji = emojiParCategorie[lieu.categorie] || "❓";                      // Sélectionne l’emoji ou point d’interrogation

  const emojiIcon = L.divIcon({                                                // Crée une icône personnalisée
    className: 'emoji-icon',                                                   // Classe CSS pour le style
    html: `<div class="emoji-marker">${emoji}</div>`,                          // HTML interne de l’icône
    iconSize: [30, 30],                                                         // Taille de l’icône
    iconAnchor: [15, 15],                                                       // Point d’ancrage de l’icône
    popupAnchor: [0, -15]                                                       // Position du popup par rapport à l’icône
  });

  const popupContent = `                                                       // Contenu HTML du popup
    <strong>${lieu.nom}</strong><br>                                           // Titre en gras
    ${lieu.resume}<br>                                                         // Résumé court
    <a href="#" class="voir-plus" data-id="${lieu.ID}">Voir plus</a>            // Lien « Voir plus » avec data-id de lieu.ID
  `;

  const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon }) // Crée le marqueur à la position
    .bindPopup(popupContent, {                                                 // Lie le popup au marqueur
      maxWidth: 600,                                                           // Largeur max du popup
      autoPan: false,                                                          // Empêche le recentrage automatique du popup
      keepInView: false                                                        // Empêche le maintien dans la vue
    });

  marker.on('click', () => {                                                   // Gestionnaire du clic sur le marqueur
    const latlng = marker.getLatLng();                                         // Récupère ses coordonnées
    map.setView(latlng, map.getZoom(), { animate: true });                     // Recentre la carte dessus
    marker.openPopup();                                                         // Ouvre le popup
  });

  return marker;                                                               // Retourne l’objet marker
}

// Chargement du fichier lieux.json et création des marqueurs
fetch('lieux.json')                                                            // Appel HTTP pour récupérer le JSON
  .then(response => response.json())                                           // Parse la réponse en JSON
  .then(data => {
    window.lieuxData = data;                                                   // Stocke les données globalement pour y accéder ailleurs

    const markers = data.map(lieu => createEmojiMarker(lieu));                // Crée un marqueur par lieu
    window.allMarkers = markers;                                               // Garde la liste pour fonctionnalités futures

    const group = L.featureGroup(markers);                                     // Groupe de marqueurs pour Leaflet
    group.addTo(map);                                                          // Ajoute le groupe à la carte
    map.fitBounds(group.getBounds());                                          // Ajuste le zoom pour englober tous les marqueurs
  })
  .catch(error => console.error('Erreur lors du chargement des lieux :', error)); // Affiche une erreur si le fetch échoue

// Création de la légende emoji
function createLegend() {                                                      // Fonction qui ajoute la légende
  const legend = L.control({ position: 'bottomleft' });                        // Position en bas à gauche

  legend.onAdd = function (map) {                                              // Méthode appelée par Leaflet
    const div = L.DomUtil.create('div', 'info legend');                        // Crée le container <div>
    const categories = [                                                       // Définition des catégories
      { name: 'Affaires Non Résolues', emoji: '❓' },
      { name: 'Crimes', emoji: '☠️' },
      { name: 'Drames', emoji: '⚰️' },
      { name: 'Guerres et Conflits', emoji: '⚔️' },
      { name: 'Lieux Abandonnés', emoji: '🏰' },
      { name: 'Lieux Mystérieux', emoji: '👁️' }
    ];

    categories.forEach(category => {                                           // Pour chaque catégorie
      div.innerHTML += `                                                       // Ajoute une ligne à la légende
        <div class="legend-item">
          <span class="emoji">${category.emoji}</span>
          <span class="category-name">${category.name}</span>
        </div>
      `;
    });

    return div;                                                                // Retourne le bloc à Leaflet
  };

  legend.addTo(map);                                                           // Ajoute la légende à la carte
}
createLegend();                                                                // Appelle la fonction pour construire la légende

// Gestion du clic sur le lien « Voir plus » dans les popups
document.addEventListener("click", function (e) {                              // Écoute globale des clics
  if (e.target.classList.contains("voir-plus")) {                              // Filtre uniquement les liens « voir-plus »
    e.preventDefault();                                                        // Empêche le comportement par défaut du lien

    const id = e.target.getAttribute("data-id");                               // Récupère l’ID stocké
    const lieu = window.lieuxData.find(l => l.ID == id);                       // Recherche l’objet lieu correspondant
    if (!lieu) return;                                                         // Si aucun lieu trouvé, on sort

    // Construction du contenu HTML détaillé
    let html = `<h2>${lieu.nom}</h2>`;                                         // Titre du lieu

    if (lieu.date)                html += `<p><strong>Date :</strong> ${lieu.date}</p>`;          // Ajoute la date si présente
    if (lieu.resume_long)         html += `<p>${lieu.resume_long}</p>`;         // Ajoute le résumé long
    if (lieu.nombre_morts)        html += `<p><strong>Nombre de morts :</strong> ${lieu.nombre_morts}</p>`; // Nombre de morts si défini
    if (lieu.niveau_mediatisation) html += `<p><strong>Médiatisation :</strong> ${'⭐'.repeat(lieu.niveau_mediatisation)}</p>`; // Niveau de médiatisation
    if (lieu.adresse)             html += `<p><strong>Adresse :</strong> ${lieu.adresse}</p>`;    // Adresse précise
    if (lieu.etat_du_lieu)        html += `<p><strong>État actuel :</strong> ${lieu.etat_du_lieu}</p>`; // État actuel

    // Ajout des liens vers articles, podcasts, vidéos, films et images
    if (lieu.liens_articles_presse) html += `<p><strong>Article :</strong> <a href="${lieu.liens_articles_presse}" target="_blank">Lire</a></p>`;
    if (lieu.liens_podcasts)        html += `<p><strong>Podcast :</strong> <a href="${lieu.liens_podcasts}" target="_blank">Écouter</a></p>`;
    if (lieu.liens_videos)          html += `<p><strong>Vidéo :</strong> <a href="${lieu.liens_videos}" target="_blank">Regarder</a></p>`;
    if (lieu.liens_films)           html += `<p><strong>Film :</strong> <a href="${lieu.liens_films}" target="_blank">Voir</a></p>`;
    if (lieu.images_associees)      html += `<img src="${lieu.images_associees}" style="max-width:100%; margin-top:10px;" />`; // Affiche l’image

    // Injection dans le panneau detailPanel et affichage
    document.getElementById("detailContent").innerHTML = html;                // Remplit le contenu
    document.getElementById("detailPanel").classList.add("visible");          // Rend visible le panneau
  }
});

// Fermeture du panneau d'informations détaillées
document.getElementById("closeDetailPanel").addEventListener("click", () => { // Écoute du clic sur la croix
  document.getElementById("detailPanel").classList.remove("visible");         // Cache le panneau
});

// Animation d’introduction au chargement de la page
let showIntro = true;                                                         // Contrôle l’affichage de l’overlay
window.addEventListener("load", () => {                                       // À la fin du chargement
  const overlay = document.getElementById("intro-overlay");                   // Récupère l’élément overlay
  if (showIntro) {                                                             // Si on doit montrer l’intro
    const line1 = document.querySelector(".line1");                           // Ligne 1 de texte
    const line2 = document.querySelector(".line2");                           // Ligne 2 de texte

    line1.textContent = "Un territoire. Une carte.";                          // Texte ligne 1
    line2.textContent = "Un passé sombre.";                                   // Texte ligne 2

    setTimeout(() => {                                                        // Délai avant disparition
      overlay.style.opacity = 0;                                              // Fade out
      setTimeout(() => overlay.remove(), 1000);                               // Supprime l’overlay après le fade
    }, 10000);                                                                 // Durée d’affichage initiale
  } else {
    overlay.style.display = "none";                                           // Ne montre pas si désactivé
  }
});

// Ajout du bouton plein écran à la carte
const fullscreenControl = L.control({ position: 'bottomright' });             // Position : bas à droite
fullscreenControl.onAdd = function (map) {                                     // Méthode d’ajout de Leaflet
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom'); // Crée un <div>
  container.id = 'fullscreenButton';                                           // Attribue un ID
  container.innerHTML = '&#x2194;&#xFE0F;';                                   // Icône ↔️
  container.title = 'Passer en plein écran';                                  // Tooltip
  container.style.cursor = 'pointer';                                         // Curseur pointeur
  L.DomEvent.disableClickPropagation(container);                               // Empêche la carte de capter le clic
  container.addEventListener('click', toggleFullscreen);                       // Lie l’événement toggleFullscreen
  return container;                                                            // Retourne l’élément
};
fullscreenControl.addTo(map);                                                  // Ajoute le contrôle à la carte

// Fonction pour basculer en plein écran et sortir
function toggleFullscreen() {                                                  // Déclaration de la fonction
  const mapElement = document.getElementById('map');                           // Récupère l’élément carte
  if (!document.fullscreenElement) {                                           // Si on n’est pas en plein écran
    mapElement.requestFullscreen?.() ??                                          // Demande le plein écran
      mapElement.mozRequestFullScreen?.() ??
      mapElement.webkitRequestFullscreen?.() ??
      mapElement.msRequestFullscreen?.();
  } else {                                                                     // Sinon si on est en plein écran
    document.exitFullscreen?.() ??                                             // Quitte le plein écran
      document.mozCancelFullScreen?.() ??
      document.webkitExitFullscreen?.() ??
      document.msExitFullscreen?.();
  }
}

// Mise à jour de l’icône et du titre du bouton plein écran
['fullscreenchange','mozfullscreenchange','webkitfullscreenchange','msfullscreenchange']
.forEach(evt => document.addEventListener(evt, updateFullscreenButton));       // Écoute tous les événements

function updateFullscreenButton() {                                            // Fonction de mise à jour
  const btn = document.getElementById('fullscreenButton');                     // Récupère le bouton
  if (!btn) return;                                                            // Si pas trouvé, stop
  if (document.fullscreenElement) {                                            // Si en plein écran
    btn.title = 'Quitter le plein écran';                                      // Change le tooltip
  } else {
    btn.title = 'Passer en plein écran';                                       // Restaure le tooltip
  }
}

// Ajout du bouton « Lieu au hasard 🎲 »
const randomControl = L.control({ position: 'topright' });                     // Position : haut à droite
randomControl.onAdd = function () {                                            // Méthode d’ajout
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom'); // Crée un <div>
  container.id = 'randomButton';                                               // ID pour cibler
  container.innerHTML = '🎲';                                                   // Emoji dé
  container.title = 'Lieu au hasard 🎲';                                        // Tooltip
  L.DomEvent.disableClickPropagation(container);                                // Ne perturbe pas la carte
  return container;                                                            // Retourne l’élément
};
randomControl.addTo(map);                                                      // Ajoute le contrôle

// Écoute du clic sur 🎲 pour afficher un lieu aléatoire
setTimeout(() => {                                                             // Délai pour s’assurer que le bouton existe
  const btn = document.getElementById("randomButton");                         // Récupère le bouton
  if (!btn) return;                                                            // Si non trouvé, stop
  btn.addEventListener("click", () => {                                        // Ajoute le gestionnaire de clic
    if (!window.allMarkers?.length) return;                                    // Si aucun marqueur, stop
    const randomIndex = Math.floor(Math.random() * window.allMarkers.length);  // Choix d’un index aléatoire
    const randomMarker = window.allMarkers[randomIndex];                       // Récupère le marqueur
    const latlng = randomMarker.getLatLng();                                   // Coordonnées du marqueur
    const currentZoom = map.getZoom();                                         // Zoom actuel

    map.closePopup();                                                          // Ferme tout popup ouvert

    if (currentZoom >= 10) {                                                   // Si zoom élevé
      map.setView(map.getCenter(), 5);                                         // Dézoom rapide
      setTimeout(() => {                                                       // Après un court délai
        map.flyTo(latlng, 10, { animate: true, duration: 2.5, easeLinearity: 0.25 }); // Vol vers le lieu
        setTimeout(() => randomMarker.openPopup(), 3000);                     // Ouvre le popup après l’animation
      }, 700);
    } else {                                                                   // Si zoom pas trop important
      map.flyTo(latlng, 10, { animate: true, duration: 2.5, easeLinearity: 0.25 }); // Vol directement
      setTimeout(() => randomMarker.openPopup(), 3000);                       // Ouvre le popup après l’animation
    }
  });
}, 0);
