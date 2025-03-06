// aiWalls.js

// Constant for speeding up text production by 2.5x
const speedFactor = 1 / 2.5; // equivalent to 0.4

// List of bots (and their walls)
const aiList = ["Pi", "Moti", "Sol", "Math"];

// Global objects for inactivity timers.
let inactivityTimers = {};

// Global score tracker for each bot.
let scores = {
  Pi: 0,
  Moti: 0,
  Sol: 0,
  Math: 0
};

// Global Pi values for each bot.
let piValues = {
  Pi: 0,
  Moti: 0,
  Sol: 0,
  Math: 0
};

/**
 * Helper function to generate a sentence from conversation context using a simple
 * Subject + Verb + Object structure. It uses words from the provided context.
 */
function generateSentenceFromContext(context) {
  // Split context into words and filter out empties.
  const words = context.split(/\s+/).filter(word => word.trim() !== "");
  // Pre-defined list of common verbs.
  const commonVerbs = ["is", "are", "has", "have", "runs", "jumps", "says", "goes", "feels", "seems", "loves", "hates", "wants"];
  
  // Candidate subjects: words starting with an uppercase letter.
  const candidateSubjects = words.filter(word => /^[A-Z]/.test(word));
  // Candidate verbs: words that are in our commonVerbs list.
  const candidateVerbs = words.filter(word => commonVerbs.includes(word.toLowerCase()));
  // Candidate objects: words that consist solely of letters.
  const candidateObjects = words.filter(word => /^[A-Za-z]+$/.test(word));
  
  // Select random elements, with fallback defaults.
  const subject = candidateSubjects.length > 0 ? candidateSubjects[Math.floor(Math.random() * candidateSubjects.length)] : "Someone";
  const verb = candidateVerbs.length > 0 ? candidateVerbs[Math.floor(Math.random() * candidateVerbs.length)] : "seems";
  const object = candidateObjects.length > 0 ? candidateObjects[Math.floor(Math.random() * candidateObjects.length)] : "something";
  
  // Construct sentence.
  let sentence = subject + " " + verb + " " + object;
  // Capitalize first letter.
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  // Ensure proper ending punctuation.
  if (!/[.!?]$/.test(sentence)) {
    sentence += ".";
  }
  return sentence;
}

/**
 * Fetches a response for a given bot by calling its designated API.
 * Now accepts a second parameter (wallName) to allow Math to analyze the conversation context.
 * Returns a Promise that resolves to a string.
 */
function getBotResponse(botName, wallName) {
  switch (botName) {
    case "Pi":
      // JokeAPI v2 for jokes.
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
      return fetch("/data/story.json")
        .then(res => res.json())
        .then(sentences => {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          const sentence = sentences[randomIndex];
          console.log("[DEBUG] Moti story sentence:", sentence);
          return sentence;
        })
        .catch(err => {
          console.error("[DEBUG] Moti story fetch error:", err);
          return "Stay inspired!";
        });
   case "Sol":
      return fetch("/public/data/funfacts.json")
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            const randomFact = data[Math.floor(Math.random() * data.length)];
            console.log("[DEBUG] Sol fun fact:", randomFact);
            return "Fun Fact: " + randomFact;
          }
          return "No fun facts available.";
        })
        .catch(err => {
          console.error("[DEBUG] Sol API error:", err);
          return "No fun facts available.";
        });
    case "Math": {
      // Retrieve the conversation context from the current wall.
      const convo = document.getElementById(`convo-${wallName}`);
      let context = "";
      if (convo) {
        const messages = convo.getElementsByTagName("p");
        const contextMessages = [];
        // Gather all messages.
        for (let i = 0; i < messages.length; i++) {
          contextMessages.push(messages[i].textContent);
        }
        context = contextMessages.join(" ");
      }
      if (context.trim().length > 0) {
        // Remove any bot names (e.g., "Pi:", "Moti:", "Sol:", "Math:") from the context.
        const filteredContext = context.replace(/\b(Pi|Moti|Sol|Math):/g, "");
        // Use our helper to generate a new sentence.
        const newSentence = generateSentenceFromContext(filteredContext);
        console.log("[DEBUG] Math bot generated sentence:", newSentence);
        return Promise.resolve(newSentence);
      } else {
        return Promise.resolve("I'm here to join the conversation!");
      }
    }
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
 * Updates the header for a given bot's wall to reflect its current score and Pi value.
 */
function updateHeader(botName) {
  const header = document.getElementById(`header-${botName}`);
  if (header) {
    header.textContent = `${botName} (Score: ${scores[botName]}, Pi: ${piValues[botName].toFixed(2)})`;
  }
}

/**
 * Resets the scores for all bots to 0 and updates their headers.
 */
function resetAllScores() {
  aiList.forEach(bot => {
    scores[bot] = 0;
    updateHeader(bot);
  });
}

