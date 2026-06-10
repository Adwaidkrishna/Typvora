export class StatsModel {
    constructor() {
        this.history = this.loadHistory();
    }

    loadHistory() {
        const savedHistory = localStorage.getItem("typepro_history");
        try {
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (e) {
            console.error("Failed to parse history, resetting stats", e);
            return [];
        }
    }

    saveHistory() {
        localStorage.setItem("typepro_history", JSON.stringify(this.history));
    }

    addRecord(wpm, accuracy, rawWpm, mode, duration, correctChars, incorrectChars) {
        const record = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            wpm: Math.round(wpm),
            accuracy: Math.round(accuracy),
            rawWpm: Math.round(rawWpm),
            mode,
            duration,
            correctChars,
            incorrectChars
        };
        this.history.unshift(record); // Add to the beginning so latest tests are first
        this.saveHistory();
        return record;
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem("typepro_history");
    }

    getSummaryStats() {
        if (this.history.length === 0) {
            return {
                testsCompleted: 0,
                averageWpm: 0,
                maxWpm: 0,
                averageAccuracy: 0,
                totalTimePlayed: 0 // in seconds
            };
        }

        let totalWpm = 0;
        let totalAccuracy = 0;
        let maxWpm = 0;
        let totalTime = 0;

        this.history.forEach(record => {
            totalWpm += record.wpm;
            totalAccuracy += record.accuracy;
            if (record.wpm > maxWpm) {
                maxWpm = record.wpm;
            }
            // Estimate total time based on mode/duration
            if (record.mode === "time") {
                totalTime += record.duration;
            } else {
                // For words mode, assume average duration based on WPM
                // words * 60 / WPM = seconds. (approximate)
                const estimatedSecs = record.wpm > 0 ? (record.correctChars / 5) * 60 / record.wpm : 0;
                totalTime += estimatedSecs;
            }
        });

        return {
            testsCompleted: this.history.length,
            averageWpm: Math.round(totalWpm / this.history.length),
            maxWpm: maxWpm,
            averageAccuracy: Math.round(totalAccuracy / this.history.length),
            totalTimePlayed: Math.round(totalTime)
        };
    }
}
