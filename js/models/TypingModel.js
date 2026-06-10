export class TypingModel {
    constructor() {
        this.mode = "time"; // "time" | "words" | "custom" | "row"
        this.duration = 30; // 15, 30, 60, 120 (seconds)
        this.wordCount = 25; // 10, 25, 50, 100 (words)
        this.customText = "";
        this.rowSelection = "home"; // "home" | "top" | "bottom" | "mixed"

        this.words = []; // Array of { text: string, letters: Array<{char: string, status: "untyped"|"correct"|"incorrect"|"extra"}> }
        this.activeWordIndex = 0;
        this.activeLetterIndex = 0;

        this.startTime = null;
        this.endTime = null;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.isTestActive = false;
        this.isTestCompleted = false;

        // Metrics tracking
        this.totalKeystrokes = 0;
        this.errorKeystrokes = 0; // Number of times an incorrect key was pressed (even if corrected)
        
        // Progress tracking for Chart.js
        this.historyData = []; // Array of { second: number, wpm: number, rawWpm: number, errors: number }
        
        // Callbacks for controller to listen to events
        this.onTimerTick = null;
        this.onTestComplete = null;
    }

    setMode(mode) {
        this.mode = mode;
        this.reset();
    }

    setDuration(duration) {
        this.duration = parseInt(duration, 10);
        this.reset();
    }

    setWordCount(count) {
        this.wordCount = parseInt(count, 10);
        this.reset();
    }

    setCustomText(text) {
        this.customText = text.trim();
        this.reset();
    }

    setRowSelection(selection) {
        this.rowSelection = selection;
        this.reset();
    }

    reset() {
        this.stopTimer();
        this.words = [];
        this.activeWordIndex = 0;
        this.activeLetterIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.timeLeft = this.mode === "time" ? this.duration : 0;
        this.isTestActive = false;
        this.isTestCompleted = false;
        this.totalKeystrokes = 0;
        this.errorKeystrokes = 0;
        this.historyData = [];
    }

    initializeTest(wordsList, quotesList, rowWords = {}) {
        this.reset();
        
        let textToUse = "";
        
        if (this.mode === "custom") {
            textToUse = this.customText || "Paste your custom text in the settings to practice.";
        } else if (this.mode === "row") {
            const homeKeys = "asdfghjkl";
            const topKeys = "qwertyuiop";
            const bottomKeys = "zxcvbnm";
            
            let allowedLettersStr = "";
            let targetPresetList = [];
            
            if (this.rowSelection === "home") {
                allowedLettersStr = homeKeys;
                targetPresetList = rowWords.home || [];
            } else if (this.rowSelection === "top") {
                allowedLettersStr = topKeys;
                targetPresetList = rowWords.top || [];
            } else if (this.rowSelection === "bottom") {
                allowedLettersStr = bottomKeys;
                targetPresetList = rowWords.bottom || [];
            } else if (this.rowSelection === "home_top") {
                allowedLettersStr = homeKeys + topKeys;
            } else if (this.rowSelection === "home_bottom") {
                allowedLettersStr = homeKeys + bottomKeys;
            } else if (this.rowSelection === "top_bottom") {
                allowedLettersStr = topKeys + bottomKeys;
            } else {
                // All keys
                allowedLettersStr = homeKeys + topKeys + bottomKeys;
            }
            
            let listToUse = [];
            
            if (targetPresetList.length > 0) {
                listToUse = targetPresetList;
            } else {
                // Filter the main list for words matching allowed characters
                const allowedSet = new Set(allowedLettersStr.split(""));
                listToUse = wordsList.filter(word => {
                    return word.toLowerCase().split("").every(char => allowedSet.has(char));
                });
                
                // Fallback in case of empty or low number matches
                if (listToUse.length < 5) {
                    if (this.rowSelection === "home_top") {
                        listToUse = [...(rowWords.home || []), ...(rowWords.top || [])];
                    } else if (this.rowSelection === "home_bottom") {
                        listToUse = [...(rowWords.home || []), ...(rowWords.bottom || [])];
                    } else if (this.rowSelection === "top_bottom") {
                        listToUse = [...(rowWords.top || []), ...(rowWords.bottom || [])];
                    } else {
                        listToUse = wordsList;
                    }
                }
            }
            
            // Generate 25 words of row training
            const selectedWords = [];
            for (let i = 0; i < 25; i++) {
                const randIndex = Math.floor(Math.random() * listToUse.length);
                selectedWords.push(listToUse[randIndex]);
            }
            textToUse = selectedWords.join(" ");
        } else if (this.mode === "words") {
            // Pick random words
            const selectedWords = [];
            for (let i = 0; i < this.wordCount; i++) {
                const randIndex = Math.floor(Math.random() * wordsList.length);
                selectedWords.push(wordsList[randIndex]);
            }
            textToUse = selectedWords.join(" ");
        } else {
            // Time mode: fill with random words. 
            // We generate plenty of words so they don't run out. Let's make it 100 words.
            const selectedWords = [];
            for (let i = 0; i < 150; i++) {
                const randIndex = Math.floor(Math.random() * wordsList.length);
                selectedWords.push(wordsList[randIndex]);
            }
            textToUse = selectedWords.join(" ");
        }

        // Parse textToUse into structure
        this.words = textToUse.split(/\s+/).map(wordStr => {
            return {
                text: wordStr,
                letters: wordStr.split("").map(char => ({
                    char,
                    status: "untyped"
                }))
            };
        });

        if (this.mode === "time") {
            this.timeLeft = this.duration;
        }
    }

    start() {
        this.isTestActive = true;
        this.startTime = Date.now();
        
        if (this.mode === "time") {
            this.timeLeft = this.duration;
            this.startTimer();
        } else {
            // For words/custom modes, we also run a timer to track WPM over time
            this.timeLeft = 0;
            this.startTimer();
        }
    }

    startTimer() {
        this.stopTimer();
        
        let secondCounter = 0;
        this.timerInterval = setInterval(() => {
            secondCounter++;
            
            if (this.mode === "time") {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    this.complete();
                    return;
                }
            } else {
                this.timeLeft++; // acts as elapsed time in words / custom mode
            }

            // Calculate current snapshot for history chart
            const elapsedMins = secondCounter / 60;
            if (elapsedMins > 0) {
                const stats = this.getCurrentStats(elapsedMins);
                this.historyData.push({
                    second: secondCounter,
                    wpm: Math.round(stats.wpm),
                    rawWpm: Math.round(stats.rawWpm),
                    errors: this.errorKeystrokes
                });
            }

            if (this.onTimerTick) {
                this.onTimerTick(this.timeLeft);
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    complete() {
        this.stopTimer();
        this.endTime = Date.now();
        this.isTestActive = false;
        this.isTestCompleted = true;

        if (this.onTestComplete) {
            const duration = this.getElapsedTimeSeconds();
            const stats = this.getCurrentStats(duration / 60);
            
            // Add a final data point to history data if empty or at a new second
            const finalSecond = Math.round(duration);
            if (this.historyData.length === 0 || this.historyData[this.historyData.length - 1].second !== finalSecond) {
                this.historyData.push({
                    second: finalSecond,
                    wpm: Math.round(stats.wpm),
                    rawWpm: Math.round(stats.rawWpm),
                    errors: this.errorKeystrokes
                });
            }

            this.onTestComplete(stats, this.historyData);
        }
    }

    getElapsedTimeSeconds() {
        if (!this.startTime) return 0;
        const end = this.endTime || Date.now();
        return (end - this.startTime) / 1000;
    }

    getCurrentStats(elapsedMins) {
        if (elapsedMins <= 0) elapsedMins = 0.01; // Avoid divide by zero

        let correctChars = 0;
        let incorrectChars = 0;
        let extraChars = 0;

        // Iterate through already processed words/letters
        this.words.forEach((word, wIdx) => {
            word.letters.forEach(letter => {
                if (letter.status === "correct") {
                    correctChars++;
                } else if (letter.status === "incorrect") {
                    incorrectChars++;
                } else if (letter.status === "extra") {
                    extraChars++;
                }
            });
            // Count spaces as correct characters if we've passed this word (except the last one)
            if (wIdx < this.activeWordIndex) {
                correctChars++; // Space character
            }
        });

        // Current typing stats
        // Net WPM = (correct letters / 5) / time (mins)
        const wpm = (correctChars / 5) / elapsedMins;
        
        // Raw WPM = (all keystrokes / 5) / time (mins)
        // Keystrokes include spacebar as well
        const rawWpm = (this.totalKeystrokes / 5) / elapsedMins;

        // Accuracy = correct characters / total typed characters (correct + incorrect + extra)
        const totalTypedChars = correctChars + incorrectChars + extraChars;
        const accuracy = totalTypedChars > 0 ? (correctChars / totalTypedChars) * 100 : 100;

        return {
            wpm: Math.max(0, wpm),
            rawWpm: Math.max(0, rawWpm),
            accuracy: Math.min(100, Math.max(0, accuracy)),
            correctChars,
            incorrectChars,
            extraChars
        };
    }

    processKey(key) {
        if (!this.isTestActive && !this.isTestCompleted) {
            this.start();
        }

        if (this.isTestCompleted) return;

        const currentWord = this.words[this.activeWordIndex];
        
        if (key === "Backspace") {
            this.totalKeystrokes++;
            this.handleBackspace();
        } else if (key === " ") {
            this.totalKeystrokes++;
            this.handleSpace();
        } else if (key.length === 1) {
            // A regular printable character
            this.totalKeystrokes++;
            this.handleCharacter(key, currentWord);
        }

        // Check if finished (in Words or Custom mode)
        if (this.mode !== "time" && this.isFinished()) {
            this.complete();
        }
    }

    handleCharacter(key, currentWord) {
        const letters = currentWord.letters;
        
        // If they are typing beyond the length of the word (adding extra characters)
        if (this.activeLetterIndex >= letters.length) {
            if (letters.length < 16) { // Limit extra characters to avoid infinite typing in a single word
                letters.push({
                    char: key,
                    status: "extra"
                });
                this.activeLetterIndex++;
                this.errorKeystrokes++;
            }
        } else {
            // Normal character check
            const currentLetter = letters[this.activeLetterIndex];
            if (currentLetter.char === key) {
                currentLetter.status = "correct";
            } else {
                currentLetter.status = "incorrect";
                this.errorKeystrokes++;
            }
            this.activeLetterIndex++;
        }
    }

    handleBackspace() {
        const currentWord = this.words[this.activeWordIndex];

        if (this.activeLetterIndex > 0) {
            this.activeLetterIndex--;
            const letter = currentWord.letters[this.activeLetterIndex];
            
            if (letter.status === "extra") {
                // Remove the extra letter completely
                currentWord.letters.splice(this.activeLetterIndex, 1);
            } else {
                letter.status = "untyped";
            }
        } else if (this.activeWordIndex > 0) {
            // Move back to the previous word
            this.activeWordIndex--;
            const prevWord = this.words[this.activeWordIndex];
            this.activeLetterIndex = prevWord.letters.length;
        }
    }

    handleSpace() {
        const currentWord = this.words[this.activeWordIndex];
        
        // Space acts as committing the current word and moving to the next.
        // If they haven't typed anything in the current word yet, do nothing (ignore double spaces).
        if (this.activeLetterIndex === 0) return;

        // If they skipped some characters, mark them as incorrect
        for (let i = this.activeLetterIndex; i < currentWord.letters.length; i++) {
            currentWord.letters[i].status = "incorrect";
            this.errorKeystrokes++;
        }

        // Move to the next word
        if (this.activeWordIndex < this.words.length - 1) {
            this.activeWordIndex++;
            this.activeLetterIndex = 0;
        } else {
            // Committing the last word finishes the test
            this.complete();
        }
    }

    isFinished() {
        // Test is finished in words or custom mode when the user reaches the end of all words
        if (this.activeWordIndex === this.words.length - 1) {
            const lastWord = this.words[this.activeWordIndex];
            // If the user has typed all letters in the last word
            if (this.activeLetterIndex >= lastWord.letters.length) {
                // If there are no extra letters or we are at the exact end
                return true;
            }
        }
        return false;
    }
}
