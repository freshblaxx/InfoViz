function createBarChart(container, data, yVar, xVar) {
    const margin = { top: 110, right: 20, bottom: 40, left: 70 };
    const width = 500 - margin.left - margin.right;
    const height = 530 - margin.top - margin.bottom;

    // Filtere die Daten für den ausgewählten Long Range Cruise Speed
    const filteredData = data.filter(d => d[xVar] > 0);

    // Erstelle die Skalen für x und y
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d[xVar])])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(filteredData.map(d => d[yVar]))
        .range([0, height])
        .padding(0.1);

    // Erstelle das SVG-Element
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

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
        .attr("fill", "steelblue");

    // Füge die x-Achse hinzu
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", 35)
        .style("text-anchor", "middle")
        .text(xVar);

    // Füge die y-Achse hinzu
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text(yVar);
}
