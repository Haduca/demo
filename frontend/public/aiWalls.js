// aiWalls.js

// List of early AIs (and their "walls")
const aiList = ["Pi", "Moti", "Sol", "Math"];

// Global objects for inactivity timers, bot scores, and consecutive response tracking.
let inactivityTimers = {};
let botScores = {
  "Pi": 0,
  "Moti": 0,
  "Sol": 0,
  "Math": 0
};
let lastBotResponse = {};  // Maps each wallName to { bot: <botName>, count: <number> }

/**
 * Returns a random letter (A-Z)
 */
function getRandomLetter() {
  const code = 65 + Math.floor(Math.random() * 26);
  return String.fromCharCode(code);
}

/**
 * Returns a random delay between min and max (in milliseconds)
 */
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates a scoreboard above the AI walls to display bot scores.
 */
function createScoreboard() {
  const scoreboard = document.createElement("div");
  scoreboard.id = "scoreboard";
  scoreboard.style.background = "#fff";
  scoreboard.style.border = "1px solid #ccc";
  scoreboard.style.padding = "10px";
  scoreboard.style.margin = "10px auto";
  scoreboard.style.width = "90%";
  scoreboard.style.maxWidth = "800px";
  scoreboard.style.textAlign = "center";
  updateScoreboard();
  // Insert scoreboard at the top of the AI walls section.
  const aiWallsRoot = document.getElementById("aiWallsRoot");
  if (aiWallsRoot && aiWallsRoot.parentNode) {
    aiWallsRoot.parentNode.insertBefore(scoreboard, aiWallsRoot);
  } else {
    document.body.insertBefore(scoreboard, document.body.firstChild);
  }
}

/**
 * Updates the scoreboard UI with current bot scores.
 */
function updateScoreboard() {
  const scoreboard = document.getElementById("scoreboard");
  if (!scoreboard) return;
  let html = "<h3>Bot Scores</h3><ul style='list-style: none; padding: 0; margin: 0;'>";
  aiList.forEach(bot => {
    html += `<li>${bot}: ${botScores[bot].toFixed(2)} Pi</li>`;
  });
  html += "</ul>";
  scoreboard.innerHTML = html;
}

/**
 * Resets the inactivity timer for a given wall.
 * If no new message is posted on that wall for 5 seconds, a random bot posts an auto response,
 * and then a chain of responses is triggered.
 */
function resetInactivityTimer(wallName) {
  if (inactivityTimers[wallName]) {
    clearTimeout(inactivityTimers[wallName]);
  }
  inactivityTimers[wallName] = setTimeout(() => {
    // Choose a random bot for the auto response.
    const bot = aiList[Math.floor(Math.random() * aiList.length)];
    appendMessage(wallName, `${bot} (auto): ${getRandomLetter()}`);
    // Trigger a chain of responses with given probabilities.
    chainResponses(wallName, bot, [0.9, 0.5, 0.8, 0.2], 0);
    // Reset the timer after the chain.
    resetInactivityTimer(wallName);
  }, 5000);
}

/**
 * Recursively triggers chain responses after an auto response.
 * @param {string} wallName - The wall where responses are posted.
 * @param {string} lastResponder - The bot that posted last.
 * @param {number[]} probabilities - Array of probabilities for chain responses.
 * @param {number} index - Current chain stage.
 */
function chainResponses(wallName, lastResponder, probabilities, index) {
  if (index >= probabilities.length) return;
  setTimeout(() => {
    if (Math.random() < probabilities[index]) {
      const candidates = aiList.filter(bot => bot !== lastResponder);
      if (candidates.length === 0) return;
      const responder = candidates[Math.floor(Math.random() * candidates.length)];
      appendMessage(wallName, `${responder} (chain): ${getRandomLetter()}`);
      // Update lastBotResponse for chain responses as well.
      lastBotResponse[wallName] = { bot: responder, count: 1 };
      // Continue chain with responder as the last poster.
      chainResponses(wallName, responder, probabilities, index + 1);
    }
  }, 1000);
}

/**
 * Creates a 2x2 grid of walls (one for each AI) and appends it to #aiWallsRoot.
 */
