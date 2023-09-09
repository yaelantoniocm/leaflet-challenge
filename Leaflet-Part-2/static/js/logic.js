const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const tectonicplatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
const api_key = "pk.eyJ1IjoieWFlbGFudG9uaW9jbTciLCJhIjoiY2xtY2ttMnp3MWEyeTNxbHA0czhyMzN0YSJ9.kHEw-mMz9o4sPehb856sjQ";  

// Function to determine marker color by depth
function getColor(d) {
    return d > 90 ? '#800026' :
    d > 70 ? '#CB5F00' :
    d > 50 ? '#EEA700' :
    d > 30 ? '#DCC600' :
    d > 10 ? '#CBC100' :
    d > -10 ? '#13B601' :
    '#FFFFFF'; 
}

// Create Tile Layer
function createTileLayer(style) {
    return L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
        attribution: "...",
        style: style,
        access_token: api_key,
        //This would mean that if you do not zoom when moving left or right, it will return you to the map, 
        //but if you zoom out, only right images will be shown.
        //noWrap: true
    });
}

// Function to fetch earthquake data and plot it
function fetchPlotEarthquakes() {
    d3.json(queryUrl).then(function (data) {
        createFeatures(data.features);
    }).catch(error => {
        console.error("Error fetching earthquake data:", error);
    });
}

// Function to create features
function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
      }

      // Create a GeoJSON layer containing the features array on the earthquakeData object
      let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
    
        // Create circle markers
        pointToLayer: function(feature, latlng) {
          // Set the marker style
          let markers = {
            radius: feature.properties.mag * 20000,
            fillColor: getColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.7,
            color: "black",
            weight: 0.5
          }
          return L.circle(latlng,markers);
        }
      });
    
      // Sending our earthquakes layer to the createMap function
      createMap(earthquakes);
}

// Function to create map
function createMap(earthquakes) {
    const satellite = createTileLayer('mapbox/satellite-v9');
    const grayscale = createTileLayer('mapbox/light-v11');
    const outdoors = createTileLayer('mapbox/outdoors-v12');
    const tectonicPlates = new L.layerGroup();
    
    // Fetch tectonic plate data and plot it
    d3.json(tectonicplatesUrl).then(function (plates) {
        L.geoJSON(plates, {
            color: "red",
            weight: 5,
        }).addTo(tectonicPlates);
    }).catch(error => {
        console.error("Error fetching tectonic plate data:", error);
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };
    
    // Create the map, giving it the satellite and earthquakes layers to display on load
    const map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [satellite, earthquakes, tectonicPlates],
        //This generates tectonic plates or earthquakes depending on or both depending on the map being viewed.
        worldCopyJump: true
    });

    // Create legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "info legend")
      let depth = [-10, 10, 30, 50, 70, 90];
  
      div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
  
      for (let i = 0; i < depth.length; i++) {
        div.innerHTML +=
        '<i class=legend-item style="background:' + getColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      }
      return div;
    };
    legend.addTo(map)
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);
  };

// Fetch earthquake data and plot it
fetchPlotEarthquakes();