/**
 * Creates a 2x2 grid of walls—one for each bot—and appends it to #aiWallsRoot.
 * The header now displays the bot's name, current score, and accumulated Pi.
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

    // Header with bot's name, score, and Pi value.
    const header = document.createElement("h3");
    header.id = "header-" + aiName;
    header.textContent = `${aiName} (Score: ${scores[aiName]}, Pi: ${piValues[aiName].toFixed(2)})`;
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
 * Every 20 seconds (adjusted by speedFactor), a random wall and random bot are chosen to generate a response.
 */
function startGlobalBotChat() {
  setInterval(() => {
    const randomWall = aiList[Math.floor(Math.random() * aiList.length)];
    const randomBot = aiList[Math.floor(Math.random() * aiList.length)];
    postAIResponse(randomWall, randomBot, "");
  }, 20000 * speedFactor);
}

/**
 * Resets the inactivity timer for a given wall.
 * If no new message is posted on that wall for 13 seconds (adjusted by speedFactor),
 * a random bot posts an auto response and then initiates a chain sequence.
 */
function resetInactivityTimer(wallName) {
  if (inactivityTimers[wallName]) {
    clearTimeout(inactivityTimers[wallName]);
  }
  inactivityTimers[wallName] = setTimeout(() => {
    const bot = aiList[Math.floor(Math.random() * aiList.length)];
    postAIResponse(wallName, bot, "");
    chainResponses(wallName, bot, [0.9, 0.5, 0.8, 0.2], 0);
    resetInactivityTimer(wallName);
  }, 13000 * speedFactor);
}

/**
 * Recursively triggers chain responses after an auto response.
 * Each chain response is delayed by 11 seconds (adjusted by speedFactor).
 */
function chainResponses(wallName, lastResponder, probabilities, index) {
  if (index >= probabilities.length) return;
  setTimeout(() => {
    if (Math.random() < probabilities[index]) {
      const candidates = aiList.filter(bot => bot !== lastResponder);
      if (candidates.length === 0) return;
      const responder = candidates[Math.floor(Math.random() * candidates.length)];
      postAIResponse(wallName, responder, "");
      chainResponses(wallName, responder, probabilities, index + 1);
    }
  }, 11000 * speedFactor);
}

/**
 * Appends a message to the conversation area for a given wall.
 * Also resets that wall's inactivity timer.
 */
function appendMessage(wallName, text, sender) {
  const convo = document.getElementById(`convo-${wallName}`);
  if (!convo) return;
  const p = document.createElement("p");
  p.textContent = text;
  p.setAttribute("data-sender", sender);
  p.style.margin = "5px 0";
  convo.appendChild(p);
  convo.scrollTop = convo.scrollHeight;
  
  // Check for consecutive bot messages.
  if (aiList.includes(sender)) {
    const messages = convo.getElementsByTagName("p");
    if (messages.length >= 2) {
      const prevSender = messages[messages.length - 2].getAttribute("data-sender");
      if (prevSender === sender) {
        scores[sender]++;
        updateHeader(sender);
        if (scores[sender] >= 5) {
          const currentDrip = window.getPiDripAccumulated();
          const reward = currentDrip * 0.05;
          piValues[sender] += reward;
          window.setPiDripAccumulated(currentDrip - reward);
          console.log(`[DEBUG] ${sender} earned a reward of ${reward.toFixed(2)} Pi. New drip: ${window.getPiDripAccumulated().toFixed(2)}`);
          updateHeader(sender);
          resetAllScores();
        }
      }
    }
  }
  
  resetInactivityTimer(wallName);
}

/**
 * Handles a user message on a given wall.
 */
function handleUserMessage(wallName) {
  const input = document.getElementById(`input-${wallName}`);
  const message = input.value.trim();
  if (!message) return;
  appendMessage(wallName, `User: ${message}`, "User");
  input.value = "";
  handleMessage(wallName, "User");
}

/**
 * General message handler for both user and bot messages.
 * All bots are candidates for a response, with a primary responder chosen after 11 seconds.
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
  }, 11000 * speedFactor);
  candidates.forEach(bot => {
    if (bot !== primary && Math.random() < 0.5) {
      const delay = getRandomDelay(12000, 15000) * speedFactor;
      setTimeout(() => {
        postAIResponse(wallName, bot, "");
      }, delay);
    }
  });
}

/**
 * Posts an AI response from a given bot to a given wall.
 * No extra tags are appended to the bot's name.
 */
function postAIResponse(wallName, botName, tag) {
  getBotResponse(botName, wallName).then(responseText => {
    appendMessage(wallName, `${botName}: ${responseText}`, botName);
  });
}

/**
 * Initialize the UI and start the global bot chat when the DOM content is loaded.
 */
window.addEventListener("DOMContentLoaded", () => {
  createWallsUI();
  startGlobalBotChat();
});
