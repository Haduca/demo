// wallet.js

(function() {
  // The AI4Pi wallet address (as provided)
  const AI4PI_WALLET = "GDEXSQLO6ZP237REWFGE2Q3AJ4PGLGSUKX6G6UNSZL45RCRJ6MXKGECQ";

  /**
   * Retrieves the AI4Pi wallet balance using the Pi SDK.
   * Returns a Promise that resolves to a number representing the balance.
   */
  function getWalletBalance() {
    return new Promise((resolve, reject) => {
      if (window.Pi && typeof window.Pi.getBalance === 'function') {
        window.Pi.getBalance()
          .then((balance) => {
            const parsedBalance = parseFloat(balance);
            if (isNaN(parsedBalance)) {
              reject(new Error("Pi SDK returned a non-numeric balance."));
            } else {
              resolve(parsedBalance);
            }
          })
          .catch((error) => {
            reject(new Error("Error fetching wallet balance from Pi SDK: " + error.message));
          });
      } else {
        reject(new Error("Pi SDK getBalance() function not available."));
      }
    });
  }

  /**
   * Updates the wallet display on the webpage.
   * If the balance is below 1 Pi, instructs the user to deposit using the 'Send Pi to AI4Pi' transaction.
   * Any errors encountered are displayed for troubleshooting.
   */
  function updateWalletDisplay() {
    const walletEl = document.getElementById("walletDisplay");
    if (walletEl) {
      getWalletBalance()
        .then((balance) => {
          if (balance < 1) {
            walletEl.textContent = "Please deposit funds via 'Send Pi to AI4Pi' to view the real wallet balance.";
          } else {
            walletEl.textContent = "Wallet Balance: " + balance.toFixed(2) + " Pi";
          }
          console.log("[DEBUG] Updated wallet balance:", balance);
        })
        .catch((error) => {
          walletEl.textContent = "Error retrieving wallet balance: " + error.message;
          console.error("Error in updateWalletDisplay:", error);
        });
    }
  }

  /**
   * Initiates an App-to-User (A2U) payment (withdrawal).
   * Because A2U payments must use your Server API Key, this function sends a POST request
   * to your backend endpoint (which must be implemented separately) that handles the payment.
   *
   * @param {number} amount - The amount of Pi to withdraw.
   * @param {string} recipientUid - The unique user ID of the recipient (from /me).
   */
  function sendA2UPayment(amount, recipientUid) {
    // WARNING: The Server API Key must NEVER be exposed in client code.
    // This function calls your backend endpoint, which uses your Server API Key.
    fetch("/api/payments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // Do not include your server API key here.
      },
      body: JSON.stringify({
        payment: {
          amount: amount,
          memo: "App-to-User payment from AI4Pi",
          metadata: { origin: "AI4Pi WebApp" },
          uid: recipientUid
        }
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Server responded with status " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        console.log("[DEBUG] A2U payment response:", data);
        // After successful withdrawal, update the wallet display.
        updateWalletDisplay();
      })
      .catch((error) => {
        console.error("Error initiating A2U payment:", error);
        alert("Error initiating withdrawal: " + error.message);
      });
  }

  // Periodically update the wallet display (every 5 seconds) for debugging.
  setInterval(updateWalletDisplay, 5000);

  // Expose functions globally for use in main.js and elsewhere.
  window.getWalletBalance = getWalletBalance;
  window.updateWalletDisplay = updateWalletDisplay;
  window.sendA2UPayment = sendA2UPayment;
})();
