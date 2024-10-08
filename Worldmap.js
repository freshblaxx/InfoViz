       // Funktion für die Weltkarte (Idiom 3)
       function createWorldMap(container) {
        const width = 600;
        const height = 350;
    
        // Verwende die Mercator-Projektion
        const projection = d3.geoMercator()
            .scale(130)
            .translate([width / 2, height / 1.5]);
    
        const path = d3.geoPath().projection(projection);
    
        // Erstelle das SVG-Element
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
    
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