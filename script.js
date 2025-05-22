// Création des deux fonds de carte

// Fond Alidade Smooth Dark
const alidadedarkLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=a1ef2388-4a98-4134-8ffc-d2496230635e',{
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>', 
   minZoom: 5,
   maxZoom: 18
});

// Fond Thunderforest Atlas
const thunderforestAtlasLayer = L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2f67b0d994104bf69ffcd0cf70f86a08', {
  attribution: '&copy; OpenStreetMap contributors, &copy; Thunderforest',
  minZoom: 5,
  maxZoom: 18
});

// Limites de la France métropolitaine + Corse
const franceBounds = L.latLngBounds(
  L.latLng(41, -10),
  L.latLng(60, 15)
);

// Initialisation de la carte
const map = L.map('map', {
  center: [46.5, 2.5],
  zoom: 5,
  layers: [alidadedarkLayer],
  maxBounds: franceBounds,
  maxBoundsViscosity: 1.0
});

// Bouton de localisation
L.control.locate({
  position: 'topright',
  strings: {
    title: "Localiser ma position"
  },
  drawCircle: true,
  drawMarker: true,
  follow: true,
  stopFollowingOnDrag: true,
  setView: true,
  keepCurrentZoomLevel: true
}).addTo(map);

// Animation de zoom lors de la géolocalisation
map.on('locationfound', function(event) {
    const targetLatLng = event.latlng;
    const targetZoom = 9;

    const currentZoom = map.getZoom();
    if (currentZoom > targetZoom - 2) {
        map.setZoom(targetZoom - 2);
    }

    setTimeout(() => {
        map.flyTo(targetLatLng, targetZoom, {
            animate: true,
            duration: 2.5,
            easeLinearity: 0.25
        });
    });
});

// Contrôle des fonds de carte
L.control.layers({
  'Dark' : alidadedarkLayer,
  'Atlas': thunderforestAtlasLayer
}, {}, { position: 'topleft' }).addTo(map);

// Emoji par catégorie
const emojiParCategorie = {
  "Affaires Non Résolues": "❓",
  "Crimes": "☠️",
  "Drames": "⚰️",
  "Guerres et Conflits": "⚔️",
  "Lieux Abandonnés": "🏰",
  "Lieux Mystérieux": "👁️"
};

