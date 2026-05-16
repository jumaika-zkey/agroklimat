// ======================================================
// WEBGIS AGROKLIMAT INDONESIA
// ======================================================

// ======================================================
// MAP
// ======================================================

var map = L.map('map', {
    zoomControl: true,
    attributionControl: true
}).setView([-2.5, 118], 5);

// ======================================================
// BASEMAPS
// ======================================================

var osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
    }
);

var cartoLight = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
        attribution: '&copy; CartoDB',
        maxZoom: 19
    }
);

var esriImagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/' +
    'World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: '&copy; Esri',
        maxZoom: 19
    }
);

// DEFAULT BASEMAP
osm.addTo(map);

// ======================================================
// BASEMAP CONTROL
// ======================================================

var baseMaps = {
    "OpenStreetMap": osm,
    "Carto Light": cartoLight,
    "Esri Satellite": esriImagery
};

// ======================================================
// GLOBAL VARIABLES
// ======================================================

var currentRasterLayer = null;

var rasterFiles = {
    "Mean Rainfall": "./data/mean_rainfall.tif",
    "Wet Month": "./data/wet_month_mean.tif",
    "Dry Month": "./data/dry_month_mean.tif",
    "Wet Consecutive": "./data/wet_consecutive_mean.tif",
    "Dry Consecutive": "./data/dry_consecutive_mean.tif",
    "Oldeman Class": "./data/true_oldeman_class.tif"
};

// ======================================================
// GEOJSON ADMINISTRATIVE BOUNDARY
// ======================================================

fetch('./data/Batas_Kab_Kot.geojson')

.then(response => response.json())

.then(data => {

    var batas = L.geoJSON(data, {

        style: function () {
            return {
                color: '#222222',
                weight: 0.7,
                fillOpacity: 0
            };
        },

        onEachFeature: function (feature, layer) {

            var props = feature.properties;

            var popupContent = `
                <div style="font-size:13px;">
                    <b>Kabupaten/Kota</b><br><br>
                    ${Object.keys(props)
                        .map(key => `<b>${key}</b>: ${props[key]}`)
                        .join('<br>')}
                </div>
            `;

            layer.bindPopup(popupContent);

            layer.on({
                mouseover: function (e) {
                    e.target.setStyle({
                        weight: 2,
                        color: '#000000'
                    });
                },

                mouseout: function (e) {
                    batas.resetStyle(e.target);
                }
            });

        }

    }).addTo(map);

});

// ======================================================
// COLOR FUNCTION
// ======================================================
    
    function getColor(value) {

    if (
        value === null ||
        value === undefined ||
        isNaN(value)
    ) {
        return null;
    }

    if (value <= 0) return '#ff0000';   // merah
    if (value <= 50) return '#ff8800';  // oranye
    if (value <= 100) return '#e5ff00'; // kuning
    if (value <= 200) return '#00ff00'; // hijau

    return '#0000ff'; // biru
}
// ======================================================
// LOAD RASTER FUNCTION
// ======================================================

function loadRaster(rasterPath) {

    // REMOVE PREVIOUS RASTER
    if (currentRasterLayer) {
        map.removeLayer(currentRasterLayer);
    }

    fetch(rasterPath)

    .then(response => {

        if (!response.ok) {
            throw new Error('Raster gagal dimuat');
        }

        return response.arrayBuffer();

    })

    .then(arrayBuffer => parseGeoraster(arrayBuffer))

    .then(georaster => {

        currentRasterLayer = new GeoRasterLayer({

            georaster: georaster,

            opacity: 0.6,

            resolution: 256,

            pixelValuesToColorFn: function (pixelValues) {

                var value = pixelValues[0];

                return getColor(value);

            }

        });

        currentRasterLayer.addTo(map);
        currentRasterLayer.bringToFront();

    })

    .catch(error => {
        console.error(error);
        alert('Gagal memuat raster.');
    });

}

// ======================================================
// INITIAL RASTER
// ======================================================

loadRaster(rasterFiles["Mean Rainfall"]);

// ======================================================
// CUSTOM LAYER PANEL
// ======================================================

var layerPanel = L.control({ position: 'topleft' });

layerPanel.onAdd = function () {

    var div = L.DomUtil.create('div', 'layer-panel');

    div.innerHTML = `

        <div class="panel-title">
            Agroklimat Indonesia
        </div>

        <div class="layer-item">
            <input type="radio"
                   name="raster"
                   value="Mean Rainfall"
                   checked>
            Mean Rainfall
        </div>

        <div class="layer-item">
            <input type="radio"
                   name="raster"
                   value="Wet Month">
            Wet Month
        </div>

        <div class="layer-item">
            <input type="radio"
                   name="raster"
                   value="Dry Month">
            Dry Month
        </div>

        <div class="layer-item">
            <input type="radio"
                   name="raster"
                   value="Wet Consecutive">
            Wet Consecutive
        </div>

        <div class="layer-item">
            <input type="radio"
                   name="raster"
                   value="Dry Consecutive">
            Dry Consecutive
        </div>

        <div class="layer-item">
            <input type="radio"
                   name="raster"
                   value="Oldeman Class">
            Oldeman Class
        </div>

        <hr>

        <div style="font-size:13px;">
            <b>Opacity</b>
        </div>

        <input type="range"
               id="opacitySlider"
               min="0"
               max="1"
               step="0.1"
               value="0.65"
               style="width:100%;">

        <hr>

    <div class="legend">

    <div>
        <span class="legend-color"
        style="background:#ff0000;"></span>
        0
    </div>

    <div>
        <span class="legend-color"
        style="background:#ff8800;"></span>
        50
    </div>

    <div>
        <span class="legend-color"
        style="background:#e5ff00;"></span>
        100
    </div>

    <div>
        <span class="legend-color"
        style="background:#00ff00;"></span>
        200
    </div>

    <div>
        <span class="legend-color"
        style="background:#0000ff;"></span>
        300+
    </div>

</div>

    `;

    L.DomEvent.disableClickPropagation(div);

    return div;
};

layerPanel.addTo(map);

// ======================================================
// RASTER SWITCHER
// ======================================================

document.addEventListener('change', function (e) {

    if (e.target.name === 'raster') {

        var selectedRaster = e.target.value;

        loadRaster(rasterFiles[selectedRaster]);

    }

});

// ======================================================
// OPACITY SLIDER
// ======================================================

document.addEventListener('input', function (e) {

    if (e.target.id === 'opacitySlider') {

        if (currentRasterLayer) {

            currentRasterLayer.setOpacity(
                parseFloat(e.target.value)
            );

        }

    }

});

// ======================================================
// LAYER CONTROL
// ======================================================

L.control.layers(baseMaps, null, {
    collapsed: true
}).addTo(map);
