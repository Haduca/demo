// main.js

// Basic variables for Pi logic
let userData = null;
const apiKey = "7jtvfxfvsitryhsniutkrjzbrxu3j983aieda0dcfqvbdypd76jvnqwi5aq8r3nr";   // Replace with your actual Pi Dev Portal key
const ai4piWallet = "GDEXSQLO6ZP237REWFGE2Q3AJ4PGLGSUKX6G6UNSZL45RCRJ6MXKGECQ"; // Replace with your actual wallet address

/**
 * Utility function to log messages to the #output area.
 */
function logMessage(message) {
  const outputDiv = document.getElementById("output");
  if (!outputDiv) return;
  outputDiv.innerHTML += `<br>> ${message}`;
  outputDiv.scrollTop = outputDiv.scrollHeight;
  console.log(message);
}

/**
 * Login to Pi Network
 */
function loginUser() {
  if (typeof Pi === "undefined") {
    logMessage("❌ Pi SDK is not available.");
    return;
  }
  logMessage("🔄 Initializing SDK for authentication...");

  Pi.init({ version: "2.0", sandbox: true, appId: "aiphub2360" })
    .then(() => {
      logMessage("✅ SDK Initialized. Attempting login...");
      return Pi.authenticate(["username", "payments"]);
    })
    .then(auth => {
      if (auth && auth.user) {
        userData = auth.user;
        logMessage(`✅ Signed in as: ${auth.user.username}`);
      } else {
        logMessage("❌ Authentication failed, no user data received.");
      }
    })
    .catch(error => {
      logMessage(`❌ Error during authentication: ${error.message}`);
    });
}

/**
 * Send Pi to AI4Pi
 */
function sendPiToAI4Pi() {
  if (!userData) {
    logMessage("❌ You must log in before sending Pi.");
    return;
  }

  const amountInput = document.getElementById("amountInput");
  if (!amountInput) {
    logMessage("❌ Amount input not found.");
    return;
  }
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    logMessage("❌ Invalid Pi amount. Please enter a valid number.");
    return;
  }

  if (!confirm(`Are you sure you want to send ${amount} Pi to AI4Pi?`)) {
    logMessage("⚠️ Transaction canceled by user.");
    return;
  }

  logMessage(`🔄 Sending ${amount} Pi to AI4Pi...`);

  // Example: Pi.createPayment
  Pi.createPayment(
    {
      amount: amount,
      memo: "Auto-approved transfer to AI4Pi",
      metadata: { transactionType: "userToAI4Pi" },
      to_address: ai4piWallet
    },
    {
      onReadyForServerApproval: function(paymentId) {
        logMessage("✅ Payment request ready. Auto-approving...");
        approvePayment(paymentId);
      },
      onReadyForServerCompletion: function(paymentId, txid) {
        logMessage("✅ Payment approved on chain. Finalizing transaction...");
        completePayment(paymentId, txid);
      },
      onCancel: function(paymentId) {
        logMessage(`⚠️ Payment canceled by user. Payment ID: ${paymentId}`);
      },
      onError: function(error) {
        logMessage(`❌ Payment error: ${error.message}`);
      }
    }
  );
}

/**
 * Approve Payment
 */
function approvePayment(paymentId) {
  logMessage(`🔄 Approving payment: ${paymentId}...`);

  fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.status && data.status.developer_approved === true) {
      logMessage("✅ Payment approved successfully (waiting for on-chain txid)...");
    } else {
      logMessage(`❌ Payment approval response: ${JSON.stringify(data)}`);
    }
  })
  .catch(error => {
    logMessage(`❌ API request failed: ${error.message}`);
  });
}

/**
 * Complete Payment
 */
function completePayment(paymentId, txid) {
  if (!txid) {
    logMessage("❌ Missing transaction ID (txid). Cannot complete payment yet.");
    return;
  }
  logMessage(`🔄 Completing payment: ${paymentId} with txid: ${txid}...`);

  fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ txid })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status && data.status.developer_completed === true) {
      logMessage(`✅ Payment ${paymentId} marked as completed.`);
    } else {
      logMessage(`❌ Payment completion response: ${JSON.stringify(data)}`);
    }
  })
  .catch(error => {
    logMessage(`❌ API request failed: ${error.message}`);
  });
}
