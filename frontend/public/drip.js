console.log("Pi Drip script loaded.");

// The current drip amount in Pi
let dripAmount = 0;

// Reference to the interval timer
let dripInterval = null;

/**
 * Creates a small UI section on the page to display the drip amount.
 */
function createDripUI() {
  const dripContainer = document.createElement("div");
  dripContainer.style.background = "#fff";
  dripContainer.style.border = "1px solid #ccc";
  dripContainer.style.padding = "10px";
  dripContainer.style.margin = "10px";
  dripContainer.style.width = "200px";
  dripContainer.style.textAlign = "center";
  dripContainer.style.marginLeft = "auto";
  dripContainer.style.marginRight = "auto";

  // Title
  const dripTitle = document.createElement("h3");
  dripTitle.textContent = "Pi Drip System";
  dripContainer.appendChild(dripTitle);

  // Display paragraph for the accumulated Pi
  const dripDisplay = document.createElement("p");
  dripDisplay.id = "dripDisplay";
  dripDisplay.style.fontSize = "20px";
  dripDisplay.style.fontWeight = "bold";
  dripDisplay.textContent = `Accumulated: ${dripAmount.toFixed(2)} Pi`;
  dripContainer.appendChild(dripDisplay);

  // Append to the page body (or wherever you like)
  document.body.appendChild(dripContainer);
}

/**
 * Updates the text to show the current accumulated drip amount.
 */
function updateDripDisplay() {
  const display = document.getElementById("dripDisplay");
  if (display) {
    display.textContent = `Accumulated: ${dripAmount.toFixed(2)} Pi`;
  }
}

/**
 * Starts the drip process, incrementing the drip amount by 0.05 Pi every 10 seconds.
 */
function startDrip() {
  if (dripInterval) {
    // Drip is already running, do nothing
    return;
  }
  dripInterval = setInterval(() => {
    dripAmount += 0.05;
    updateDripDisplay();
  }, 10_000); // 10,000 ms = 10 seconds
}

// Create the UI and start the drip once the DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  createDripUI();
  startDrip();
});
