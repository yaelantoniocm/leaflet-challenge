// Perform a GET request to the query URL
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(data => {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });
  

function createMap(earthquakeData) {
    // Define the map layers
    const streetmap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
  
    // Create the map
    const map = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap, earthquakeData]
    });
  
    // Create the legend
    const legend = L.control({ position: "bottomright" });
  
    legend.onAdd = function() {
      const div = L.DomUtil.create("div", "info legend");
      const grades = [-10, 10,30, 50, 70, 90];
      let labels = [];
  
      grades.forEach((grade, index) => {
        labels.push(
          `<li style="background-color: ${getColor(grade + 1)}">${grade}${(grades[index + 1] ? "&ndash;" + grades[index + 1] : "+")}</li>`
        );
      });
  
      div.innerHTML = `<ul>${labels.join("")}</ul>`;
      return div;
    };
  
    legend.addTo(map);
  }
  
  // Function to get color based on magnitude
  function getColor(d) {
    return d > 100 ? '#800026' :
           d > 80  ? '#CB5F00' :
           d > 60  ? '#EEA700' :
           d > 40  ? '#DCC600' :
           d > 20  ? '#CBC100' :
                     '#13B601';
}
    
// Function to create features
  function createFeatures(earthquakeData) {
    const earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: feature.properties.mag * 5,
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Profundidad: ${feature.geometry.coordinates[2]} km</p>`);
    }
    });
  
    // Send our earthquakes layer to the createMap function
    createMap(earthquakes);
  }