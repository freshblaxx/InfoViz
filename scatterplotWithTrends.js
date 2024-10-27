// Create the tooltip div (hidden by default)
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


// Function to create a scatterplot with trendline
function createScatterplotWithTrend(container, data, xVar, yVar, title) {
    const margin = { top: 50, right: 20, bottom: 40, left: 70 };
    const width = 450 - margin.left - margin.right;
    const height = 330 - margin.top - margin.bottom;
    
    // Remove existing scatterplot (if any)
    d3.select(container).select("svg").remove();

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale: Use a domain from 1960 to 2020
    const xScale = d3.scaleLinear()
        .domain([1960, 2020]) // Set the domain manually to 1960-2020
        .range([0, width]);

    // Y scale: Based on the chosen Y variable
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d[yVar]) * 1.1]) // Adjust domain based on the max value of the selected Y variable
        .range([height, 0]);

    // Create the X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))) // Display years in integer format
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .text(xVar);

    // Create the Y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text(yVar);
    

    //  X-Axis Label but not in german
    svg.append("text")
          .attr("class", "axis-label")
          .attr("x", width / 2)
          .attr("y", height + 35) // Adjust here to be closer to the X axis
          .style("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(xVar);
  
    // Y-Axis Label but not in german
    svg.append("text")
          .attr("class", "axis-label")
          .attr("x", -height / 2)
          .attr("y", -40) // Adjust here to be closer to the Y axis
          .attr("transform", "rotate(-90)") // Rotation parameter
          .style("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(yVar);
      

          svg.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", d => xScale(d[xVar]))
          .attr("cy", d => yScale(d[yVar]))
          .attr("r", 4.5)
          .attr("fill", "steelblue")
          .attr("opacity", 0.7)
          .on("mouseover", function (event, d) {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip.html(`Manufacturer: ${d.Manufacturer} <br/>Type: ${d.Type}<br/> Model: ${d.Model}<br/>${xVar}: ${d[xVar]}<br/>${yVar}: ${d[yVar]}`)
                  .style("left", (event.pageX + 5) + "px")
                  .style("top", (event.pageY - 28) + "px");
          })
          .on("mousemove", (event) => {
              tooltip.style("left", (event.pageX + 5) + "px")
                     .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", () => {
              tooltip.transition().duration(200).style("opacity", 0);
          });

    // Calculate the least squares regression line
    const regression = leastSquares(data.map(d => d[xVar]), data.map(d => d[yVar]));

    // Draw the trendline
    svg.append("line")
        .attr("x1", xScale(1960)) // Start trendline at 1960
        .attr("y1", yScale(regression.slope * 1960 + regression.intercept)) // Y value at 1960
        .attr("x2", xScale(2020)) // End trendline at 2020
        .attr("y2", yScale(regression.slope * 2020 + regression.intercept)) // Y value at 2020
        .attr("stroke", "red")
        .attr("stroke-width", 2);
        svg.selectAll("line")
        .on("mouseover", function (event) {
            d3.select("body").append("div").attr("class", "tooltip")
                .html(`Slope: ${regression.slope.toFixed(4)}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            d3.selectAll(".tooltip").remove();
        });
    // Function to calculate the least squares regression (slope and intercept)
    function leastSquares(x, y) {
        const n = x.length;
        const sumX = d3.sum(x); // Sum of X values
        const sumY = d3.sum(y); // Sum of Y values
        const sumXY = d3.sum(x.map((d, i) => d * y[i])); // Sum of X * Y
        const sumX2 = d3.sum(x.map(d => d * d)); // Sum of X^2

        // Calculate slope (m) and intercept (b)
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept }; // Return slope and intercept for the regression line
    }
}


// Function to handle the second scatterplot with a dropdown for Y-axis selection
function createSecondScatterplotWithDropdown(data) {
    const xVar = "Initial Service Date"; // Fixed X-axis variable
    const defaultYVar = "Fuel(l) per seat per 100km"; // Default Y-axis variable

    // Initially create the scatterplot with default Y-axis
    createScatterplotWithTrend("#scatterplot2", data, xVar, defaultYVar, `${xVar} vs. ${defaultYVar}`);

    // Populate the dropdown with options for Y-axis selection
    const dropdown = d3.select("#yAxisSelect");
    const options = [
        "Fuel(l) per seat per 100km",
        "Weight per Wing Area (kg/m2)",
        "Max. seats (single class)",
        "Wing Span (m)",
        "Long Range Cruise Speed (km/h)",
        "Max. take-off weight (ton)",
        "Take off distance (m)",
        "Max. fuel (+p) Range (nm)"
    ];

    dropdown.selectAll("option")
        .data(options)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    // Update the scatterplot when a new Y-axis variable is selected
    dropdown.on("change", function () {
        const selectedYVar = this.value; // Get the selected Y-axis variable
        createScatterplotWithTrend("#scatterplot2", data, xVar, selectedYVar, `${xVar} vs. ${selectedYVar}`); // Update the scatterplot
    });
}

// Load the data and initialize the visualizations
d3.csv("converted_CPI-16_dataset.csv").then(originalData => {
    const data = [];
    for (let col = 0; col < originalData.columns.length; col++) {
        data.push({
            Manufacturer: originalData[0][originalData.columns[col]],
            Type: originalData[1][originalData.columns[col]],
            Model: originalData[2][originalData.columns[col]],
            "Fuel(l) per seat per 100km": parseFloat(originalData[21][originalData.columns[col]]) || 0,
            "Weight per Wing Area (kg/m2)": parseFloat(originalData[13][originalData.columns[col]]) || 0,
            "Max. seats (single class)": parseFloat(originalData[5][originalData.columns[col]]) || 0,
            "Initial Service Date": parseInt(originalData[3][originalData.columns[col]]) || 0,
            "Wing Span (m)": parseFloat(originalData[11][originalData.columns[col]]) || 0,
            "Long Range Cruise Speed (km/h)": parseFloat(originalData[16][originalData.columns[col]]) || 0,
            "Max. take-off weight (ton)": parseInt(originalData[7][originalData.columns[col]]) || 0,
            "Take off distance (m)": parseFloat(originalData[15][originalData.columns[col]]) || 0,
            "Max. fuel (+p) Range (nm)":parseFloat(originalData[18][originalData.columns[col]]) || 0
        });
    }
    
    // Initialize the first scatterplot (with trendline) on top
    createScatterplotWithTrend("#scatterplot2", data, "Max. seats (single class)", "Fuel(l) per seat per 100km", "Max. seats (single class) vs. Fuel(l) per seat per 100km");

    // Initialize the second scatterplot (with dropdown for Y-axis) below
    createSecondScatterplotWithDropdown(data);
});