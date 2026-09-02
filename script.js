const words = ["PROGRAMMING", "COMPUTER", "KEYBOARD", "FUNCTION", "VARIABLE"];
let secretWord = "";
let currentMode = "";
let guessedLetters = [];
let wrongGuesses = 0;

const SUPABASE_URL = "https://iipfldbpoaijhhwecqja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcGZsZGJwb2Fpamhod2VjcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjQ2MTMsImV4cCI6MjEwMzkwMDYxM30.yKrbRnDDU2_4cOPkmB_qOGi6cqEAqTmacPx1uBXIkYU";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const maxWrongGuesses = 8;

const modeSelection = document.getElementById("mode-selection");
const wordSetup = document.getElementById("word-setup");
const linkDisplay = document.getElementById("link-display");
const readyScreen = document.getElementById("ready-screen");
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
document.getElementById("vs-friend-btn").addEventListener("click", showWordSetup);
document.getElementById("submit-word-btn").addEventListener("click", submitWord);
document.getElementById("copy-link-btn").addEventListener("click", copyLink);
document.getElementById("ready-btn").addEventListener("click", startGuessing);
restartBtn.addEventListener("click", () => window.location.href = window.location.pathname);

// Check if this page was opened via a shared link
window.addEventListener("load", checkForSharedWord);

function checkForSharedWord() {
    const params = new URLSearchParams(window.location.search);
    const encodedWord = params.get("word");

    if (encodedWord) {
        secretWord = atob(encodedWord); // decode the word
        modeSelection.style.display = "none";
        readyScreen.style.display = "block";
            currentMode = "friend";
    }
}

function startComputerGame() {
    secretWord = words[Math.floor(Math.random() * words.length)];
        currentMode = "computer";
    modeSelection.style.display = "none";
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

    const encodedWord = btoa(word); // encode the word so it's not plainly visible
    const link = `${window.location.origin}${window.location.pathname}?word=${encodedWord}`;

    generatedLink.value = link;
    wordSetup.style.display = "none";
    linkDisplay.style.display = "block";
        currentMode = "friend";
}

function copyLink() {
    generatedLink.select();
    document.execCommand("copy");
    alert("Link copied! Send it to your friend.");
}

function startGuessing() {
    readyScreen.style.display = "none";
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
        endGame();
    } else if (wrongGuesses >= maxWrongGuesses) {
        message.textContent = `Game Over! The word was: ${secretWord}`;
        saveResult("lost");
        endGame();
    }
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
