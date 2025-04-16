// Fonction pour créer et personnaliser la carte
function creerCarte() {
    const map = L.map("map", {
        center: [46.603354, 1.888320],
        zoom: 6,
        minZoom: 5,
        maxZoom: 18,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
    }).addTo(map);

    const markerIcon = L.icon({
        iconUrl: 'marker.png',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
    });

    // Chargement des données des lieux à partir du fichier lieux.js
    fetch('lieux.js')
        .then(response => response.json())
        .then(lieuxSombres => {
            lieuxSombres.forEach((lieu) => {
                const marker = L.marker([lieu.lat, lieu.lng], { icon: markerIcon }).addTo(map);
                let popupContent = `
                    <div style="width: 250px;">
                        <h2 style="font-size: 1.4em; font-family: 'Cormorant Garamond', serif; color: #e60000; margin-bottom: 5px;">${lieu.titre}</h2>
                        <p style="font-size: 0.9em; font-family: 'Cormorant Garamond', serif; font-style: italic; margin-bottom: 10px;">${lieu.description}</p>
                        <img src="${lieu.image}" alt="${lieu.titre}" style="width: 100%; height: auto; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); margin-bottom: 10px;">
                        <a href="#" style="font-size: 0.8em; color: #e60000; text-decoration: none; font-weight: bold;" onclick="afficherDetails('${lieu.titre}')">Voir les détails</a>
                    </div>
                `;
                marker.bindPopup(popupContent);
            });
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données des lieux:', error);
            // Afficher un message d'erreur à l'utilisateur
            document.getElementById('map').innerHTML = `<div style="color: red; text-align: center; padding: 20px;">Erreur lors du chargement des données. Veuillez réessayer plus tard.</div>`;
        });
}

function afficherDetails(titre) {
    alert(`Détails de : ${titre}`);
}

function effetDeFrappe() {
    const introTextElement = document.getElementById("intro-text");
    const line1Element = document.querySelector("#intro-text .line1");
    const line2Element = document.querySelector("#intro-text .line2");
    const line1 = "Bienvenue sur";
    const line2 = "DarkMap";
    const typingSpeed = 100;
    const delayBetweenLines = 1000;

    let charIndex = 0;

    function typeLine1() {
        if (charIndex < line1.length) {
            line1Element.textContent += line1.charAt(charIndex);
            charIndex++;
            setTimeout(typeLine1, typingSpeed);
        } else {
            setTimeout(() => {
                charIndex = 0;
                typeLine2();
            }, delayBetweenLines);
        }
    }

    function typeLine2() {
        if (charIndex < line2.length) {
            line2Element.textContent += line2.charAt(charIndex);
            charIndex++;
            setTimeout(typeLine2, typingSpeed);
        }
    }

    typeLine1();
}

window.onload = function () {
    creerCarte();
    effetDeFrappe();
    setTimeout(() => {
        const introOverlay = document.getElementById('intro-overlay');
        if (introOverlay) {
            introOverlay.style.display = 'none';
        }
    }, 3000);
};