function createWallsUI() {
  const aiWallsRoot = document.getElementById("aiWallsRoot");
  if (!aiWallsRoot) {
    console.warn("No #aiWallsRoot found. AI walls won't be displayed.");
    return;
  }

  const container = document.createElement("div");
  container.id = "aiWallsContainer";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "1fr 1fr";
  container.style.gridGap = "20px";
  container.style.width = "90%";
  container.style.maxWidth = "800px";
  container.style.margin = "20px auto";

  aiList.forEach((aiName) => {
    const wall = document.createElement("div");
    wall.className = "aiWall";
    wall.style.border = "2px solid #007BFF";
    wall.style.borderRadius = "5px";
    wall.style.padding = "10px";
    wall.style.height = "300px";
    wall.style.display = "flex";
    wall.style.flexDirection = "column";
    wall.style.justifyContent = "space-between";

    // Header with the wall name.
    const header = document.createElement("h3");
    header.textContent = aiName;
    header.style.margin = "0 0 10px 0";
    wall.appendChild(header);

    // Conversation area.
    const convo = document.createElement("div");
    convo.className = "conversation";
    convo.style.flexGrow = "1";
    convo.style.overflowY = "auto";
    convo.style.backgroundColor = "#f9f9f9";
    convo.style.padding = "5px";
    convo.style.marginBottom = "10px";
    convo.style.border = "1px solid #ccc";
    convo.style.borderRadius = "3px";
    convo.id = `convo-${aiName}`;
    wall.appendChild(convo);

    // Input area: textbox and send button.
    const inputContainer = document.createElement("div");
    inputContainer.style.display = "flex";
    inputContainer.style.gap = "5px";

    const inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Type here...";
    inputBox.style.flexGrow = "1";
    inputBox.id = `input-${aiName}`;

    const sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    sendButton.addEventListener("click", () => {
      handleUserMessage(aiName);
    });
    inputBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleUserMessage(aiName);
      }
    });

    inputContainer.appendChild(inputBox);
    inputContainer.appendChild(sendButton);
    wall.appendChild(inputContainer);

    container.appendChild(wall);
  });

  aiWallsRoot.appendChild(container);
}

/**
 * Appends a message to the conversation area for a given wall and resets that wall's inactivity timer.
 */
function appendMessage(wallName, text) {
  const convo = document.getElementById(`convo-${wallName}`);
  if (!convo) return;
  const p = document.createElement("p");
  p.textContent = text;
  p.style.margin = "5px 0";
  convo.appendChild(p);
  convo.scrollTop = convo.scrollHeight;
  resetInactivityTimer(wallName);
}

/**
 * Handles a user message on a given wall.
 * Resets the consecutive bot response tracker for that wall.
 */
function handleUserMessage(wallName) {
  const input = document.getElementById(`input-${wallName}`);
  const message = input.value.trim();
  if (!message) return;
  appendMessage(wallName, `User: ${message}`);
  input.value = "";
  // Reset consecutive bot response tracking for this wall.
  lastBotResponse[wallName] = null;
  handleMessage(wallName, "User");
}

/**
 * General message handler for both user and bot messages.
 * - If sender is "User": all bots are candidates.
 * - If sender is a bot: all other bots are candidates.
 * A primary responder is chosen (after a 2s delay) and others may respond (50% chance, delay 3-8s).
 */
function handleMessage(wallName, sender) {
  let candidates;
  if (sender === "User") {
    candidates = [...aiList]; // All bots are candidates.
  } else {
    candidates = aiList.filter(bot => bot !== sender); // Exclude sender bot.
  }
  if (candidates.length === 0) return;

  const primary = candidates[Math.floor(Math.random() * candidates.length)];
  setTimeout(() => {
    postAIResponse(primary, wallName);
  }, 2000);

  candidates.forEach(bot => {
    if (bot !== primary && Math.random() < 0.5) {
      const delay = getRandomDelay(3000, 8000);
      setTimeout(() => {
        postAIResponse(bot, wallName);
      }, delay);
    }
  });
}

/**
 * Posts an AI response (a random letter) from the given bot to the specified wall.
 * Also tracks consecutive responses and awards bonus if a bot responds twice in a row.
 */
function postAIResponse(botName, wallName) {
  const letter = getRandomLetter();

  // Track consecutive responses per wall.
  if (lastBotResponse[wallName] && lastBotResponse[wallName].bot === botName) {
    lastBotResponse[wallName].count += 1;
  } else {
    lastBotResponse[wallName] = { bot: botName, count: 1 };
  }

  // If this bot has responded twice consecutively on the wall, award bonus.
  if (lastBotResponse[wallName].count >= 2) {
    // Get current accumulated drip from localStorage.
    let drip = parseFloat(localStorage.getItem("dripAmount")) || 0;
    let bonus = 0.1 * drip;
    botScores[botName] += bonus;
    updateScoreboard();
    // Reset consecutive count for this wall to avoid repeated awards.
    lastBotResponse[wallName].count = 0;
  }

  appendMessage(wallName, `${botName}: ${letter} (score: ${botScores[botName].toFixed(2)})`);
}

// Initialize scoreboard and walls when the DOM content is loaded.
window.addEventListener("DOMContentLoaded", () => {
  createScoreboard();
  createWallsUI();
});
