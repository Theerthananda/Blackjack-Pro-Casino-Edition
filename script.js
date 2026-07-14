//==================================================
//          BLACKJACK PRO - CASINO EDITION
//==================================================

"use strict";

//==================================================
//              GAME VARIABLES
//==================================================

//=============================
// GAME VARIABLES
//=============================
let currentHand = 1;
let playerCards = [];
let dealerCards = [];
let hand1Bet = 0;
let hand2Bet = 0;
let splitHand = [];
let insuranceBet = 0;
let isSplit = false;

let deck = [];

let currentBet = 0;

let playerBalance = 1000;

let gameStarted = false;

let playerTurn = false;

let dealerTurn = false;

let wins = 0;

let losses = 0;

let blackjacks = 0;

let gamesPlayed = 0;

//==================================================
//              DOM ELEMENTS
//==================================================

const balanceEl = document.getElementById("balance");

const currentBetEl = document.getElementById("current-bet");

const dealerCardsEl = document.getElementById("dealer-cards");

const playerCardsEl = document.getElementById("player-cards");

const dealerScoreEl = document.getElementById("dealer-score");

const playerScoreEl = document.getElementById("player-score");

const gameStatusEl = document.getElementById("game-status");

const winsEl = document.getElementById("wins");

const lossesEl = document.getElementById("losses");

const blackjackEl = document.getElementById("blackjacks");

const gamesPlayedEl = document.getElementById("games-played");

const chipButtons = document.querySelectorAll(".chip");

const newGameButton = document.getElementById("new-game-btn");

const doubleButton = document.getElementById("double-btn");

doubleButton.addEventListener("click", double);

const splitButton = document.getElementById("split-btn");

splitButton.addEventListener("click", split);

const insuranceButton = document.getElementById("insurance-btn");
insuranceButton.style.display = "none";

insuranceButton.addEventListener("click", () => {
  playButtonSound();

  insuranceBet = currentBet / 2;

  updateGameStatus(`🛡 Insurance placed: $${insuranceBet}`, "lime");

  insuranceButton.disabled = true;
  insuranceButton.style.display = "none";
});

const surrenderButton = document.getElementById("surrender-btn");
surrenderButton.style.display = "none";

surrenderButton.addEventListener("click", surrender);

const dealSound = new Audio("sounds/card-deal.mp3");
const chipSound = new Audio("sounds/chip.mp3");
const winSound = new Audio("sounds/win.mp3");
const loseSound = new Audio("sounds/lose.mp3");
const blackjackSound = new Audio("sounds/blackjack.mp3");
const bustSound = new Audio("sounds/bust.mp3");
const buttonSound = new Audio("sounds/button.mp3");
const splitSound = new Audio("sounds/split.mp3");
const rollingSound = new Audio("sounds/rolling.mp3");

function playRollingSound() {
  if (!soundEnabled) return;

  rollingSound.currentTime = 0;

  rollingSound.play();
}

function playButtonSound() {
  if (!soundEnabled) return;
  buttonSound.currentTime = 0;
  buttonSound.play();
}

function playDealSound() {
  if (!soundEnabled) return;
  dealSound.currentTime = 0;
  dealSound.play();
}

function playWinSound() {
  if (!soundEnabled) return;
  winSound.currentTime = 0;
  winSound.play();
}

function playLoseSound() {
  if (!soundEnabled) return;
  loseSound.currentTime = 0;
  loseSound.play();
}

function playBlackjackSound() {
  if (!soundEnabled) return;
  blackjackSound.currentTime = 0;
  blackjackSound.play();
}

function playSplitSound() {
  if (!soundEnabled) return;
  splitSound.currentTime = 0;
  splitSound.play();
}

function playChipSound() {
  if (!soundEnabled) return;
  chipSound.currentTime = 0;
  chipSound.play();
}

function playBustSound() {
  if (!soundEnabled) return;
  bustSound.currentTime = 0;

  bustSound.play();
}

