// Funktion für Scatterplot mit Trendlinie
function createScatterplotWithTrend(container, data, xVar, yVar, title) {
    const margin = { top: 50, right: 50, bottom: 60, left: 70 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[xVar]), d3.max(data, d => d[xVar])])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yVar]) * 1.1])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .text(xVar);

    svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text(yVar);

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[xVar]))
        .attr("cy", d => yScale(d[yVar]))
        .attr("r", 6)
        .attr("fill", "steelblue")
        .attr("opacity", 0.7);

    // Berechnung der Trendlinie
    const regression = leastSquares(data.map(d => d[xVar]), data.map(d => d[yVar]));

    svg.append("line")
        .attr("x1", xScale(d3.min(data, d => d[xVar])))
        .attr("y1", yScale(regression.slope * d3.min(data, d => d[xVar]) + regression.intercept))
        .attr("x2", xScale(d3.max(data, d => d[xVar])))
        .attr("y2", yScale(regression.slope * d3.max(data, d => d[xVar]) + regression.intercept))
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    // Funktion zur Berechnung der Regressionsgerade
    function leastSquares(x, y) {
        const n = x.length;
        const sumX = d3.sum(x);
        const sumY = d3.sum(y);
        const sumXY = d3.sum(x.map((d, i) => d * y[i]));
        const sumX2 = d3.sum(x.map(d => d * d));

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }
}