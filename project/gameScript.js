const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let lastTime = performance.now();
let gameOver = false;

// ---------------------------
// ELIXIR: Spieler & Bot
let playerWinner = false; 
let enemyWinner = false; 
let playerElixir = 5;
const maxElixir = 10;
let elixirTimer = 0;
const playerElixirEl = document.getElementById("playerElixir");
const elixirProgressEl = document.getElementById("elixirProgress");

let botElixir = 5;
const maxBotElixir = 10;
let botElixirTimer = 0;

// ---------------------------
// TOWER-SETUP: Jeder Spieler hat 3 Türme – 2 kleine und 1 großer (Index 1).
// Kleine Türme: HP 500, Damage 10, Range 150. Großer Turm: HP 1000, Damage 20, Range 250.
// Die kleinen Türme sind näher an der Brücke (x=150 für Player, x=canvas.width-150-width für Enemy).
function createTower(owner, type, x, y, width, height, hp, damage, range) {
  return { owner, type, x, y, width, height, hp, maxHp: hp, damage, range, attackCooldown: 1.0, attackTimer: 0 };
}
let playerTowers = [
  createTower("player", "small", 150, 60, 50, 60, 1500, 10, 200),
  createTower("player", "big", 50, canvas.height / 2 - 40, 60, 70, 2000, 20, 300),
  createTower("player", "small", 150, canvas.height - 110, 50, 60, 1500, 10, 200)
];
let enemyTowers = [
  createTower("enemy", "small", canvas.width - 150 - 30, 60, 50, 60, 1500, 10, 200),
  createTower("enemy", "big", canvas.width - 50 - 40, canvas.height / 2 - 40, 60, 70, 2000, 20, 300),
  createTower("enemy", "small", canvas.width - 150 - 30, canvas.height - 110, 50, 60, 1500, 10, 200)
];

