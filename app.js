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

            if(value === null) return null;

            if(value < 1000) return "#ffffcc";
            if(value < 1500) return "#a1dab4";
            if(value < 2000) return "#41b6c4";
            if(value < 2500) return "#2c7fb8";

            return "#253494";

        }

    });

    layer.addTo(map);

    map.fitBounds(layer.getBounds());

});