function saveGame() {
  localStorage.setItem("blackjackBalance", playerBalance);
  localStorage.setItem("blackjackWins", wins);
  localStorage.setItem("blackjackLosses", losses);
  localStorage.setItem("blackjackGames", gamesPlayed);
  localStorage.setItem("blackjackBlackjacks", blackjacks);
}

function loadGame() {
  playerBalance = Number(localStorage.getItem("blackjackBalance")) || 1000;
  wins = Number(localStorage.getItem("blackjackWins")) || 0;
  losses = Number(localStorage.getItem("blackjackLosses")) || 0;
  gamesPlayed = Number(localStorage.getItem("blackjackGames")) || 0;
  blackjacks = Number(localStorage.getItem("blackjackBlackjacks")) || 0;
  const savedSound = localStorage.getItem("blackjackSound");

  if (savedSound !== null) {
    soundEnabled = savedSound === "true";
  }

  balanceEl.textContent = `$${playerBalance}`;

  updateStats();
}

function generateBankroll() {
  const random = Math.random() * 100;

  let bankroll = 0;

  if (random < 10) {
    bankroll = 500;
  } else if (random < 60) {
    bankroll = 1000;
  } else if (random < 80) {
    bankroll = 1500;
  } else if (random < 95) {
    bankroll = 2000;
  } else {
    bankroll = 5000;
  }

  chipButtons.forEach((chip) => {
    chip.disabled = false;
  });
  return bankroll;
}

const bankrollRewards = [500, 1000, 1500, 2000, 5000];
const newBankrollButton = document.getElementById("new-bankroll-btn");
newBankrollButton.style.display = "none";

newBankrollButton.addEventListener("click", () => {
  newBankrollButton.disabled = true;

  playButtonSound();
  playRollingSound();

  newBankrollButton.textContent = "🎰 Rolling...";

  const rolling = setInterval(() => {
    const randomReward =
      bankrollRewards[Math.floor(Math.random() * bankrollRewards.length)];

    newBankrollButton.textContent = `🎰 ₹${randomReward}`;
  }, 100);

  setTimeout(() => {
    clearInterval(rolling);

    rollingSound.pause();

    rollingSound.currentTime = 0;

    const reward = generateBankroll();

    playerBalance = reward;

    balanceEl.textContent = `$${playerBalance}`;

    newBankrollButton.textContent = `🎉 You received ₹${reward}!`;

    playWinSound();

    setTimeout(() => {
      chipButtons.forEach((chip) => {
        chip.style.display = "inline-block";
      });

      newBankrollButton.style.display = "none";

      newBankrollButton.disabled = false;

      newBankrollButton.textContent = "💰 New Bankroll";

      currentBet = 0;
      currentBetEl.textContent = "$0";

      updateGameStatus("💰 Good luck! Build your fortune.", "lime");
    }, 1000);

    saveGame();
  }, 4000);
});

const resetProgressButton = document.getElementById("reset-progress-btn");
resetProgressButton.addEventListener("click", () => {
  const confirmReset = confirm(
    "⚠️ This will permanently erase all your progress.\n\nAre you sure?",
  );

  if (!confirmReset) {
    return;
  }

  playerBalance = 1000;

  wins = 0;
  losses = 0;
  gamesPlayed = 0;
  blackjacks = 0;

  currentBet = 0;

  balanceEl.textContent = "$1000";
  currentBetEl.textContent = "$0";

  updateStats();

  localStorage.removeItem("blackjackBalance");
  localStorage.removeItem("blackjackWins");
  localStorage.removeItem("blackjackLosses");
  localStorage.removeItem("blackjackGames");
  localStorage.removeItem("blackjackBlackjacks");

  updateGameStatus("🗑️ Progress Reset Successfully!", "lime");

  gameStarted = false;

  chipButtons.forEach((chip) => {
    chip.disabled = false;
  });

  newBankrollButton.style.display = "none";
  newBankrollButton.disabled = false;
  newBankrollButton.textContent = "💰 New Bankroll";
});

const shortcutsButton = document.getElementById("shortcuts-btn");
console.log(shortcutsButton);
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const closeModal = document.getElementById("close-modal");
const helpButton = document.getElementById("help-btn");

