function createBarChart(container, data, yVar) {
    const margin = { top: 10, right: 20, bottom: 40, left: 50 };
    const width = 650 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Initiale X-Variable für die Visualisierung
    let currentXVar = "Long Range Cruise Speed (km/h)"; // Standardmäßig Speed

    // Erstelle den Tooltip
    const tooltip = d3.select(container)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0); // Unsichtbar, solange der Benutzer nicht hovert

    // Funktion zur Aktualisierung des Balkendiagramms basierend auf der ausgewählten X-Variable
    function updateBarChart(xVar) {
        // Filtere die Daten für die ausgewählte X-Variable und überprüfe, ob der Wert existiert
        const filteredData = data.filter(d => d[xVar] && d[xVar] > 0);

        // Aktualisiere die Skalen für x und y
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d[xVar])])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(filteredData.map(d => d[yVar]))
            .range([0, height])
            .padding(0.1);

        // Entferne das vorherige Diagramm
        svg.selectAll(".bar").remove();
        svg.selectAll(".x-axis").remove();
        svg.selectAll(".y-axis").remove();

        // Erstelle die Balken
        svg.selectAll(".bar")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d[yVar]))
            .attr("width", d => xScale(d[xVar]))
            .attr("height", yScale.bandwidth())
            .attr("fill", "steelblue")
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
            });

        // Füge die x-Achse hinzu
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

        // Füge die y-Achse mit den Flugzeugmodellen hinzu
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
    }

    // Erstelle die Buttons über dem Diagramm
    const buttonContainer = d3.select(container)
        .append("div")
        .attr("class", "button-container")
        .style("display", "flex")
        .style("gap", "5px")
        .style("margin-top", "50px") // Erhöhe diesen Wert, um die Buttons weiter nach unten zu verschieben
        .style("margin-bottom", "5px");

    // Button für "Speed"
    buttonContainer.append("button")
        .text("Speed")
        .on("click", () => updateBarChart("Long Range Cruise Speed (km/h)"));

    // Button für "Seat Range"
    buttonContainer.append("button")
        .text("Seat X Range")
        .on("click", () => updateBarChart("Max. seats (single class)"));

    // Erstelle das SVG-Element für das Diagramm
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Initialisiere das Diagramm mit der Standard-X-Variable
    updateBarChart(currentXVar);
}
