const deckBoxContainer = document.getElementById("deckBoxContainer");
const deckFrame1 = document.getElementById("deckFrame1");
const deckFrame2 = document.getElementById("deckFrame2");
const deckResetBtn = document.getElementById("deckResetBtn");

let deckSelectedBox = null;
let deckAddedBoxes = new Set();

function initDeckBoxes() {
  deckBoxContainer.innerHTML = "";
  for (let i = 1; i <= 15; i++) {
    const box = createDeckBox(i);
    deckBoxContainer.appendChild(box);
  }
}

function createDeckBox(number) {
  const container = document.createElement("div");
  container.className = "deckCardContainer";
  container.setAttribute("data-box", `Box ${number}`);

  const card = document.createElement("div");
  card.className = "deckCard";
  card.textContent = `Box ${number}`;

  const buttons = document.createElement("div");
  buttons.className = "deckButtonsContainer";

  const addBtn = document.createElement("button");
  addBtn.className = "deckButton deckAddButton";
  addBtn.textContent = "Hinzufügen";
  addBtn.onclick = (e) => {
    e.stopPropagation();
    handleDeckAddBox(`Box ${number}`, container);
  };

  const infoBtn = document.createElement("button");
  infoBtn.className = "deckButton deckInfoButton";
  infoBtn.textContent = "Info";
  infoBtn.onclick = (e) => {
    e.stopPropagation();
    showDeckInfo(`Box ${number}`, `Infos zu Box ${number}`);
  };

  buttons.appendChild(addBtn);
  buttons.appendChild(infoBtn);

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
    newCard.textContent = boxLabel;
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
    const oldLabel = existingCard.childNodes[0].nodeValue.trim();
    existingCard.childNodes[0].nodeValue = deckSelectedBox;

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
  document.getElementById("deckInfoContent").textContent = content;
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