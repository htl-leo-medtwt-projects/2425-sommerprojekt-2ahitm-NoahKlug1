const deckBoxContainer = document.getElementById("deckBoxContainer");
const deckFrame1 = document.getElementById("deckFrame1");
const deckFrame2 = document.getElementById("deckFrame2");
const deckResetBtn = document.getElementById("deckResetBtn");

let deckSelectedBox = null;
let deckAddedBoxes = new Set();

const unitTypesArray = [
  { type: "swordsman", cost: 3, speed: 20, hp: 600, damage: 150, width: 30, height: 30, color: "cyan", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 20, imageRun: "img/sprites/barbarBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "archer",    cost: 3, speed: 20, hp: 250, damage: 120, width: 30, height: 30, color: "green", attackCooldown: 1.2, perceptionRadius: 150, attackRange: 80, imageRun: "img/sprites/archerBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "giant",     cost: 5, speed: 10, hp: 4232, damage: 100, width: 40, height: 40, color: "purple", attackCooldown: 2.0, perceptionRadius: 150, attackRange: 20, imageRun: "img/sprites/rieseBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "knight",    cost: 4, speed: 20, hp: 1703, damage: 140, width: 30, height: 30, color: "yellow", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 20, imageRun: "img/sprites/ritterBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "skeleton",  cost: 1, speed: 30, hp: 100, damage: 100, width: 20, height: 20, color: "gray", attackCooldown: 0.8, perceptionRadius: 100, attackRange: 30, imageRun: "img/sprites/skelletBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "wizard",    cost: 6, speed: 40, hp: 500, damage: 200, width: 30, height: 30, color: "magenta", attackCooldown: 1.5, perceptionRadius: 150, attackRange: 50, imageRun: "img/sprites/magierBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "minion",    cost: 3, speed: 40, hp: 120, damage: 100, width: 25, height: 25, color: "pink", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 40, imageRun: "img/sprites/barbarBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "goblin",    cost: 2, speed: 40, hp: 200, damage: 100, width: 25, height: 25, color: "darkgreen", attackCooldown: 0.8, perceptionRadius: 150, attackRange: 30, imageRun: "img/sprites/barbarBlue.png", totalFrames: 2, frameSpeed: 25 }
];



function initDeckBoxes() {
  deckBoxContainer.innerHTML = "";
  for (let i = 1; i <= 16; i++) {
    const box = createDeckBox(i);
    deckBoxContainer.appendChild(box);
  }
}
function createDeckBox(number) {
  const container = document.createElement("div");
  container.className = "deckCardContainer";
  container.setAttribute("data-box", `Box ${number}`);

  // Inhalt der Karte als HTML (statt textContent)
  const card = document.createElement("div");
  card.className = "deckCard";

  card.innerHTML = `
  <div class="deckCardContent">
    <img src="img/sprites/archerBlue.png" alt="Box ${number}" class="deckCardImage">
    <div class="deckCardOverlay">
      <h3>Box ${number}</h3>
    </div>
  </div>
`;

  // Button-Container erstellen
  const buttons = document.createElement("div");
  buttons.className = "deckButtonsContainer";

  // Hinzufügen-Button
  const addBtn = document.createElement("button");
  addBtn.className = "deckButton deckAddButton";
  addBtn.textContent = "Hinzufügen";
  addBtn.onclick = (e) => {
    e.stopPropagation();
    handleDeckAddBox(`Box ${number}`, container);
  };

  // Info-Button
  const infoBtn = document.createElement("button");
  infoBtn.className = "deckButton deckInfoButton";
  infoBtn.textContent = "Info";
  infoBtn.onclick = (e) => {
    e.stopPropagation();
    showDeckInfo(`Box ${number}`, `Infos zu Box ${number}`);
  };

  // Buttons zum Container hinzufügen
  buttons.appendChild(addBtn);
  buttons.appendChild(infoBtn);

  // Card und Buttons in den Hauptcontainer packen
  container.appendChild(card);
  container.appendChild(buttons);

  return container;
}


function handleDeckAddBox(boxLabel, boxElement) {
  if (deckAddedBoxes.has(boxLabel)) return;

  deckSelectedBox = boxLabel;

  const total = deckFrame1.children.length + deckFrame2.children.length;
  if (total < 8) {
    const newCard = document.createElement("div");
    newCard.className = "deckTargetCard";
    newCard.innerHTML = `
      <div class="deckTargetCardContent">
        <img src="${imgUrls[0/*numberFromLabel(boxLabel)*/]}" alt="${boxLabel}" class="deckTargetImage">
        <div class="deckTargetOverlay">${boxLabel}</div>
      </div>
    `;
    newCard.onclick = () => handleDeckReplaceBox(newCard);

    const removeBtn = document.createElement("button");
    removeBtn.className = "deckButton deckRemoveButton deckRemoveSmall";
    removeBtn.textContent = "✖";
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      handleDeckRemoveBox(newCard, boxLabel);
    };
    newCard.appendChild(removeBtn);

    if (deckFrame1.children.length < 4) {
      deckFrame1.appendChild(newCard);
    } else {
      deckFrame2.appendChild(newCard);
    }

    deckAddedBoxes.add(boxLabel);
    boxElement.remove();
  } else {
    document.getElementById("deckTargetFrame").scrollIntoView({ behavior: "smooth" });
    document.querySelectorAll(".deckTargetCard").forEach(card => {
      card.classList.add("deckWobble");
    });
    setTimeout(() => {
      document.querySelectorAll(".deckTargetCard").forEach(card => {
        card.classList.remove("deckWobble");
      });
    }, 2000);
  }
}

