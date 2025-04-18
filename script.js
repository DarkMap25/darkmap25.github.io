// script.js

const emojiParCategorie = {
  "Crimes": "☠️",
  "Histoires Sombres": "⚰️",
  "Lieux Mystérieux": "👁️",
  "Lieux Abandonnés": "🏰"
};

// Vue centrée sur la France
const view = new ol.View({
  center: ol.proj.fromLonLat([2.5, 46.5]),
  zoom: 6,
  minZoom: 5,
  maxZoom: 15
});

// Fond de carte sombre via OSM (modifiable)
const tileLayer = new ol.layer.Tile({
  source: new ol.source.OSM()
});

// Source des marqueurs
const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({
  source: vectorSource
});

// Création de la carte
const map = new ol.Map({
  target: 'map',
  layers: [tileLayer, vectorLayer],
  view: view
});

// Fonction pour créer un marqueur emoji
function createEmojiFeature(lieu) {
  const emoji = emojiParCategorie[lieu.categorie] || "❓";
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lieu.longitude, lieu.latitude])),
    name: lieu.nom,
    resume: lieu.resume,
    lien: lieu.lien,
    emoji: emoji
  });

  const style = new ol.style.Style({
    text: new ol.style.Text({
      text: emoji,
      font: '24px sans-serif',
      offsetY: -15
    })
  });

  feature.setStyle(style);
  return feature;
}

// Charger les lieux depuis lieux.json
fetch('lieux.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(lieu => {
      const feature = createEmojiFeature(lieu);
      vectorSource.addFeature(feature);
    });
  })
  .catch(error => console.error('Erreur lors du chargement des lieux :', error));

// Popup
const popupElement = document.createElement('div');
popupElement.className = 'ol-popup';
const overlay = new ol.Overlay({
  element: popupElement,
  autoPan: true,
  autoPanAnimation: { duration: 250 }
});
map.addOverlay(overlay);

// Afficher le popup au clic
map.on('click', function (evt) {
  overlay.setPosition(undefined);

  map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    const content = `
      <strong>${feature.get('name')}</strong><br>
      ${feature.get('resume')}<br>
      <a href="${feature.get('lien')}" target="_blank">Voir plus</a>
    `;
    popupElement.innerHTML = content;
    overlay.setPosition(evt.coordinate);
  });
});
