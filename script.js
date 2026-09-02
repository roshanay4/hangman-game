const words = ["PROGRAMMING", "COMPUTER", "KEYBOARD", "FUNCTION", "VARIABLE"];
let secretWord = "";
let currentMode = "";
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrongGuesses = 8;

const SUPABASE_URL = "https://iipfldbpoaijhhwecqja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcGZsZGJwb2Fpamhod2VjcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjQ2MTMsImV4cCI6MjEwMzkwMDYxM30.yKrbRnDDU2_4cOPkmB_qOGi6cqEAqTmacPx1uBXIkYU";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let player1Score = 0;
let player2Score = 0;
let isDirectFriendMode = false;

const modeSelection = document.getElementById("mode-selection");
const directWordSetup = document.getElementById("direct-word-setup");
const directWordInput = document.getElementById("direct-word-input");
const wordSetup = document.getElementById("word-setup");
const linkDisplay = document.getElementById("link-display");
const readyScreen = document.getElementById("ready-screen");
const scoreBoard = document.getElementById("score-board");
const player1ScoreDisplay = document.getElementById("player1-score");
const player2ScoreDisplay = document.getElementById("player2-score");
const gameArea = document.getElementById("game-area");
const wordInput = document.getElementById("word-input");
const generatedLink = document.getElementById("generated-link");
const wordDisplay = document.getElementById("word-display");
const wrongCount = document.getElementById("wrong-count");
const guessedLettersDisplay = document.getElementById("guessed-letters");
const letterButtons = document.getElementById("letter-buttons");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

document.getElementById("vs-computer-btn").addEventListener("click", startComputerGame);
document.getElementById("vs-friend-direct-btn").addEventListener("click", showDirectWordSetup);
document.getElementById("direct-submit-btn").addEventListener("click", submitDirectWord);
document.getElementById("vs-friend-btn").addEventListener("click", showWordSetup);
document.getElementById("submit-word-btn").addEventListener("click", submitWord);
document.getElementById("copy-link-btn").addEventListener("click", copyLink);
document.getElementById("ready-btn").addEventListener("click", startGuessing);
restartBtn.addEventListener("click", playAgain);

window.addEventListener("load", checkForSharedWord);

function checkForSharedWord() {
    const params = new URLSearchParams(window.location.search);
    const encodedWord = params.get("word");

    if (encodedWord) {
        secretWord = atob(encodedWord);
        currentMode = "friend";
        modeSelection.style.display = "none";
        readyScreen.style.display = "block";
    }
}

function startComputerGame() {
    secretWord = words[Math.floor(Math.random() * words.length)];
    currentMode = "computer";
    isDirectFriendMode = false;
    modeSelection.style.display = "none";
    beginGame();
}

function showDirectWordSetup() {
    modeSelection.style.display = "none";
    directWordSetup.style.display = "block";
}

function submitDirectWord() {
    const word = directWordInput.value.trim().toUpperCase();
    if (word.length === 0) {
        alert("Please enter a word!");
        return;
    }
    secretWord = word;
    currentMode = "friend";
    isDirectFriendMode = true;
    directWordInput.value = "";
    directWordSetup.style.display = "none";
    scoreBoard.style.display = "block";
    beginGame();
}

function showWordSetup() {
    modeSelection.style.display = "none";
    wordSetup.style.display = "block";
}

function submitWord() {
    const word = wordInput.value.trim().toUpperCase();
    if (word.length === 0) {
        alert("Please enter a word!");
        return;
    }

    const encodedWord = btoa(word);
    const link = `${window.location.origin}${window.location.pathname}?word=${encodedWord}`;

    generatedLink.value = link;
    wordSetup.style.display = "none";
    linkDisplay.style.display = "block";
    currentMode = "friend";
    isDirectFriendMode = false;
}

function copyLink() {
    generatedLink.select();
    document.execCommand("copy");
    alert("Link copied! Send it to your friend.");
}

function startGuessing() {
    readyScreen.style.display = "none";
    isDirectFriendMode = false;
    beginGame();
}

function beginGame() {
    guessedLetters = [];
    wrongGuesses = 0;
    gameArea.style.display = "block";
    message.textContent = "";
    restartBtn.style.display = "none";

    updateDisplay();
    createLetterButtons();
}

function updateDisplay() {
    let display = "";
    for (let letter of secretWord) {
        display += guessedLetters.includes(letter) ? letter : "_";
    }
    wordDisplay.textContent = display;
    wrongCount.textContent = `Wrong guesses: ${wrongGuesses}/${maxWrongGuesses}`;
    guessedLettersDisplay.textContent = `Guessed: ${guessedLetters.join(", ")}`;
}

function createLetterButtons() {
    letterButtons.innerHTML = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let letter of alphabet) {
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.addEventListener("click", () => guessLetter(letter, btn));
        letterButtons.appendChild(btn);
    }
}

function guessLetter(letter, btn) {
    btn.disabled = true;
    guessedLetters.push(letter);

    if (!secretWord.includes(letter)) {
        wrongGuesses++;
    }

    updateDisplay();
    checkGameEnd();
}

function checkGameEnd() {
    const won = [...secretWord].every(letter => guessedLetters.includes(letter));

    if (won) {
        message.textContent = "Congratulations! You won! 🎉";
        saveResult("won");
        if (isDirectFriendMode) {
            player2Score++;
            updateScoreDisplay();
        }
        endGame();
    } else if (wrongGuesses >= maxWrongGuesses) {
        message.textContent = `Game Over! The word was: ${secretWord}`;
        saveResult("lost");
        if (isDirectFriendMode) {
            player1Score++;
            updateScoreDisplay();
        }
        endGame();
    }
}

function updateScoreDisplay() {
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
}

async function saveResult(result) {
    await supabaseClient
        .from("game_results")
        .insert([{ mode: currentMode, result: result, word: secretWord }]);
}

function endGame() {
    const buttons = letterButtons.querySelectorAll("button");
    buttons.forEach(btn => btn.disabled = true);
    restartBtn.style.display = "inline-block";
}

function playAgain() {
    if (isDirectFriendMode) {
        gameArea.style.display = "none";
        directWordSetup.style.display = "block";
    } else {
        window.location.href = window.location.pathname;
    }
}