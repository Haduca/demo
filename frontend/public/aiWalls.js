// aiWalls.js

// List of bots (and their walls)
const aiList = ["Pi", "Moti", "Sol", "Math"];

// Global objects for inactivity timers.
let inactivityTimers = {};

// Global variables for lightweight models for Moti and Math.
let motiModel = null;
let mathModel = null;

// Placeholder URLs for the TF.js models (you must replace these with actual URLs)
const MOTI_MODEL_URL = "https://storage.googleapis.com/tfjs-models/gpt2/model.json";
const MATH_MODEL_URL = "https://storage.googleapis.com/tfjs-models/gpt2/model.json";

/**
 * Loads the Moti model if not already loaded.
 */
async function loadMotiModel() {
  if (!motiModel) {
    try {
      motiModel = await tf.loadGraphModel(MOTI_MODEL_URL);
      console.log("[DEBUG] Moti model loaded.");
    } catch (err) {
      console.error("[DEBUG] Error loading Moti model:", err);
    }
  }
  return motiModel;
}

/**
 * Loads the Math model if not already loaded.
 */
async function loadMathModel() {
  if (!mathModel) {
    try {
      mathModel = await tf.loadGraphModel(MATH_MODEL_URL);
      console.log("[DEBUG] Math model loaded.");
    } catch (err) {
      console.error("[DEBUG] Error loading Math model:", err);
    }
  }
  return mathModel;
}

/**
 * A pseudo-code function to generate text using a loaded model and a prompt.
 * In a real implementation, you would tokenize the prompt, run it through the model,
 * and decode the output tokens to text.
 */
async function generateText(model, prompt) {
  // Pseudo-code: In an actual implementation, you'd use your tokenizer and model here.
  // For demonstration, we simply return the prompt with some random variation.
  const variations = [
    prompt + " Stay strong and shine!",
    prompt + " Believe in yourself!",
    prompt + " Every moment counts!",
    prompt + " Keep pushing forward!",
    prompt + " The future is bright!"
  ];
  const choice = variations[Math.floor(Math.random() * variations.length)];
  return choice;
}

/**
 * Fetches a response for a given bot.
 * For Pi and Sol, uses public APIs.
 * For Moti and Math, uses the loaded TF.js model to generate text.
 */
function getBotResponse(botName) {
  switch (botName) {
    case "Pi":
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
      return loadMotiModel().then(model => {
        if (model) {
          const prompt = "Motivational:";
          return generateText(model, prompt);
        } else {
          return "Stay inspired!";
        }
      }).catch(err => {
        console.error("[DEBUG] Moti model error:", err);
        return "Keep pushing forward!";
      });
    case "Sol":
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
      return loadMathModel().then(model => {
        if (model) {
          const prompt = "Math fact:";
          return generateText(model, prompt);
        } else {
          return "Math is fascinating!";
        }
      }).catch(err => {
        console.error("[DEBUG] Math model error:", err);
        return "Math is fascinating!";
      });
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
 * Sets conversation font size smaller to display more text.
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
    convo.style.fontSize = "12px";
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
 * Global timer that triggers spontaneous bot responses.
 * Every 15 seconds, a random wall and bot are chosen to generate a response.
 */
function startGlobalBotChat() {
  setInterval(() => {
    const randomWall = aiList[Math.floor(Math.random() * aiList.length)];
    const randomBot = aiList[Math.floor(Math.random() * aiList.length)];
    postAIResponse(randomWall, randomBot, "(global)");
  }, 15000);
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
  }, 8000);
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
  }, 6000);
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
  }, 6000);
  candidates.forEach(bot => {
    if (bot !== primary && Math.random() < 0.5) {
      const delay = getRandomDelay(7000, 10000);
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
