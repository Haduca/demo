document.addEventListener("DOMContentLoaded", function() {
    alert("✅ This test message confirms external changes are being detected!");

    let testDiv = document.createElement("div");
    testDiv.style.position = "fixed";
    testDiv.style.bottom = "10px";
    testDiv.style.left = "10px";
    testDiv.style.background = "red";
    testDiv.style.color = "white";
    testDiv.style.padding = "10px";
    testDiv.style.fontSize = "16px";
    testDiv.style.zIndex = "1000";
    testDiv.innerText = "External Change Detected!";
    
    document.body.appendChild(testDiv);
});
