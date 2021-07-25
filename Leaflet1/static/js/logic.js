var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

// Create our map, to display on load
var myMap = L.map("map", {
    center: [34.30, -106.1],
    zoom: 5,
});

grayscaleMap.addTo(myMap);

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(queryUrl, function(data) {


    // function for style  
    function mapStyle(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: mapColor(feature.properties.mag),
            color: "#000000",
            radius: mapRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    //function for color
    function mapColor(mag) {
        switch (true) {
            case mag > 5:
                return "#ea2c2c";
            case mag > 4:
                return "#eaa92c";
            case mag > 3:
                return "#d5ea2c";
            case mag > 2:
                return "#92ea2c";
            case mag > 1:
                return "#2ceabf";
            default:
                return "#2c99ea";
        }
    }
    //function for radius
    function mapRadius(mag) {
        if (mag === 0) {
            return 1;
        }

        return mag * 4;
    }



    L.geoJson(data, {

        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: mapStyle,

        onEachFeature: function(feature, layer) {
            layer.bindPopup("<strong> Magnitude: </strong>" + feature.properties.mag + "<br><strong>Location: </strong>" + feature.properties.place);

        }
    }).addTo(myMap);

    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [0, 1, 2, 3, 4, 5];
        var colors = ["#2c99ea", "#2ceabf", "#92ea2c", "#d5ea2c", "#eaa92c", "#ea2c2c"];


        // Iterate the colors to put it in the labels
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;

    };

    legend.addTo(myMap)

});