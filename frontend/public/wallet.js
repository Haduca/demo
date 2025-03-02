// wallet.js

(function() {
  /**
   * Retrieves the wallet balance using the Pi SDK.
   * Returns a Promise that resolves to a number (the balance).
   * If the function is not available or an error occurs, the Promise is rejected.
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
   * Sets the wallet balance using the Pi SDK.
   * Note: In a real environment, you don't directly set a wallet balance.
   * For deposits/withdrawals, you would use transaction methods.
   * This function assumes Pi SDK has a hypothetical setBalance() for debugging.
   */
  function setWalletBalance(newBalance) {
    return new Promise((resolve, reject) => {
      if (window.Pi && typeof window.Pi.setBalance === 'function') {
        window.Pi.setBalance(newBalance)
          .then(() => {
            resolve(newBalance);
          })
          .catch((error) => {
            reject(new Error("Error setting wallet balance: " + error.message));
          });
      } else {
        reject(new Error("Pi SDK setBalance() function not available."));
      }
    });
  }

  /**
   * Updates the wallet display on the webpage.
   * If the wallet balance is below 1 Pi, prompts the user to deposit.
   * If an error occurs, displays the error message.
   */
  function updateWalletDisplay() {
    const walletEl = document.getElementById("walletDisplay");
    if (walletEl) {
      getWalletBalance()
        .then((balance) => {
          if (balance < 1) {
            walletEl.textContent = "Please deposit at least 1 Pi to view the real wallet balance.";
          } else {
            walletEl.textContent = "Wallet Balance: " + balance.toFixed(2) + " Pi";
          }
        })
        .catch((error) => {
          walletEl.textContent = "Error retrieving wallet balance: " + error.message;
          console.error("Error in updateWalletDisplay:", error);
        });
    }
  }

  /**
   * Initiates a deposit transaction.
   * This function calls the Pi SDK deposit method to deposit 1 Pi into the AI4Pi wallet.
   * On success, the wallet display is updated.
   */
  function depositPi() {
    if (window.Pi && typeof window.Pi.deposit === 'function') {
      window.Pi.deposit({ amount: 1, to: "AI4Pi_wallet_address" })
        .then((txResult) => {
          console.log("Deposit transaction result:", txResult);
          updateWalletDisplay();
        })
        .catch((error) => {
          console.error("Error during deposit transaction:", error);
          alert("Error depositing Pi: " + error.message);
        });
    } else {
      alert("Deposit function not available in the Pi SDK.");
    }
  }

  /**
   * Initiates a withdrawal transaction.
   * Prompts the user for an amount to withdraw and ensures the wallet does not drop below 1 Pi.
   * Uses the Pi SDK withdraw method for the transaction.
   */
  function withdrawPi() {
    let amountStr = prompt("Enter amount to withdraw (in Pi):", "0.5");
    let amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid withdrawal amount.");
      return;
    }
    getWalletBalance()
      .then((balance) => {
        if (balance - amount < 1) {
          alert("Withdrawal would leave wallet balance below 1 Pi. Operation aborted.");
        } else {
          if (window.Pi && typeof window.Pi.withdraw === 'function') {
            window.Pi.withdraw({ amount: amount, to: "user_wallet_address" })
              .then((txResult) => {
                console.log("Withdrawal transaction result:", txResult);
                updateWalletDisplay();
                alert("Withdrawal successful.");
              })
              .catch((error) => {
                console.error("Error during withdrawal transaction:", error);
                alert("Error withdrawing Pi: " + error.message);
              });
          } else {
            alert("Withdrawal function not available in the Pi SDK.");
          }
        }
      })
      .catch((error) => {
        alert("Error retrieving balance for withdrawal: " + error.message);
      });
  }

  // Periodically update the wallet display (every 5 seconds) for debugging purposes.
  setInterval(updateWalletDisplay, 5000);

  // Expose the functions globally.
  window.getWalletBalance = getWalletBalance;
  window.setWalletBalance = setWalletBalance;
  window.updateWalletDisplay = updateWalletDisplay;
  window.depositPi = depositPi;
  window.withdrawPi = withdrawPi;
})();
