export class ConfigController {
    constructor(models, views, appController) {
        this.models = models;
        this.views = views;
        this.appController = appController;
        this.init();
    }

    init() {
        // Load persisted configs
        const savedMode = localStorage.getItem("typepro_mode") || "time";
        const savedDuration = localStorage.getItem("typepro_duration") || "30";
        const savedWordCount = localStorage.getItem("typepro_word_count") || "25";
        const savedRowSelection = localStorage.getItem("typepro_row_selection") || "home";
        const savedCustomText = localStorage.getItem("typepro_custom_text") || "";

        this.models.typing.mode = savedMode;
        this.models.typing.duration = parseInt(savedDuration, 10);
        this.models.typing.wordCount = parseInt(savedWordCount, 10);
        this.models.typing.rowSelection = savedRowSelection;
        this.models.typing.customText = savedCustomText;

        let configVal = "";
        if (savedMode === "time") {
            configVal = savedDuration;
        } else if (savedMode === "words") {
            configVal = savedWordCount;
        } else if (savedMode === "row") {
            configVal = savedRowSelection;
        } else {
            configVal = savedCustomText;
        }

        this.views.typing.updateConfigUI(savedMode, configVal);

        this.bindEvents();
    }

    bindEvents() {
        // Mode switching buttons
        this.views.typing.modeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const mode = btn.getAttribute("data-mode");
                this.models.typing.setMode(mode);
                localStorage.setItem("typepro_mode", mode);
                
                let value = "";
                if (mode === "time") value = this.models.typing.duration;
                else if (mode === "words") value = this.models.typing.wordCount;
                else if (mode === "row") value = this.models.typing.rowSelection;
                else value = this.models.typing.customText;

                this.views.typing.updateConfigUI(mode, value);
                this.appController.restartTest();
            });
        });

        // Time choices
        this.views.typing.timeOptions.forEach(opt => {
            opt.addEventListener("click", () => {
                const duration = opt.getAttribute("data-time");
                this.models.typing.setDuration(duration);
                localStorage.setItem("typepro_duration", duration);
                this.views.typing.updateConfigUI("time", duration);
                this.appController.restartTest();
            });
        });

        // Word choices
        this.views.typing.wordOptions.forEach(opt => {
            opt.addEventListener("click", () => {
                const count = opt.getAttribute("data-words");
                this.models.typing.setWordCount(count);
                localStorage.setItem("typepro_word_count", count);
                this.views.typing.updateConfigUI("words", count);
                this.appController.restartTest();
            });
        });

        // Key row dropdown trigger click
        this.views.typing.rowDropdownBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const menu = this.views.typing.rowDropdownMenu;
            const isHidden = menu.classList.contains("hidden");
            
            if (isHidden) {
                menu.classList.remove("hidden");
                // Small delay to trigger CSS transition
                setTimeout(() => menu.classList.add("active"), 10);
            } else {
                menu.classList.remove("active");
                setTimeout(() => menu.classList.add("hidden"), 200);
            }
        });

        // Close dropdown on clicking anywhere else
        document.addEventListener("click", (e) => {
            const menu = this.views.typing.rowDropdownMenu;
            if (menu && !menu.classList.contains("hidden")) {
                menu.classList.remove("active");
                setTimeout(() => menu.classList.add("hidden"), 200);
            }
        });

        // Key row choices in dropdown
        this.views.typing.rowOptions.forEach(opt => {
            opt.addEventListener("click", (e) => {
                e.stopPropagation();
                const selection = opt.getAttribute("data-row");
                this.models.typing.setRowSelection(selection);
                localStorage.setItem("typepro_row_selection", selection);
                this.views.typing.updateConfigUI("row", selection);
                
                // Hide dropdown menu
                const menu = this.views.typing.rowDropdownMenu;
                menu.classList.remove("active");
                setTimeout(() => menu.classList.add("hidden"), 200);
                
                this.appController.restartTest();
            });
        });

        // Custom text settings
        this.views.typing.customTextSubmit.addEventListener("click", () => {
            const text = this.views.typing.customTextInput.value;
            this.models.typing.setCustomText(text);
            localStorage.setItem("typepro_custom_text", text);
            this.views.typing.closeModal(this.views.typing.settingsModal);
            this.appController.restartTest();
        });
    }
}
