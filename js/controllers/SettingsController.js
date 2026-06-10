export class SettingsController {
    constructor(models, views, appController) {
        this.models = models;
        this.views = views;
        this.appController = appController;
        this.init();
    }

    init() {
        // 1. Load sound configurations
        const savedSoundType = localStorage.getItem("typepro_sound_type") || "tactile";
        const savedVolume = localStorage.getItem("typepro_sound_volume") || "0.5";
        
        this.views.sound.setSoundType(savedSoundType);
        this.views.sound.setVolume(savedVolume);
        
        this.views.typing.soundTypeSelect.value = savedSoundType;
        this.views.typing.volumeRange.value = savedVolume;
        this.views.typing.volumeVal.textContent = Math.round(savedVolume * 100) + "%";

        // 2. Load visual preferences
        const savedFontSize = localStorage.getItem("typepro_font_size") || "24px";
        const savedFontFamily = localStorage.getItem("typepro_font_family") || "'Roboto Mono', monospace";
        const savedKeyboard = localStorage.getItem("typepro_keyboard") !== "false"; // default true

        // Apply visual settings to views
        this.views.typing.fontSizeSelect.value = savedFontSize;
        this.views.typing.fontFamilySelect.value = savedFontFamily;
        this.views.typing.keyboardToggle.checked = savedKeyboard;

        this.views.typing.wordsContainer.style.setProperty('--user-font-size', savedFontSize);
        this.views.typing.wordsContainer.style.fontFamily = savedFontFamily;
        
        if (savedKeyboard) {
            this.views.typing.keyboardContainer.classList.remove("hidden");
        } else {
            this.views.typing.keyboardContainer.classList.add("hidden");
        }

        this.bindEvents();
    }

    bindEvents() {
        // Sounds
        this.views.typing.soundTypeSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            this.views.sound.setSoundType(val);
            localStorage.setItem("typepro_sound_type", val);
        });

        this.views.typing.volumeRange.addEventListener("change", (e) => {
            const val = e.target.value;
            this.views.sound.setVolume(val);
            localStorage.setItem("typepro_sound_volume", val);
        });

        // Fonts and sizes
        this.views.typing.fontSizeSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            this.views.typing.wordsContainer.style.setProperty('--user-font-size', val);
            localStorage.setItem("typepro_font_size", val);
            setTimeout(() => this.views.typing.updateCaretPosition(), 50);
        });

        this.views.typing.fontFamilySelect.addEventListener("change", (e) => {
            const val = e.target.value;
            this.views.typing.wordsContainer.style.fontFamily = val;
            localStorage.setItem("typepro_font_family", val);
            setTimeout(() => this.views.typing.updateCaretPosition(), 50);
        });

        // Keyboard visualizer toggle
        this.views.typing.keyboardToggle.addEventListener("change", (e) => {
            const val = e.target.checked;
            localStorage.setItem("typepro_keyboard", val.toString());
            if (val) {
                this.views.typing.keyboardContainer.classList.remove("hidden");
            } else {
                this.views.typing.keyboardContainer.classList.add("hidden");
            }
        });
    }
}
