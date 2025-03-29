// script.js
const objectsContainer = document.getElementById('objects');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const timerDisplay = document.getElementById('timer');
const levelButtons = document.querySelectorAll('.level-selector button');
const extraTimeButton = document.getElementById('extra-time');
const doublePointsButton = document.getElementById('double-points');
const freezeTimeButton = document.getElementById('freeze-time');
const shuffleObjectsButton = document.getElementById('shuffle-objects');
const playerNameInput = document.getElementById('player-name');
const startMultiplayerButton = document.getElementById('start-multiplayer');
const multiplayerFeedback = document.getElementById('multiplayer-feedback');
const leaderboardList = document.getElementById('leaderboard-list');
const avatarSelect = document.getElementById('avatar');
const themeSelect = document.getElementById('theme');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let currentLevel = 1;
let timeLeft = 60;
let timer;
let isDoublePointsActive = false;
let isTimeFrozen = false;
let multiplayerMode = false;
let players = JSON.parse(localStorage.getItem('players')) || [];

highScoreDisplay.textContent = highScore;

const levels = {
    1: [
        { emoji: "🔒", info: "Use strong passwords!", points: 10 },
        { emoji: "📝", info: "Change passwords regularly!", points: 10 },
    ],
    2: [
        { emoji: "👤", info: "Don't talk to strangers online!", points: 20 },
        { emoji: "🚫", info: "Block strangers who make you uncomfortable!", points: 20 },
    ],
    3: [
        { emoji: "📄", info: "Never share personal information!", points: 30 },
        { emoji: "🌐", info: "Be careful what you post online!", points: 30 },
        { emoji: "🛡️", info: "Use antivirus software!", points: 30 },
    ],
    4: [
        { emoji: "😡", info: "Don't respond to cyberbullies!", points: 40 },
        { emoji: "📵", info: "Report cyberbullying to an adult!", points: 40 },
    ],
    5: [
        { emoji: "🎣", info: "Don't click on suspicious links!", points: 50 },
        { emoji: "📧", info: "Be cautious with emails from unknown senders!", points: 50 },
    ],
    6: [
        { emoji: "🔍", info: "Verify website security (HTTPS)!", points: 60 },
        { emoji: "🚦", info: "Use safe browsing tools!", points: 60 },
    ],
    7: [
        { emoji: "📱", info: "Set social media profiles to private!", points: 70 },
        { emoji: "👀", info: "Be mindful of what you share online!", points: 70 },
    ],
    8: [
        { emoji: "🎮", info: "Don't share personal info in games!", points: 80 },
        { emoji: "🕹️", info: "Use parental controls for gaming!", points: 80 },
    ],
};

function loadLevel(level) {
    objectsContainer.innerHTML = ''; 
    levels[level].forEach(obj => {
        const div = document.createElement('div');
        div.className = 'object';
        div.innerHTML = `<span>${obj.emoji}</span><p class="info">${obj.info}</p>`;
        div.draggable = true;
        div.dataset.points = obj.points;
        objectsContainer.appendChild(div);
    });

    const objects = document.querySelectorAll('.object');
    objects.forEach(object => {
        object.addEventListener('dragstart', dragStart);
        object.addEventListener('dragend', dragEnd);
        object.addEventListener('click', onClick);
    });

    feedback.textContent = '';
    startTimer();
}

function dragStart(e) {
    this.classList.add('dragging');
    setTimeout(() => this.style.opacity = '0.7', 0);
    e.dataTransfer.setData('text/plain', this.innerHTML);
}

function dragEnd() {
    this.style.opacity = '1';
    this.classList.remove('dragging');
}

function onClick() {
    this.classList.add('clicked', 'glow');
    let points = parseInt(this.dataset.points);
    if (isDoublePointsActive) points *= 2;
    score += points;
    scoreDisplay.textContent = score;
    feedback.textContent = `Great job! You earned ${points} points!`;
    feedback.style.color = "green";
    correctSound.play();

    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('highScore', highScore);
    }

    setTimeout(() => this.classList.remove('glow'), 2000);

    checkLevelCompletion();
}

