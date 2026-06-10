export class StatsController {
    constructor(models, views, appController) {
        this.models = models;
        this.views = views;
        this.appController = appController;
        this.init();
    }

    init() {
        this.updateHistoryUI();
        this.bindEvents();
    }

    bindEvents() {
        // Clear history trigger
        this.views.typing.clearHistoryBtn.onclick = () => {
            if (confirm("Are you sure you want to clear all history?")) {
                this.models.stats.clearHistory();
                this.updateHistoryUI();
            }
        };
    }

    handleTimerTick(timeLeft) {
        this.views.typing.updateTimer(timeLeft, this.models.typing.mode);
    }

    handleTestComplete(stats, historyData) {
        // Save test record
        this.models.stats.addRecord(
            stats.wpm,
            stats.accuracy,
            stats.rawWpm,
            this.models.typing.mode,
            stats.duration,
            stats.correctChars,
            stats.incorrectChars
        );

        // Update history drawers
        this.updateHistoryUI();

        // Reveal stats metrics
        this.views.typing.showResults(stats);

        // Render line chart
        this.views.chart.renderChart(this.views.typing.chartCanvas, historyData);
    }

    updateHistoryUI() {
        const history = this.models.stats.getHistory();
        const summary = this.models.stats.getSummaryStats();
        
        this.views.typing.renderHistory(
            history,
            summary,
            () => {
                this.models.stats.clearHistory();
                this.updateHistoryUI();
            }
        );
    }
}