// Fonction de création des marqueurs emoji
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
    <a href="#" class="voir-plus" data-id="${lieu.identifiant}">Voir plus</a>
  `;

const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon })
    .bindPopup(popupContent, {
        maxWidth: 600,
        autoPan: false, // Important de garder autoPan: false
        keepInView: false // et keepInView: false pour éviter les erreurs
    });

marker.on('click', () => {
    const latlng = marker.getLatLng();
    map.setView(latlng, map.getZoom(), { animate: true });
    marker.openPopup();
});
  return marker;
}

// === Chargement des lieux depuis le fichier lieux.json ===
fetch('lieux.json')
  .then(response => response.json())     // On récupère les données JSON
  .then(data => {
    window.lieuxData = data;             // ✅ On stocke toutes les données globalement pour les réutiliser plus tard

    const markers = data.map(lieu => createEmojiMarker(lieu)); // Création des marqueurs
    window.allMarkers = markers;        // On les garde pour d'autres fonctions (recherche, random...)
    
    const group = L.featureGroup(markers); // Groupe de tous les marqueurs
    group.addTo(map);                      // Ajout à la carte
    map.fitBounds(group.getBounds());      // Ajuste le zoom pour englober tous les lieux
  })
  .catch(error => console.error('Erreur lors du chargement des lieux :', error)); // Affiche une erreur si problème

// Légende emoji
function createLegend() {
  const legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const categories = [
      { name: 'Affaires Non Résolues', emoji: '❓' },
      { name: 'Crimes', emoji: '☠️' },
      { name: 'Drames', emoji: '⚰️' },
      { name: 'Guerres et Conflits', emoji: '⚔️' },
      { name: 'Lieux Abandonnés', emoji: '🏰' },
      { name: 'Lieux Mystérieux', emoji: '👁️' }
    ];

    categories.forEach(category => {
      div.innerHTML += `
        <div class="legend-item">
          <span class="emoji">${category.emoji}</span>
          <span class="category-name">${category.name}</span>
        </div>
      `;
    });

    return div;
  };

  legend.addTo(map);
}
createLegend();

// === Gère le clic sur le bouton "Voir plus" dans le popup ===
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("voir-plus")) {
    e.preventDefault();  // Empêche le lien # de faire défiler la page

    const id = e.target.getAttribute("data-id");
    const lieu = window.lieuxData.find(l => l.identifiant == id);
    if (!lieu) return;

    // === Construction HTML dynamique ===
    let html = `<h2>${lieu.nom}</h2>`;

    if (lieu.date) html += `<p><strong>Date :</strong> ${lieu.date}</p>`;
    if (lieu.resume_long) html += `<p>${lieu.resume_long}</p>`;
    if (lieu.nombre_morts) html += `<p><strong>Nombre de morts :</strong> ${lieu.nombre_morts}</p>`;
    if (lieu.niveau_mediatisation) html += `<p><strong>Médiatisation :</strong> ${'⭐'.repeat(lieu.niveau_mediatisation)}</p>`;
    if (lieu.adresse) html += `<p><strong>Adresse :</strong> ${lieu.adresse}</p>`;
    if (lieu.etat_du_lieu) html += `<p><strong>État actuel :</strong> ${lieu.etat_du_lieu}</p>`;

    // === Liens divers ===
    if (lieu.liens_articles_presse) {
      html += `<p><strong>Article :</strong> <a href="${lieu.liens_articles_presse}" target="_blank">Lire</a></p>`;
    }
    if (lieu.liens_podcasts) {
      html += `<p><strong>Podcast :</strong> <a href="${lieu.liens_podcasts}" target="_blank">Écouter</a></p>`;
    }
    if (lieu.liens_videos) {
      html += `<p><strong>Vidéo :</strong> <a href="${lieu.liens_videos}" target="_blank">Regarder</a></p>`;
    }
    if (lieu.liens_films) {
      html += `<p><strong>Film :</strong> <a href="${lieu.liens_films}" target="_blank">Voir</a></p>`;
    }
    if (lieu.images_associees) {
      html += `<img src="${lieu.images_associees}" style="max-width:100%; margin-top:10px;" />`;
    }

    document.getElementById("detailContent").innerHTML = html;
    document.getElementById("detailPanel").classList.add("visible");
  }
});

// === Fermer le panneau d'infos ===
document.getElementById("closeDetailPanel").addEventListener("click", () => {
  document.getElementById("detailPanel").classList.remove("visible");
});

// Animation d’introduction
let showIntro = true;

window.addEventListener("load", () => {
  const overlay = document.getElementById("intro-overlay");

  if (showIntro) {
    const line1 = document.querySelector(".line1");
    const line2 = document.querySelector(".line2");

    line1.textContent = "Un territoire. Une carte.";
    line2.textContent = "Un passé sombre.";

    setTimeout(() => {
      overlay.style.opacity = 0;
      setTimeout(() => overlay.remove(), 1000);
    }, 10000);
  } else {
    overlay.style.display = "none";
  }
});

// === Ajout du bouton plein écran à l'intérieur de la carte (Bas à droite, avec emoji) ===
const fullscreenControl = L.control({ position: 'bottomright' });

fullscreenControl.onAdd = function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.id = 'fullscreenButton';

    container.innerHTML = '&#x2194;&#xFE0F;';
    container.title = 'Passer en plein écran';

    container.style.cursor = 'pointer';
    container.style.fontSize = '2.5em';
    container.style.lineHeight = '1';
    container.style.color = 'inherit';
    container.style.textShadow = 'none';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.overflow = 'visible';
    container.style.backgroundColor = 'transparent !important';
    container.style.border = 'none !important';
    container.style.padding = '5px !important';
    container.style.width = 'auto !important';
    container.style.height = 'auto !important';
    container.style.transition = 'transform 0.2s ease';

    L.DomEvent.disableClickPropagation(container);

    // Ajouter l'écouteur d'événement ici, directement dans onAdd
    container.addEventListener('click', toggleFullscreen);

    return container;
};

fullscreenControl.addTo(map);

// === Définition de la fonction toggleFullscreen ===
function toggleFullscreen() {
    const mapElement = document.getElementById('map');

    if (!document.fullscreenElement) {
        if (mapElement.requestFullscreen) {
            mapElement.requestFullscreen();
        } else if (mapElement.mozRequestFullScreen) { /* Firefox */
            mapElement.mozRequestFullScreen();
        } else if (mapElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            mapElement.webkitRequestFullscreen();
        } else if (mapElement.msRequestFullscreen) { /* IE/Edge */
            mapElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    }
}

// Gestion des événements de changement de plein écran (optionnel mais recommandé)
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('msfullscreenchange', updateFullscreenButton);

function updateFullscreenButton() {
    const fullscreenButton = document.getElementById('fullscreenButton');
    if (fullscreenButton) {
        if (document.fullscreenElement) {
            fullscreenButton.innerHTML = '&#x2194;&#xFE0F;';
            fullscreenButton.title = 'Quitter le plein écran';
        } else {
            fullscreenButton.innerHTML = '&#x2194;&#xFE0F;';
            fullscreenButton.title = 'Passer en plein écran';
        }
    }
}

// === Ajout du bouton 🎲 à l'intérieur de la carte (sous le bouton de localisation) ===
const randomControl = L.control({ position: 'topright' });

randomControl.onAdd = function () {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  container.id = 'randomButton';
  container.innerHTML = '🎲';
  container.title = 'Lieu au hasard 🎲';

  container.style.cursor = 'pointer';

  // Empêche que le clic interfère avec les événements de la carte
  L.DomEvent.disableClickPropagation(container);

  return container;
};

randomControl.addTo(map);

// Ajout de l'écouteur une fois le bouton inséré dans la carte
setTimeout(() => {
  const btn = document.getElementById("randomButton");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!window.allMarkers || window.allMarkers.length === 0) return;

    const randomIndex = Math.floor(Math.random() * window.allMarkers.length);
    const randomMarker = window.allMarkers[randomIndex];
    const latlng = randomMarker.getLatLng();
    const currentZoom = map.getZoom();

    // ✅ Fermer tous les popups ouverts AVANT tout
    map.closePopup();
      
    if (currentZoom >= 10) {
      map.setView(map.getCenter(), 5); // dézoom rapide
      setTimeout(() => {
        map.flyTo(latlng, 10, {
          animate: true,
          duration: 2.5,
          easeLinearity: 0.25
        });
    setTimeout(() => randomMarker.openPopup(), 3000); // ✅ ouverture après 1 seconde      
      }, 700);
    } else {
      map.flyTo(latlng, 10, {
        animate: true,
        duration: 2.5,
        easeLinearity: 0.25
      });
         setTimeout(() => randomMarker.openPopup(), 3000); // ✅ ouverture après 1 seconde    
    }
  });
}, 0);
