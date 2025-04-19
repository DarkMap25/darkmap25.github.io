// Initialisation de la carte centrée sur la France
const map = L.map('map', {
  // Définition des limites de la carte (la France + Corse)
  maxBounds: [[41, -5], [52, 10]],  // Limites géographiques minimales et maximales pour éviter de sortir de la France
  minZoom: 5,  // Niveau de zoom minimum
  maxZoom: 15  // Niveau de zoom maximum
}).setView([46.5, 2.5], 6);  // Positionnement initial de la carte au centre de la France avec un zoom de niveau 6

// Fond de carte sombre Stamen Toner
L.tileLayer('https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://stamen.com">Stamen Design</a>',  // Attribution des sources du fond de carte
  subdomains: 'abcd',  // Sous-domaines pour le rendu du fond de carte
  maxZoom: 19  // Zoom maximal de la carte
}).addTo(map);  // Ajout du fond de carte à la carte

// Emoji par catégorie
const emojiParCategorie = {
  "Crimes": "☠️",  // Emoji pour la catégorie Crimes
  "Histoires Sombres": "⚰️",  // Emoji pour la catégorie Histoires Sombres
  "Lieux Mystérieux": "👁️",  // Emoji pour la catégorie Lieux Mystérieux
  "Lieux Abandonnés": "🏰"  // Emoji pour la catégorie Lieux Abandonnés
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
    <strong>${lieu.nom}</strong><br>  // Nom du lieu en gras
    ${lieu.resume}<br>  // Résumé court du lieu
    <a href="${lieu.lien}" target="_blank">Voir plus</a>  // Lien pour afficher plus de détails sur le lieu
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
