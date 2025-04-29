const deckBoxContainer = document.getElementById("deckBoxContainer");
const deckFrame1 = document.getElementById("deckFrame1");
const deckFrame2 = document.getElementById("deckFrame2");
const deckResetBtn = document.getElementById("deckResetBtn");

let deckSelectedBox = null;
let deckAddedBoxes = new Set();

const unitTypesArray = [
  { type: "swordsman", cost: 3, speed: 20, hp: 600, damage: 150, width: 30, height: 30, color: "cyan", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 20, image: "img/sprites/barbarBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "archer", cost: 3, speed: 20, hp: 250, damage: 120, width: 30, height: 30, color: "green", attackCooldown: 1.2, perceptionRadius: 150, attackRange: 80, image: "img/sprites/archerBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "giant", cost: 5, speed: 10, hp: 4232, damage: 100, width: 40, height: 40, color: "purple", attackCooldown: 2.0, perceptionRadius: 150, attackRange: 20, image: "img/sprites/rieseBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "knight", cost: 4, speed: 20, hp: 1703, damage: 140, width: 30, height: 30, color: "yellow", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 20, image: "img/sprites/ritterBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "skeleton", cost: 1, speed: 30, hp: 100, damage: 100, width: 20, height: 20, color: "gray", attackCooldown: 0.8, perceptionRadius: 100, attackRange: 30, image: "img/sprites/skelletBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "wizard", cost: 6, speed: 40, hp: 500, damage: 200, width: 30, height: 30, color: "magenta", attackCooldown: 1.5, perceptionRadius: 150, attackRange: 50, image: "img/sprites/magierBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "wizardFire", cost: 3, speed: 40, hp: 120, damage: 100, width: 25, height: 25, color: "pink", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 40, image: "img/sprites/magierFeuerBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "tableTennis", cost: 2, speed: 40, hp: 200, damage: 100, width: 25, height: 25, color: "darkgreen", attackCooldown: 0.8, perceptionRadius: 150, attackRange: 30, image: "img/sprites/tableTennisManBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "gunMan", cost: 4, speed: 50, hp: 200, damage: 300, width: 25, height: 25, color: "black", attackCooldown: 0.6, perceptionRadius: 200, attackRange: 30, image: "img/sprites/gunManBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "viking", cost: 3, speed: 25, hp: 300, damage: 0, width: 30, height: 30, color: "lightgreen", attackCooldown: 2.0, perceptionRadius: 150, attackRange: 60, image: "img/sprites/vikingBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "megaKnight", cost: 6, speed: 10, hp: 6000, damage: 50, width: 50, height: 50, color: "darkblue", attackCooldown: 2.5, perceptionRadius: 150, attackRange: 20, image: "img/sprites/megaRitterBlue.png", totalFrames: 2, frameSpeed: 25 },
  { type: "witch", cost: 10, speed: 35, hp: 2000, damage: 500, width: 60, height: 60, color: "red", attackCooldown: 3.0, perceptionRadius: 200, attackRange: 100, image: "img/sprites/hexeBlue.png", totalFrames: 2, frameSpeed: 25 }
];




function initDeckBoxes() {
  deckBoxContainer.innerHTML = "";
  for (let i = 0; i <= 12; i++) {
    const box = createDeckBox(i);
    deckBoxContainer.appendChild(box);
  }
}
function createDeckBox(number) {
  const container = document.createElement("div");
  container.className = "deckCardContainer";
  container.setAttribute("data-box", `Box${number}`);

  // Inhalt der Karte als HTML (statt textContent)
  const card = document.createElement("div");
  card.className = "deckCard";

  card.innerHTML = `
  <div class="deckCardContent">
    <img src="${unitTypesArray[number].image}" alt="Box${number}" class="deckCardImage">
    <div class="deckCardOverlay">
      <h3>${unitTypesArray[number].type.toUpperCase()}</h3>
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
    handleDeckAddBox(`Box${number}`, container);
  };

  // Info-Button
  const infoBtn = document.createElement("button");
  infoBtn.className = "deckButton deckInfoButton";
  infoBtn.textContent = "Info";
  infoBtn.onclick = (e) => {
    e.stopPropagation();
    showDeckInfo(`Box${number}`, `${unitTypesArray[number].type.toUpperCase()}`);
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

  const index = parseInt(boxLabel.replace("Box", ""));
  const total = deckFrame1.children.length + deckFrame2.children.length;

  if (total < 8) {
    // Direkt hinzufügen
    const newCard = document.createElement("div");
    newCard.className = "deckTargetCard";
    newCard.innerHTML = `
      <div class="deckTargetCardContent">
        <img src="${unitTypesArray[index].image}" alt="${boxLabel}" class="deckTargetImage">
        <div class="deckTargetOverlay"><h4>${unitTypesArray[index].type}</h4></div>
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
    deckSelectedBox = null;
  } else {
    // Deck ist voll – Auswahl bleibt erhalten für Austausch
    // Nur Animation – Karte nicht entfernen!
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
    const index = parseInt(deckSelectedBox.replace("Box", ""));
    // Erstelle neuen HTML-Inhalt mit Bild
    existingCard.innerHTML = `
      <div class="deckTargetCardContent">
        <img src="${unitTypesArray[index].image}" alt="${boxLabel}" class="deckTargetImage">
        <div class="deckTargetOverlay">${unitTypesArray[index].type}</div>
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

  const index = parseInt(label.replace("Box", ""));
  const restored = createDeckBox(index);

  // Die Karte an der ursprünglichen Position wieder einfügen
  const allDecks = [...deckBoxContainer.children];
  const insertBefore = allDecks.find(el => {
    const elIndex = parseInt(el.getAttribute("data-box").replace("Box", ""));
    return elIndex > index;
  });

  if (insertBefore) {
    deckBoxContainer.insertBefore(restored, insertBefore);
  } else {
    deckBoxContainer.appendChild(restored);
  }
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