function openModal(title, content) {
  modalTitle.textContent = title;

  modalContent.innerHTML = content;

  modalOverlay.classList.remove("hidden");
}

function closeModalBox() {
  console.log("Close clicked");

  modalOverlay.classList.add("hidden");

  console.log(modalOverlay.className);
}

closeModal.addEventListener("click", closeModalBox);

shortcutsButton.addEventListener("click", () => {
  console.log("clicked");

  openModal(
    "⌨️ Keyboard Shortcuts",
    `
<b>H</b> → Hit <br><br>
<b>S</b> → Stand <br><br>
<b>D</b> → Double <br><br>
<b>P</b> → Split <br><br>
<b>R</b> → Restart Round
`,
  );
});

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModalBox();
  }
});

helpButton.addEventListener("click", () => {
  openModal(
    "📖 How To Play",

    `
<h3>🎯 Objective</h3>

Beat the dealer without going over <b>21</b>.

<hr>

<h3>🃏 Blackjack</h3>

An Ace + any 10-value card is an instant Blackjack.

<hr>

<h3>💰 Double Down</h3>

Double your bet and receive exactly one more card.

<hr>

<h3>✂️ Split</h3>

If your first two cards have the same value, split them into two hands.

<hr>

<h3>🛡 Insurance</h3>

Available only when the dealer's first card is an Ace.

<hr>

<h3>🏳️ Surrender</h3>

Give up the round and lose only half your bet.

<hr>

<h3>🤝 Push</h3>

Equal scores return your bet.

<hr>

<h3>💸 New Bankroll</h3>

When your balance reaches $0, claim a New Bankroll to continue playing.

<hr>

<h3>🍀 Tips</h3>

• Don't hit on 20.

• Use Double Down wisely.

• Insurance is risky.

• Split pairs strategically.

`,
  );
});

const settingsButton = document.getElementById("settings-btn");
let soundEnabled = true;

settingsButton.addEventListener("click", () => {
  openModal(
    "⚙️ Settings",

    `
<div class="setting-item">

    <span>🔊 Sound Effects</span>

    <label class="switch">

        <input type="checkbox" id="sound-toggle" checked>

        <span class="slider"></span>

    </label>

</div>

<hr>

<div class="version">

    🎰 Blackjack Pro
    <br>
    <small>Version 1.0</small>

</div>
`,
  );

  const soundToggle = document.getElementById("sound-toggle");

  soundToggle.checked = soundEnabled;

  soundToggle.addEventListener("change", () => {
    soundEnabled = soundToggle.checked;

    localStorage.setItem("blackjackSound", soundEnabled);
  });

  document
    .getElementById("sound-toggle")
    .addEventListener("change", function () {
      soundEnabled = this.checked;
    });
});

const aboutButton = document.getElementById("about-btn");
aboutButton.addEventListener("click", () => {
  openModal(
    "ℹ About Blackjack Pro",

    `
<div class="about-container">

    <div class="about-header">

        <div class="about-logo">♠</div>

        <h2>BLACKJACK PRO</h2>

        <p>Casino Edition</p>

        <span class="version-badge">Version 1.0.0</span>

    </div>

    <hr>

<div class="about-footer">

    <a href="https://theerthananda.github.io" target="_blank">
        🌐 Visit Portfolio ↗
    </a>

    <p>Developed by <strong>Theerthananda</strong></p>

</div>

</div>
`,
  );
});

//==================================================
//              CARD SUITS
//==================================================

const suits = ["♠", "♥", "♦", "♣"];

//==================================================
//              CARD VALUES
//==================================================

const values = [
  "A",

  "2",

  "3",

  "4",

  "5",

  "6",

  "7",

  "8",

  "9",

  "10",

  "J",

  "Q",

  "K",
];

//==================================================
//          CREATE FULL DECK
//==================================================

function createDeck() {
  deck = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit,

        value,
      });
    }
  }

  //console.log(deck);
}