function checkLevelCompletion() {
    const goodItems = document.querySelectorAll('#good .object');
    const badItems = document.querySelectorAll('#bad .object');
    const totalObjects = levels[currentLevel].length;

    if (goodItems.length + badItems.length === totalObjects) {
        let correct = true;

        goodItems.forEach(item => {
            if (item.dataset.correct !== "good") {
                correct = false;
            }
        });

        badItems.forEach(item => {
            if (item.dataset.correct !== "bad") {
                correct = false;
            }
        });

        if (correct) {
            feedback.textContent = `Level ${currentLevel} completed! Moving to the next level...`;
            feedback.style.color = "green";
            setTimeout(() => {
                currentLevel++;
                if (currentLevel <= Object.keys(levels).length) {
                    loadLevel(currentLevel);
                } else {
                    feedback.textContent = "Congratulations! You've completed all levels!";
                    feedback.style.color = "blue";
                }
            }, 2000); 
        }
    }
}

function startTimer() {
    timeLeft = 60;
    timerDisplay.textContent = timeLeft;
    clearInterval(timer); 
    timer = setInterval(() => {
        if (!isTimeFrozen) {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                feedback.textContent = "Time's up! Try again.";
                feedback.style.color = "red";
            }
        }
    }, 1000);
}


extraTimeButton.addEventListener('click', () => {
    timeLeft += 10;
    timerDisplay.textContent = timeLeft;
    feedback.textContent = "You gained 10 extra seconds!";
    feedback.style.color = "blue";
});

doublePointsButton.addEventListener('click', () => {
    isDoublePointsActive = true;
    feedback.textContent = "Double points activated for the next 3 clicks!";
    feedback.style.color = "blue";
    setTimeout(() => {
        isDoublePointsActive = false;
        feedback.textContent = "Double points deactivated.";
        feedback.style.color = "red";
    }, 30000); 
});

freezeTimeButton.addEventListener('click', () => {
    isTimeFrozen = true;
    feedback.textContent = "Time frozen for 10 seconds!";
    feedback.style.color = "blue";
    setTimeout(() => {
        isTimeFrozen = false;
        feedback.textContent = "Time unfrozen.";
        feedback.style.color = "red";
    }, 10000); 
});

shuffleObjectsButton.addEventListener('click', () => {
    const objectsArray = Array.from(objectsContainer.children);
    objectsArray.sort(() => Math.random() - 0.5);
    objectsContainer.innerHTML = '';
    objectsArray.forEach(object => objectsContainer.appendChild(object));
    feedback.textContent = "Objects shuffled!";
    feedback.style.color = "blue";
});

startMultiplayerButton.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        multiplayerMode = true;
        players.push({ name: playerName, score: 0 });
        multiplayerFeedback.textContent = `Welcome, ${playerName}! Multiplayer mode activated.`;
        multiplayerFeedback.style.color = "green";
        updateLeaderboard();
        saveLeaderboard();
    } else {
        multiplayerFeedback.textContent = "Please enter your name!";
        multiplayerFeedback.style.color = "red";
    }
});

function updateLeaderboard() {
    leaderboardList.innerHTML = '';
    players.sort((a, b) => b.score - a.score); 
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name}: ${player.score} points`;
        leaderboardList.appendChild(li);
    });
}

function saveLeaderboard() {
    localStorage.setItem('players', JSON.stringify(players));
}

function loadLeaderboard() {
    const savedPlayers = JSON.parse(localStorage.getItem('players')) || [];
    players = savedPlayers;
    updateLeaderboard();
}

avatarSelect.addEventListener('change', (e) => {
    const avatar = e.target.value;
    feedback.textContent = `Avatar changed to ${avatar}!`;
    feedback.style.color = "blue";
});

themeSelect.addEventListener('change', (e) => {
    const theme = e.target.value;
    document.body.className = theme;
    feedback.textContent = `Theme changed to ${theme}!`;
    feedback.style.color = "blue";
});

document.addEventListener('dragover', e => {
    e.preventDefault();
});

document.addEventListener('drop', e => {
    e.preventDefault();
    feedback.textContent = "You moved an object!";
    feedback.style.color = "blue";
});

loadLevel(currentLevel);

loadLeaderboard();

levelButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentLevel = parseInt(button.textContent.replace("Level ", "").charAt(0));
        loadLevel(currentLevel);
    });
});