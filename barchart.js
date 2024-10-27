function createBarChart(container, data, yVar, selectedPlanes) {
    const margin = { top: 20, right: 20, bottom: 40, left: 180 };
    const width = 550 - margin.left - margin.right;
    const height = 340 - margin.top - margin.bottom;

    // Tooltip für das Balkendiagramm
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // SVG-Element für das Diagramm
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-top", "40px")
        .append("g")
        .attr("transform", `translate(${margin.left - 30},${margin.top})`);

    

    // Funktion zur Aktualisierung des Balkendiagramms, inklusive Highlighting der ausgewählten Flugzeuge
        updateBarChart = function(xVar,selectedPlanes) {
            const selectedMap = new Map(selectedPlanes.map(plane => [`${plane.Type}-${plane.Model}`, plane]));
        
        // Filter data based on both conditions:
        const filteredData = data.filter(d => 
            d[xVar] && d[xVar] > 0 && selectedMap.has(`${d.Type}-${d.Model}`)
        );
        const filteredDataS = filteredData.sort((a, b) => b[xVar] - a[xVar]);//sorting 
        
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(filteredDataS, d => d[xVar])])
            .range([0, width]);

        const yScale = d3.scaleBand()
        .domain(filteredDataS.map(d => `${d.Manufacturer} ${d.Type} ${d.Model}`)) 
            .range([0, height])
            .padding(0.1);

        svg.selectAll(".bar").remove();
        svg.selectAll(".x-axis").remove();
        svg.selectAll(".y-axis").remove();
        // Define a color scale that maps bar values to shades of green
        const colorScale = d3.scaleLinear()
            .domain([0, d3.max(filteredDataS, d => +d[xVar])])
            .range(["#a8e6a3", "#006400"]);  // Light green to dark green

        svg.selectAll(".bar")
            .data(filteredDataS)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(`${d.Manufacturer} ${d.Type} ${d.Model}`))  // Use combined label
            .attr("width", d => xScale(d[xVar]))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => selectedPlanes.includes(d) ? "green" : "steelblue") // Highlight selected planes
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`<strong>${yVar}:</strong> ${d[yVar]}<br><strong>${xVar}:</strong> ${d[xVar]}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(200).style("opacity", 0);
            })
            .on("click", (event, d) => {
                // Beim Klick auf einen Balken Auswahl hinzufügen/entfernen
                const listItem = d3.select(`planeList li`)
                    .filter(item => item.Model === d.Model && item.Manufacturer === d.Manufacturer);
                togglePlaneSelection(d, listItem);
                
                // Aktualisieren Sie das Balkendiagramm nach Auswahländerungen
                updateBarChart(xVar);
            });

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", 35)
            .style("text-anchor", "middle")
            .text(xVar);

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("class", "axis-label")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text(yVar);    

        // Rufe die Highlighting-Funktion auf, um ausgewählte Flugzeuge zu markieren
        highlightSelectedPlanesInBarchart();
    };

    // Initialisiere das Diagramm mit der Standard-X-Variable
    updateBarChart("Cruise Speed (km/h)",selectedPlanes);
    
}