//==================================================
//              SHUFFLE DECK
//==================================================

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  console.log("🎲 Deck Shuffled!");

  console.log(deck);
}

//=============================
// DEAL ONE CARD
//=============================

function dealCard(hand) {
  const card = deck.pop();

  hand.push(card);

  playDealSound();

  return card;
}

//=============================
// START GAME
//=============================

function startGame() {

  currentHand = 1;

  hand1Bet = 0;
  hand2Bet = 0;

  insuranceBet = 0;

  isSplit = false;

  chipButtons.forEach((chip) => {
    chip.disabled = true;
  });

  hitButton.style.display = "inline-block";
  surrenderButton.style.display = "inline-block";

  splitButton.style.display = "none";
  gameStarted = true;

  doubleButton.disabled = false;
  splitButton.disabled = false;

  playerCards = [];
  dealerCards = [];
  splitHand = [];

  document.getElementById("hand2-title").style.display = "none";
  document.getElementById("split-score-container").style.display = "none";
  document.getElementById("split-score").textContent = "0";

  document.getElementById("split-cards").style.display = "none";
  document.getElementById("split-cards").innerHTML = "";

  document.getElementById("hand1-title").classList.remove("active-hand");
  document.getElementById("hand2-title").classList.remove("active-hand");

  dealCard(playerCards);
  dealCard(playerCards);

  dealCard(dealerCards);
  dealCard(dealerCards);

  if (dealerCards[0].value === "A") {
    insuranceButton.style.display = "inline-block";
  } else {
    insuranceButton.style.display = "none";
  }

  renderPlayerCards();
  checkSplit();
  renderDealerCards();

  updateScores();
  updateButtons();

  updateGameStatus("🎴 Round Started! Good Luck!", "dodgerblue");

  if (checkBlackjack()) {
    gameStarted = false;
    return;
  }

  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);

  //console.log("Player Score:", playerScore);
  //console.log("Dealer Score:", dealerScore);
}

function checkSplit() {
  if (playerCards.length !== 2) {
    hitButton.style.display = "inline-block";
    splitButton.style.display = "none";

    return;
  }

  if (playerCards[0].value === playerCards[1].value) {
    hitButton.style.display = "none";
    splitButton.style.display = "inline-block";
  } else {
    hitButton.style.display = "inline-block";
    splitButton.style.display = "none";
  }
}

function split() {
  playButtonSound();

  insuranceButton.style.display = "none";

  surrenderButton.style.display = "none";

  hand1Bet = currentBet;
  hand2Bet = currentBet;

  currentBet = hand1Bet;

  console.clear();

  console.log("=== BEFORE ===");
  console.log([...playerCards]);
  console.log([...splitHand]);

  if (playerBalance < currentBet) {
    alert("Not enough balance!");

    return;
  }

  playerBalance -= currentBet;
  balanceEl.textContent = `$${playerBalance}`;

  isSplit = true;

  currentHand = 1;

  document.getElementById("hand1-title").classList.add("active-hand");
  document.getElementById("hand2-title").classList.remove("active-hand");

  splitButton.style.display = "none";
  hitButton.style.display = "inline-block";
  splitButton.disabled = true;

  const removedCard = playerCards.pop();

  console.log("Removed:", removedCard);

  splitHand.push(removedCard);

  console.log("=== AFTER POP ===");
  console.log([...playerCards]);
  console.log([...splitHand]);

  dealCard(playerCards);
  dealCard(splitHand);

  renderPlayerCards();
  renderSplitHand();

  updateScores();
  updateButtons();

  currentBetEl.textContent = `$${hand1Bet}`;

  console.log("=== AFTER DEAL ===");
  console.log([...playerCards]);
  console.log([...splitHand]);

  saveGame();
}
//=====================================
// PLAYER HIT
//=====================================

