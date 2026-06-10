import { WORDS, QUOTES, HOME_ROW_WORDS, TOP_ROW_WORDS, BOTTOM_ROW_WORDS } from "../data/words.js";
import { TypingModel } from "../models/TypingModel.js";
import { ThemeModel } from "../models/ThemeModel.js";
import { StatsModel } from "../models/StatsModel.js";
import { TypingView } from "../views/TypingView.js";
import { ChartView } from "../views/ChartView.js";
import { SoundView } from "../views/SoundView.js";

// Import sub-controllers
import { ConfigController } from "./ConfigController.js";
import { SettingsController } from "./SettingsController.js";
import { StatsController } from "./StatsController.js";
import { TypingEngineController } from "./TypingEngineController.js";

export class TypingController {
    constructor() {
        // Core MVC Models and Views Store
        this.models = {
            typing: new TypingModel(),
            theme: new ThemeModel(),
            stats: new StatsModel()
        };

        this.views = {
            typing: new TypingView(),
            chart: new ChartView(),
            sound: new SoundView()
        };

        this.init();
    }

    init() {
        // 1. Initial visual setup
        this.models.theme.applyTheme();
        
        this.views.typing.renderThemes(
            this.models.theme.getThemes(),
            this.models.theme.getActiveTheme(),
            (themeId) => this.handleThemeSelect(themeId)
        );

        // 2. Instantiate dedicated sub-controllers
        this.configController = new ConfigController(this.models, this.views, this);
        this.settingsController = new SettingsController(this.models, this.views, this);
        this.statsController = new StatsController(this.models, this.views, this);
        this.typingEngineController = new TypingEngineController(this.models, this.views, this);

        // 3. Connect Model Event listeners to Stats Controller
        this.models.typing.onTestStart = () => {
            this.views.typing.setDistractionFree(true);
        };

        this.models.typing.onTimerTick = (timeLeft) => {
            this.statsController.handleTimerTick(timeLeft);
        };
        
        this.models.typing.onTestComplete = (stats, historyData) => {
            this.statsController.handleTestComplete(stats, historyData);
        };

        // 4. Initial test boot
        this.restartTest();
    }

    restartTest() {
        this.models.typing.initializeTest(WORDS, QUOTES, {
            home: HOME_ROW_WORDS,
            top: TOP_ROW_WORDS,
            bottom: BOTTOM_ROW_WORDS
        });
        
        // Reset distraction free mode
        this.views.typing.setDistractionFree(false);
        
        // Show test playground
        this.views.typing.showTestArea();
        
        // Render word characters
        this.views.typing.renderWords(this.models.typing.words);
        
        // Set up initial timer display
        const initialTimerVal = this.models.typing.mode === "time" ? this.models.typing.duration : 0;
        this.views.typing.updateTimer(initialTimerVal, this.models.typing.mode);

        // Reset virtual key states
        this.views.typing.keyboardContainer.querySelectorAll(".key").forEach(k => k.classList.remove("active"));

        // Highlight first expected key
        const expectedChar = this.models.typing.getExpectedChar();
        this.views.typing.highlightExpectedKey(expectedChar);

        // Force capture cursor focus
        this.views.typing.focusTyping();
    }

    handleThemeSelect(themeId) {
        this.models.theme.setTheme(themeId);
        
        // Redraw stats chart with theme accent color if on results screen
        if (this.models.typing.isTestCompleted && this.models.typing.historyData.length > 0) {
            this.views.chart.renderChart(this.views.typing.chartCanvas, this.models.typing.historyData);
        }
    }
}
