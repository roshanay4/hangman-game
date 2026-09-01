#include <iostream>
#include <string>
#include <random>
#include <algorithm>
using namespace std;

int main() {
    string secretWord;
    int mode;

    cout << "Welcome to Hangman!" << endl;
    cout << "Choose mode:" << endl;
    cout << "1. Play against Computer" << endl;
    cout << "2. Play against a Friend" << endl;
    cout << "Enter choice (1 or 2): ";
    cin >> mode;

    if (mode == 1) {
        string words[] = {"PROGRAMMING", "COMPUTER", "KEYBOARD", "FUNCTION", "VARIABLE"};
        int wordCount = 5;

        random_device rd;
        mt19937 gen(rd());
        uniform_int_distribution<> dist(0, wordCount - 1);
        secretWord = words[dist(gen)];

    } else if (mode == 2) {
        cout << "\nPlayer 1: Enter the secret word (Player 2 should look away!): ";
        cin >> secretWord;

        transform(secretWord.begin(), secretWord.end(), secretWord.begin(), ::toupper);

        for (int i = 0; i < 50; i++) cout << endl;
        cout << "Player 2, get ready to guess!" << endl;
    } else {
        cout << "Invalid choice. Exiting." << endl;
        return 0;
    }

    string guessedDisplay(secretWord.length(), '_');
    int wrongGuesses = 0;
    int maxWrongGuesses = 8;
    string guessedLetters = "";

    cout << "\nGuess the word. You have " << maxWrongGuesses << " wrong guesses allowed." << endl;

    while (wrongGuesses < maxWrongGuesses && guessedDisplay != secretWord) {
        cout << "\nWord: " << guessedDisplay << endl;
        cout << "Wrong guesses: " << wrongGuesses << "/" << maxWrongGuesses << endl;
        cout << "Already guessed: " << guessedLetters << endl;
        cout << "Guess a letter: ";

        char guess;
        cin >> guess;
        guess = toupper(guess);

        if (guessedLetters.find(guess) != string::npos) {
            cout << "You already guessed that letter!" << endl;
            continue;
        }

        guessedLetters += guess;

        bool found = false;
        for (int i = 0; i < secretWord.length(); i++) {
            if (secretWord[i] == guess) {
                guessedDisplay[i] = guess;
                found = true;
            }
        }

        if (!found) {
            wrongGuesses++;
            cout << "Wrong guess!" << endl;
        } else {
            cout << "Good guess!" << endl;
        }
    }

    if (guessedDisplay == secretWord) {
        cout << "\nCongratulations! You guessed the word: " << secretWord << endl;
    } else {
        cout << "\nGame Over! The word was: " << secretWord << endl;
    }

    return 0;
}