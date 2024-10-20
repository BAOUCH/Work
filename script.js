// Initialisation de la carte avec désactivation du zoom par défilement
const map = L.map('map', {
    //scrollWheelZoom: false // Désactive le zoom avec la molette de défilement
}).setView([31.7917, -7.0926], 5); // Position initiale

// Ajout d'une couche de carte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Variable pour stocker les polygones
let ecoPolygons = [];

// Définir le style par défaut pour les polygones
const defaultStyle = {
    color: 'blue', // Couleur par défaut des polygones
    weight: 2,
    fillOpacity: 0.5
};

// Définir le style pour le polygone actif
const activeStyle = {
    color: 'red', // Couleur du polygone actif
    weight: 4,
    fillOpacity: 0.7
};

// Ajouter les polygones directement depuis le fichier GeoJSON existant
L.geoJSON(eco, {
    style: defaultStyle, // Appliquer le style par défaut
    onEachFeature: function (feature, layer) {
        ecoPolygons.push(layer); // Stocker chaque polygone

        // Lier une popup au polygone avec le nom
        if (feature.properties) {
            const name = feature.properties.Name || "Nom non disponible";
            const surface = feature.properties.Surface ? feature.properties.Surface.toFixed(2) : "Surface non disponible"; // Formater la superficie avec deux décimales
            const nbr_etud = feature.properties.nbr_etud || "Nbr non disponible";
            // Créer le contenu de la popup
            const popupContent = `
                <strong>Nom :</strong> ${name} <br>
                <strong>Superficie :</strong> ${surface} m²<br>
                <strong>Nombre des etudiants:</strong> ${nbr_etud} <br>
            `;
            
            layer.bindPopup(popupContent); // Lier le contenu de la popup au polygone
        }
    }
}).addTo(map);

// Ajuster la vue de la carte pour afficher tous les polygones
const bounds = L.geoJSON(eco).getBounds(); // Utiliser les polygones pour obtenir les limites
map.fitBounds(bounds); // Ajuster la carte pour afficher tous les polygones

// Fonction pour mettre à jour le titre et la description
function updateLocationInfo(index) {
    if (index < ecoPolygons.length) {
        const featureName = ecoPolygons[index].feature.properties.Name || `Polygone ${index + 1}`;
        const featureDesc = ecoPolygons[index].feature.properties.Desc || `Polygone ${index + 1}`;
        document.getElementById('location-title').innerText = `Universite: ${featureName}`;
        document.getElementById('location-description').innerText = `Description: ${featureDesc}` || "Description non disponible.";
    }
}

// Fonction pour mettre à jour le style des polygones
function updatePolygonStyles(activeIndex) {
    ecoPolygons.forEach((polygon, index) => {
        if (index === activeIndex) {
            polygon.setStyle(activeStyle); // Appliquer le style actif
            polygon.openPopup(); // Ouvrir la popup pour le polygone actif
        } else {
            polygon.setStyle(defaultStyle); // Réinitialiser le style par défaut
            polygon.closePopup(); // Fermer la popup pour les autres polygones
        }
    });
}

// Gestion du défilement
window.addEventListener('scroll', () => {
    // Obtenir le pourcentage de défilement de la page
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = scrollY / maxScroll;

    // Calculer l'index du polygone à afficher avec un facteur d'espacement
    const index = Math.floor(scrollPercent * ecoPolygons.length / 1.5); // Ajustez le facteur (1.5) selon vos besoins
    updateMapPosition(index);
});

// Fonction de mise à jour de la position de la carte
function updateMapPosition(index) {
    if (index >= 0 && index < ecoPolygons.length) {
        // Obtenir le polygone correspondant
        const polygon = ecoPolygons[index];

        // Déplacer la carte vers les limites du polygone
        map.fitBounds(polygon.getBounds(), {animate: true, duration: 1});

        // Mettre à jour le texte en fonction de la position
        updateLocationInfo(index);

        // Mettre à jour les styles des polygones
        updatePolygonStyles(index);
    }
}

// Fonction pour détecter la fin du défilement
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;

    // Si on est proche de la fin du défilement (à 95% du défilement)
    if (scrollY / maxScroll > 0.95) {
        document.getElementById('redirect-button').style.display = 'block'; // Afficher le bouton
    } else {
        document.getElementById('redirect-button').style.display = 'none'; // Cacher le bouton
    }
});