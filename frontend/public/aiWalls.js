// aiWalls.js

// List of bots (and their walls)
const aiList = ["Pi", "Moti", "Sol", "Math"];

// Global objects for inactivity timers.
let inactivityTimers = {};

// Global cache for ZenQuotes (for Moti)
let zenQuotesCache = [];

/**
 * Fetches a response for a given bot by calling its designated API.
 * Returns a Promise that resolves to a string.
 */
function getBotResponse(botName) {
  switch (botName) {
    case "Pi":
      // JokeAPI v2: returns a joke.
      return fetch("https://v2.jokeapi.dev/joke/Any?type=single")
        .then(res => res.json())
        .then(data => {
          console.log("[DEBUG] Pi API response:", data);
          return data.joke || "No joke available.";
        })
        .catch(err => {
          console.error("[DEBUG] Pi API error:", err);
          return "Oops, couldn't fetch a joke.";
        });
    case "Moti":
      // ZenQuotes API for motivational quotes.
      if (zenQuotesCache.length === 0) {
        return fetch("https://zenquotes.io/api/random")
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              zenQuotesCache = data;
              console.log("[DEBUG] Moti API response:", data);
              return data[0].q + " — " + data[0].a;
            }
            return "Stay inspired!";
          })
          .catch(err => {
            console.error("[DEBUG] Moti API error:", err);
            return "Keep pushing forward!";
          });
      } else {
        const randomQuote = zenQuotesCache[Math.floor(Math.random() * zenQuotesCache.length)];
        console.log("[DEBUG] Moti cached response:", randomQuote);
        return Promise.resolve(randomQuote.q + " — " + randomQuote.a);
      }
    case "Sol":
      // TheMealDB API for a random meal (text-only: the meal name).
      return fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        .then(res => res.json())
        .then(data => {
          if (data.meals && data.meals.length > 0) {
            console.log("[DEBUG] Sol API response:", data.meals[0]);
            return "Try: " + data.meals[0].strMeal;
          }
          return "No meal suggestion available.";
        })
        .catch(err => {
          console.error("[DEBUG] Sol API error:", err);
          return "No meal suggestion available.";
        });
    case "Math":
      // Numbers API for a random math fact.
      return fetch("http://numbersapi.com/random/math?json")
        .then(res => res.json())
        .then(data => {
          console.log("[DEBUG] Math API response:", data);
          return data.text || "Math is fascinating!";
        })
        .catch(err => {
          console.error("[DEBUG] Math API error:", err);
          return "Math is fascinating!";
        });
    default:
      return Promise.resolve("Default response.");
  }
}

/**
 * Returns a random delay between min and max (in milliseconds).
 * (Now slower: between 7000 and 10000 ms for candidate responses.)
 */
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates a 2x2 grid of walls—one for each bot—and appends it to #aiWallsRoot.
 * Adjusts conversation text size to be smaller.
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
    convo.style.fontSize = "12px"; // Smaller text for more content.
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
 * Global timer to trigger spontaneous bot responses.
 * Every 15 seconds, a random wall and bot are chosen to generate a response.
 */
function startGlobalBotChat() {
  setInterval(() => {
    const randomWall = aiList[Math.floor(Math.random() * aiList.length)];
    const randomBot = aiList[Math.floor(Math.random() * aiList.length)];
    postAIResponse(randomWall, randomBot, "(global)");
  }, 15000); // every 15 seconds
}

/**
 * Resets the inactivity timer for a given wall.
 * If no new message is posted on that wall for 8 seconds,
 * a random bot posts an auto response and then initiates a chain sequence.
 */
function resetInactivityTimer(wallName) {
  if (inactivityTimers[wallName]) {
    clearTimeout(inactivityTimers[wallName]);
  }
  inactivityTimers[wallName] = setTimeout(() => {
    const bot = aiList[Math.floor(Math.random() * aiList.length)];
    postAIResponse(wallName, bot, "(auto)");
    chainResponses(wallName, bot, [0.9, 0.5, 0.8, 0.2], 0);
    resetInactivityTimer(wallName);
  }, 8000); // 8 seconds inactivity
}

/**
 * Recursively triggers chain responses after an auto response.
 * Each chain response is delayed by 6 seconds.
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
  }, 6000); // 6 seconds delay for each chain response
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
 * A primary responder is chosen after 6 seconds,
 * and each other candidate has a 50% chance to respond after a random delay between 7 and 10 seconds.
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
  }, 6000); // primary response after 6 seconds
  candidates.forEach(bot => {
    if (bot !== primary && Math.random() < 0.5) {
      const delay = getRandomDelay(7000, 10000); // delay between 7 and 10 seconds
      setTimeout(() => {
        postAIResponse(wallName, bot, "");
      }, delay);
    }
  });
}

/**
 * Posts an AI response from a given bot to a given wall.
 * The tag parameter indicates if the response is auto, chain, or global.
 * The response text is obtained from getBotResponse(botName).
 */
function postAIResponse(wallName, botName, tag) {
  getBotResponse(botName).then(responseText => {
    let displayTag = tag ? ` ${tag}` : "";
    appendMessage(wallName, `${botName}${displayTag}: ${responseText}`);
  });
}

/**
 * Initialize the UI and start the global bot chat when the DOM content is loaded.
 */
window.addEventListener("DOMContentLoaded", () => {
  createWallsUI();
  startGlobalBotChat();
});
