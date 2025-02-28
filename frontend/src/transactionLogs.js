// transactionLogs.js - AI4Pi Persistent Transaction Storage
// File Path: frontend/src/transactionLogs.js

export function persistTransaction(paymentId, txid, status) {
    let transactions = JSON.parse(localStorage.getItem("ai4pi_transactions")) || [];
    transactions.push({ paymentId, txid, status, timestamp: new Date().toISOString() });
    localStorage.setItem("ai4pi_transactions", JSON.stringify(transactions));
    console.log("[AI4Pi] Transaction stored:", { paymentId, txid, status });
}

export function retrieveTransactions() {
    return JSON.parse(localStorage.getItem("ai4pi_transactions")) || [];
}

export function clearTransactionHistory() {
    localStorage.removeItem("ai4pi_transactions");
    console.log("[AI4Pi] Transaction history cleared.");
}