function handleDeckReplaceBox(existingCard) {
  if (deckSelectedBox && !deckAddedBoxes.has(deckSelectedBox)) {
    const oldLabel = existingCard.querySelector(".deckTargetOverlay").textContent.trim();

    // Erstelle neuen HTML-Inhalt mit Bild
    existingCard.innerHTML = `
      <div class="deckTargetCardContent">
        <img src="${imgUrls[/*numberFromLabel(deckSelectedBox)*/0]}" alt="${deckSelectedBox}" class="deckTargetImage">
        <div class="deckTargetOverlay">${deckSelectedBox}</div>
      </div>
    `;

    // Setze onclick und remove button erneut
    existingCard.onclick = () => handleDeckReplaceBox(existingCard);

    const removeBtn = document.createElement("button");
    removeBtn.className = "deckButton deckRemoveButton deckRemoveSmall";
    removeBtn.textContent = "✖";
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      handleDeckRemoveBox(existingCard, deckSelectedBox);
    };
    existingCard.appendChild(removeBtn);

    deckAddedBoxes.delete(oldLabel);
    deckAddedBoxes.add(deckSelectedBox);

    const number = parseInt(oldLabel.replace("Box ", ""));
    const oldBox = createDeckBox(number);
    deckBoxContainer.appendChild(oldBox);

    const newBox = [...document.querySelectorAll('.deckCardContainer')]
      .find(el => el.getAttribute("data-box") === deckSelectedBox);
    if (newBox) newBox.remove();

    deckSelectedBox = null;
  }
}

function handleDeckRemoveBox(card, label) {
  card.remove();
  deckAddedBoxes.delete(label);
  const number = parseInt(label.replace("Box ", ""));
  const restored = createDeckBox(number);
  deckBoxContainer.appendChild(restored);
}

function showDeckInfo(title, content) {
  document.getElementById("deckInfoTitle").textContent = title;
  document.getElementById("deckInfoContent").innerHTML = content;
  document.getElementById("deckInfoModal").style.display = "block";
}

document.getElementById("deckCloseInfo").onclick = () => {
  document.getElementById("deckInfoModal").style.display = "none";
};

deckResetBtn.onclick = () => {
  deckFrame1.innerHTML = "";
  deckFrame2.innerHTML = "";
  deckAddedBoxes.clear();
  deckSelectedBox = null;
  initDeckBoxes();
};

initDeckBoxes();

function numberFromLabel(label) {
  return parseInt(label.replace("Box ", ""));
}
