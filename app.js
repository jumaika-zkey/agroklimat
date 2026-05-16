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
var currentLayerName = "Mean Rainfall";

// ======================================================
// RASTER FILES
// ======================================================

var rasterFiles = {

    "Mean Rainfall":
        "./data/mean_rainfall.tif",

    "Wet Month":
        "./data/wet_month_mean.tif",

    "Dry Month":
        "./data/dry_month_mean.tif",

    "Wet Consecutive":
        "./data/wet_consecutive_mean.tif",

    "Dry Consecutive":
        "./data/dry_consecutive_mean.tif",

    "Oldeman Class":
        "./data/true_oldeman_class.tif"
};

// ======================================================
// LEGENDS
// ======================================================

var legends = {

    "Mean Rainfall": `
        <div><span class="legend-color"
        style="background:#ff0000;"></span>0</div>

        <div><span class="legend-color"
        style="background:#ff8800;"></span>50</div>

        <div><span class="legend-color"
        style="background:#ffff00;"></span>100</div>

        <div><span class="legend-color"
        style="background:#00ff00;"></span>200</div>

        <div><span class="legend-color"
        style="background:#0000ff;"></span>300+</div>
    `,

    "Wet Month": `
        <div><span class="legend-color"
        style="background:#d8f0d2;"></span>0 - 2</div>

        <div><span class="legend-color"
        style="background:#a8d8c0;"></span>2 - 4</div>

        <div><span class="legend-color"
        style="background:#78c8c8;"></span>4 - 6</div>

        <div><span class="legend-color"
        style="background:#4ca6d8;"></span>6 - 8</div>

        <div><span class="legend-color"
        style="background:#2d73c8;"></span>8 - 10</div>

        <div><span class="legend-color"
        style="background:#1c3faa;"></span>10 - 12</div>
    `,

    "Dry Month": `
        <div><span class="legend-color"
        style="background:#f4df72;"></span>0 - 2</div>

        <div><span class="legend-color"
        style="background:#f8b84a;"></span>2 - 4</div>

        <div><span class="legend-color"
        style="background:#ff8a33;"></span>4 - 6</div>

        <div><span class="legend-color"
        style="background:#ff5522;"></span>6 - 8</div>

        <div><span class="legend-color"
        style="background:#e61f1f;"></span>8 - 10</div>

        <div><span class="legend-color"
        style="background:#cc0033;"></span>10 - 12</div>
    `,

    "Wet Consecutive": `
        <div><span class="legend-color"
        style="background:#d8f0d2;"></span>0 - 2</div>

        <div><span class="legend-color"
        style="background:#a8d8c0;"></span>2 - 4</div>

        <div><span class="legend-color"
        style="background:#78c8c8;"></span>4 - 6</div>

        <div><span class="legend-color"
        style="background:#4ca6d8;"></span>6 - 8</div>

        <div><span class="legend-color"
        style="background:#2d73c8;"></span>8 - 10</div>

        <div><span class="legend-color"
        style="background:#1c3faa;"></span>10 - 12</div>
    `,

    "Dry Consecutive": `
        <div><span class="legend-color"
        style="background:#3b0f70;"></span>0 - 2</div>

        <div><span class="legend-color"
        style="background:#8c2981;"></span>2 - 4</div>

        <div><span class="legend-color"
        style="background:#de4968;"></span>4 - 6</div>

        <div><span class="legend-color"
        style="background:#fe9f6d;"></span>6 - 8</div>

        <div><span class="legend-color"
        style="background:#f9c74f;"></span>8 - 10</div>

        <div><span class="legend-color"
        style="background:#fcfdbf;"></span>10 - 12</div>
    `,

    "Oldeman Class": `
        <div><span class="legend-color"
        style="background:#0000ff;"></span>Sangat Basah</div>

        <div><span class="legend-color"
        style="background:#00d5ff;"></span>Basah</div>

        <div><span class="legend-color"
        style="background:#00ff00;"></span>Sedang</div>

        <div><span class="legend-color"
        style="background:#ffff00;"></span>Agak Kering</div>

        <div><span class="legend-color"
        style="background:#ff0000;"></span>Kering</div>
    `
};

// ======================================================
// GEOJSON ADMINISTRATIVE BOUNDARY
// ======================================================

fetch('./data/Batas_Kab_Kot.geojson')

.then(response => response.json())

.then(data => {

    var batas = L.geoJSON(data, {

        style: {
            color: '#222222',
            weight: 0.7,
            fillOpacity: 0
        },

        onEachFeature: function(feature, layer){

            var props = feature.properties;

            var popup = `
                <div style="font-size:13px;">
                    <b>Kabupaten/Kota</b><br><br>
                    ${Object.keys(props)
                    .map(key =>
                        `<b>${key}</b>: ${props[key]}`)
                    .join('<br>')}
                </div>
            `;

            layer.bindPopup(popup);

            layer.on({

                mouseover:function(e){

                    e.target.setStyle({
                        weight:2,
                        color:'#000000'
                    });

                },

                mouseout:function(e){

                    batas.resetStyle(e.target);

                }

            });

        }

    }).addTo(map);

});

