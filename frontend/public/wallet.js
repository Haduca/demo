// wallet.js

(function() {
  // Fallback simulated wallet balance (in Pi)
  let simulatedWalletBalance = 100;

  /**
   * Retrieves the wallet balance.
   * If the Pi SDK provides a getBalance() function, it is used.
   * Otherwise, the simulated balance is returned.
   * Returns a Promise that resolves to a number.
   */
  function getWalletBalance() {
    return new Promise((resolve, reject) => {
      if (window.Pi && typeof window.Pi.getBalance === 'function') {
        window.Pi.getBalance()
          .then((balance) => {
            const parsedBalance = parseFloat(balance);
            if (isNaN(parsedBalance)) {
              console.warn("Received non-numeric balance; using simulated balance.");
              resolve(simulatedWalletBalance);
            } else {
              resolve(parsedBalance);
            }
          })
          .catch((error) => {
            console.error("Error fetching wallet balance from Pi SDK:", error);
            resolve(simulatedWalletBalance);
          });
      } else {
        // Fallback to simulated wallet balance
        resolve(simulatedWalletBalance);
      }
    });
  }

  /**
   * Sets a new wallet balance.
   * In a real wallet, you wouldn’t typically set the balance directly,
   * but in our sandbox simulation, we update the simulated balance.
   * Returns a Promise that resolves to the new balance.
   */
  function setWalletBalance(newBalance) {
    return new Promise((resolve, reject) => {
      if (typeof newBalance !== "number" || isNaN(newBalance)) {
        reject(new Error("Invalid balance value."));
      } else {
        simulatedWalletBalance = newBalance;
        updateWalletDisplay(); // Update UI after changing balance.
        resolve(simulatedWalletBalance);
      }
    });
  }

  /**
   * Updates the wallet display on the webpage.
   * It fetches the current wallet balance and sets it in the element with id "walletDisplay".
   */
  function updateWalletDisplay() {
    const walletEl = document.getElementById("walletDisplay");
    if (walletEl) {
      getWalletBalance().then((balance) => {
        walletEl.textContent = "Wallet Balance: " + balance.toFixed(2) + " Pi";
      });
    }
  }

  // Periodically update the wallet display (every 5 seconds).
  setInterval(updateWalletDisplay, 5000);

  // Expose the functions globally so other modules can access them.
  window.getWalletBalance = getWalletBalance;
  window.setWalletBalance = setWalletBalance;
  window.updateWalletDisplay = updateWalletDisplay;
})();
