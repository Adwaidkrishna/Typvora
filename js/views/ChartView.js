export class ChartView {
    constructor() {
        this.chartInstance = null;
    }

    renderChart(canvasElement, historyData) {
        if (!window.Chart) {
            console.error("Chart.js is not loaded.");
            return;
        }

        // Destroy previous instance if it exists
        this.destroyChart();

        // Get colors from CSS custom properties for a cohesive look
        const rootStyles = getComputedStyle(document.documentElement);
        const accentColor = rootStyles.getPropertyValue("--accent-color").trim() || "#e2b714";
        const subColor = rootStyles.getPropertyValue("--sub-color").trim() || "#585858";
        const errorColor = rootStyles.getPropertyValue("--error-color").trim() || "#ca4754";
        const textColor = rootStyles.getPropertyValue("--text-color").trim() || "#e5e5e5";

        const seconds = historyData.map(d => d.second);
        const wpmData = historyData.map(d => d.wpm);
        const rawWpmData = historyData.map(d => d.rawWpm);
        const errorData = historyData.map(d => d.errors);

        const ctx = canvasElement.getContext("2d");
        
        // Create gradients for WPM fill
        const wpmGradient = ctx.createLinearGradient(0, 0, 0, 300);
        wpmGradient.addColorStop(0, this.hexToRgba(accentColor, 0.3));
        wpmGradient.addColorStop(1, this.hexToRgba(accentColor, 0.0));

        this.chartInstance = new window.Chart(ctx, {
            type: "line",
            data: {
                labels: seconds,
                datasets: [
                    {
                        label: "WPM",
                        data: wpmData,
                        borderColor: accentColor,
                        backgroundColor: wpmGradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: accentColor,
                        pointHoverRadius: 6,
                        yAxisID: "y-wpm"
                    },
                    {
                        label: "Raw WPM",
                        data: rawWpmData,
                        borderColor: subColor,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.35,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        yAxisID: "y-wpm"
                    },
                    {
                        label: "Errors Accumulated",
                        data: errorData,
                        borderColor: errorColor,
                        borderWidth: 1.5,
                        fill: false,
                        tension: 0.2,
                        pointRadius: 1,
                        yAxisID: "y-errors",
                        hidden: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            color: textColor,
                            font: {
                                family: "Inter, sans-serif",
                                size: 12
                            },
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                        backgroundColor: "rgba(15, 15, 15, 0.85)",
                        titleColor: accentColor,
                        bodyColor: "#ffffff",
                        borderColor: this.hexToRgba(accentColor, 0.3),
                        borderWidth: 1,
                        padding: 10,
                        titleFont: { family: "Share Tech Mono, monospace" },
                        bodyFont: { family: "Inter, sans-serif" }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.hexToRgba(subColor, 0.1),
                            borderColor: this.hexToRgba(subColor, 0.2)
                        },
                        ticks: {
                            color: subColor,
                            font: { family: "Share Tech Mono, monospace" },
                            callback: function(value) {
                                return value + "s";
                            }
                        },
                        title: {
                            display: true,
                            text: "Time Elapsed",
                            color: subColor,
                            font: { family: "Inter, sans-serif", size: 11 }
                        }
                    },
                    "y-wpm": {
                        type: "linear",
                        position: "left",
                        grid: {
                            color: this.hexToRgba(subColor, 0.1),
                            borderColor: this.hexToRgba(subColor, 0.2)
                        },
                        ticks: {
                            color: subColor,
                            font: { family: "Share Tech Mono, monospace" }
                        },
                        title: {
                            display: true,
                            text: "Words Per Minute (WPM)",
                            color: subColor,
                            font: { family: "Inter, sans-serif", size: 11 }
                        },
                        min: 0
                    },
                    "y-errors": {
                        type: "linear",
                        position: "right",
                        grid: {
                            drawOnChartArea: false // Only show grid lines for WPM axis
                        },
                        ticks: {
                            color: errorColor,
                            font: { family: "Share Tech Mono, monospace" },
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: "Errors",
                            color: errorColor,
                            font: { family: "Inter, sans-serif", size: 11 }
                        },
                        min: 0,
                        suggestedMax: 5
                    }
                }
            }
        });
    }

    destroyChart() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }

    hexToRgba(hex, alpha) {
        // Strip the hash if present
        hex = hex.replace("#", "");
        
        // Handle short hex code (e.g. "fff")
        if (hex.length === 3) {
            hex = hex.split("").map(char => char + char).join("");
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            // Fallback for non-hex values (e.g. css variables like rgb(0,0,0))
            return `rgba(128, 128, 128, ${alpha})`;
        }

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
