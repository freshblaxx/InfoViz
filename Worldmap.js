function updateWorldMap() {
    d3.select("#map").selectAll("*").remove(); // Clear existing map

    // Call `createWorldMap` with the latest selected planes
    createWorldMap("#map", data, selectedPlanes);
}

// Function to create an Equirectangular projection world map (Idiom 3)
function createWorldMap(container, data, selectedPlanes) {
    const margin = { top: 30, right: 20, bottom: 40, left: 30 };
    const width = (650 * 0.90) - margin.left - margin.right; 
    const height = (400 * 0.95) - margin.top - margin.bottom; 
     // Clear any existing content inside the container
     // d3.select(container).selectAll("*").remove();

     // **Set up Azimuthal Equidistant projection with default center at 0 LAT 0 LONG**
    const projection = d3.geoAzimuthalEquidistant()
        .center([0, 0]) // Set the central point for accurate distances
        .scale(100) // Skaliere die Projektion ebenfalls, um die Karte anzupassen
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Create SVG container
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left - 60},${margin.top - 20})`); // Weiter nach links (-60px)
    
    
    // **Define panning behavior only (no zoom)**
    const pan = d3.zoom()
        .scaleExtent([0.9, 1.1])  // Prevent zooming
        .on("zoom", (event) => {
            // Update projection translation
            svg.transition().duration(100).attr("transform", event.transform); // Add smoothness to panning
        });
      

    svg.call(pan); // Apply panning behavior to the SVG


    // Create a tooltip div with animations for fade-in and fade-out
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("visibility", "hidden")
        .style("opacity", 0)
        .style("transition", "opacity 0.3s"); // Smooth transition effect



    //Load and render world map GeoJSON data
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
            /*.on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "steelblue");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("fill", "lightgrey");
            });*/
        
         // Check if data is available and filter it based on selectedPlanes list
         
         if (Array.isArray(selectedPlanes)) {
            // Step 1: Create a Map for fast lookup of selected planes
            const selectedMap = new Map(selectedPlanes.map(plane => [`${plane.Type}-${plane.Model}`, plane]));
        
            // Step 2: Filter data using the Map for quick matching
            const filteredData = data.filter(d => selectedMap.has(`${d.Type}-${d.Model}`));
        
        

         // Scale for circle size based on Range
         const rangeScale = d3.scaleLinear()
         .domain([0, d3.max(data, d => d["Max. fuel (+p) Range (nm)"])])
         .range([2, 100]);

        // **Function to draw circles based on current projection center**
            function updateRangeCircles() {
                svg.selectAll("circle").remove(); // Clear previous circles
                svg.selectAll("text").remove(); // Clear previous labels

                svg.selectAll("circle")
                    .data(filteredData)
                    .enter()
                    .append("circle")
                    .attr("cx", width / 2)
                    .attr("cy", height / 2)
                    .attr("r", d => rangeScale(d["Max. fuel (+p) Range (nm)"]))
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.8)
                    // **Add event listeners for tooltip functionality**
                    .on("mouseover", function(event, d) {
                        // Show tooltip with plane details
                        tooltip.html(
                            `<strong>Airplane:</strong> ${d.Type}${d.Model}<br/>
                             <strong>Range:</strong> ${d["Max. fuel (+p) Range (nm)"]} nm`
                        )
                        .style("visibility", "visible")
                        .style("opacity", 1); // Fade in
                    })
                    .on("mousemove", function(event) {
                        // Position the tooltip near the cursor
                        tooltip.style("top", (event.pageY - 10) + "px")
                               .style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", function() {
                        // Hide the tooltip
                        tooltip.style("visibility", "hidden")
                        .style("opacity", 0); // Fade out
                                
                    });

                    svg.selectAll("text")
                    .data(filteredData)
                    .enter()
                    .append("text")
                    .attr("x", width / 2)
                    .attr("y", (d, i) => {
                        const offset = rangeScale(d["Max. fuel (+p) Range (nm)"]) + 10;
                        return (i % 2 === 0) ? (height / 2) - offset : (height / 2) + offset;
                    }) // Alternate positions for labels
                    .attr("text-anchor", "middle")
                    .attr("font-size", "10px")
                    .attr("fill", "black")
                    .text(d => `${d.Type}-${d.Model}`);
            }

                updateRangeCircles();
            
        }
    }).catch(error => console.error("Error loading GeoJSON:", error));    

    
     
}
