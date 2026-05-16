// ==============================
// BASEMAP
// ==============================

const map = L.map('map').setView([-2.5, 118], 5);

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap'
    }
).addTo(map);


// ==============================
// TILE LAYERS
// ==============================

const layers = {

    mean_rainfall: L.tileLayer(
        'tiles/mean_rainfall/{z}/{x}/{y}.png',
        {
            tms: false,
            opacity: 0.8,
            maxZoom: 12
        }
    ),

    wet_month_mean: L.tileLayer(
        'tiles/wet_month_mean/{z}/{x}/{y}.png',
        {
            opacity: 0.8,
            maxZoom: 12
        }
    ),

    dry_month_mean: L.tileLayer(
        'tiles/dry_month_mean/{z}/{x}/{y}.png',
        {
            opacity: 0.8,
            maxZoom: 12
        }
    ),

    wet_consecutive_mean: L.tileLayer(
        'tiles/wet_consecutive_mean/{z}/{x}/{y}.png',
        {
            opacity: 0.8,
            maxZoom: 12
        }
    ),

    dry_consecutive_mean: L.tileLayer(
        'tiles/dry_consecutive_mean/{z}/{x}/{y}.png',
        {
            opacity: 0.8,
            maxZoom: 12
        }
    ),

    oldeman_class: L.tileLayer(
        'tiles/oldeman_class/{z}/{x}/{y}.png',
        {
            opacity: 0.8,
            maxZoom: 12
        }
    )

};


// ==============================
// DEFAULT LAYER
// ==============================

layers.mean_rainfall.addTo(map);

let currentLayer = layers.mean_rainfall;


// ==============================
// SWITCH LAYER
// ==============================

document.querySelectorAll('input[name="layer"]')
.forEach(radio => {

    radio.addEventListener('change', function() {

        map.removeLayer(currentLayer);

        currentLayer = layers[this.value];

        currentLayer.addTo(map);

    });

});


// ==============================
// GEOJSON
// ==============================

fetch('data/Batas_Kab_Kot.geojson')
.then(response => response.json())
.then(data => {

    L.geoJSON(data, {

        style: {
            color: '#222',
            weight: 0.5,
            fillOpacity: 0
        }

    }).addTo(map);

});