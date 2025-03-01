// aiWalls.js

// List of early AIs (and their "walls")
const aiList = ["Pi", "Moti", "Sol", "Math"];

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
 * Creates a 2x2 grid of walls—one for each AI.
 */
function createWallsUI() {
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

    // Header with the wall name
    const header = document.createElement("h3");
    header.textContent = aiName;
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

  document.body.appendChild(container);
}

/**
 * Appends a message to the conversation area for the specified wall.
 */
function appendMessage(wallName, text) {
  const convo = document.getElementById(`convo-${wallName}`);
  if (!convo) return;
  const messagePara = document.createElement("p");
  messagePara.textContent = text;
  messagePara.style.margin = "5px 0";
  convo.appendChild(messagePara);
  convo.scrollTop = convo.scrollHeight;
}

/**
 * Handles a user message in a given wall.
 */
function handleUserMessage(wallName) {
  const input = document.getElementById(`input-${wallName}`);
  const message = input.value.trim();
  if (!message) return;
  appendMessage(wallName, `User: ${message}`);
  input.value = "";
  // Process the message with sender as "User"
  handleMessage(wallName, "User");
}

/**
 * General message handler for both user and bot messages.
 * When a message is posted in a wall:
 * - If the sender is "User", available responder candidates are all bots.
 * - If the sender is a bot, available responder candidates are all bots except the one that just posted.
 * A primary responder is chosen randomly to respond after 2 seconds,
 * and each remaining candidate has a 50% chance to respond after a random delay (3-8 seconds).
 */
function handleMessage(wallName, sender) {
  let responderCandidates;
  if (sender === "User") {
    // All bots are candidates
    responderCandidates = [...aiList];
  } else {
    // Exclude the bot that just posted
    responderCandidates = aiList.filter(bot => bot !== sender);
  }
  if (responderCandidates.length === 0) return;

  // Choose a primary responder randomly from the candidates
  const primaryResponder = responderCandidates[Math.floor(Math.random() * responderCandidates.length)];
  setTimeout(() => {
    postAIResponse(primaryResponder, wallName);
  }, 2000);

  // For each remaining candidate, 50% chance to respond after a random delay (3-8 seconds)
  responderCandidates.forEach(bot => {
    if (bot !== primaryResponder && Math.random() < 0.5) {
      const delay = getRandomDelay(3000, 8000);
      setTimeout(() => {
        postAIResponse(bot, wallName);
      }, delay);
    }
  });
}

/**
 * Posts an AI response (a single random letter) from the specified bot to the specified wall.
 */
function postAIResponse(botName, wallName) {
  const letter = getRandomLetter();
  appendMessage(wallName, `${botName}: ${letter}`);
}

// Initialize the walls UI once the DOM content is loaded.
window.addEventListener("DOMContentLoaded", () => {
  createWallsUI();
});