function hit() {
  playButtonSound();

  insuranceButton.style.display = "none";

  surrenderButton.style.display = "none";

  if (!gameStarted) {
    alert("🎴 Start a new round!");

    return;
  }
  if (currentHand === 1) {
    dealCard(playerCards);
    renderPlayerCards();
  } else {
    dealCard(splitHand);
    renderSplitHand();
  }

  updateScores();

  const score =
    currentHand === 1 ? calculateScore(playerCards) : calculateScore(splitHand);

  if (currentHand === 1) {
    console.log("Hand 1:", playerCards);
  } else {
    console.log("Hand 2:", splitHand);
  }
  console.log("Player Score:", score);

  if (score > 21) {
    playBustSound();

    alert("💥 BUST!");

    if (isSplit && currentHand === 1) {
      currentHand = 2;

      document.getElementById("hand1-title").classList.remove("active-hand");
      document.getElementById("hand2-title").classList.add("active-hand");

      updateGameStatus("💥 Hand 1 Bust! 👉 Playing Hand 2", "orange");

      return;
    }

    gameStarted = false;

    renderDealerCards();

    updateScores();

    checkWinner();
  }
}

//=====================================
// DEALER TURN
//=====================================

function dealerPlay() {
  let dealerScore = calculateScore(dealerCards);

  while (dealerScore < 17) {
    dealCard(dealerCards);

    dealerScore = calculateScore(dealerCards);
  }

  renderDealerCards();
  updateScores();

  console.log("Dealer Score:", dealerScore);
}

function checkInsurance() {
  if (insuranceBet === 0) return;

  const dealerScore = calculateScore(dealerCards);

  if (dealerCards.length === 2 && dealerScore === 21) {
    playerBalance += insuranceBet * 3;

    updateGameStatus(`🛡 Insurance Won! +$${insuranceBet * 2}`, "lime");
  } else {
    playerBalance -= insuranceBet;
    balanceEl.textContent = `$${playerBalance}`;
    if (playerBalance <= 0) {
      chipButtons.forEach((chip) => {
        chip.style.display = "none";
      });

      newBankrollButton.style.display = "inline-block";

      updateGameStatus("💸 GAME OVER! Get a New Bankroll.", "red");
    }

    updateGameStatus(`❌ Insurance Lost!`, "red");
  }

  insuranceBet = 0;

  saveGame();
}

//=====================================
// STAND
//=====================================

function stand() {
  playButtonSound();

  insuranceButton.style.display = "none";
  surrenderButton.style.display = "none";

  if (!gameStarted) {
    alert("🎴 Start a new round!");

    return;
  }
  hitButton.style.display = "inline-block";

  splitButton.style.display = "none";

  if (isSplit && currentHand === 1) {
    currentHand = 2;

    document.getElementById("hand1-title").classList.remove("active-hand");
    document.getElementById("hand2-title").classList.add("active-hand");

    currentBetEl.textContent = `$${hand2Bet}`;

    hitButton.style.display = "inline-block";

    doubleButton.disabled = false;

    updateButtons();

    updateGameStatus("👉 Playing Hand 2", "gold");

    return;
  }

  dealerPlay();

  checkInsurance();

  gameStarted = false;

  renderDealerCards();

  updateScores();

  checkWinner();
}

function double() {
  playButtonSound();

  insuranceButton.style.display = "none";

  surrenderButton.style.display = "none";

  if (!gameStarted) {
    alert("🎴 Start a game first!");

    return;
  }

  if (playerBalance < currentBet) {
    alert("💰 Not enough balance to Double Down!");

    return;
  }

  playerBalance -= currentBet;

  if (isSplit) {
    if (currentHand === 1) {
      hand1Bet *= 2;
    } else {
      hand2Bet *= 2;
    }
  } else {
    currentBet *= 2;
  }

  balanceEl.textContent = `$${playerBalance}`;
  if (playerBalance <= 0) {
    chipButtons.forEach((chip) => {
      chip.style.display = "none";
    });

    newBankrollButton.style.display = "inline-block";

    updateGameStatus("💸 GAME OVER! Get a New Bankroll.", "red");
  }

  currentBetEl.textContent = `$${currentHand === 1 ? hand1Bet : hand2Bet}`;

  if (currentHand === 1) {
    dealCard(playerCards);

    renderPlayerCards();
  } else {
    dealCard(splitHand);

    renderSplitHand();
  }

  updateScores();

  doubleButton.disabled = true;

  if (isSplit) {
    if (currentHand === 1) {
      // Hand 1 finished, move to Hand 2
      stand();
    } else {
      // Hand 2 finished, now dealer plays
      dealerPlay();

      gameStarted = false;

      renderDealerCards();

      updateScores();

      checkWinner();
    }
  } else {
    stand();
  }
}

