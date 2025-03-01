// newfeature.js

console.log("New Feature Loaded");

// Example function #1: Adds a new UI element on page load
function addNewFeatureUI() {
  const container = document.createElement("div");
  container.style.background = "#eee";
  container.style.padding = "10px";
  container.style.margin = "10px";
  container.innerHTML = `
    <p>New Feature: This is a new addition!</p>
    <button id="fetchDataBtn">Fetch Data</button>
    <div id="dataDisplay" style="margin-top: 10px; font-weight: bold;"></div>
  `;
  document.body.appendChild(container);
}

// Example function #2: Fetch data from a public API and display it
function fetchData() {
  const displayDiv = document.getElementById("dataDisplay");
  if (!displayDiv) return;

  displayDiv.textContent = "Loading data...";

  fetch("https://jsonplaceholder.typicode.com/todos/1")  // Example public API
    .then(response => response.json())
    .then(data => {
      displayDiv.textContent = `Fetched Data: ${JSON.stringify(data)}`;
    })
    .catch(error => {
      displayDiv.textContent = `Error: ${error.message}`;
    });
}

// Attach event listeners after the DOM loads
window.addEventListener("DOMContentLoaded", () => {
  addNewFeatureUI();

  const fetchButton = document.getElementById("fetchDataBtn");
  if (fetchButton) {
    fetchButton.addEventListener("click", fetchData);
  }
});
