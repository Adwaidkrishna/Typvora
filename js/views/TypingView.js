export class TypingView {
    constructor() {
        // Cache DOM elements
        this.wordsContainer = document.getElementById("words-container");
        this.caret = document.getElementById("caret");
        this.timerDisplay = document.getElementById("timer-display");
        
        this.testSection = document.getElementById("test-section");
        this.resultsSection = document.getElementById("results-section");
        
        // Results metrics
        this.wpmVal = document.getElementById("wpm-val");
        this.accuracyVal = document.getElementById("accuracy-val");
        this.rawWpmVal = document.getElementById("raw-wpm-val");
        this.timeVal = document.getElementById("time-val");
        this.charsVal = document.getElementById("chars-val");
        this.chartCanvas = document.getElementById("performance-chart");
        
        // Navigation / Modals / Controls
        this.themeBtn = document.getElementById("theme-toggle-btn");
        this.themeModal = document.getElementById("theme-modal");
        this.closeThemeBtn = document.getElementById("close-theme-btn");
        this.themeGrid = document.getElementById("theme-grid");
        
        this.settingsBtn = document.getElementById("settings-btn");
        this.settingsModal = document.getElementById("settings-modal");
        this.closeSettingsBtn = document.getElementById("close-settings-btn");
        
        this.historyBtn = document.getElementById("history-btn");
        this.historyDrawer = document.getElementById("history-drawer");
        this.closeHistoryBtn = document.getElementById("close-history-btn");
        this.historyList = document.getElementById("history-list");
        this.clearHistoryBtn = document.getElementById("clear-history-btn");
        
        // Summary stats in history drawer
        this.sumTests = document.getElementById("sum-tests");
        this.sumAvgWpm = document.getElementById("sum-avg-wpm");
        this.sumMaxWpm = document.getElementById("sum-max-wpm");
        this.sumAvgAcc = document.getElementById("sum-avg-acc");
        this.sumTime = document.getElementById("sum-time");

        // Config Controls
        this.modeButtons = document.querySelectorAll(".mode-btn");
        this.timeSubconfig = document.getElementById("time-subconfig");
        this.wordsSubconfig = document.getElementById("words-subconfig");
        this.rowSubconfig = document.getElementById("row-subconfig");
        this.customSubconfig = document.getElementById("custom-subconfig");
        
        this.timeOptions = document.querySelectorAll("[data-time]");
        this.wordOptions = document.querySelectorAll("[data-words]");
        this.rowOptions = document.querySelectorAll("[data-row]");
        this.rowDropdownBtn = document.getElementById("row-dropdown-btn");
        this.rowDropdownMenu = document.getElementById("row-dropdown-menu");
        this.immersiveHUD = document.getElementById("immersive-hud");
        this.hudTimer = document.getElementById("hud-timer");
        this.hudWpm = document.getElementById("hud-wpm");
        this.hudAccuracy = document.getElementById("hud-accuracy");
        this.hudErrors = document.getElementById("hud-errors");
        this.customTextSubmit = document.getElementById("custom-text-submit");
        this.customTextInput = document.getElementById("custom-text-input");
        
        this.restartBtns = document.querySelectorAll(".restart-btn");
        this.keyboardContainer = document.getElementById("keyboard-container");
        
        // Audio Controls in settings
        this.soundTypeSelect = document.getElementById("sound-type-select");
        this.volumeRange = document.getElementById("volume-range");
        this.volumeVal = document.getElementById("volume-val");
        
        // Visual settings controls
        this.keyboardToggle = document.getElementById("keyboard-toggle");
        this.fontSizeSelect = document.getElementById("font-size-select");
        this.fontFamilySelect = document.getElementById("font-family-select");
        
        // Setup initial UI states
        this.setupGeneralEventListeners();
    }

    setupGeneralEventListeners() {
        // Toggle theme modal
        this.themeBtn.addEventListener("click", () => this.openModal(this.themeModal));
        this.closeThemeBtn.addEventListener("click", () => this.closeModal(this.themeModal));
        
        // Toggle settings modal
        this.settingsBtn.addEventListener("click", () => this.openModal(this.settingsModal));
        this.closeSettingsBtn.addEventListener("click", () => this.closeModal(this.settingsModal));
        
        // Toggle history drawer
        this.historyBtn.addEventListener("click", () => this.openDrawer(this.historyDrawer));
        this.closeHistoryBtn.addEventListener("click", () => this.closeDrawer(this.historyDrawer));
        
        // Close modals on clicking backdrop
        window.addEventListener("click", (e) => {
            if (e.target === this.themeModal) this.closeModal(this.themeModal);
            if (e.target === this.settingsModal) this.closeModal(this.settingsModal);
            if (e.target === this.historyDrawer) this.closeDrawer(this.historyDrawer);
        });

        // Volume slider indicator
        this.volumeRange.addEventListener("input", (e) => {
            this.volumeVal.textContent = Math.round(e.target.value * 100) + "%";
        });
    }

    openModal(modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    }

    closeModal(modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
        // Force caret refocus
        this.focusTyping();
    }

    openDrawer(drawer) {
        drawer.classList.add("active");
    }

    closeDrawer(drawer) {
        drawer.classList.remove("active");
        this.focusTyping();
    }

    focusTyping() {
        // We will trigger a hidden input focus or just window focus
        const focusInput = document.getElementById("focus-input");
        if (focusInput) {
            focusInput.focus();
        }
    }

    renderWords(wordsData) {
        this.wordsContainer.innerHTML = "";
        
        // Add a hidden input to capture keystrokes on mobile & desktop focus
        if (!document.getElementById("focus-input")) {
            const input = document.createElement("input");
            input.type = "text";
            input.id = "focus-input";
            input.style.position = "absolute";
            input.style.opacity = "0";
            input.style.pointerEvents = "none";
            input.style.left = "-9999px";
            this.wordsContainer.appendChild(input);
        }

        // Re-append caret
        this.caret.classList.remove("hidden");
        this.caret.classList.add("blinking");
        this.wordsContainer.appendChild(this.caret);

        wordsData.forEach((wordObj, wIdx) => {
            const wordEl = document.createElement("div");
            wordEl.className = "word";
            wordEl.setAttribute("data-word-idx", wIdx);
            
            wordObj.letters.forEach((letterObj, lIdx) => {
                const letterEl = document.createElement("span");
                letterEl.className = "letter";
                letterEl.setAttribute("data-letter-idx", lIdx);
                letterEl.textContent = letterObj.char;
                wordEl.appendChild(letterEl);
            });
            
            this.wordsContainer.appendChild(wordEl);
        });

        // Set active classes
        const firstWord = this.wordsContainer.querySelector('.word[data-word-idx="0"]');
        if (firstWord) {
            firstWord.classList.add("active");
            const firstLetter = firstWord.querySelector('.letter[data-letter-idx="0"]');
            if (firstLetter) firstLetter.classList.add("active");
            
            // Apply line fading to the first word
            this.updateLineFading(firstWord);
        }

        // Reset scroll
        this.wordsContainer.scrollTop = 0;
        
        // Position caret
        setTimeout(() => this.updateCaretPosition(), 50);
    }

    updateLetterState(wordIndex, letterIndex, status, key = "") {
        const wordEl = this.wordsContainer.querySelector(`.word[data-word-idx="${wordIndex}"]`);
        if (!wordEl) return;

        // If this was an extra letter and status is backspaced/removed
        if (status === "removed") {
            const letterEl = wordEl.querySelector(`.letter[data-letter-idx="${letterIndex}"]`);
            if (letterEl) {
                letterEl.remove();
            }
            return;
        }

        // If adding an extra letter
        if (status === "extra") {
            const letterEl = document.createElement("span");
            letterEl.className = "letter extra incorrect";
            letterEl.setAttribute("data-letter-idx", letterIndex);
            letterEl.textContent = key;
            wordEl.appendChild(letterEl);
            return;
        }

        // Regular character status update
        const letterEl = wordEl.querySelector(`.letter[data-letter-idx="${letterIndex}"]`);
        if (letterEl) {
            letterEl.className = "letter " + status;
        }
    }

    updateActiveIndicators(oldWordIdx, oldLetterIdx, newWordIdx, newLetterIdx, wordsData) {
        // Clear active classes
        const allWords = this.wordsContainer.querySelectorAll(".word");
        allWords.forEach(w => w.classList.remove("active"));
        const allLetters = this.wordsContainer.querySelectorAll(".letter");
        allLetters.forEach(l => l.classList.remove("active"));

        // Highlight new active word
        const activeWordEl = this.wordsContainer.querySelector(`.word[data-word-idx="${newWordIdx}"]`);
        if (activeWordEl) {
            activeWordEl.classList.add("active");
            
            // Highlight active letter if not completed the word
            const lettersCount = wordsData[newWordIdx].letters.length;
            if (newLetterIdx < lettersCount) {
                const activeLetterEl = activeWordEl.querySelector(`.letter[data-letter-idx="${newLetterIdx}"]`);
                if (activeLetterEl) {
                    activeLetterEl.classList.add("active");
                }
            }
        }

        // Stop blinking when typing starts
        if (newWordIdx > 0 || newLetterIdx > 0) {
            this.caret.classList.remove("blinking");
        } else {
            this.caret.classList.add("blinking");
        }

        this.updateCaretPosition(newWordIdx, newLetterIdx);
        this.scrollActiveWordIntoView(activeWordEl);
        
        // Update line fading based on active word line
        this.updateLineFading(activeWordEl);
    }

    updateCaretPosition(wordIdx = null, letterIdx = null) {
        if (wordIdx === null || letterIdx === null) {
            // Find active letter or word
            const activeLetter = this.wordsContainer.querySelector(".letter.active");
            if (activeLetter) {
                this.caret.style.left = `${activeLetter.offsetLeft}px`;
                this.caret.style.top = `${activeLetter.offsetTop}px`;
                this.caret.style.height = `${activeLetter.offsetHeight}px`;
            } else {
                const activeWord = this.wordsContainer.querySelector(".word.active");
                if (activeWord) {
                    const letters = activeWord.querySelectorAll(".letter");
                    if (letters.length > 0) {
                        const lastL = letters[letters.length - 1];
                        this.caret.style.left = `${lastL.offsetLeft + lastL.offsetWidth}px`;
                        this.caret.style.top = `${lastL.offsetTop}px`;
                        this.caret.style.height = `${lastL.offsetHeight}px`;
                    }
                }
            }
            return;
        }

        const activeWordEl = this.wordsContainer.querySelector(`.word[data-word-idx="${wordIdx}"]`);
        if (!activeWordEl) return;

        const letters = activeWordEl.querySelectorAll(".letter");
        if (letterIdx < letters.length) {
            const activeLetterEl = letters[letterIdx];
            this.caret.style.left = `${activeLetterEl.offsetLeft}px`;
            this.caret.style.top = `${activeLetterEl.offsetTop}px`;
            this.caret.style.height = `${activeLetterEl.offsetHeight}px`;
        } else {
            // Position caret after the last character of the word (space indicator)
            const lastLetterEl = letters[letters.length - 1];
            if (lastLetterEl) {
                this.caret.style.left = `${lastLetterEl.offsetLeft + lastLetterEl.offsetWidth}px`;
                this.caret.style.top = `${lastLetterEl.offsetTop}px`;
                this.caret.style.height = `${lastLetterEl.offsetHeight}px`;
            }
        }
    }

    scrollActiveWordIntoView(activeWordEl) {
        if (!activeWordEl) return;

        // Container bounds
        const containerTop = this.wordsContainer.scrollTop;
        const containerBottom = containerTop + this.wordsContainer.clientHeight;
        
        // Element bounds
        const elemTop = activeWordEl.offsetTop;
        const elemBottom = elemTop + activeWordEl.offsetHeight;

        // Perfect scroll centered line behavior:
        // If the active word is on a new line (beyond container display height), scroll
        // we can check if it's nearing the bottom
        const rowHeight = activeWordEl.offsetHeight;
        if (elemBottom > containerBottom - rowHeight) {
            // Scroll down one row
            this.wordsContainer.scrollTo({
                top: elemTop - rowHeight,
                behavior: "smooth"
            });
        } else if (elemTop < containerTop) {
            // Scroll up
            this.wordsContainer.scrollTo({
                top: elemTop,
                behavior: "smooth"
            });
        }
    }

    updateTimer(timeLeft, mode) {
        if (mode === "time") {
            this.timerDisplay.textContent = timeLeft;
            if (timeLeft <= 5) {
                this.timerDisplay.classList.add("low-time");
            } else {
                this.timerDisplay.classList.remove("low-time");
            }
        } else {
            // Words mode / custom: show word count remaining or elapsed words
            this.timerDisplay.textContent = timeLeft + "s";
        }
    }

    setTimerLoading(statusText) {
        this.timerDisplay.textContent = statusText;
    }

    showResults(stats) {
        this.testSection.classList.add("hidden");
        this.resultsSection.classList.remove("hidden");
        this.caret.classList.add("hidden");

        // Animate count up for visual excellence
        this.animateValue(this.wpmVal, 0, stats.wpm, 1000);
        this.animateValue(this.accuracyVal, 0, stats.accuracy, 1000, "%");
        this.animateValue(this.rawWpmVal, 0, stats.rawWpm, 1000);
        
        this.timeVal.textContent = Math.round(stats.duration) + "s";
        
        // Format character stats: "correct / incorrect / extra"
        this.charsVal.innerHTML = `
            <span class="correct-text">${stats.correctChars}</span>/
            <span class="incorrect-text">${stats.incorrectChars}</span>/
            <span class="extra-text">${stats.extraChars}</span>
        `;
    }

    animateValue(obj, start, end, duration, suffix = "") {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end + suffix;
            }
        };
        window.requestAnimationFrame(step);
    }

    showTestArea() {
        this.resultsSection.classList.add("hidden");
        this.testSection.classList.remove("hidden");
        this.caret.classList.remove("hidden");
        this.timerDisplay.classList.remove("low-time");
    }

    renderThemes(themes, activeTheme, onSelectTheme) {
        this.themeGrid.innerHTML = "";
        
        themes.forEach(theme => {
            const btn = document.createElement("button");
            btn.className = `theme-select-btn ${theme.id === activeTheme.id ? "active" : ""}`;
            btn.setAttribute("data-theme-id", theme.id);
            
            // Text label
            const label = document.createElement("span");
            label.className = "theme-name";
            label.textContent = theme.name;
            btn.appendChild(label);
            
            // Colored dots preview
            const preview = document.createElement("div");
            preview.className = "theme-preview";
            
            const dotBg = document.createElement("span");
            dotBg.style.backgroundColor = theme.colors["--bg-color"];
            
            const dotText = document.createElement("span");
            dotText.style.backgroundColor = theme.colors["--text-color"];
            
            const dotAccent = document.createElement("span");
            dotAccent.style.backgroundColor = theme.colors["--accent-color"];
            
            preview.appendChild(dotBg);
            preview.appendChild(dotText);
            preview.appendChild(dotAccent);
            
            btn.appendChild(preview);
            
            btn.addEventListener("click", () => {
                // Clear old active styles
                this.themeGrid.querySelectorAll(".theme-select-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                onSelectTheme(theme.id);
                // Re-render chart since accent colors update
                // (Controller handles this)
            });

            this.themeGrid.appendChild(btn);
        });
    }

    renderHistory(history, summary, onClearHistory) {
        // 1. Render Summary Stats
        this.sumTests.textContent = summary.testsCompleted;
        this.sumAvgWpm.textContent = summary.averageWpm;
        this.sumMaxWpm.textContent = summary.maxWpm;
        this.sumAvgAcc.textContent = summary.averageAccuracy + "%";
        
        const mins = Math.floor(summary.totalTimePlayed / 60);
        const secs = summary.totalTimePlayed % 60;
        this.sumTime.textContent = `${mins}m ${secs}s`;

        // 2. Render list of test history
        this.historyList.innerHTML = "";
        
        if (history.length === 0) {
            this.historyList.innerHTML = `<div class="history-empty">No tests completed yet. Start typing!</div>`;
            return;
        }

        history.forEach(record => {
            const date = new Date(record.timestamp);
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + " " + 
                            date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
            
            const row = document.createElement("div");
            row.className = "history-row";
            row.innerHTML = `
                <div class="hist-date">${dateStr}</div>
                <div class="hist-wpm">${record.wpm} <span>WPM</span></div>
                <div class="hist-acc">${record.accuracy}% <span>ACC</span></div>
                <div class="hist-mode">${record.mode} (${record.duration}s)</div>
            `;
            this.historyList.appendChild(row);
        });

        // 3. Bind clear event
        this.clearHistoryBtn.onclick = () => {
            if (confirm("Are you sure you want to clear all history?")) {
                onClearHistory();
            }
        };
    }

    highlightKey(code, isPressed) {
        if (!this.keyboardToggle.checked) return;

        // Map keyboard event codes to virtual keyboard element IDs
        // Some codes might have spaces or differ. Let's make key IDs matching the code
        // e.g. key-KeyA, key-Space, key-Backspace
        let keyId = `key-${code}`;
        
        // Handle normal modifications
        if (code === "ShiftLeft" || code === "ShiftRight") keyId = "key-Shift";
        if (code === "ControlLeft" || code === "ControlRight") keyId = "key-Ctrl";
        if (code === "AltLeft" || code === "AltRight") keyId = "key-Alt";

        const keyEl = document.getElementById(keyId);
        if (keyEl) {
            if (isPressed) {
                keyEl.classList.add("active");
            } else {
                keyEl.classList.remove("active");
            }
        }
    }

    updateConfigUI(mode, value) {
        // Mode buttons state
        this.modeButtons.forEach(btn => {
            if (btn.getAttribute("data-mode") === mode) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Hide all configurations first
        this.timeSubconfig.classList.add("hidden");
        this.wordsSubconfig.classList.add("hidden");
        this.rowSubconfig.classList.add("hidden");
        this.customSubconfig.classList.add("hidden");

        // Show selected subconfig
        if (mode === "time") {
            this.timeSubconfig.classList.remove("hidden");
            this.timeOptions.forEach(opt => {
                if (parseInt(opt.getAttribute("data-time"), 10) === parseInt(value, 10)) {
                    opt.classList.add("active");
                } else {
                    opt.classList.remove("active");
                }
            });
        } else if (mode === "words") {
            this.wordsSubconfig.classList.remove("hidden");
            this.wordOptions.forEach(opt => {
                if (parseInt(opt.getAttribute("data-words"), 10) === parseInt(value, 10)) {
                    opt.classList.add("active");
                } else {
                    opt.classList.remove("active");
                }
            });
        } else if (mode === "row") {
            this.rowSubconfig.classList.remove("hidden");
            let activeLabel = "home";
            this.rowOptions.forEach(opt => {
                if (opt.getAttribute("data-row") === value) {
                    opt.classList.add("active");
                    activeLabel = opt.textContent;
                } else {
                    opt.classList.remove("active");
                }
            });
            this.rowDropdownBtn.innerHTML = `${activeLabel} <i class="fa-solid fa-chevron-down" style="font-size:10px; margin-left: 4px;"></i>`;
        } else if (mode === "custom") {
            this.customSubconfig.classList.remove("hidden");
            this.customTextInput.value = value || "";
        }
    }

    setDistractionFree(active) {
        if (active) {
            document.body.classList.add("distraction-free");
            this.immersiveHUD.classList.remove("hidden");
        } else {
            document.body.classList.remove("distraction-free");
            this.immersiveHUD.classList.add("hidden");
        }
    }

    updateRealtimeHUD(wpm, accuracy, mistakes, timeLeft, mode) {
        if (this.hudWpm) this.hudWpm.textContent = Math.round(wpm);
        if (this.hudAccuracy) this.hudAccuracy.textContent = Math.round(accuracy) + "%";
        if (this.hudErrors) this.hudErrors.textContent = mistakes;

        if (this.hudTimer) {
            if (mode === "time") {
                const mins = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                this.hudTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            } else {
                // For other modes, show elapsed time or remaining count
                this.hudTimer.textContent = timeLeft + "s";
            }
        }
    }

    updateLineFading(activeWordEl) {
        if (!activeWordEl) return;
        const activeOffsetTop = activeWordEl.offsetTop;
        const allWords = this.wordsContainer.querySelectorAll(".word");
        
        allWords.forEach(wordEl => {
            if (wordEl.offsetTop === activeOffsetTop) {
                wordEl.classList.remove("faded-line");
            } else {
                wordEl.classList.add("faded-line");
            }
        });
    }

    highlightExpectedKey(expectedChar) {
        // Clear previous expected highlights
        this.keyboardContainer.querySelectorAll(".key.expected").forEach(k => k.classList.remove("expected"));

        if (!expectedChar) return;

        let keyQuery = expectedChar.toLowerCase();
        if (keyQuery === " ") {
            keyQuery = "space";
        }

        const keyEl = this.keyboardContainer.querySelector(`.key[data-key="${keyQuery}"]`);
        if (keyEl) {
            keyEl.classList.add("expected");
        }
    }
}
