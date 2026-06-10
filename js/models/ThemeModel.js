export const THEMES = [
    {
        id: "aero-light",
        name: "Aero Light",
        colors: {
            "--bg-color": "#f3f4f6",
            "--text-color": "#1f2937",
            "--sub-color": "#6b7280",
            "--accent-color": "#2563eb",
            "--error-color": "#ef4444",
            "--caret-color": "#2563eb",
            "--panel-bg": "rgba(255, 255, 255, 0.45)",
            "--key-bg": "rgba(255, 255, 255, 0.75)",
            "--key-active": "#2563eb",
            "--key-active-text": "#ffffff",
            "--border-color": "rgba(0, 0, 0, 0.08)",
            "--shadow-color": "rgba(31, 41, 55, 0.05)"
        }
    },
    {
        id: "midnight-slate",
        name: "Midnight Slate",
        colors: {
            "--bg-color": "#111827",
            "--text-color": "#f9fafb",
            "--sub-color": "#9ca3af",
            "--accent-color": "#60a5fa",
            "--error-color": "#f87171",
            "--caret-color": "#60a5fa",
            "--panel-bg": "rgba(31, 41, 55, 0.5)",
            "--key-bg": "rgba(17, 24, 39, 0.6)",
            "--key-active": "#60a5fa",
            "--key-active-text": "#111827",
            "--border-color": "rgba(255, 255, 255, 0.08)",
            "--shadow-color": "rgba(0, 0, 0, 0.2)"
        }
    },
    {
        id: "jade-oasis",
        name: "Jade Oasis",
        colors: {
            "--bg-color": "#f0fdfa",
            "--text-color": "#0f766e",
            "--sub-color": "#4b5563",
            "--accent-color": "#0d9488",
            "--error-color": "#e11d48",
            "--caret-color": "#0d9488",
            "--panel-bg": "rgba(255, 255, 255, 0.55)",
            "--key-bg": "rgba(204, 251, 241, 0.7)",
            "--key-active": "#0d9488",
            "--key-active-text": "#ffffff",
            "--border-color": "rgba(13, 148, 136, 0.15)",
            "--shadow-color": "rgba(13, 148, 136, 0.04)"
        }
    },
    {
        id: "amber-ember",
        name: "Amber Ember",
        colors: {
            "--bg-color": "#fffbeb",
            "--text-color": "#b45309",
            "--sub-color": "#4b5563",
            "--accent-color": "#d97706",
            "--error-color": "#dc2626",
            "--caret-color": "#d97706",
            "--panel-bg": "rgba(255, 255, 255, 0.55)",
            "--key-bg": "rgba(254, 243, 199, 0.7)",
            "--key-active": "#d97706",
            "--key-active-text": "#ffffff",
            "--border-color": "rgba(217, 119, 6, 0.15)",
            "--shadow-color": "rgba(217, 119, 6, 0.04)"
        }
    },
    {
        id: "cobalt-neon",
        name: "Cobalt Neon",
        colors: {
            "--bg-color": "#0f172a",
            "--text-color": "#38bdf8",
            "--sub-color": "#64748b",
            "--accent-color": "#0ea5e9",
            "--error-color": "#f43f5e",
            "--caret-color": "#38bdf8",
            "--panel-bg": "rgba(15, 23, 42, 0.6)",
            "--key-bg": "rgba(30, 41, 59, 0.5)",
            "--key-active": "#0ea5e9",
            "--key-active-text": "#ffffff",
            "--border-color": "rgba(56, 189, 248, 0.15)",
            "--shadow-color": "rgba(0, 0, 0, 0.25)"
        }
    }
];

export class ThemeModel {
    constructor() {
        this.themes = THEMES;
        this.activeTheme = this.loadTheme();
    }

    loadTheme() {
        const savedThemeId = localStorage.getItem("typepro_theme");
        const theme = this.themes.find(t => t.id === savedThemeId);
        return theme || this.themes[0]; // Default to Aero Light
    }

    setTheme(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (theme) {
            this.activeTheme = theme;
            localStorage.setItem("typepro_theme", themeId);
            this.applyTheme(theme);
        }
    }

    applyTheme(theme = this.activeTheme) {
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
        document.body.setAttribute("data-theme", theme.id);
    }

    getThemes() {
        return this.themes;
    }

    getActiveTheme() {
        return this.activeTheme;
    }
}
