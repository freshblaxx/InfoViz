// Standardmäßig gesetzte Felder für den Scatterplot
let currentXAxis = "Fuel(l) per seat per 100km";
let currentYAxis = "Max. seats (single class)";
let alternateView = false; // Zustand für die Ansicht wechseln
let showOutliers = false;    // Toggle for showing/hiding outliers

// Funktion zum Aktualisieren des Scatterplots
function updateScatterplot() {
    d3.select("#scatterplot1").selectAll("*").remove(); // Vorherigen Plot entfernen
    createScatterplot("#scatterplot1", data, currentXAxis, currentYAxis, currentXAxis + " vs. " + currentYAxis);
}

// Event-Listener für den Button, um die Ansicht umzuschalten
document.getElementById('changeViewButton').addEventListener('click', () => {
    if (alternateView) {
        // Ansicht 1: Originalwerte anzeigen
        currentXAxis = "Fuel(l) per seat per 100km";
        currentYAxis = "Max. seats (single class)";
    } else {
        // Ansicht 2: Alternative Achsen festlegen (zum Beispiel Initial Service Date vs. Wing Span)
        currentXAxis = "Initial Service Date";
        currentYAxis = "Wing Span (m)";
    }
    alternateView = !alternateView; // Zustand wechseln
    updateScatterplot(); // Scatterplot aktualisieren
});
// Event listener for the second button to toggle outliers visibility
document.getElementById('hideOutliers').addEventListener('click', () => {
    showOutliers = !showOutliers;  // Toggle the outlier visibility state
    updateScatterplot();           // Re-draw the scatterplot with/without outliers
});

