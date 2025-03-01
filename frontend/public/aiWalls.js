// aiWalls.js

const aiList = ["Pi", "Moti", "Sol", "Math"];

function getRandomLetter() {
  const code = 65 + Math.floor(Math.random() * 26);
  return String.fromCharCode(code);
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

  aiList.forEach(aiName => {
    const wall = document.createElement("div");
    wall.className = "aiWall";
    wall.style.border = "2px solid #007BFF";
    wall.style.borderRadius = "5px";
    wall.style.padding = "10px";
    wall.style.height = "300px";
    wall.style.display = "flex";
    wall.style.flexDirection = "column";
    wall.style.justifyContent = "space-between";

    const header = document.createElement("h3");
    header.textContent = aiName;
    header.style.margin = "0 0 10px 0";
    wall.appendChild(header);

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

function appendMessage(wallName, text) {
  const convo = document.getElementById(`convo-${wallName}`);
  if (!convo) return;
  const p = document.createElement("p");
  p.textContent = text;
  p.style.margin = "5px 0";
  convo.appendChild(p);
  convo.scrollTop = convo.scrollHeight;
}

function handleUserMessage(wallName) {
  const input = document.getElementById(`input-${wallName}`);
  const message = input.value.trim();
  if (!message) return;
  appendMessage(wallName, `User: ${message}`);
  input.value = "";
  handleMessage(wallName, "User");
}

function handleMessage(wallName, sender) {
  let candidates;
  if (sender === "User") {
    // All bots
    candidates = [...aiList];
  } else {
    // All bots except the one that just posted
    candidates = aiList.filter(bot => bot !== sender);
  }
  if (candidates.length === 0) return;

  // Primary responder after 2s
  const primary = candidates[Math.floor(Math.random() * candidates.length)];
  setTimeout(() => {
    postAIResponse(primary, wallName);
  }, 2000);

  // Each other candidate has 50% chance to respond in 3-8s
  candidates.forEach(bot => {
    if (bot !== primary && Math.random() < 0.5) {
      const delay = getRandomDelay(3000, 8000);
      setTimeout(() => {
        postAIResponse(bot, wallName);
      }, delay);
    }
  });
}

function postAIResponse(botName, wallName) {
  const letter = getRandomLetter();
  appendMessage(wallName, `${botName}: ${letter}`);
}

window.addEventListener("DOMContentLoaded", () => {
  createWallsUI();
});
