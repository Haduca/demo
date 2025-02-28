// debug.js - AI4Pi Debugging & Logging System
// File Path: frontend/src/debug.js

export function logDebug(message, data = null) {
    if (localStorage.getItem("debugMode") === "true") {
        console.log(`[AI4Pi Debug] ${message}`, data);
    }
}

export function saveTransactionLog(paymentId, txid, status) {
    let logs = JSON.parse(sessionStorage.getItem("transactionLogs")) || [];
    logs.push({ paymentId, txid, status, timestamp: new Date().toISOString() });
    sessionStorage.setItem("transactionLogs", JSON.stringify(logs));
    logDebug("Transaction logged", { paymentId, txid, status });
}

export function displayTransactionLogs() {
    let logs = JSON.parse(sessionStorage.getItem("transactionLogs")) || [];
    console.log("[AI4Pi] Transaction Logs:", logs);
}

export function toggleDebugMode() {
    let debugEnabled = document.getElementById("debugToggle").checked;
    localStorage.setItem("debugMode", debugEnabled);
    console.log("[AI4Pi] Debug Mode:", debugEnabled ? "ON" : "OFF");
}

export function enableDebugLogs() {
    if (localStorage.getItem("debugMode") === "true") {
        document.getElementById("debugToggle").checked = true;
        console.log("[AI4Pi] Debug Mode: ON");
    }
}
