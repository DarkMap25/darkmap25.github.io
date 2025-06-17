// === PARTIE I / CREATION CARTE / INTRODUCTION === //



//  I.1. Création du fond de carte Alidade Smooth Dark

        const alidadedarkLayer = L.tileLayer(
          'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=a1ef2388-4a98-4134-8ffc-d2496230635e',
          {
            attribution: false,
            minZoom: 5,
            maxZoom: 18
          }
        );

// I.2 Création du fond de carte Thunderforest Atlas

        const thunderforestAtlasLayer = L.tileLayer(
          'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2f67b0d994104bf69ffcd0cf70f86a08',
          {
            attribution: false,
            minZoom: 5,
            maxZoom: 18
          }
        );

// I.3 Définition des limites géographiques (France métropolitaine + Corse)

        const franceBounds = L.latLngBounds(
          L.latLng(28, -16),
          L.latLng(65, 21)
        );

// I.4 Initialisation de la carte avec le calque sombre par défaut

        const map = L.map('map', {
          center: [46.5, 2.5],
          zoom: 6,
          layers: [alidadedarkLayer],
          maxBounds: franceBounds,
          maxBoundsViscosity: 0.5
        });

// I.5 Animation d’introduction au chargement de la page

        // Il écoute le DOMContentLoaded pour lancer le reveal progressif.
        document.addEventListener('DOMContentLoaded', () => {
          // Durée totale avant le reveal = 3s (typing CSS) + 1s de pause = 4000ms
          const revealDelay = 3000 + 1000;
        
          // Après le délai, on déclenche le fade-in et on supprime l'overlay
          setTimeout(() => {
            // Fade-in de la carte
            const mapEl = document.getElementById('map');
            if (mapEl) {
              mapEl.style.opacity = '1';
            }
        
            // Fade-in de la section intro
            const introEl = document.querySelector('.intro');
            if (introEl) {
              introEl.style.opacity = '1';
            }
        
            // Fade-in du footer
            const footerEl = document.querySelector('footer');
            if (footerEl) {
              footerEl.style.opacity = '1';
            }
        
            // Suppression de l'overlay pour rétablir l'interaction normale
            const overlayEl = document.getElementById('intro-overlay');
            if (overlayEl) {
              overlayEl.remove();
            }
          }, revealDelay);
        });


// === PARTIE II / EMOJIS / POP-UP  === //


// II.1.1 Définition des emojis par catégorie
          const emojiParCategorie = {
            "Affaires Non Résolues": "❓",
            "Crimes": "☠️",
            "Drames": "⚰️",
            "Guerres et Conflits": "⚔️",
            "Lieux Abandonnés": "🏰",
            "Lieux Mystérieux": "👁️"
          };

