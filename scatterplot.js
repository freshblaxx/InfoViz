// Standardmäßig festgelegte Achsen-Variablen
let currentXAxis = "Max. seats (single class)";
let currentYAxis = "Fuel(l) per seat per 100km";
let alternateView = false; // Toggle between different views
let showOutliers = true;   // Toggle for showing/hiding outliers

// Overly complex function to calculate mean and standard deviation
function calculateMeanAndStd(data, key) {
    const mean = d3.mean(data, d => d[key]);
    const stdDev = d3.deviation(data, d => d[key]);
    return { mean, stdDev };
}

// Overly complex function to filter out outliers based on standard deviations from the mean
function filterOutliers(data, key, numStdDev = 2) {
    const { mean, stdDev } = calculateMeanAndStd(data, key);
    return data.filter(d => Math.abs(d[key] - mean) <= numStdDev * stdDev);
}

// Function to create the scatterplot
function createScatterplot(container, data, xVar, yVar, title) {
       // Remove the previous scatterplot
    d3.select(container).select("svg").remove();

    const margin = { top: 50, right: 20, bottom: 40, left: 70 };
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        

    // Dynamische Skalen basierend auf den aktuellen Variablen
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[xVar]) * 1.1]) // Skalierung der x-Achse
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yVar]) * 1.1]) // Skalierung der y-Achse
        .range([height, 0]);

    // X-Achse erstellen
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .text(xVar);

    // Y-Achse erstellen
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

    // Punkte zeichnen
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
            d3.select("body").append("div").attr("class", "tooltip")
                .html(`Manufacturer: ${d.Manufacturer} <br/>Type: ${d.Type}<br/> Model: ${d.Model}<br/>${xVar}: ${d[xVar]}<br/>${yVar}: ${d[yVar]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            d3.selectAll(".tooltip").remove();
        });// Füge die Überschrift zum Scatterplot hinzu
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2) // Positioniere die Überschrift oberhalb des Scatterplots
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
             .style("fill", "white")
            .text("1: Technical Analysis");
    
        // Zeitstrahl erstellen
        const timelineGroup = svg.append("g").attr("class", "timeline");
    
        // Definiere die Positionen der Zeitereignisse (z.B. Initial Date)
        const timelineData = [
            { year: 1965, label: "1965" },
            { year: 1975, label: "1975" },
            { year: 1985, label: "1985" },
            { year: 1995, label: "1995" },
            { year: 2005, label: "2005" },
            { year: 2015, label: "2015" },
        ];
    
        // Zeitstrahl mit Dreieckssymbolen hinzufügen
        timelineGroup.selectAll("text")
            .data(timelineData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.year))
            .attr("y", -20) // Position oberhalb der x-Achse
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .text(d => d.label);
    
        // Dreiecke für Zeitstrahlmarkierungen hinzufügen
        timelineGroup.selectAll("path")
            .data(timelineData)
            .enter()
            .append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle).size(64)) // Dreieckssymbole
            .attr("transform", d => `translate(${xScale(d.year)},-10)`)
            .attr("fill", "white");
    }

// Funktion zum Laden der CSV-Datei und Erstellen des Scatterplots
function loadAndDrawScatterplot() {
    d3.csv("converted_CPI-16_dataset.csv").then(originalData => {
        console.log("CSV-Datei erfolgreich geladen:", originalData);

        // Daten umstrukturieren, da die Attribute in den Zeilen stehen
        const attributes = originalData.map(d => d[Object.keys(d)[0]]); // Extrahiere die Attributnamen aus der ersten Spalte

        // Erstelle eine Liste von Objekten, bei denen jede Spalte als Flugzeug dargestellt wird
        const data = [];
        for (let col = 1; col < originalData.columns.length; col++) { // Starte bei Spalte 1, um Spalte 0 (Attributnamen) zu ignorieren
            const airplane = {};
            for (let row = 0; row < attributes.length; row++) {
                airplane[attributes[row]] = originalData[row][originalData.columns[col]];
            }
            // Konvertiere die numerischen Felder
            airplane["Fuel(l) per seat per 100km"] = parseFloat(airplane["Fuel(l) per seat per 100km"]) || 0;
            airplane["Max. seats (single class)"] = parseFloat(airplane["Max. seats (single class)"]) || 0;
            airplane["Max. take-off weight (ton)"] = parseInt(airplane["Max. take-off weight (ton)"]) || 0;
            airplane["Take off distance (m)"] = parseFloat(airplane["Take off distance (m)"]) || 0;

            data.push(airplane);
        }

        console.log("Umstrukturierte Daten:", data); // Debug: Überprüfe die umstrukturierten Daten

        // Scatterplot erstellen mit den aktuellen Achsenwerten
        createScatterplot("#scatterplot1", data, currentXAxis, currentYAxis, `${currentXAxis} vs. ${currentYAxis}`);
    }).catch(error => {
        console.error("Fehler beim Laden der CSV-Datei:", error);
    });
}

// Event-Listener für den Button hinzufügen, um die Ansicht zu ändern
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('toggleView').addEventListener('click', () => {
        console.log("Button wurde geklickt!"); // Debug-Ausgabe, um sicherzustellen, dass der Klick erkannt wird

        // Ansicht umschalten
        if (!alternateView) {
            // Ändere zu alternativen Achsen
            currentXAxis = "Max. take-off weight (ton)";
            currentYAxis = "Take off distance (m)";
        } else {
            // Wechsel zurück zur Standardansicht
            currentXAxis = "Max. seats (single class)";
            currentYAxis = "Fuel(l) per seat per 100km";
        }

        alternateView = !alternateView; // Zustand umschalten
        console.log(`Neue Achsen: X = ${currentXAxis}, Y = ${currentYAxis}`); // Debug-Ausgabe für neue Achsen

        // CSV-Datei erneut laden und Scatterplot neu zeichnen
        loadAndDrawScatterplot();
    });

    // Initiales Zeichnen des Scatterplots nach Laden der CSV-Datei
    loadAndDrawScatterplot();
});