function compareHand(hand, handName) {
  const playerScore = calculateScore(hand);
  const dealerScore = calculateScore(dealerCards);

  const bet = handName === "Hand 1" ? hand1Bet : hand2Bet;

  if (playerScore > 21) {
    losses++;
    return `${handName} BUST ❌`;
  } else if (dealerScore > 21) {
    playerBalance += bet;
    wins++;

    return `${handName} WINS 🏆`;
  } else if (playerScore > dealerScore) {
    playerBalance += bet;
    wins++;

    return `${handName} WINS 🏆`;
  } else if (playerScore < dealerScore) {
    losses++;

    return `${handName} LOSES ❌`;
  } else {
    return `${handName} PUSH 🤝`;
  }
}
//=====================================
// CHECK WINNER
//=====================================

function checkWinner() {
  if (isSplit) {
    const hand1Result = compareHand(playerCards, "Hand 1");

    const hand2Result = compareHand(splitHand, "Hand 2");

    // Apply loss for each losing hand
    if (hand1Result.includes("LOSES") || hand1Result.includes("BUST")) {
      playerBalance -= hand1Bet;
    }

    if (hand2Result.includes("LOSES") || hand2Result.includes("BUST")) {
      playerBalance -= hand2Bet;
    }

    if (playerBalance < 0) {
      playerBalance = 0;
    }

    updateGameStatus(`${hand1Result} | ${hand2Result}`, "gold");

    playSplitSound();

    gamesPlayed++;

    updateStats();

    balanceEl.textContent = `$${playerBalance}`;
    if (playerBalance <= 0) {
      chipButtons.forEach((chip) => {
        chip.style.display = "none";
      });

      newBankrollButton.style.display = "inline-block";

      updateGameStatus("💸 GAME OVER! Get a New Bankroll.", "red");
    }

    currentBet = 0;

    currentBetEl.textContent = "$0";

    gameStarted = false;

    updateButtons();

    chipButtons.forEach((chip) => {
      chip.disabled = false;
    });

    // Reset split state
isSplit = false;
currentHand = 1;
splitHand = [];
hand1Bet = 0;
hand2Bet = 0;
insuranceBet = 0;

    saveGame();
    return;
  }
  console.log("✅ checkWinner called");

  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);


  console.log(currentBet);

  if (playerScore > 21) {
    playerBalance -= currentBet;

    losses++;

    gamesPlayed++;

    updateStats();
    playLoseSound();
    updateGameStatus("💥 BUST! Dealer Wins!", "red");
  } else if (dealerScore > 21) {
    playerBalance += currentBet;

    wins++;

    gamesPlayed++;

    updateStats();
    playWinSound();
    updateGameStatus("🎉 Dealer Bust! Player Wins!", "lime");
  } else if (playerScore > dealerScore) {
    playerBalance += currentBet;

    wins++;

    gamesPlayed++;

    updateStats();
    playWinSound();
    updateGameStatus("🏆 Player Wins!", "lime");
  } else if (dealerScore > playerScore) {
    playerBalance -= currentBet;

    losses++;

    gamesPlayed++;

    updateStats();
    playLoseSound();
    updateGameStatus("🤵 Dealer Wins!", "red");
  } else {
    gamesPlayed++;

    updateStats();

    updateGameStatus("🤝 Push! It's a Draw.", "dodgerblue");
  }

  balanceEl.textContent = `$${playerBalance}`;
  if (playerBalance <= 0) {
    chipButtons.forEach((chip) => {
      chip.style.display = "none";
    });

    newBankrollButton.style.display = "inline-block";

    updateGameStatus("💸 GAME OVER! Get a New Bankroll.", "red");
  }

  currentBet = 0;

  currentBetEl.textContent = "$0";

  gameStarted = false;

  chipButtons.forEach((chip) => {
    chip.disabled = false;
  });

  updateButtons();

  saveGame();
}