// II.1.2 Fonction pour créer un marqueur emoji pour chaque lieu

          function createEmojiMarker(lieu) {
            const emoji = emojiParCategorie[lieu.categorie] || "❓";
          
            // Création de l’icône emoji personnalisée
            const emojiIcon = L.divIcon({
              className: 'emoji-icon',
              html: `<div class="emoji-marker">${emoji}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
              popupAnchor: [0, -15]
            });

 // II.2.1 Création du contenu HTML du Pop-Up
                  
                const popupContent = `
                  <strong>${lieu.nom}</strong><br>
                  ${lieu.resume}<br>
                  <a href="#" class="voir-plus" data-id="${lieu.ID}">Voir plus</a>
                `;
                
// II.2.2 Calcul dynamique de maxWidth/maxHeight et configuration du Pan
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                let popupOptions;
                if (vw < 768) {
                  popupOptions = {
                    className: 'custom-popup',
                    minWidth: 120,
                    maxWidth: Math.floor(vw * 0.6),    // 60% de la largeur écran (mobile)
                    maxHeight: Math.floor(vh * 0.4),   // 40% de la hauteur écran
                    autoPan: false,                     // ← Désactivé pour ne pas interférer
                    keepInView: false
                  };
                } else {
                  popupOptions = {
                    className: 'custom-popup',
                    minWidth: 200,
                    maxWidth: Math.floor(vw * 0.6),    // 60% de la largeur écran 
                    maxHeight: Math.floor(vh * 0.4),   // 40% de la hauteur écran
                    autoPan: false,                     // ← Désactivé sur desktop aussi
                    keepInView: false
                  };
                }
                
// II.2.3 Création du marqueur et liaison du Pop-Up avec nos options
                const marker = L.marker([lieu.latitude, lieu.longitude], { icon: emojiIcon })
                  .bindPopup(popupContent, popupOptions);
                
// II.2.4 Gestion du clic pour recentrer à 20% vers le bas, puis ouvrir le popup
                
                marker.on('click', () => {
                  // 1) Récupère la position du marqueur en pixels dans la fenêtre
                  const latlng   = marker.getLatLng();
                  const point    = map.latLngToContainerPoint(latlng);
                
                  // 2) Calcule le décalage vertical (20 % de la hauteur)
                  const mapSize  = map.getSize();
                  const offsetY  = mapSize.y * 0.20;
                
                  // 3) Crée un "point cible" : même X (le pixel du marqueur), Y = markerY – offsetY
                  //    => on veut que ce pixel (marker) remonte en centreY+offsetY
                  const targetPoint = L.point(point.x, point.y - offsetY);
                
                  // 4) Transforme ce point cible en lat/lng absolu
                  const newCenter = map.containerPointToLatLng(targetPoint);
                
                  // 5) Recentre la carte sur ce lat/lng (zoom inchangé)
                  map.setView(newCenter, map.getZoom(), { animate: true });
                
                  // 6) Quand le recentrage est fini, ouvre le popup
                  map.once('moveend', () => {
                    marker.openPopup();
                  });
                });
                return marker;
          }

// II.2.4 Chargement du fichier lieux.json et création des marqueurs

          fetch('lieux.json')
            .then(response => response.json())
            .then(data => {
              window.lieuxData = data;
          
              const markers = data.map(lieu => createEmojiMarker(lieu));
              window.allMarkers = markers;
          
              const group = L.featureGroup(markers);
              group.addTo(map);
              map.fitBounds(group.getBounds());
            })
            .catch(error => console.error('Erreur lors du chargement des lieux :', error));

// II.2.5 Création de la légende emoji

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



// PARTIE III / VOIR PLUS //



                // === BLOC INITIAL : variable pour savoir quel panneau est ouvert ===
                let currentlyOpenPanel = null;   // ‘null’ si aucun panel/modal/plein-écran n’est ouvert
                
                // === 1) Handler pour ouvrir le panneau "Voir plus" dans le style DarkMap ===
                document.addEventListener("click", function(e) {
                  // === 1) On cible vraiment le lien .voir-plus, quel que soit l'élément cliqué à l'intérieur ===
                  const voirPlusBtn = e.target.closest(".voir-plus");
                  if (!voirPlusBtn) return;  // Si le clic n’est pas sur un .voir-plus, on sort
                  e.preventDefault();
                
                  // === 2) Si on est en plein écran, on en sort pour éviter conflit ===
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  }
                
                  // === 3) Références aux éléments DOM : carte, panneau de détail, contenu du panneau ===
                  const mapContainer  = document.getElementById("map");
                  const detailPanel   = document.getElementById("detailPanel");
                  const detailContent = document.getElementById("detailContent");
                
                  // === 4) Sauvegarde de la vue actuelle (centre + zoom) de la carte ===
                  window._prevMapView = {
                    center: map.getCenter(),
                    zoom:   map.getZoom()
                  };
                
                  // === 5) Masquer la carte et afficher le panneau en fullscreen DarkMap ===
                  mapContainer.style.display = "none";
                  detailPanel.classList.add("visible", "full-view");
                
                  // === 6) On mémorise quel panel est ouvert et on affiche le bouton de fermeture global ===
                  currentlyOpenPanel = detailPanel;
                  document.getElementById("globalCloseBtn").style.display = "block";
                
                  // === 7) Récupération des données du lieu à partir de l’ID ===
                  const id   = voirPlusBtn.getAttribute("data-id");
                  const lieu = window.lieuxData.find(l => l.ID == id);
                  if (!lieu) return;  // Si pas de lieu correspondant, on sort
                
                  // === 8) Construction du HTML dans le style DarkMap ===
                  let html = "";
                
                  // 8.1) Header du panneau : **seulement** le titre de l’affaire en <h2>
                  html += `
                    <div class="panel-header">
                      <h2>${lieu.nom}</h2>
                    </div>
                    <div class="panel-body">
                  `;
                
                  // 8.2) Affichage du résumé long (ou résumé court si pas de résumé long)
                  //      → on ajoute class="first-section" pour que le résumé prenne 100 % de la largeur
                  html += `
                    <div class="info-section first-section">
                      <p>${lieu.resume_long || lieu.resume}</p>
                    </div>
                  `;
                
                  // 8.3) Affichage de la catégorie si présente
                  if (lieu.categorie) {
                    html += `
                      <div class="info-section">
                        <strong>Catégorie :</strong> ${lieu.categorie}
                      </div>
                    `;
                  }
                
                  // 8.4) Gestion de la date ou période
                  const dDeb = lieu.date_debut || "";
                  const dFin = lieu.date_fin   || "";
                  if (dDeb && dFin) {
                    if (dDeb === dFin) {
                      // Même date de début et de fin → on affiche une seule date
                      html += `
                        <div class="info-section">
                          <strong>Date :</strong> ${dDeb}
                        </div>
                      `;
                    } else {
                      // Période différente → on affiche la période
                      html += `
                        <div class="info-section">
                          <strong>Période :</strong> ${dDeb} – ${dFin}
                        </div>
                      `;
                    }
                  } else if (lieu.date) {
                    // Si clé unique "date" définie (sans date_debut/date_fin)
                    html += `
                      <div class="info-section">
                        <strong>Date :</strong> ${lieu.date}
                      </div>
                    `;
                  }
                
                  // 8.5) Affichage du nombre de morts si renseigné
                  if (lieu.nombre_morts != null && lieu.nombre_morts !== "") {
                    html += `
                      <div class="info-section">
                        <strong>Nombre de morts :</strong> ${lieu.nombre_morts}
                      </div>
                    `;
                  }
                
                  // 8.6) Affichage du niveau de médiatisation si renseigné
                  if (lieu.niveau_mediatisation != null && lieu.niveau_mediatisation !== "") {
                    html += `
                      <div class="info-section">
                        <strong>Niveau médiatisation :</strong> ${lieu.niveau_mediatisation}
                      </div>
                    `;
                  }
                
                  // 8.7) Affichage de l’adresse exacte si présente
                  if (lieu.adresse_exacte) {
                    html += `
                      <div class="info-section">
                        <strong>Adresse exacte :</strong> ${lieu.adresse_exacte}
                      </div>
                    `;
                  }
                
                  // 8.8) Affichage de l’état actuel du lieu si présent
                  if (lieu.etat_actuel_du_lieu) {
                    html += `
                      <div class="info-section">
                        <strong>État du lieu :</strong> ${lieu.etat_actuel_du_lieu}
                      </div>
                    `;
                  }
                
                  // 8.9) Regroupement et affichage de tous les liens et images associées
                  const liens = [];
                  ["lien", "liens_articles_presse", "liens_videos"].forEach(key => {
                    if (lieu[key]) {
                      // Si plusieurs liens séparés par des virgules, on les sépare
                      if (typeof lieu[key] === "string" && lieu[key].includes(",")) {
                        lieu[key].split(",").forEach(u => {
                          liens.push(u.trim());
                        });
                      } else {
                        liens.push(lieu[key]);
                      }
                    }
                  });
                
                  if (liens.length > 0) {
                          html += `
                            <div class="info-section first-section">
                              <strong>Sources :</strong>
                              <div class="links-images">
                                <ul>
                          `;
                          liens.forEach(url => {
                            if (url.match(/\.(jpeg|jpg|gif|png|svg)$/i)) {
                              html += `
                                  <li>
                                    <img src="${url}" alt="Image associée">
                                  </li>
                              `;
                            } else {
                              html += `
                                  <li>
                                    <a href="${url}" target="_blank">${url}</a>
                                  </li>
                              `;
                            }
                          });
                          html += `
                                </ul>
                              </div>
                            </div>
                          `;
                        }
                                        
                  // 8.10) Fermeture de la balise panel-body
                  html += `</div>`;
                
                  // === 9) Injection du HTML construit dans le panneau de détail ===
                  detailContent.innerHTML = html;
                  // (Le CSS prendra en charge l’apparition du bouton de fermeture via #detailPanel.visible)
                });



// PARTIE IV / PLEIN ECRAN / SOUMETTRE / MENTIONS LEGALES //



// IV.1.1 Ajout du bouton plein écran à la carte

          const fullscreenControl = L.control({ position: 'bottomright' });
          fullscreenControl.onAdd = function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.id = 'fullscreenButton';
            container.innerHTML = '&#x2194;&#xFE0F;';
            container.title = 'Passer en plein écran';
            container.style.cursor = 'pointer';
            L.DomEvent.disableClickPropagation(container);
            container.addEventListener('click', toggleFullscreen);
            return container;
          };
          fullscreenControl.addTo(map);

// IV.1.2 Fonction pour basculer en plein écran et sortir

          function toggleFullscreen() {
            const mapElement = document.getElementById('map');
            if (!document.fullscreenElement) {
              mapElement.requestFullscreen?.() ??
                mapElement.mozRequestFullScreen?.() ??
                mapElement.webkitRequestFullscreen?.() ??
                mapElement.msRequestFullscreen?.();
            } else {
              document.exitFullscreen?.() ??
                document.mozCancelFullScreen?.() ??
                document.webkitExitFullscreen?.() ??
                document.msExitFullscreen?.();
            }
          }

//  IV.1.3 Mise à jour de l’icône et du titre du bouton plein écran 

                ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange']
                  .forEach(evt => document.addEventListener(evt, updateFullscreenButton));
                
                function updateFullscreenButton() {
                  const btn = document.getElementById('fullscreenButton');
                  if (!btn) return;
                  btn.title = document.fullscreenElement ? 'Quitter le plein écran' : 'Passer en plein écran';
                
                  // === Afficher/masquer la croix globale en fonction du fullscreen ===
                  if (document.fullscreenElement) {
                    currentlyOpenPanel = null;                     // pas de panel “interne” ouvert
                    document.getElementById('globalCloseBtn').style.display = 'block';
                  } else {
                    // On sort du plein écran : cacher la croix si aucun panel n’est ouvert
                    if (currentlyOpenPanel === null) {
                      document.getElementById('globalCloseBtn').style.display = 'none';
                    }
                  }
                }

// IV.2.1 Création du contrôle Leaflet “Soumettre une histoire” (emoji 📜 en bas à droite)

            L.Control.SubmitStory = L.Control.extend({
              onAdd: function() {
                const btn = L.DomUtil.create('a', 'leaflet-bar leaflet-control submit-story-control');
                btn.innerHTML = '📜';
                btn.title     = 'Soumettre une histoire';
                btn.href      = '#';
                L.DomEvent.on(btn, 'click', e => {
                  L.DomEvent.stop(e);
                  openSubmitPanel();
                });
                return btn;
              },
              onRemove: function() {}
            });
            L.control.submitStory = opts => new L.Control.SubmitStory(opts);
            L.control.submitStory({ position: 'bottomright' }).addTo(map);

// IV.2.2 Fonction d’ouverture du panneau de soumission (fetch externe)
               
                function openSubmitPanel() {
                  // i. SI ON EST EN PLEIN ÉCRAN, ON EN SORT
                  if (
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                  ) {
                    if (document.exitFullscreen) {
                      document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                      document.webkitExitFullscreen(); // pour Safari / Chrome anciens
                    } else if (document.mozCancelFullScreen) {
                      document.mozCancelFullScreen(); // pour Firefox
                    } else if (document.msExitFullscreen) {
                      document.msExitFullscreen(); // pour IE/Edge
                    }
                  }
                
                  // Masquer la carte
                  document.getElementById('map').style.display = 'none';
                
                  // Afficher le panneau de soumission
                  const submitPanel = document.getElementById('submitPanel');
                  submitPanel.classList.remove('hidden');
                  submitPanel.classList.add('visible', 'full-view');
                
                  // Charger le HTML de submit.html
                  fetch('submit.html')
                    .then(r => {
                      if (!r.ok) {
                        throw new Error('submit.html introuvable');
                      }
                      return r.text();
                    })
                    .then(htmlString => {
                      // → on parse le HTML pour extraire le header et le formulaire
                      const parser = new DOMParser();
                      const doc = parser.parseFromString(htmlString, 'text/html');
                
                      // 1. Récupérer l'élément <header>
                      const headerEl = doc.querySelector('header');
                      // 2. Récupérer l'élément <form>
                      const formEl = doc.querySelector('form');
                
                      // Vérifier si on a bien récupéré le formulaire
                      if (formEl) {
                        // → construire la chaîne HTML à injecter
                        let html = '';
                        if (headerEl) {
                          html += headerEl.outerHTML; // injecte <header>…</header>
                        }
                        html += formEl.outerHTML; // injecte ensuite le <form>…</form>
                
                        // Injecter le header et le formulaire dans #submitContent
                        document.getElementById('submitContent').innerHTML = html;
                      } else {
                        // Afficher un message d'erreur si le <form> est introuvable
                        document.getElementById('submitContent').innerHTML =
                          '<p>Impossible de charger correctement le formulaire.</p>';
                        return; // on stoppe ici car pas de formulaire
                      }
                
                      // → maintenant qu’on a collé uniquement le <form>, on peut attacher le listener
                      const sendBtn = document.getElementById('submitStoryButton');
                      if (!sendBtn) {
                        console.error('submitStoryButton introuvable !');
                        return;
                      }
                      sendBtn.addEventListener('click', e => {
                        e.preventDefault();
                
                        // Petit debug pour vérifier qu’on entre bien dans ce listener
                        console.log('Clic sur "Suggérer ce lieu" détecté');
                
                        const form = document.getElementById('storyForm');
                        if (!form) {
                          console.error('storyForm introuvable !');
                          return;
                        }
                
                        const data = new FormData(form);
                        // Construire le sujet et le corps du mail
                        const subject = 'Nouvelle histoire DarkMap';
                        let body = '';
                
                        // Champs simples
                        body += `Titre du récit  : ${data.get('titre_recit')}\n`;
                        body += `Catégorie       : ${data.get('categorie')}\n`;
                        body += `Lieu            : ${data.get('lieu')}\n`;
                        body += `Date / période  : ${data.get('date_event')}\n`;
                        body += `Résumé          : ${data.get('resume_interet')}\n`;
                
                        // Pseudo optionnel
                        const pseudo = data.get('pseudo');
                        if (pseudo) {
                          body += `Pseudo          : ${pseudo}\n`;
                        }
                
                        // Tous les liens (tableau liens[])
                        for (const l of data.getAll('liens[]')) {
                          if (l) {
                            body += `Lien            : ${l}\n`;
                          }
                        }
                
                        // Ouvrir la boîte mail avec les données du formulaire
                        const mailto =
                          `mailto:darkmap.fr@gmail.com` +
                          `?subject=${encodeURIComponent(subject)}` +
                          `&body=${encodeURIComponent(body)}`;
                
                        console.log('mailto généré :', mailto);
                        window.location.href = mailto;
                      });
                    })
                    .catch(err => {
                      console.error(err);
                      document.getElementById('submitContent').innerHTML =
                        '<p>Impossible de charger le formulaire.</p>';
                    });
                
                  // === On mémorise quel panel est ouvert ===
                  currentlyOpenPanel = submitPanel;
                  document.getElementById('globalCloseBtn').style.display = 'block';
                }

// IV.2.3 Liaison du lien "suggérer des lieux" dans l'intro (index.html)

            document.getElementById('submitLink')?.addEventListener('click', e => {
              e.preventDefault();
              openSubmitPanel();
            });
              


// === PARTIE V / BOUTONS ET ACTIONS === //



// V.1.1 Ajout du bouton de localisation

            L.control.locate({
              position: 'topright',
              strings: { title: "Localiser ma position" },
              drawCircle: true,
              drawMarker: true,
              follow: true,
              stopFollowingOnDrag: true,
              setView: true,
              keepCurrentZoomLevel: true
            }).addTo(map);

// V.1.2 Animation pour zoomer doucement lors de la géolocalisation

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

// V.2 Ajout du contrôle de changement de fond de carte

          L.control.layers(
            { 'Dark': alidadedarkLayer, 'Atlas': thunderforestAtlasLayer },
            {},
            { position: 'topleft' }
          ).addTo(map);

// V.3 Ajout du bouton de fermeture Mentions Légales

// i. On récupère une seule fois l’élément <a id="mentionsLink"> dans le DOM
const mentionsLink   = document.getElementById('mentionsLink');

// ii. On récupère aussi une seule fois ces éléments du panneau de détail
const detailPanel    = document.getElementById('detailPanel');
const detailContent  = document.getElementById('detailContent');
const globalCloseBtn = document.getElementById('globalCloseBtn');

// iii. Lorsque l’on clique sur "Mentions légales", on ouvre le panneau, on charge le HTML et on applique les styles
mentionsLink.addEventListener('click', function(e) {
  e.preventDefault();

  // → 1) Masquer la carte
  document.getElementById('map').style.display = 'none';

  // → 2) Afficher le panneau #detailPanel en plein écran
  detailPanel.classList.add('visible', 'full-view');

  // → 3) Marquer ce panneau comme “legal” pour cibler le bon fond + polices + titres en CSS
  detailPanel.classList.add('legal');

  // → 4) Charger le fichier HTML des mentions légales
  fetch('mentions-legales.html')
    .then(resp => resp.text())
    .then(htmlString => {
      // • Parser le HTML récupéré
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');

      // • Récupérer tous les <style> du head de mentions-legales.html pour conserver les polices/couleurs
      const headStyles = Array.from(doc.head.querySelectorAll('style'));
      headStyles.forEach(styleEl => {
        document.head.appendChild(styleEl.cloneNode(true));
      });

      // • Récupérer le contenu du <body>
      const bodyContent = doc.body.innerHTML;

      // • Injecter ce contenu dans #detailContent
      detailContent.innerHTML = bodyContent;

      // → 5) Mémoriser quel panneau est ouvert
      currentlyOpenPanel = detailPanel;

      // → 6) Afficher le bouton de fermeture
      globalCloseBtn.style.display = 'block';
    })
    .catch(err => {
      detailContent.innerHTML = '<p>Impossible de charger les mentions légales.</p>';
      console.error(err);
    });
});

// iv. Gestion du clic sur le bouton de fermeture global (pour “Voir plus”, “Soumettre”, “Mentions légales”)
globalCloseBtn.addEventListener('click', function() {
  // • 1) Cacher le panneau quel que soit son usage
  detailPanel.classList.remove('visible', 'full-view');

  // • 2) Retirer la classe 'legal' si présente
  if (detailPanel.classList.contains('legal')) {
    detailPanel.classList.remove('legal');
  }

  // • 3) Vider le contenu
  detailContent.innerHTML = '';

  // • 4) Masquer la croix de fermeture
  globalCloseBtn.style.display = 'none';

  // • 5) Réafficher la carte
  document.getElementById('map').style.display = 'block';

  // • 6) Réinitialiser la variable d’état du panneau ouvert
  currentlyOpenPanel = null;
});

// V.4 Ajout du bouton "Lieu au hasard 🎲"

const randomControl = L.control({ position: 'topright' });
randomControl.onAdd = function() {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  container.id = 'randomButton';
  container.innerHTML = '🎲';
  container.title = 'Lieu au hasard 🎲';
  L.DomEvent.disableClickPropagation(container);
  return container;
};
randomControl.addTo(map);

// Clic sur 🎲 pour afficher un lieu aléatoire / Zoom
setTimeout(() => {
  const btn = document.getElementById("randomButton");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!window.allMarkers?.length) return;
    const randomIndex = Math.floor(Math.random() * window.allMarkers.length);
    const randomMarker = window.allMarkers[randomIndex];
    const latlng = randomMarker.getLatLng();
    const currentZoom = map.getZoom();

    map.closePopup();

    if (currentZoom >= 10) {
      map.setView(map.getCenter(), 5);
      setTimeout(() => {
        map.flyTo(latlng, 10, { animate: true, duration: 2.5, easeLinearity: 0.25 });
        setTimeout(() => randomMarker.openPopup(), 3000);
      }, 700);
    } else {
      map.flyTo(latlng, 10, { animate: true, duration: 2.5, easeLinearity: 0.25 });
      setTimeout(() => randomMarker.openPopup(), 3000);
    }
  });
}, 0);

// V.5 BOUTON FERMETURE CENTRALE //

// ====  Création unique du bouton globalCloseBtn  ====
;(function() {
  // Si le bouton n’existe pas déjà, on le crée
  if (!document.getElementById('globalCloseBtn')) {
    const btn = document.createElement('button');
    btn.id = 'globalCloseBtn';
    btn.className = 'overlay-close';  // reprend la classe CSS définie
    btn.textContent = '❌';
    document.body.appendChild(btn);
  }
})();

document.getElementById('globalCloseBtn').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();

  // 1) Si on est en plein écran, on en sort
  if (document.fullscreenElement) {
    document.exitFullscreen?.() ??
      document.mozCancelFullScreen?.() ??
      document.webkitExitFullscreen?.() ??
      document.msExitFullscreen?.();
    return;
  }

  // 2) Sinon, si un panel est ouvert (Voir plus, Soumettre, Mentions), on le ferme
  if (currentlyOpenPanel) {
    // a) Si c’est detailPanel (Voir plus ou Mentions légales)
    if (currentlyOpenPanel.id === 'detailPanel') {
      // i. Masquer detailPanel
      currentlyOpenPanel.classList.remove('visible', 'full-view');
      // ii. Vider le contenu
      document.getElementById('detailContent').innerHTML = '';
      // iii. Réafficher la carte
      document.getElementById('map').style.display = 'block';
      // iv. Redimensionner Leaflet
      map.invalidateSize();
      // v. Restaurer la vue si on venait de « Voir plus »
      if (window._prevMapView) {
        map.setView(window._prevMapView.center, window._prevMapView.zoom, { animate: false });
        delete window._prevMapView;
      }
    }
    // b) Si c’est submitPanel (Soumettre)
    else if (currentlyOpenPanel.id === 'submitPanel') {
      // i. Masquer submitPanel
      currentlyOpenPanel.classList.remove('visible', 'full-view');
      // ii. Rajouter la classe 'hidden' pour revenir à l’état initial
      currentlyOpenPanel.classList.add('hidden');
      // iii. Réafficher la carte
      document.getElementById('map').style.display = 'block';
    }
    // c) Cas d’un autre panel éventuel
    else {
      currentlyOpenPanel.classList.remove('visible', 'full-view');
      currentlyOpenPanel.classList.add('hidden');
    }

    // 3) Masquer la croix
    document.getElementById('globalCloseBtn').style.display = 'none';
    // 4) Réinitialiser la variable d’état
    currentlyOpenPanel = null;
  }
});

// Gestion du bouton global de fermeture
document.getElementById('globalCloseBtn').addEventListener('click', function(e) {
  // On masque le bouton croix
  this.style.display = 'none';

  // On ferme tous les panels possibles
  // 1. Soumission (submitPanel)
  var submitPanel = document.getElementById('submitPanel');
  if (submitPanel) {
    submitPanel.classList.remove('visible', 'full-view');
    submitPanel.classList.add('hidden');
    // On vide le contenu au cas où
    var submitContent = document.getElementById('submitContent');
    if (submitContent) submitContent.innerHTML = '';
  }

  // 2. Voir plus / Mentions légales (detailPanel)
  var detailPanel = document.getElementById('detailPanel');
  if (detailPanel) {
    detailPanel.classList.remove('visible', 'full-view');
    detailPanel.classList.add('hidden');
    var detailContent = document.getElementById('detailContent');
    if (detailContent) detailContent.innerHTML = '';
  }

  // 3. On réaffiche la carte
  var mapDiv = document.getElementById('map');
  if (mapDiv) mapDiv.style.display = 'block';

  // 4. On enlève tous les overlays possibles
  // (si tu en rajoutes d'autres, copie/colle leur fermeture ici)

  // 5. On revalide la taille de la carte si besoin (Leaflet)
  if (typeof map !== 'undefined' && map.invalidateSize) map.invalidateSize();
});
