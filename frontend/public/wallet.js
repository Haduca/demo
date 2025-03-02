// wallet.js

(function() {
  // Known AI4Pi wallet address (as provided)
  const AI4PI_WALLET = "GDEXSQLO6ZP237REWFGE2Q3AJ4PGLGSUKX6G6UNSZL45RCRJ6MXKGECQ";

  /**
   * Retrieves the wallet balance for AI4Pi from the PiBlockExplorer.
   * Returns a Promise that resolves to a number (the balance).
   */
  function getWalletBalance() {
    return fetch("https://explorer.minepi.com/api/address/" + AI4PI_WALLET)
      .then((res) => res.json())
      .then((data) => {
        // Assuming the JSON response contains a field "balance"
        if (data && typeof data.balance !== "undefined") {
          let balance = parseFloat(data.balance);
          if (isNaN(balance)) {
            throw new Error("Block Explorer returned a non-numeric balance.");
          }
          return balance;
        } else {
          throw new Error("Invalid response from Block Explorer.");
        }
      });
  }

  /**
   * Updates the wallet display on the webpage.
   * If the wallet balance is below 1 Pi, it prompts the user to deposit by using the Send Pi function.
   */
  function updateWalletDisplay() {
    const walletEl = document.getElementById("walletDisplay");
    if (walletEl) {
      getWalletBalance()
        .then((balance) => {
          if (balance < 1) {
            walletEl.textContent = "Deposit funds via 'Send Pi to AI4Pi' to view the wallet balance.";
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

  // Periodically update the wallet display every 5 seconds for testing and debugging.
  setInterval(updateWalletDisplay, 5000);

  // Expose functions globally so other modules can trigger updates.
  window.getWalletBalance = getWalletBalance;
  window.updateWalletDisplay = updateWalletDisplay;
})();