//=====================================
// RENDER PLAYER CARDS
//=====================================

function renderPlayerCards() {
  const container = document.getElementById("player-cards");

  container.innerHTML = "";

  playerCards.forEach((card, index) => {
    container.innerHTML += `

       <div class="playing-card"
     style="animation-delay:${index * 0.15}s">

            <span class="card-value">
                ${card.value}
            </span>

            <span class="card-suit">
                ${card.suit}
            </span>

        </div>

        `;
  });
}

function renderSplitHand() {
  const container = document.getElementById("split-cards");
  document.getElementById("split-score-container").style.display = "block";

  container.innerHTML = "";

  document.getElementById("hand2-title").style.display = "block";
  container.style.display = "flex";

  splitHand.forEach((card, index) => {
    container.innerHTML += `

        <div class="playing-card"
             style="animation-delay:${index * 0.15}s">

            <span class="card-value">
                ${card.value}
            </span>

            <span class="card-suit">
                ${card.suit}
            </span>

        </div>

        `;
  });
}

//=====================================
// RENDER DEALER CARDS
//=====================================

function renderDealerCards() {
  const container = document.getElementById("dealer-cards");

  container.innerHTML = "";

  dealerCards.forEach((card, index) => {
    if (gameStarted && index === 1) {
      container.innerHTML += `

        <div class="playing-card card-back"
     style="animation-delay:${index * 0.15}s">

            <span class="card-value">🂠</span>

            <span class="card-suit"></span>

        </div>

        `;
    } else {
      container.innerHTML += `

     <div class="playing-card"
     style="animation-delay:${index * 0.15}s">
            <span class="card-value">
                ${card.value}
            </span>

            <span class="card-suit">
                ${card.suit}
            </span>

        </div>

        `;
    }
  });
}

//=====================================
// CALCULATE SCORE
//=====================================

function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (card.value === "A") {
      score += 11;
      aces++;
    } else if (["K", "Q", "J"].includes(card.value)) {
      score += 10;
    } else {
      score += Number(card.value);
    }
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
}

//=====================================
// CHECK BLACKJACK
//=====================================

function checkBlackjack() {
  if (isSplit) {
    return false;
  }

  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);

  if (playerCards.length === 2 && playerScore === 21) {
    if (dealerCards.length === 2 && dealerScore === 21) {
      updateGameStatus("🤝 Both have Blackjack! Push!", "dodgerblue");
    } else {
      playerBalance += Math.floor(currentBet * 1.5);

      balanceEl.textContent = `$${playerBalance}`;
      if (playerBalance <= 0) {
        chipButtons.forEach((chip) => {
          chip.style.display = "none";
        });

        newBankrollButton.style.display = "inline-block";

        updateGameStatus("💸 GAME OVER! Get a New Bankroll.", "red");
      }

      currentBet = 0;
      currentBetEl.textContent = "$0";

      gameStarted = false;

      blackjacks++;

      wins++;

      gamesPlayed++;

      updateStats();

      playBlackjackSound();
      saveGame();

      updateGameStatus("🃏 BLACKJACK! Player Wins!", "gold");
      gameStarted = false;
    }

    chipButtons.forEach((chip) => {
      chip.disabled = false;
    });

    return true;
  }

  return false;
}

//=====================================
// NEW GAME
//=====================================

