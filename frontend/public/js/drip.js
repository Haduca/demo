// drip.js - Pi Drip Logic

// Initialize variables
let accumulatedPi = 0.000000; // Starting accumulated Pi
let dripRate = 0.000000; // Drip rate (to be calculated based on Pi Network)
let baseMiningRate = 0.000047706; // The base mining rate for Pi Network

// Function to update the Drip rate
function updateDripRate() {
    // Calculate the drip rate as 1% of the base mining rate
    dripRate = baseMiningRate * 0.01;
    // Update the displayed values
    updateDripDisplay();
}

// Function to update the display of the Drip Information
function updateDripDisplay() {
    const dripInfo = document.getElementById('drip-info');
    dripInfo.textContent = `Accumulated Pi: ${accumulatedPi.toFixed(6)} | Drip Rate: ${dripRate.toFixed(6)}`;
}

// Function to simulate Pi Drip accumulation every 10 seconds
function simulatePiDrip() {
    setInterval(() => {
        accumulatedPi += dripRate;
        updateDripDisplay();
    }, 10000); // Drip every 10 seconds
}

// Start the Pi Drip simulation
updateDripRate();
simulatePiDrip();