// ---------------------------
// TROOP-TYPEN & DECK
let cardPool = [
  "swordsman", "archer", "giant", "knight",
  "skeleton", "wizard", "gunman", "tennis"
];
if(JSON.parse(localStorage.getItem('deck')) == null){
  localStorage.setItem('deck', JSON.stringify(cardPool));
}else{
  cardPool = JSON.parse(localStorage.getItem('deck')); 
}
let unitTypes = {
  swordsman:   { cost: 3, speed: 20, hp: 600, damage: 150, width: 30, height: 30, color: "cyan", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 20, image: {srcRunPlayer: "img/sprites/barbarBlueRun.png"}, srcPlayer: "img/sprites/barbarBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  archer:      { cost: 3, speed: 20, hp: 250, damage: 120, width: 30, height: 30, color: "green", attackCooldown: 1.2, perceptionRadius: 150, attackRange: 80, image: {srcRunPlayer: "img/sprites/archerBlueRun.png"}, srcPlayer: "img/sprites/archerBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  giant:       { cost: 5, speed: 10, hp: 4232, damage: 100, width: 40, height: 40, color: "purple", attackCooldown: 2.0, perceptionRadius: 150, attackRange: 20, image: {srcRunPlayer: "img/sprites/rieseBlueRun.png"}, srcPlayer: "img/sprites/rieseBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  knight:      { cost: 4, speed: 20, hp: 1703, damage: 140, width: 30, height: 30, color: "yellow", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 20, image: {srcRunPlayer: "img/sprites/ritterBlueRun.png"}, srcPlayer: "img/sprites/ritterBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  skeleton:    { cost: 1, speed: 30, hp: 100, damage: 100, width: 20, height: 20, color: "gray", attackCooldown: 0.8, perceptionRadius: 100, attackRange: 30, image: {srcRunPlayer: "img/sprites/skelletBlueRun.png"}, srcPlayer: "img/sprites/skelletBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  wizard:      { cost: 6, speed: 40, hp: 500, damage: 200, width: 30, height: 30, color: "magenta", attackCooldown: 1.5, perceptionRadius: 150, attackRange: 50, image: {srcRunPlayer: "img/sprites/magierBlueRun.png"}, srcPlayer: "img/sprites/magierBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  firewizard:  { cost: 3, speed: 40, hp: 120, damage: 100, width: 25, height: 25, color: "pink", attackCooldown: 1.0, perceptionRadius: 150, attackRange: 40, image: {srcRunPlayer: "img/sprites/magierFeuerBlueRun.png", srcPlayer: "img/sprites/magierFeuerBlue.png"}, totalFrames: 2, frameSpeed: 25, level: 0},
  tennis:      { cost: 2, speed: 40, hp: 200, damage: 100, width: 25, height: 25, color: "darkgreen", attackCooldown: 0.8, perceptionRadius: 150, attackRange: 30, image: {srcRunPlayer: "img/sprites/tableTennisManBlueRun.png"}, srcPlayer: "img/sprites/tableTennisManBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  gunman:      { cost: 4, speed: 50, hp: 200, damage: 300, width: 25, height: 25, color: "black", attackCooldown: 0.6, perceptionRadius: 200, attackRange: 30, image: {srcRunPlayer: "img/sprites/gunManBlueRun.png"}, srcPlayer: "img/sprites/gunManBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  viking:      { cost: 3, speed: 25, hp: 300, damage: 200, width: 30, height: 30, color: "lightgreen", attackCooldown: 2.0, perceptionRadius: 150, attackRange: 60, image: {srcRunPlayer: "img/sprites/vikingBlueRun.png"}, srcPlayer: "img/sprites/vikingBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  bigknight:   { cost: 6, speed: 10, hp: 4000, damage: 50, width: 50, height: 50, color: "darkblue", attackCooldown: 2.5, perceptionRadius: 150, attackRange: 20, image: {srcRunPlayer: "img/sprites/megaRitterBlueRun.png"}, srcPlayer: "img/sprites/megaRitterBlue.png", totalFrames: 2, frameSpeed: 25, level: 0},
  witch:       { cost: 9, speed: 15, hp: 2000, damage: 400, width: 30, height: 30, color: "red", attackCooldown: 3.0, perceptionRadius: 200, attackRange: 100, image: {srcRunPlayer: "img/sprites/hexeBlueRun.png"}, srcPlayer: "img/sprites/hexeBlue.png", totalFrames: 2, frameSpeed: 25, level: 0}
};

if(JSON.parse(localStorage.getItem('unit types')) == null){
  localStorage.setItem('unit types', JSON.stringify(unitTypes));
}else{
  unitTypes = JSON.parse(localStorage.getItem('unit types')); 
}

// Festes Deck (8 eindeutige Karten, einmal am Spielstart definiert)
const fixedDeck = [];

// Spieler-Deck (Hand aus den ersten 4 Karten des festen Decks)
let playerHand = fixedDeck.slice(0, 4);
// Bot-Deck (ebenfalls fix)
let enemyHand = fixedDeck.slice(0, 4);

let selectedCard = null;
const cardHandEl = document.getElementById("cardHand");

function updateCardHandUI() {
  cardHandEl.innerHTML = "";
  playerHand.forEach((card, index) => {
    const cardCost = unitTypes[card].cost;
    const cardImg = unitTypes[card].srcPlayer;

    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper";
    if (selectedCard === index) wrapper.classList.add("selected");
    wrapper.dataset.index = index;

    const colorCanvas = document.createElement("canvas");
    const grayCanvas = document.createElement("canvas");
    colorCanvas.width = grayCanvas.width = 100;
    colorCanvas.height = grayCanvas.height = 140;
    colorCanvas.classList.add("card-canvas", "color");
    grayCanvas.classList.add("card-canvas", "gray");
    wrapper.appendChild(colorCanvas);
    wrapper.appendChild(grayCanvas);
    cardHandEl.appendChild(wrapper);

    wrapper.addEventListener("click", () => {
      selectedCard = index;
      updateCardHandUI();
    });

    const img = new Image();
    img.src = cardImg;
    img.onload = () => {
      const cctx = colorCanvas.getContext("2d");
      const gctx = grayCanvas.getContext("2d");
      cctx.drawImage(img, 0, 0, 100, 140);
      gctx.drawImage(img, 0, 0, 100, 140);
      const sectorsToReveal = Math.min(playerElixir, cardCost);
      revealSectors(gctx, grayCanvas, sectorsToReveal, cardCost);
    };
  });
}

function revealSectors(ctx, canvas, activeSectors, totalSectors) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.max(canvas.width, canvas.height) * 1.5;
  const anglePerSector = (2 * Math.PI) / totalSectors;

  for (let i = 0; i < activeSectors; i++) {
    const start = anglePerSector * i;
    const end = start + anglePerSector;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
/*
function updateCardHandUI() {
  cardHandEl.innerHTML = "";
  playerHand.forEach((card, index) => {
    const div = document.createElement("div");
    div.className = "card";
    if (selectedCard === index) div.classList.add("selected");
    div.dataset.index = index;
    div.innerHTML = `<p>${card}</p><p>Cost: ${unitTypes[card].cost}</p>`;
    div.addEventListener("click", () => {
      selectedCard = index;
      updateCardHandUI();
    });
    cardHandEl.appendChild(div);
  });
}
*/

// to do check later updateCardHandUI();

// ---------------------------
// Arrays für Einheiten
let playerUnits = [];
let enemyUnits = [];

// ---------------------------
// UNIT CREATION
function createUnit(owner, type, x, y) {
  const data = unitTypes[type];
  return {
    owner,
    type,
    x,
    y,
    width: data.width,
    height: data.height,
    speed: data.speed,
    hp: data.hp,
    maxHp: data.hp,
    damage: data.damage,
    attackCooldown: data.attackCooldown,
    attackTimer: 0,
    color: data.color,
    perceptionRadius: data.perceptionRadius,
    attackRange: data.attackRange,
    flashTimer: 0,
    currentTarget: null,
    imageSrc: data.image.srcRunPlayer, 
    totalFrames: data.totalFrames,
    frameSpeed: data.frameSpeed,
    frameCounter: 0,
    isAttacking: false
  };
}
// ---------------------------
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  if (selectedCard === null) return;
  const cardKey = playerHand[selectedCard];
  const cost = unitTypes[cardKey].cost;
  if (playerElixir < cost) return;
  playerElixir -= cost;
  const data = unitTypes[cardKey];
  let startX = Math.max(0, Math.min(clickX - data.width / 2, canvas.width / 2 - data.width));
  let startY = Math.max(0, Math.min(clickY - data.height / 2, canvas.height - data.height));
  playerUnits.push(createUnit("player", cardKey, startX, startY));

  playerHand.splice(selectedCard, 1);
  while (playerHand.length < 4) {
    let candidate = fixedDeck[Math.floor(Math.random() * fixedDeck.length)];
    if (!playerHand.includes(candidate)) playerHand.push(candidate);
  }
  selectedCard = null;
  updateCardHandUI();
});

// ---------------------------
let enemyCardTimer = 0;
const enemyCardInterval = 3;
function botPlayCard() {
  const index = Math.floor(Math.random() * enemyHand.length);
  const cardKey = enemyHand[index];
  const cost = unitTypes[cardKey] ? unitTypes[cardKey].cost : 0;
  if (botElixir < cost) return;
  botElixir -= cost;
  const data = unitTypes[cardKey];
  let startX = Math.max(canvas.width / 2 + 20, canvas.width - data.width - 10);
  let startY = Math.random() * (canvas.height - data.height);
  if (cardKey === "skeletonArmy") {
    const newUnits = createUnit("enemy", startX, startY);
    enemyUnits.push(...newUnits);
  } else {
    enemyUnits.push(createUnit("enemy", cardKey, startX, startY));
  }
  enemyHand.splice(index, 1);
  while (enemyHand.length < 4) {
    let candidate = fixedDeck[Math.floor(Math.random() * fixedDeck.length)];
    if (!enemyHand.includes(candidate)) enemyHand.push(candidate);
  }
}


function getDistance(a, b) {
  const ax = a.x + a.width / 2, ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2, by = b.y + b.height / 2;
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}


const riverWidth = 30;
const riverX = canvas.width / 2 - riverWidth / 2;
const bridgeTop = { y: 50, height: 50, centerY: 75 };
const bridgeBottom = { y: canvas.height - 100, height: 50, centerY: canvas.height - 75 };

function collidesWithTowers(unit, towers) {
  for (let tower of towers) {
    if (tower.hp > 0) {
      if (unit.x < tower.x + tower.width &&
          unit.x + unit.width > tower.x &&
          unit.y < tower.y + tower.height &&
          unit.y + unit.height > tower.y) {
        return tower;
      }
    }
  }
  return null;
}
// ---------------------------
// Bewegung & Angriff
function isBlocked(unit, units, nextX, nextY) {
  for (let other of units) {
    if (other !== unit) {
      if (nextX < other.x + other.width &&
          nextX + unit.width > other.x &&
          nextY < other.y + other.height &&
          nextY + unit.height > other.y) {
        return false;
      }
    }
  }
  return false;
}
function moveUnit(unit, deltaTime) {
  let targetPos = null;
  if (unit.type === "giant") {
    let candidate = null;
    let candidateDist = Infinity;
    const towers = unit.owner === "player" ? enemyTowers : playerTowers;
    for (const tower of towers) {
      if (tower.type === "small" && tower.hp > 0) {
        let d = getDistance(unit, tower);
        if (d < candidateDist) { 
          candidate = tower; 
          candidateDist = d; 
        }
      }
    }
    if (candidate) {
      targetPos = { x: candidate.x + candidate.width / 2, y: candidate.y + candidate.height / 2 };
    } else if (enemyTowers.length > 1 && playerTowers.length > 1) {
      targetPos = unit.owner === "player" 
                  ? { x: enemyTowers[1].x + enemyTowers[1].width / 2, y: enemyTowers[1].y + enemyTowers[1].height / 2 }
                  : { x: playerTowers[1].x + playerTowers[1].width / 2, y: playerTowers[1].y + playerTowers[1].height / 2 };
    }
  } else {
    if (unit.currentTarget && unit.currentTarget.hp > 0) {
      targetPos = { x: unit.currentTarget.x + unit.currentTarget.width / 2, y: unit.currentTarget.y + unit.currentTarget.height / 2 };
    } else {
      let nearestEnemy = null;
      let minDist = Infinity;
      const opponents = unit.owner === "player" ? enemyUnits : playerUnits;
      for (const enemy of opponents) {
        let d = getDistance(unit, enemy);
        if (d < unit.perceptionRadius && d < minDist) {
          minDist = d;
          nearestEnemy = enemy;
        }
      }
      if (nearestEnemy) {
        unit.currentTarget = nearestEnemy;
        targetPos = { x: nearestEnemy.x + nearestEnemy.width / 2, y: nearestEnemy.y + nearestEnemy.height / 2 };
      } else {
        let candidate = null;
        let candidateDist = Infinity;
        for (const tower of (unit.owner === "player" ? enemyTowers : playerTowers)) {
          if (tower.hp > 0) {
            let d = getDistance(unit, tower);
            if (d < candidateDist) {
              candidate = tower;
              candidateDist = d;
            }
          }
        }
        if (candidate) {
          targetPos = { x: candidate.x + candidate.width / 2, y: candidate.y + candidate.height / 2 };
        }
      }
    }
  }

  if (!targetPos) return;

  if (unit.owner === "player" && unit.x + unit.width < riverX && targetPos.x > riverX) {
    let bridgeY = Math.abs((unit.y + unit.height / 2) - bridgeTop.centerY) < Math.abs((unit.y + unit.height / 2) - bridgeBottom.centerY)
                  ? bridgeTop.centerY : bridgeBottom.centerY;
    targetPos = { x: riverX + riverWidth / 2, y: bridgeY };
  } else if (unit.owner !== "player" && unit.x > riverX + riverWidth && targetPos.x < riverX + riverWidth) {
    let bridgeY = Math.abs((unit.y + unit.height / 2) - bridgeTop.centerY) < Math.abs((unit.y + unit.height / 2) - bridgeBottom.centerY)
                  ? bridgeTop.centerY : bridgeBottom.centerY;
    targetPos = { x: riverX + riverWidth / 2, y: bridgeY };
  }

  const unitCenter = { x: unit.x + unit.width / 2, y: unit.y + unit.height / 2 };
  let dx = targetPos.x - unitCenter.x;
  let dy = targetPos.y - unitCenter.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;
  let vx = dx / dist, vy = dy / dist;
  let moveDist = unit.speed * deltaTime;
  let desiredX = Math.max(0, Math.min(unit.x + vx * moveDist, canvas.width - unit.width));
  let desiredY = Math.max(0, Math.min(unit.y + vy * moveDist, canvas.height - unit.height));

  let adjusted = avoidTowerCollision(unit, desiredX, desiredY);
  desiredX = adjusted.x;
  desiredY = adjusted.y;

  if (unit.type !== "giant") {
    const friendly = unit.owner === "player" ? playerUnits : enemyUnits;
    if (!isBlocked(unit, friendly, desiredX, desiredY)) {
      unit.x = desiredX;
      unit.y = desiredY;
    }
  } else {
    unit.x = desiredX;
    unit.y = desiredY;
  }
}

// Verhindert, dass eine Einheit durch einen lebenden Turm läuft – verschiebt sie sanft.
function avoidTowerCollision(unit, x, y) {
  let newX = x, newY = y;
  const allTowers = [...playerTowers, ...enemyTowers]; // beide Seiten
  allTowers.forEach(tower => {
    if (tower.hp > 0) {
      if (newX < tower.x + tower.width &&
          newX + unit.width > tower.x &&
          newY < tower.y + tower.height &&
          newY + unit.height > tower.y) {
        let unitCenterX = newX + unit.width / 2;
        let unitCenterY = newY + unit.height / 2;
        let towerCenterX = tower.x + tower.width / 2;
        let towerCenterY = tower.y + tower.height / 2;
        let diffX = unitCenterX - towerCenterX;
        let diffY = unitCenterY - towerCenterY;
        let distance = Math.sqrt(diffX*diffX + diffY*diffY) || 1;
        let push = 2;
        newX += (diffX / distance) * push;
        newY += (diffY / distance) * push;
      }
    }
  });
  return { x: newX, y: newY };
}

function updateFlashTimers(units, deltaTime) {
  units.forEach(unit => {
    if (unit.flashTimer > 0) {
      unit.flashTimer = Math.max(0, unit.flashTimer - deltaTime);
    }
  });
}
function updateUnits(deltaTime) {
  // Schleife über alle Spieler-Einheiten
  playerUnits.forEach(unit => {
    unit.attackTimer += deltaTime;  // Timer für den Angriff der Einheit erhöhen (für Cooldown-Mechanik)
    let target = null; // Ziel der Einheit initialisieren
    let minDist = Infinity; // Kleinste Distanz auf "unendlich" setzen, um das nächste Ziel zu finden

    // Zuerst feindliche Einheiten suchen
    for (let enemy of enemyUnits) {
      let d = getDistance(unit, enemy); // Distanz zur feindlichen Einheit berechnen
      if (d < unit.perceptionRadius && d < minDist) {
        minDist = d;  // Kleinste Distanz aktualisieren
        target = enemy; // Feindliche Einheit als Ziel setzen
      }
    }

    // Wenn kein feindliches Ziel gefunden wurde, nach Türmen suchen
    if (!target) {
      let candidate = null; 
      let candidateDist = Infinity;  // Distanz zu einem Turm initialisieren
      for (const tower of enemyTowers) {
        if (tower.type === "small" && tower.hp > 0) { // Nur funktionierende kleine Türme auswählen
          let d = getDistance(unit, tower);  // Distanz zum Turm berechnen
          if (d < candidateDist) { 
            candidate = tower; // Turm als Kandidaten speichern
            candidateDist = d; // Kleinste Distanz aktualisieren
          }
        }
      }
      // Wenn kein Turm gefunden wurde, das zweite Feind-Turm als Ziel wählen
      target = candidate || enemyTowers[1];
      minDist = getDistance(unit, target); // Neue Ziel-Distanz berechnen
    }

    // Angreifen, wenn das Ziel im Angriffsradius ist und der Angriff bereit ist
    if (minDist <= unit.attackRange && unit.attackTimer >= unit.attackCooldown) {
      unit.isAttacking = true; 
      target.hp -= unit.damage;  // Leben des Ziels verringern
      unit.attackTimer = 0;  // Angriffstimer zurücksetzen
      // Wenn das Ziel noch lebt und es eine feindliche Einheit ist, das Ziel blinken lassen
      if (target.hp > 0 && target.type !== undefined) {
        target.flashTimer = 0.2; // Flash-Effekt aktivieren
      }
    } 
    if (target.hp <= 0 || minDist > unit.attackRange){
      unit.isAttacking = false; 
      moveUnit(unit, deltaTime);  // Einheit weiterbewegen, wenn sie nicht angreifen kann
    }
  });

  // Schleife über alle feindlichen Einheiten
  enemyUnits.forEach(unit => {
    unit.attackTimer += deltaTime;  // Angriffstimer der feindlichen Einheit erhöhen
    let target = null;
    let minDist = Infinity;

    // Zuerst nach Spieler-Einheiten suchen
    for (let pUnit of playerUnits) {
      let d = getDistance(unit, pUnit);  // Distanz zur Spieler-Einheit berechnen
      if (d < unit.perceptionRadius && d < minDist) {
        minDist = d;  // Kleinste Distanz aktualisieren
        target = pUnit;  // Spieler-Einheit als Ziel setzen
      }
    }

    // Wenn kein Ziel gefunden wurde, nach Spieler-Türmen suchen
    if (!target) {
      let candidate = null; 
      let candidateDist = Infinity;
      for (const tower of playerTowers) {
        if (tower.type === "small" && tower.hp > 0) {
          let d = getDistance(unit, tower); // Distanz zum Turm berechnen
          if (d < candidateDist) { 
            candidate = tower;
            candidateDist = d;
          }
        }
      }
      target = candidate || playerTowers[1];  // Wenn kein Turm gefunden wurde, das zweite Spieler-Turm als Ziel
      minDist = getDistance(unit, target);  // Neue Distanz zum Ziel berechnen
    }

    // Angreifen, wenn das Ziel im Angriffsradius ist und der Angriff bereit ist
    if (minDist <= unit.attackRange && unit.attackTimer >= unit.attackCooldown) {
      target.hp -= unit.damage;  // Leben des Ziels verringern
      unit.attackTimer = 0;  // Angriffstimer zurücksetzen
      // Wenn das Ziel noch lebt und es eine Spieler-Einheit ist, das Ziel blinken lassen
      if (target.hp > 0 && target.type !== undefined) {
        target.flashTimer = 0.2;  // Flash-Effekt aktivieren
      }
    } else {
      moveUnit(unit, deltaTime);  // Feindliche Einheit weiterbewegen, wenn sie nicht angreifen kann
    }
  });

  // Flash-Effekte für alle Einheiten aktualisieren
  if (playerUnits.length > 0) updateFlashTimers(playerUnits, deltaTime);
  if (enemyUnits.length > 0) updateFlashTimers(enemyUnits, deltaTime);
}


// ---------------------------
// Towers greifen an – großer Turm greift nur, wenn mindestens ein kleiner zerstört ist.
function updateTowers(towers, enemyUnits) {
  towers.forEach(tower => {
    if (tower.hp <= 0) return;
    if (tower.type === "big") {
      let smallTowers = towers.filter(t => t.type === "small");
      let bothAlive = smallTowers.every(t => t.hp > 0);
      if (bothAlive) return;
    }
    tower.attackTimer += 1/60;
    if (tower.attackTimer >= tower.attackCooldown) {
      for (let enemy of enemyUnits) {
        if (getDistance(tower, enemy) <= tower.range) {
          enemy.hp -= tower.damage;
          enemy.flashTimer = 0.2;
          tower.attackTimer = 0;
          break;
        }
      }
    }
  });
}

// ---------------------------
// Update-Funktion (Elixir, Bot, Units, Towers, Victory)

function update(deltaTime) {
  elixirTimer += deltaTime;
  if (elixirTimer >= 2) {
    if (playerElixir < maxElixir) { 
      playerElixir++; 
      updateCardHandUI();
    }
    elixirTimer -= 2;
  }
  //playerElixirEl.textContent = playerElixir;
  elixirProgressEl.style.width = ((playerElixir / maxElixir) * 100) + "%";
  if (playerElixir === maxElixir) {
    elixirProgressEl.classList.add("shake");
  } else {
    elixirProgressEl.classList.remove("shake");
  }
  botElixirTimer += deltaTime;
  if (botElixirTimer >= 2) {
    if (botElixir < maxBotElixir) { botElixir++; }
    botElixirTimer -= 2;
  }
  enemyCardTimer += deltaTime;
  if (enemyCardTimer >= enemyCardInterval) {
    botPlayCard();
    enemyCardTimer = 0;
  }
  
  updateUnits(deltaTime);
  updateTowers(playerTowers, enemyUnits);
  updateTowers(enemyTowers, playerUnits);
  
  playerUnits = playerUnits.filter(u => u.hp > 0);
  enemyUnits = enemyUnits.filter(u => u.hp > 0);
  
  if (playerTowers[1].hp <= 0) {
    enemyWinner = true; 
    gameOver = true;
  }
  if (enemyTowers[1].hp <= 0) {
    playerWinner = true; 
    gameOver = true;
  }
  
  //document.getElementById("playerTowerHP").textContent = playerTowers[1].hp;
  //document.getElementById("enemyTowerHP").textContent = enemyTowers[1].hp;
}

// ---------------------------
// Zeichnen
function preloadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}
let canvasImg; 
let riverImg; 
let bridgeImg; 
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hintergrund zeichnen
  if(!canvasImg){
    canvasImg = preloadImage("img/designImg/lightBattlefield.png");
  }
  ctx.drawImage(canvasImg ,0, 0, canvas.width, canvas.height);

  // Fluss zeichnen
  if(!riverImg){
    riverImg = preloadImage("img/designImg/fluss2.png");
  }
  ctx.drawImage(riverImg, riverX, 0, riverWidth, canvas.height/5);
  ctx.drawImage(riverImg, riverX, 100, riverWidth, canvas.height/5);
  ctx.drawImage(riverImg, riverX, 200, riverWidth, canvas.height/5);
  ctx.drawImage(riverImg, riverX, 300, riverWidth, canvas.height/5);
  ctx.drawImage(riverImg, riverX, 400, riverWidth, canvas.height/5);

  ctx.clearRect(riverX, bridgeTop.y, riverWidth, bridgeTop.height);
  ctx.clearRect(riverX, bridgeBottom.y, riverWidth, bridgeBottom.height);

  if(!bridgeImg){
    bridgeImg = preloadImage("img/designImg/schildForInfo.png");
  }

  ctx.drawImage(bridgeImg, riverX, bridgeTop.y, riverWidth, bridgeTop.height);
  ctx.drawImage(bridgeImg, riverX, bridgeBottom.y, riverWidth, bridgeBottom.height);

  // Türme zeichnen
  function drawTower(tower) {
    if (tower.hp <= 0) return;

    if (!tower.image) {
      if(tower.owner == "enemy"){
        tower.image = preloadImage("img/sprites/towerRed.png");
      }
      else{
        tower.image = preloadImage("img/sprites/towerBlue.png")
      }
    }

    ctx.drawImage(tower.image, tower.x, tower.y, tower.width, tower.height);

    // Lebensanzeige
    ctx.fillStyle = "blue";
    ctx.fillRect(tower.x, tower.y - 10, tower.width, 5);
    ctx.fillStyle = "lime";
    let hpWidth = (tower.hp / tower.maxHp) * tower.width;
    ctx.fillRect(tower.x, tower.y - 10, hpWidth, 5);
  }

  // Einheit mit Animation (Spritesheet) zeichnen
  function drawUnit(unit) {
    if (!unit.image) {
      if(unit.owner == "enemy"){
        let imageSrc = unit.imageSrc;
        unit.image = preloadImage(imageSrc.replace("Blue", "Red"))
      }else{
        unit.image = preloadImage(unit.imageSrc);
      }
    }

    // Animation: Frame berechnen
    const frameWidth = unit.image.width / unit.totalFrames;
    const frameHeight = unit.image.height;
    const currentFrame = Math.floor(unit.frameCounter / unit.frameSpeed) % unit.totalFrames;
    const sx = currentFrame * frameWidth;

    ctx.drawImage(
      unit.image,
      sx, 0, frameWidth, frameHeight,     // Quelle (Spritesheet)
      unit.x, unit.y, unit.width, unit.height  // Ziel (Canvas)
    );

    unit.frameCounter++;

    // Lebensanzeige
    ctx.fillStyle = "blue";
    ctx.fillRect(unit.x, unit.y - 8, unit.width, 4);
    ctx.fillStyle = "lime";
    let hpWidth = (unit.hp / unit.maxHp) * unit.width;
    ctx.fillRect(unit.x, unit.y - 8, hpWidth, 4);
  }

  playerTowers.forEach(drawTower);
  enemyTowers.forEach(drawTower);
  playerUnits.forEach(drawUnit);
  enemyUnits.forEach(drawUnit);
}

function gameLoop(timestamp) {
  let deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  if (!gameOver) {
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    document.getElementById('ui').style.display = 'none';
    if(playerWinner){
      availableBoxes += 10; 
      localStorage.setItem('available boxes', JSON.stringify(availableBoxes));
      updateBoxCount();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Hintergrund
      ctx.fillStyle = "#111"; // dunkler Hintergrund
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text-Shadow
      ctx.shadowColor = "gold";
      ctx.shadowBlur = 15;

      // Text
      ctx.fillStyle = "white";
      ctx.font = "64px 'pixelFont'";
      ctx.textAlign = "center";
      ctx.fillText("🎉 YOU WON! 🎉", canvas.width / 2, canvas.height / 2 - 40);

      ctx.font = "32px 'pixelFont'";
      ctx.fillText("Congratulations, you did it!", canvas.width / 2, canvas.height / 2 + 20);

      // Schatten zurücksetzen
      ctx.shadowBlur = 0;
    }else{
      availableBoxes += 5; 
      localStorage.setItem('available boxes', JSON.stringify(availableBoxes));
      updateBoxCount();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Hintergrund
      ctx.fillStyle = "#200"; // dunkles Rot
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text-Shadow
      ctx.shadowColor = "red";
      ctx.shadowBlur = 20;

      // Text
      ctx.fillStyle = "white";
      ctx.font = "64px 'pixelFont'";
      ctx.textAlign = "center";
      ctx.fillText("☠ YOU LOST ☠", canvas.width / 2, canvas.height / 2 - 40);

      ctx.font = "28px 'pixelFont'";
      ctx.fillText("Better luck next time...", canvas.width / 2, canvas.height / 2 + 20);

      // Schatten zurücksetzen
      ctx.shadowBlur = 0;
    } 
  }
}

function startGame(){
  document.getElementById('ui').style.display = 'block';

  playerTowers = [
    createTower("player", "small", 150, 60, 50, 60, 1500, 10, 200),
    createTower("player", "big", 50, canvas.height / 2 - 40, 60, 70, 2000, 20, 300),
    createTower("player", "small", 150, canvas.height - 110, 50, 60, 1500, 10, 200)
  ];
  enemyTowers = [
    createTower("enemy", "small", canvas.width - 150 - 30, 60, 50, 60, 1500, 10, 200),
    createTower("enemy", "big", canvas.width - 50 - 40, canvas.height / 2 - 40, 60, 70, 2000, 20, 300),
    createTower("enemy", "small", canvas.width - 150 - 30, canvas.height - 110, 50, 60, 1500, 10, 200)
  ];
  playerWinner = false; 
  enemyWinner = false; 
  lastTime = performance.now();
  gameOver = false;
  playerElixir = 5;
  elixirTimer = 0;
  fixedDeck.length = 0;
  while (fixedDeck.length < 8) {
    let card = cardPool[Math.floor(Math.random() * cardPool.length)];
    if (!fixedDeck.includes(card)) fixedDeck.push(card);
  }
  botElixir = 5;
  botElixirTimer = 0;
  playerHand = fixedDeck.slice(0, 4);
  enemyHand = fixedDeck.slice(0, 4);
  selectedCard = null;
  playerUnits = [];
  enemyUnits = [];
  enemyCardTimer = 0;
  updateCardHandUI();
  requestAnimationFrame(gameLoop);
}
