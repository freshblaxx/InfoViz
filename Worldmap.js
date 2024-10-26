// Funktion für die Weltkarte (Idiom 3)
function createWorldMap(container) {
    const margin = { top: 30, right: 20, bottom: 40, left: 30 };
    const width = (650 * 0.90) - margin.left - margin.right; // 95% der ursprünglichen Breite
    const height = (400 * 0.95) - margin.top - margin.bottom; // 95% der ursprünglichen Höhe

    // Verwende die Mercator-Projektion
    const projection = d3.geoEquirectangular()
        .scale(95) // Skaliere die Projektion ebenfalls, um die Karte anzupassen
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Erstelle das SVG-Element
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left - 60},${margin.top - 20})`); // Weiter nach links (-60px)

    // Lade die GeoJSON-Daten
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(geojson) {
        // Zeichne die Ländergrenzen
        svg.append("g")
            .selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "lightgrey")
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "steelblue");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("fill", "lightgrey");
            });
    });
}
