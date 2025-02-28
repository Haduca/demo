// App.js - AI4Pi Payment Handling & Debugging Fixes
// File Path: frontend/src/App.js

import { logDebug, saveTransactionLog } from "./debug.js";
import { persistTransaction } from "./transactionLogs.js";

export function loginUser() {
    logDebug("Initializing SDK for authentication...");
    Pi.init({ version: "2.0", sandbox: true, appId: "aiphub2360" })
        .then(() => Pi.authenticate(["username", "payments"]))
        .then(auth => {
            if (auth && auth.user) {
                logDebug(`Signed in as: ${auth.user.username}`);
            } else {
                logDebug("Authentication failed, no user data received.");
            }
        })
        .catch(error => logDebug(`Error during authentication: ${error.message}`));
}

export function sendPiToAI4Pi(amount, walletAddress, apiKey) {
    if (!amount || amount <= 0) {
        logDebug("Invalid Pi amount.");
        return;
    }
    logDebug(`Sending ${amount} Pi to ${walletAddress}...`);

    Pi.createPayment(
        {
            amount: amount,
            memo: "Auto-approved transfer to AI4Pi",
            metadata: { transactionType: "userToAI4Pi" },
            to_address: walletAddress
        },
        {
            onIncompletePaymentFound: payment => {
                logDebug(`Found incomplete payment: ${payment.identifier}`);
            },
            onReadyForServerApproval: paymentId => {
                logDebug("Payment request ready. Auto-approving...");
                approvePayment(paymentId, apiKey);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                logDebug("Payment approved. Finalizing transaction...");
                completePayment(paymentId, txid, apiKey);
            },
            onCancel: paymentId => logDebug(`Payment canceled by user. Payment ID: ${paymentId}`),
            onError: error => logDebug(`Payment error: ${error.message}`)
        }
    );
}

function approvePayment(paymentId, apiKey) {
    logDebug(`Approving payment: ${paymentId}...`);
    fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
            "Authorization": `Key ${apiKey}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                logDebug("Payment approved successfully.");
            } else {
                logDebug(`Payment approval failed: ${data.error}`);
            }
        })
        .catch(error => logDebug(`API request failed: ${error.message}`));
}

function completePayment(paymentId, txid, apiKey) {
    logDebug(`Completing payment: ${paymentId} with txid: ${txid}...`);
    fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: {
            "Authorization": `Key ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ txid: txid })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                logDebug("Payment marked as completed.");
                persistTransaction(paymentId, txid, "Completed");
            } else {
                logDebug(`Payment completion failed: ${data.error}`);
            }
        })
        .catch(error => logDebug(`API request failed: ${error.message}`));
}