// ======================================================
// COLOR FUNCTION
// ======================================================

function getColor(value, layerName){

    if(
        value === null ||
        value === undefined ||
        isNaN(value)
    ){
        return null;
    }

    // =========================================
    // MEAN RAINFALL
    // =========================================

    if(layerName === "Mean Rainfall"){

        if(value <= 0) return '#ff0000';
        if(value <= 50) return '#ff8800';
        if(value <= 100) return '#ffff00';
        if(value <= 200) return '#00ff00';

        return '#0000ff';

    }

    // =========================================
    // WET MONTH
    // =========================================

    if(layerName === "Wet Month"){

        if(value <= 2) return '#d8f0d2';
        if(value <= 4) return '#a8d8c0';
        if(value <= 6) return '#78c8c8';
        if(value <= 8) return '#4ca6d8';
        if(value <= 10) return '#2d73c8';

        return '#1c3faa';

    }

    // =========================================
    // DRY MONTH
    // =========================================

    if(layerName === "Dry Month"){

        if(value <= 2) return '#f4df72';
        if(value <= 4) return '#f8b84a';
        if(value <= 6) return '#ff8a33';
        if(value <= 8) return '#ff5522';
        if(value <= 10) return '#e61f1f';

        return '#cc0033';

    }

    // =========================================
    // WET CONSECUTIVE
    // =========================================

    if(layerName === "Wet Consecutive"){

        if(value <= 2) return '#d8f0d2';
        if(value <= 4) return '#a8d8c0';
        if(value <= 6) return '#78c8c8';
        if(value <= 8) return '#4ca6d8';
        if(value <= 10) return '#2d73c8';

        return '#1c3faa';

    }

    // =========================================
    // DRY CONSECUTIVE
    // =========================================

    if(layerName === "Dry Consecutive"){

        if(value <= 2) return '#3b0f70';
        if(value <= 4) return '#8c2981';
        if(value <= 6) return '#de4968';
        if(value <= 8) return '#fe9f6d';
        if(value <= 10) return '#f9c74f';

        return '#fcfdbf';

    }

    // =========================================
    // OLDEMAN CLASS
    // =========================================

    if(layerName === "Oldeman Class"){

        if(value === 1) return '#0000ff';
        if(value === 2) return '#00d5ff';
        if(value === 3) return '#00ff00';
        if(value === 4) return '#ffff00';

        return '#ff0000';

    }

    return null;
}

// ======================================================
// LOAD RASTER
// ======================================================

function loadRaster(rasterPath, layerName){

    currentLayerName = layerName;

    if(currentRasterLayer){

        map.removeLayer(currentRasterLayer);

    }

    fetch(rasterPath)

    .then(response => {

        if(!response.ok){

            throw new Error('Raster gagal dimuat');

        }

        return response.arrayBuffer();

    })

    .then(arrayBuffer =>
        parseGeoraster(arrayBuffer)
    )

    .then(georaster => {

        currentRasterLayer = new GeoRasterLayer({

            georaster: georaster,

            opacity: 0.7,

            resolution: 256,

            pixelValuesToColorFn: function(pixelValues){

                var value = pixelValues[0];

                return getColor(
                    value,
                    layerName
                );

            }

        });

        currentRasterLayer.addTo(map);

        currentRasterLayer.bringToFront();

    })

    .catch(error => {

        console.error(error);

        alert('Gagal memuat raster');

    });

}

// ======================================================
// INITIAL RASTER
// ======================================================

loadRaster(
    rasterFiles["Mean Rainfall"],
    "Mean Rainfall"
);

// ======================================================
// CUSTOM PANEL
// ======================================================

var layerPanel = L.control({
    position:'topleft'
});

layerPanel.onAdd = function(){

    var div = L.DomUtil.create(
        'div',
        'layer-panel'
    );

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
               value="0.7"
               style="width:100%;">

        <hr>

        <div id="legendContainer"
             class="legend">

             ${legends["Mean Rainfall"]}

        </div>

    `;

    L.DomEvent.disableClickPropagation(div);

    return div;
};

layerPanel.addTo(map);

// ======================================================
// RASTER SWITCHER
// ======================================================

document.addEventListener(
    'change',
    function(e){

    if(e.target.name === 'raster'){

        var selectedRaster =
            e.target.value;

        loadRaster(
            rasterFiles[selectedRaster],
            selectedRaster
        );

        document.getElementById(
            'legendContainer'
        ).innerHTML =
            legends[selectedRaster];

    }

});

// ======================================================
// OPACITY SLIDER
// ======================================================

document.addEventListener(
    'input',
    function(e){

    if(e.target.id === 'opacitySlider'){

        if(currentRasterLayer){

            currentRasterLayer.setOpacity(
                parseFloat(e.target.value)
            );

        }

    }

});

// ======================================================
// BASEMAP CONTROL
// ======================================================

L.control.layers(
    baseMaps,
    null,
    {
        collapsed:true
    }
).addTo(map);