function newGame() {
  playButtonSound();

  chipButtons.forEach((chip) => {
    chip.disabled = false;
  });

  surrenderButton.style.display = "none";
  insuranceButton.style.display = "none";
  splitButton.style.display = "none";

  // Reset split state
  currentHand = 1;
  isSplit = false;
  splitHand = [];
  hand1Bet = 0;
  hand2Bet = 0;
  insuranceBet = 0;

  playerCards = [];
  dealerCards = [];

  renderPlayerCards();
  renderDealerCards();

  playerScoreEl.textContent = "0";
  dealerScoreEl.textContent = "?";

  currentBet = 0;
  currentBetEl.textContent = "$0";

  gameStarted = false;

  updateGameStatus("🎲 Place your bet to begin.", "dodgerblue");

  updateButtons();
}

//=====================================
// UPDATE SCORES
//=====================================

function updateScores() {
  playerScoreEl.textContent = calculateScore(playerCards);

  if (isSplit) {
    document.getElementById("split-score").textContent =
      calculateScore(splitHand);
  }

  if (gameStarted) {
    dealerScoreEl.textContent = "?";
  } else {
    dealerScoreEl.textContent = calculateScore(dealerCards);
  }
}

//=====================================
// UPDATE STATISTICS
//=====================================

function updateStats() {
  winsEl.textContent = wins;

  lossesEl.textContent = losses;

  blackjackEl.textContent = blackjacks;

  gamesPlayedEl.textContent = gamesPlayed;
}

//=====================================
// UPDATE GAME STATUS
//=====================================

//=====================================
// UPDATE GAME STATUS
//=====================================

function updateGameStatus(message, color = "white") {
  gameStatusEl.textContent = message;

  gameStatusEl.style.color = color;
}

//=====================================
// UPDATE BUTTON STATES
//=====================================

function updateButtons() {
  if (gameStarted) {
    dealButton.disabled = true;

    hitButton.disabled = false;

    standButton.disabled = false;
  } else {
    dealButton.disabled = false;

    hitButton.disabled = true;

    standButton.disabled = true;
  }
}

//=============================
// DEAL BUTTON
//=============================

const dealButton = document.getElementById("deal-btn");

dealButton.addEventListener("click", () => {
  if (currentBet === 0) {
    alert("💰 Please place a bet first!");

    return;
  }

  createDeck();

  shuffleDeck();

  startGame();
});
//=====================================
// HIT BUTTON
//=====================================

const hitButton = document.getElementById("hit-btn");

hitButton.addEventListener("click", () => {
  playButtonSound();
  hit();
});

const standButton = document.getElementById("stand-btn");

standButton.addEventListener("click", stand);
newGameButton.addEventListener("click", newGame);

chipButtons.forEach((chip) => {
  chip.addEventListener("click", () => {
    playChipSound();

    const bet = chip.dataset.bet;

    if (bet === "all") {
      currentBet = playerBalance;
    } else {
      const betAmount = Number(bet);

      if (betAmount > playerBalance) {
        alert("❌ Not enough balance!");

        return;
      }

      currentBet = betAmount;
    }

    currentBetEl.textContent = `$${currentBet}`;

    console.log(currentBet);
  });
});

function surrender() {
  playButtonSound();

  playerBalance -= currentBet / 2;

  balanceEl.textContent = `$${playerBalance}`;
  if (playerBalance <= 0) {
    chipButtons.forEach((chip) => {
      chip.style.display = "none";
    });

    newBankrollButton.style.display = "inline-block";

    updateGameStatus("💸 GAME OVER! Get a New Bankroll.", "red");
  }

  updateGameStatus("🏳 Player Surrendered!", "orange");

  losses++;

  gamesPlayed++;

  updateStats();

  currentBet = 0;

  currentBetEl.textContent = "$0";

  gameStarted = false;

  splitButton.style.display = "none";
  hitButton.style.display = "none";
  doubleButton.disabled = true;
  insuranceButton.style.display = "none";
  surrenderButton.style.display = "none";

  updateButtons();

  chipButtons.forEach((chip) => {
    chip.disabled = false;
  });

  saveGame();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "h") {
    hit();
  } else if (key === "s") {
    stand();
  } else if (key === "d") {
    double();
  } else if (key === "p") {
    split();
  } else if (key === "r") {
    newGame();
  }
});
updateButtons();
loadGame();
