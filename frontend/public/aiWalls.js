// aiWalls.js

// List of bots (and their walls)
const aiList = ["Pi", "Moti", "Sol", "Math"];

// Global objects for inactivity timers.
let inactivityTimers = {};

// Global cache for motivational quotes (for Moti)
let motivationalQuotes = [];

/**
 * Fetches a response for a given bot by calling its designated API.
 * Returns a Promise that resolves to a string.
 */
function getBotResponse(botName) {
  switch (botName) {
    case "Pi":
      // JokeAPI v2: returns a joke (single type)
      return fetch("https://v2.jokeapi.dev/joke/Any?type=single")
        .then(res => res.json())
        .then(data => data.joke || "No joke today.")
        .catch(err => "Oops, couldn't get a joke.");
    case "Moti":
      // Type.fit API for motivational quotes.
      // Cache the quotes on first fetch.
      if (motivationalQuotes.length === 0) {
        return fetch("https://type.fit/api/quotes")
          .then(res => res.json())
          .then(data => {
            motivationalQuotes = data.map(q => q.text).filter(Boolean);
            return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)] || "Stay motivated!";
          })
          .catch(err => "Keep pushing forward!");
      } else {
        return Promise.resolve(
          motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)] || "Stay motivated!"
        );
      }
    case "Sol":
      // TheMealDB API for a random meal. We'll return the meal name.
      return fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        .then(res => res.json())
        .then(data => {
          if (data.meals && data.meals.length > 0) {
            return "Try: " + data.meals[0].strMeal;
          }
          return "No meal suggestion available.";
        })
        .catch(err => "No meal suggestion available.");
    case "Math":
      // Numbers API for a random math fact.
      return fetch("http://numbersapi.com/random/math?json")
        .then(res => res.json())
        .then(data => data.text || "Math is fascinating!")
        .catch(err => "Math is fascinating!")
    default:
      return Promise.resolve("Default response.");
  }
}

/**
 * Returns a random delay between min and max (in milliseconds).
 */
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates a 2x2 grid of walls—one for each bot—and appends it to #aiWallsRoot.
 */
function createWallsUI() {
  const aiWallsRoot = document.getElementById("aiWallsRoot");
  if (!aiWallsRoot) {
    console.warn("No #aiWallsRoot found in HTML. AI walls won't be displayed.");
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

    // Header with bot's name.
    const header = document.createElement("h3");
    header.id = "header-" + aiName;
    header.textContent = `${aiName}`;
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
 * Resets the inactivity timer for a given wall.
 * If no new message is posted for 5 seconds, a random bot posts an auto response
 * and then a chain sequence is initiated.
 */
function resetInactivityTimer(wallName) {
  if (inactivityTimers[wallName]) {
    clearTimeout(inactivityTimers[wallName]);
  }
  inactivityTimers[wallName] = setTimeout(() => {
    const bot = aiList[Math.floor(Math.random() * aiList.length)];
    // Auto response:
    postAIResponse(bot, wallName, "(auto)");
    // Initiate chain responses with probabilities.
    chainResponses(wallName, bot, [0.9, 0.5, 0.8, 0.2], 0);
    resetInactivityTimer(wallName);
  }, 5000);
}

/**
 * Recursively triggers chain responses after an auto response.
 * Each chain response is delayed by 1 second.
 */
function chainResponses(wallName, lastResponder, probabilities, index) {
  if (index >= probabilities.length) return;
  setTimeout(() => {
    if (Math.random() < probabilities[index]) {
      const candidates = aiList.filter(bot => bot !== lastResponder);
      if (candidates.length === 0) return;
      const responder = candidates[Math.floor(Math.random() * candidates.length)];
      postAIResponse(wallName, responder, "(chain)");
      chainResponses(wallName, responder, probabilities, index + 1);
    }
  }, 1000);
}

/**
 * Appends a message to the conversation area for a given wall.
 * Also resets that wall's inactivity timer.
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
 */
function handleUserMessage(wallName) {
  const input = document.getElementById(`input-${wallName}`);
  const message = input.value.trim();
  if (!message) return;
  appendMessage(wallName, `User: ${message}`);
  input.value = "";
  handleMessage(wallName, "User");
}

/**
 * General message handler for both user and bot messages.
 * - If sender is "User": all bots are candidates.
 * - If sender is a bot: all other bots are candidates.
 * A primary responder is chosen after 2 seconds,
 * and each other candidate has a 50% chance to respond after a random delay (3-8 seconds).
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
    postAIResponse(wallName, primary, "");
  }, 2000);

  candidates.forEach(bot => {
    if (bot !== primary && Math.random() < 0.5) {
      const delay = getRandomDelay(3000, 8000);
      setTimeout(() => {
        postAIResponse(wallName, bot, "");
      }, delay);
    }
  });
}

/**
 * Posts an AI response from a given bot on a given wall.
 * The tag parameter is used to indicate if the response is auto or chain.
 * This function calls getBotResponse(botName) and appends the response text.
 */
function postAIResponse(wallName, botName, tag) {
  getBotResponse(botName).then(responseText => {
    let displayTag = tag ? ` ${tag}` : "";
    appendMessage(wallName, `${botName}${displayTag}: ${responseText}`);
  });
}

/**
 * Initialize the UI when the DOM content is loaded.
 */
window.addEventListener("DOMContentLoaded", () => {
  createWallsUI();
});
