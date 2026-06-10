export class TypingEngineController {
    constructor(models, views, appController) {
        this.models = models;
        this.views = views;
        this.appController = appController;
        this.focusInput = null;
        this.init();
    }

    init() {
        this.focusInput = document.getElementById("focus-input");
        this.bindEvents();
    }

    bindEvents() {
        // Tap words container to focus typing cursor
        this.views.typing.wordsContainer.addEventListener("click", () => {
            this.views.sound.init(); // Activate AudioContext
            this.focusInput.focus();
        });

        // Initialize mobile hidden input tracking value
        this.focusInput.value = " ";

        this.focusInput.addEventListener("input", (e) => {
            const val = this.focusInput.value;
            this.views.sound.init();

            if (val.length === 0) {
                this.handleKeyStroke("Backspace");
            } else if (val.length > 1) {
                const typedChar = val.substring(1);
                this.handleKeyStroke(typedChar);
            }
            this.focusInput.value = " ";
        });

        // Desktop keyboard capturing
        document.addEventListener("keydown", (e) => {
            if (document.activeElement.tagName === "INPUT" && document.activeElement.id !== "focus-input") return;
            if (document.activeElement.tagName === "TEXTAREA") return;
            
            // Ignore keystrokes when modals or drawers are open
            if (this.views.typing.themeModal.classList.contains("active") || 
                this.views.typing.settingsModal.classList.contains("active") || 
                this.views.typing.historyDrawer.classList.contains("active")) {
                return;
            }

            const code = e.code;
            const key = e.key;

            if (key === "Tab") {
                e.preventDefault();
                this.appController.restartTest();
                return;
            }

            // Highlight virtual keycap
            this.views.typing.highlightKey(code, true);
            this.views.sound.init();

            // Skip printable keys if focusInput is active (handled by input listener)
            if (document.activeElement.id === "focus-input") {
                if (key === "Backspace" || key === " ") {
                    if (key === " ") {
                        e.preventDefault();
                        this.handleKeyStroke(" ");
                    }
                }
                return;
            }

            if (key === "Backspace" || key === " " || key.length === 1) {
                if (key === " ") e.preventDefault();
                this.handleKeyStroke(key);
                this.focusInput.focus();
            }
        });

        document.addEventListener("keyup", (e) => {
            this.views.typing.highlightKey(e.code, false);
        });

        // Virtual Keyboard Touch UI clicks
        const virtualKeys = this.views.typing.keyboardContainer.querySelectorAll(".key");
        virtualKeys.forEach(keyEl => {
            keyEl.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                this.views.sound.init();

                const keyValue = keyEl.getAttribute("data-key");
                const code = keyEl.id.replace("key-", "");

                keyEl.classList.add("active");

                if (keyValue === "space") {
                    this.handleKeyStroke(" ");
                } else if (keyValue === "backspace") {
                    this.handleKeyStroke("Backspace");
                } else if (keyValue === "shift" || keyValue === "ctrl" || keyValue === "alt") {
                    // Ignored modifiers
                } else if (keyValue) {
                    this.handleKeyStroke(keyValue);
                }

                this.focusInput.focus();
            });

            keyEl.addEventListener("pointerup", () => {
                keyEl.classList.remove("active");
            });

            keyEl.addEventListener("pointerleave", () => {
                keyEl.classList.remove("active");
            });
        });
    }

    handleKeyStroke(key) {
        // Trigger simulated switch click
        this.views.sound.playKey(key);

        const oldWordIdx = this.models.typing.activeWordIndex;
        const oldLetterIdx = this.models.typing.activeLetterIndex;

        this.models.typing.processKey(key);

        const newWordIdx = this.models.typing.activeWordIndex;
        const newLetterIdx = this.models.typing.activeLetterIndex;

        if (oldWordIdx !== newWordIdx || oldLetterIdx !== newLetterIdx) {
            if (key === "Backspace") {
                if (oldWordIdx === newWordIdx) {
                    this.views.typing.updateLetterState(newWordIdx, newLetterIdx, "untyped");
                    const currentWordModel = this.models.typing.words[newWordIdx];
                    if (currentWordModel.letters.length < this.views.typing.wordsContainer.querySelector(`.word[data-word-idx="${newWordIdx}"]`).querySelectorAll(".letter").length) {
                        this.views.typing.updateLetterState(newWordIdx, currentWordModel.letters.length, "removed");
                    }
                }
            } else if (key === " ") {
                const oldWordModel = this.models.typing.words[oldWordIdx];
                oldWordModel.letters.forEach((l, idx) => {
                    if (l.status === "incorrect") {
                        this.views.typing.updateLetterState(oldWordIdx, idx, "incorrect");
                    }
                });
            } else {
                const wordModel = this.models.typing.words[oldWordIdx];
                if (oldLetterIdx >= wordModel.text.length) {
                    this.views.typing.updateLetterState(oldWordIdx, oldLetterIdx, "extra", key);
                } else {
                    const letterStatus = wordModel.letters[oldLetterIdx].status;
                    this.views.typing.updateLetterState(oldWordIdx, oldLetterIdx, letterStatus);
                }
            }

            this.views.typing.updateActiveIndicators(oldWordIdx, oldLetterIdx, newWordIdx, newLetterIdx, this.models.typing.words);
        }

        // Update real-time HUD instantly on keystroke if the test is active
        if (this.models.typing.isTestActive) {
            const elapsedMins = this.models.typing.getElapsedTimeSeconds() / 60;
            const stats = this.models.typing.getCurrentStats(elapsedMins);
            this.views.typing.updateRealtimeHUD(
                stats.wpm,
                stats.accuracy,
                this.models.typing.errorKeystrokes,
                this.models.typing.timeLeft,
                this.models.typing.mode
            );
        }

        // Update highlighted expected key after the keystroke is processed
        const expectedChar = this.models.typing.getExpectedChar();
        this.views.typing.highlightExpectedKey(expectedChar);
    }
}
