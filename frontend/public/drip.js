// drip.js

console.log("Pi Drip script loaded.");

// The current drip amount in Pi
let dripAmount = 0;
let dripInterval = null;

function createDripUI() {
  const container = document.getElementById("dripContainer");
  if (!container) return;

  const dripBox = document.createElement("div");
  dripBox.style.background = "#fff";
  dripBox.style.border = "1px solid #ccc";
  dripBox.style.padding = "10px";
  dripBox.style.margin = "10px 0";
  dripBox.innerHTML = `
    <h3>Pi Drip System</h3>
    <p id="dripDisplay">Accumulated: ${dripAmount.toFixed(2)} Pi</p>
    <button id="resetDripBtn">Reset Drip</button>
  `;
  container.appendChild(dripBox);

  document.getElementById("resetDripBtn").addEventListener("click", resetDrip);
}

function updateDripDisplay() {
  const disp = document.getElementById("dripDisplay");
  if (disp) {
    disp.textContent = `Accumulated: ${dripAmount.toFixed(2)} Pi`;
  }
}

function startDrip() {
  if (dripInterval) return;
  dripInterval = setInterval(() => {
    dripAmount += 0.05;
    updateDripDisplay();
  }, 10000);
}

function resetDrip() {
  dripAmount = 0;
  updateDripDisplay();
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
  createDripUI();
  startDrip();
});
