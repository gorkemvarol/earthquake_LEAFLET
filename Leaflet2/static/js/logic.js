// Earthquakes and Tectonic plates GeoJSON url variables
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicPlates/master/GeoJSON/PB2002_boundaries.json"

// LayerGroups for earthquake and tectonicPlates
var earthquakes = L.layerGroup();
var tectonicPlates = L.layerGroup();

// Tile layers for SatelliteMap, grayscaleMap, outdoorsMap and darkMap
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});

var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

// BaseMaps object to hold the base layers
var baseMaps = {
    "Satellite Map": satelliteMap,
    "Grayscale Map": grayscaleMap,
    "Outdoors Map": outdoorsMap,
    "Dark Map": darkMap
};

// Overlay object to hold the overlay layer
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Create the map, and assign satelliteMap and earthquakes layers to display on load
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 2,
    layers: [satelliteMap, earthquakes]
});

// Create a layer control
// Pass in the baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

d3.json(earthquakesURL, function(data) {

    // Set the style of the markers based on properties.mag
    // function for style  
    function mapStyle(feature) {
        return {
            radius: mapRadius(feature.properties.mag),
            fillColor: mapColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.7,
            color: "black",
            stroke: true,
            weight: 0.5
        };
    }

    // Determine the marker color by depth
    function mapColor(mag) {
        switch (true) {
            case mag > 90:
                return "red";
            case mag > 70:
                return "orangered";
            case mag > 50:
                return "orange";
            case mag > 30:
                return "gold";
            case mag > 10:
                return "yellow";
            default:
                return "lightgreen";
        }
    }

    //function for radius
    function mapRadius(mag) {
        if (mag === 0) {
            return 1;
        }

        return mag * 4;
    }

    // Create a GeoJSON layer containing the features array
    // Each feature a popup describing the place and time of the earthquake

    L.geoJSON(data, {

        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: mapStyle,

        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: " +
                new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");

        }
    }).addTo(earthquakes);

    // Sending our earthquakes layer to the createMap function
    earthquakes.addTo(myMap);

    // Get the tectonic plate data from tectonicPlatesURL
    d3.json(tectonicPlatesURL, function(data) {
        L.geoJSON(data, {
            color: "orange",
            weight: 2
        }).addTo(tectonicPlates);
        tectonicPlates.addTo(myMap);
    });

    // Add legend
    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [-10, 10, 30, 50, 70, 90];
        var colors = ["lightgreen", "yellow", "gold", "orange", "orangered", "red"]

        div.innerHTML += "<h3 style='text-align: center'>grades</h3>"

        // Iterate the colors to put it in the labels
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };
    legend.addTo(myMap);
});