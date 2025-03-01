// newfeature.js

// This message will appear in the browser console when the file loads.
console.log("New Feature Loaded");

// Example function: Adds a new UI element to the page.
function addNewFeatureUI() {
  const container = document.createElement("div");
  container.style.background = "#eee";
  container.style.padding = "10px";
  container.style.margin = "10px";
  container.innerHTML = "<p>New Feature: This is a new addition!</p>";
  document.body.appendChild(container);
}

// Run the function once the DOM is fully loaded.
window.addEventListener("DOMContentLoaded", () => {
  addNewFeatureUI();
});
