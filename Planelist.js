// Helper function to clean manufacturer names by removing numeric suffixes created by the csv dataset
// (e.g., "Airbus.1" becomes "Airbus") i call this later while filtering data to fill the list.
function cleanManufacturerName(manufacturer) {
    return manufacturer.split('.')[0];  // Split at the period and take the first part
}

// Array to store the selected planes
//let selectedPlanes = [];
//let data = [];
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
/*
// Function to toggle plane selection in the list and scatterplot
// Function to toggle plane selection in the list, scatterplot, and bar chart
function togglePlaneSelection(data, listItem) {
    //const planeIndex = selectedPlanes.indexOf(data);
    const planeIndex = selectedPlanes.findIndex(selected => 
        selected.Type === data.Type && selected.Model === data.Model
    );
    if (planeIndex === -1) {
        // Plane is not selected yet, so add it to the selected planes
        selectedPlanes.push(data);
        listItem.classed("highlighted", true);
    } else {
        // Plane is already selected, so remove it from the selected planes
        selectedPlanes.splice(planeIndex, 1);
        listItem.classed("highlighted", false);
    }
    highlightSelectedPlanesInScatterplot();
    highlightSelectedPlanesInBarchart();
    updateWorldMap(); // Trigger the event after updating selection.
}

*/
//function to ensure the selected planes trought interactions in other idioms highlight elements in the planelist.
function updatePlaneListHighlight() {
    // Select all list items in the plane list
    d3.selectAll(".plane-list-item").each(function(d) {
        const isSelected = selectedPlanes.some(selected => 
            selected.Type === d.Type && selected.Model === d.Model
        );
        d3.select(this).classed("highlighted", isSelected);
    });
}
// Function to highlight the selected planes in the scatterplot
function highlightSelectedPlanesInScatterplot() {
    // Reset all scatterplot points to default
    d3.selectAll("circle").attr("fill", "steelblue").attr("r", 4.5);

    // Highlight each selected plane in the scatterplot
    selectedPlanes.forEach(data => {
        d3.selectAll("circle")
            .filter(d => d.Model === data.Model && d.Manufacturer === data.Manufacturer)
            .attr("fill", "orange")  // Change color to highlight
            .attr("r", 8);  // Increase size for emphasis
    });
}

// Function to highlight the selected planes in the bar chart
function highlightSelectedPlanesInBarChart() {
    // Reset all bars to default style
    d3.selectAll(".bar").classed("highlighted-bar", false);

    // Highlight each selected plane in the bar chart
    selectedPlanes.forEach(data => {
        d3.selectAll(".bar")
             .filter(d => 
                d.Model.trim() === data.Model.trim() &&
                d.Manufacturer.trim() === data.Manufacturer.trim() &&
                d.Type.trim() === data.Type.trim()  // Added condition for Type
        )
            .classed("highlighted-bar", true);
    });
}



// Function to load data from the CSV and populate the plane panel
function loadAndPopulatePlaneList() {
        // Call the function to populate the plane panel
        populatePlanePanel(data);
    
}



// Call this function after the page loads to populate the plane list
document.addEventListener('DOMContentLoaded', loadAndPopulatePlaneList);
// Function to clear all selected planes
function clearSelectedPlanes() {
    selectedPlanes = [];
    d3.selectAll(".plane-item").classed("highlighted", false); // Remove highlighting
    highlightSelectedPlanesInScatterplot(); // Update the scatterplot to reflect the cleared selection    
    updateWorldMap();                        // Update the map
    clearMapSelections();                    // Clear map selections
    updateBarChart("Cruise Speed (km/h)",selectedPlanes);
    highlightSelectedPlanesInBarChart()
    
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

function togglePlaneSelection(data, listItem) {
    const planeIndex = selectedPlanes.indexOf(data);

    if (planeIndex === -1) {
        // Flugzeug ist nicht ausgewählt, daher hinzufügen und hervorheben
        selectedPlanes.push(data);
        listItem.classed("highlighted", true);
    } else {
        // Flugzeug ist bereits ausgewählt, daher entfernen und Hervorhebung löschen
        selectedPlanes.splice(planeIndex, 1);
        listItem.classed("highlighted", false);
    }

    // Scatterplot aktualisieren, um die neue Auswahl anzuzeigen
    highlightSelectedPlanesInScatterplot();
    highlightSelectedPlanesInBarChart();
    updateWorldMap(); // Trigger the event after updating selection.
    updateBarChart("Cruise Speed (km/h)",selectedPlanes);
    
}
