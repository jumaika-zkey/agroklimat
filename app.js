// ======================
// MAP
// ======================

var map = L.map('map').setView([-2.5, 118], 5);

// ======================
// BASEMAP
// ======================

var osm = L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
    attribution:'© OpenStreetMap'
}).addTo(map);

// ======================
// LOAD GEOJSON
// ======================

fetch('./data/Batas_Kab_Kot.geojson')
.then(response => response.json())
.then(data => {

    var batas = L.geoJSON(data,{

        style:{
            color:'#000000',
            weight:1,
            fillOpacity:0
        },

        onEachFeature:function(feature, layer){

            if(feature.properties){

                layer.bindPopup(
                    '<b>Kabupaten/Kota</b><br>' +
                    JSON.stringify(feature.properties)
                );

            }

        }

    }).addTo(map);

});

// ======================
// LOAD RASTER
// ======================

fetch('./data/mean_rainfall_2015_2025.tif')

.then(response => response.arrayBuffer())

.then(arrayBuffer => parseGeoraster(arrayBuffer))

.then(georaster => {

    var layer = new GeoRasterLayer({

        georaster: georaster,

        opacity: 0.8,

        resolution: 256,

    pixelValuesToColorFn: function(pixelValues){

    var value = pixelValues[0];

    if(value === null || value <= 0){
        return null;
    }

    if(value < 1000) return "#ffffb2";
    if(value < 1500) return "#fecc5c";
    if(value < 2000) return "#fd8d3c";
    if(value < 2500) return "#f03b20";

    return "#bd0026";
}

    });

    layer.addTo(map);

    map.fitBounds(layer.getBounds());

});
