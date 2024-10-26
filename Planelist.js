// Helper function to clean manufacturer names by removing numeric suffixes created by the csv dataset
// (e.g., "Airbus.1" becomes "Airbus") i call this later while filtering data to fill the list.
function cleanManufacturerName(manufacturer) {
    return manufacturer.split('.')[0];  // Split at the period and take the first part
}

// Array to store the selected planes
let selectedPlanes = [];

// Function to populate the plane panel
function populatePlanePanel(data) {
    const planePanel = d3.select("#planePanel");
    planePanel.html(""); // Clear any existing content

    // Add a title to the panel
    planePanel.append("h2").text("List of Planes");
    addClearButton();
    // Add a search input field
    planePanel.append("input")
        .attr("type", "text")
        .attr("id", "planeSearch")
        .attr("placeholder", "Search for a plane or manufacturer...")
        .on("input", function () {
            filterPlaneList(data, this.value);  // Filter the list as user types
        });

    // Create an unordered list (ul) to hold the plane names
    planePanel.append("ul").attr("id", "planeList");
    // Initially populate the full list
    filterPlaneList(data, "");
    

   

}

// Function to filter and display the list of planes based on search term
function filterPlaneList(data, searchTerm) {
    const ul = d3.select("#planeList");
    ul.html("");  // Clear the existing list

    // Filter the data based on the search term matching either model, type, or manufacturer
    const filteredData = data.filter(d => 
        d.Model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.Manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.Type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Append each filtered plane name with the format: Type-Model (Manufacturer)
    filteredData.forEach(d => {
        const listItem = ul.append("li")
            .html(`<strong>${d.Type}-${d.Model}</strong> (${cleanManufacturerName(d.Manufacturer)})`)
            .attr("class", "plane-item")  // Add a class for styling
            .on("click", () => {
                togglePlaneSelection(d, listItem);
            });

        // Highlight the list item if it's already selected
        if (selectedPlanes.includes(d)) {
            listItem.classed("highlighted", true);
        }
    });
}

// Function to toggle plane selection in the list and scatterplot
// Function to toggle plane selection in the list, scatterplot, and bar chart
function togglePlaneSelection(planeData, listItem) {
    const planeIndex = selectedPlanes.indexOf(planeData);

    if (planeIndex === -1) {
        // Plane is not selected yet, so add it to the selected planes
        selectedPlanes.push(planeData);
        listItem.classed("highlighted", true);
    } else {
        // Plane is already selected, so remove it from the selected planes
        selectedPlanes.splice(planeIndex, 1);
        listItem.classed("highlighted", false);
    }

    // Update the scatterplot and bar chart to reflect the new selection
    highlightSelectedPlanesInScatterplot();
    highlightSelectedPlanesInBarchart();
}


// Function to highlight the selected planes in the scatterplot
function highlightSelectedPlanesInScatterplot() {
    // Reset all scatterplot points to default
    d3.selectAll("circle").attr("fill", "steelblue").attr("r", 4.5);

    // Highlight each selected plane in the scatterplot
    selectedPlanes.forEach(planeData => {
        d3.selectAll("circle")
            .filter(d => d.Model === planeData.Model && d.Manufacturer === planeData.Manufacturer)
            .attr("fill", "orange")  // Change color to highlight
            .attr("r", 8);  // Increase size for emphasis
    });
}

// Function to highlight the selected planes in the bar chart
function highlightSelectedPlanesInBarChart() {
    // Reset all bars to default style
    d3.selectAll(".bar").classed("highlighted-bar", false);

    // Highlight each selected plane in the bar chart
    selectedPlanes.forEach(planeData => {
        d3.selectAll(".bar")
             .filter(d => 
                d.Model.trim() === planeData.Model.trim() &&
                d.Manufacturer.trim() === planeData.Manufacturer.trim() &&
                d.Type.trim() === planeData.Type.trim()  // Added condition for Type
        )
            .classed("highlighted-bar", true);
    });
}


// Function to load data from the CSV and populate the plane panel
function loadAndPopulatePlaneList() {
    d3.csv("converted_CPI-16_dataset.csv").then(originalData => {
        const attributes = originalData.map(d => d[Object.keys(d)[0]]);
        const data = [];
        for (let col = 1; col < originalData.columns.length; col++) {
            const airplane = {};
            for (let row = 0; row < attributes.length; row++) {
                airplane[attributes[row]] = originalData[row][originalData.columns[col]];
            }
            airplane["Fuel(l) per seat per 100km"] = parseFloat(airplane["Fuel(l) per seat per 100km"]) || 0;
            airplane["Max. seats (single class)"] = parseFloat(airplane["Max. seats (single class)"]) || 0;
            airplane["Max. take-off weight (ton)"] = parseInt(airplane["Max. take-off weight (ton)"]) || 0;
            airplane["Take off distance (m)"] = parseFloat(airplane["Take off distance (m)"]) || 0;
            data.push(airplane);
        }

        // Call the function to populate the plane panel
        populatePlanePanel(data);
    }).catch(error => {
        console.error("Error loading or processing CSV data:", error);
    });
}



// Call this function after the page loads to populate the plane list
document.addEventListener('DOMContentLoaded', loadAndPopulatePlaneList);
// Function to clear all selected planes
function clearSelectedPlanes() {
    selectedPlanes = [];
    d3.selectAll(".plane-item").classed("highlighted", false); // Remove highlighting
    highlightSelectedPlanesInScatterplot(); // Update the scatterplot to reflect the cleared selection
}

// Function to add a "Clear Selections" button in the plane panel
function addClearButton() {
    const planePanel = d3.select("#planePanel");
    
    // Add a button for clearing selections
    planePanel.append("button")
        .attr("id", "clearSelections")
        .text("Clear Selections")
        .on("click", clearSelectedPlanes);
}
function togglePlaneSelection(planeData, listItem) {
    const planeIndex = selectedPlanes.indexOf(planeData);

    if (planeIndex === -1) {
        // Flugzeug ist nicht ausgewählt, daher hinzufügen und hervorheben
        selectedPlanes.push(planeData);
        listItem.classed("highlighted", true);
    } else {
        // Flugzeug ist bereits ausgewählt, daher entfernen und Hervorhebung löschen
        selectedPlanes.splice(planeIndex, 1);
        listItem.classed("highlighted", false);
    }

    // Scatterplot aktualisieren, um die neue Auswahl anzuzeigen
    highlightSelectedPlanesInScatterplot();
    highlightSelectedPlanesInBarChart();
}
