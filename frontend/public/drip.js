// drip.js
console.log("Pi Drip script loaded.");

// The current drip amount in Pi
let dripAmount = 0;

// Reference to the interval timer
let dripInterval = null;

/**
 * Creates a small UI section on the page to display the drip amount and a reset button.
 */
function createDripUI() {
  const dripContainer = document.createElement("div");
  dripContainer.style.background = "#fff";
  dripContainer.style.border = "1px solid #ccc";
  dripContainer.style.padding = "10px";
  dripContainer.style.margin = "10px auto";
  dripContainer.style.width = "200px";
  dripContainer.style.textAlign = "center";

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

  // Reset button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset Drip";
  resetButton.style.marginTop = "10px";
  resetButton.addEventListener("click", resetDrip);
  dripContainer.appendChild(resetButton);

  // Append to the page body (or any container you prefer)
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
    // Drip is already running
    return;
  }
  dripInterval = setInterval(() => {
    dripAmount += 0.05;
    // Save the updated amount to localStorage
    localStorage.setItem("dripAmount", dripAmount);
    updateDripDisplay();
  }, 10000); // 10 seconds
}

/**
 * Reset the drip amount to 0, clear from localStorage, and update UI.
 */
function resetDrip() {
  dripAmount = 0;
  localStorage.removeItem("dripAmount");
  updateDripDisplay();
}

// On page load, retrieve any saved drip amount and initialize the UI + drip timer
window.addEventListener("DOMContentLoaded", () => {
  const savedDrip = localStorage.getItem("dripAmount");
  if (savedDrip) {
    dripAmount = parseFloat(savedDrip) || 0;
  }
  createDripUI();
  startDrip();
});
