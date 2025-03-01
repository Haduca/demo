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
// For each wall, we track the last bot that responded and how many times consecutively.
let lastBotResponse = {};

// The fixed bonus awarded when a bot responds twice in a row.
const BONUS_VALUE = 0.1;

/**
 * Utility function: returns a random letter (A-Z)
 */
function getRandomLetter() {
  const charCode = 65 + Math.floor(Math.random() * 26);
  return String.fromCharCode(charCode);
}

/**
 * Utility: returns a random delay between min and max (in milliseconds)
 */
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Updates the header on the resident wall for a given bot.
 * The header element's id is "header-" + botName.
 */
function updateWallHeader(botName) {
  const header = document.getElementById("header-" + botName);
  if (header) {
    header.textContent = `${botName} (Score: ${botScores[botName].toFixed(2)} Pi)`;
  }
}

/**
 * Creates the UI for AI walls—a 2x2 grid—and appends it to the #aiWallsRoot div.
 * Each wall has a header (showing the bot's name and score), a conversation area, and an input box.
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

    // Header with the wall's resident bot name and score
    const header = document.createElement("h3");
    header.id = "header-" + aiName;
    header.textContent = `${aiName} (Score: ${botScores[aiName].toFixed(2)} Pi)`;
    header.style.margin = "0 0 10px 0";
    wall.appendChild(header);

    // Conversation area
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

    // Input area: textbox and send button
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
 * Resets the inactivity timer for a given wall.
 * If no new message is posted on that wall for 5 seconds,
 * a random bot posts an auto response, then triggers chain responses.
 */
function resetInactivityTimer(wallName) {
  if (inactivityTimers[wallName]) {
    clearTimeout(inactivityTimers[wallName]);
  }
  inactivityTimers[wallName] = setTimeout(() => {
    // Choose a random bot for auto response
    const bot = aiList[Math.floor(Math.random() * aiList.length)];
    appendMessage(wallName, `${bot} (auto): ${getRandomLetter()}`);
    chainResponses(wallName, bot, [0.9, 0.5, 0.8, 0.2], 0);
    resetInactivityTimer(wallName);
  }, 5000);
}

/**
 * Recursively triggers chain responses after an auto response.
 * Each chain response is delayed by 1 second.
 * @param {string} wallName - The wall where responses are posted.
 * @param {string} lastResponder - The bot that posted last.
 * @param {number[]} probabilities - Array of probabilities for each chain stage.
 * @param {number} index - Current chain stage index.
 */
function chainResponses(wallName, lastResponder, probabilities, index) {
  if (index >= probabilities.length) return;
  setTimeout(() => {
    if (Math.random() < probabilities[index]) {
      const candidates = aiList.filter(bot => bot !== lastResponder);
      if (candidates.length === 0) return;
      const responder = candidates[Math.floor(Math.random() * candidates.length)];
      appendMessage(wallName, `${responder} (chain): ${getRandomLetter()}`);
      lastBotResponse[wallName] = { bot: responder, count: 1 };
      chainResponses(wallName, responder, probabilities, index + 1);
    }
  }, 1000);
}

/**
 * Appends a message to the conversation area for the specified wall.
 * Also resets the inactivity timer for that wall.
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
 * Also resets consecutive response tracking for that wall.
 */
function handleUserMessage(wallName) {
  const input = document.getElementById(`input-${wallName}`);
  const message = input.value.trim();
  if (!message) return;
  appendMessage(wallName, `User: ${message}`);
  input.value = "";
  lastBotResponse[wallName] = null;
  handleMessage(wallName, "User");
}

/**
 * General message handler for both user and bot messages.
 * - If sender is "User": all bots are candidates.
 * - If sender is a bot: all other bots are candidates.
 * A primary responder is chosen after 2 seconds, and each remaining candidate has a 50% chance to respond after 3-8 seconds.
 */
function handleMessage(wallName, sender) {
  let candidates;
  if (sender === "User") {
    candidates = [...aiList];
  } else {
    candidates = aiList.filter(bot => bot !== sender);
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
 * Posts an AI response (a random letter) from the specified bot to the specified wall.
 * It tracks consecutive responses: if a bot posts twice in a row, it earns a fixed bonus.
 */
function postAIResponse(botName, wallName) {
  const letter = getRandomLetter();

  // Update consecutive response tracking for this wall.
  if (lastBotResponse[wallName] && lastBotResponse[wallName].bot === botName) {
    lastBotResponse[wallName].count += 1;
  } else {
    lastBotResponse[wallName] = { bot: botName, count: 1 };
  }

  // When a bot responds twice in a row on the same wall, award bonus.
  if (lastBotResponse[wallName].count >= 2) {
    botScores[botName] += BONUS_VALUE;
    // Update the resident wall header if this bot is the owner.
    updateWallHeader(botName);
    // Reset the consecutive counter for that wall.
    lastBotResponse[wallName].count = 0;
  }

  appendMessage(wallName, `${botName}: ${letter} (score: ${botScores[botName].toFixed(2)})`);
}

// Initialize scoreboard and walls when DOM is loaded.
window.addEventListener("DOMContentLoaded", () => {
  createWallsUI();
});
