const box = document.getElementById("bonus-box");
const starsContainer = document.querySelector(".bonus-stars");
const points = document.querySelectorAll(".bonus-point");
const reward = document.getElementById("bonus-reward");
const rewardNumber = reward.querySelector("p");
const countEl = document.getElementById("bonus-count");
const availableDisplay = document.querySelector(".bonus-available");
const particlesContainer = document.getElementById("bonus-particles");

let clickCount = 0;
let upgradeLevel = 0;
let availableBoxes = 0;

if(JSON.parse(localStorage.getItem('available boxes')) == null){
  localStorage.setItem('available boxes', JSON.stringify(availableBoxes));
}else{
  availableBoxes = JSON.parse(localStorage.getItem('available boxes')); 
}

function updateBoxCount() {
  countEl.textContent = "Boxen "+ availableBoxes;

  if (availableBoxes > 0) {
    availableDisplay.classList.remove("bonus-blink");
    resetBoxState();
  } else {
    resetBoxState();
    availableDisplay.classList.add("bonus-blink");
  }
}

function addStar() {
  const star = document.createElement("img");
  star.src = "img/designImg/goldStar.png";
  star.alt = "Bonus-Stern";
  star.classList.add("bonus-star");
  starsContainer.appendChild(star);

  // Upgrade Effekt
  box.classList.add("upgraded");
  setTimeout(() => {
    box.classList.remove("upgraded");
  }, 300);
}

function createExplosionParticles(numberOfStars) {
  particlesContainer.innerHTML = "";

  for (let i = 0; i < 40*numberOfStars; i++) {
    const particle = document.createElement("div");
    particle.classList.add("bonus-particle");

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 300 + 100;

    const x = Math.cos(angle) * distance + "px";
    const y = Math.sin(angle) * distance + "px";

    particle.style.setProperty("--x", x);
    particle.style.setProperty("--y", y);

    particlesContainer.appendChild(particle);
  }
}

function explodeBox() {
  box.style.animation = "rotate 0.2s linear infinite";

  setTimeout(() => {
    createExplosionParticles(upgradeLevel);
    box.style.display = "none";

    const baseValue = 7;
    const perStar = 13;
    const total = baseValue + (upgradeLevel * perStar);
    let randomImg = Math.floor(Math.random()* 12)
    //todo safe to local storage and upgrade troops 
    document.getElementById('bonus-reward-img').src = unitTypesArray[randomImg].image; 
    rewardNumber.textContent = total;

    //upgrade safeing 
    let unitType = unitTypesArray[randomImg].type; 
    unitTypes[unitType].level += total; 

    if(unitTypes[unitType].level >= 100){
      unitTypes[unitType].damage = Math.round(unitTypes[unitType].damage *1.1); 
      unitTypes[unitType].hp = Math.round(unitTypes[unitType].hp *1.1); 
       
      unitTypes[unitType].level -= 100; 
      displayCardPool();
    }
    localStorage.setItem('unit types', JSON.stringify(unitTypes));

    reward.classList.remove("hidden");
    reward.style.display = "flex";

    availableBoxes--;
    localStorage.setItem('available boxes', JSON.stringify(availableBoxes));
    updateBoxCount();
  }, 1000);
}

function resetBoxState() {
  clickCount = 0;
  upgradeLevel = 0;
  starsContainer.innerHTML = "";
  points.forEach(p => p.classList.remove("used"));
  box.style.display = "block";
  box.style.animation = "rotate 3s linear infinite";
}

box.addEventListener("click", () => {
  if (availableBoxes <= 0 || reward.style.display === "flex") return;

  if (clickCount < 5) {
    points[clickCount].classList.add("used");
    clickCount++;

    const chance = Math.max(0.7 - upgradeLevel * 0.15, 0.05);
    if (Math.random() < chance) {
      upgradeLevel++;
      addStar();
    }

    if (clickCount === 5) {
      explodeBox();
    }
  }
});

reward.addEventListener("click", () => {
  reward.classList.add("hidden");
  reward.style.display = "none";

  if (availableBoxes > 0) {
    resetBoxState();
  }
});



updateBoxCount();
