// Initialisation de la carte avec désactivation du zoom par défilement
const map = L.map('map', {
    scrollWheelZoom: false // Désactive le zoom avec la molette de défilement
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
        if (feature.properties && feature.properties.Name) {
            layer.bindPopup(feature.properties.Name); // Lier la popup avec le nom du polygone
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
        document.getElementById('location-title').innerText = `Position: ${featureName}`;
        document.getElementById('location-description').innerText = ecoPolygons[index].feature.properties.description || "Description non disponible.";
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
