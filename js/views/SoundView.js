export class SoundView {
    constructor() {
        this.ctx = null;
        this.volume = 0.5; // Default volume 0-1
        this.soundType = "clicky"; // "clicky" | "tactile" | "linear" | "mute"
    }

    init() {
        if (!this.ctx) {
            // Lazy initialization on first keypress or interaction to satisfy browser policies
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    setVolume(volume) {
        this.volume = parseFloat(volume);
    }

    setSoundType(type) {
        this.soundType = type;
        if (type !== "mute") {
            this.init();
        }
    }

    playKey(key) {
        if (this.soundType === "mute") return;
        this.init();
        if (!this.ctx) return;

        // Spacebar and Backspace get different pitches/timbres
        let isSpace = key === " ";
        let isBackspace = key === "Backspace";

        // Synthesize the click
        if (this.soundType === "clicky") {
            this.synthesizeClicky(isSpace, isBackspace);
        } else if (this.soundType === "tactile") {
            this.synthesizeTactile(isSpace, isBackspace);
        } else if (this.soundType === "linear") {
            this.synthesizeLinear(isSpace, isBackspace);
        }
    }

    // High quality clicky switch synthesis (e.g. Cherry MX Blue)
    synthesizeClicky(isSpace, isBackspace) {
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Master gain node
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(this.volume * 0.4, now);
        masterGain.connect(ctx.destination);

        // 1. High frequency mechanical leaf click (using noise + bandpass)
        const bufferSize = ctx.sampleRate * 0.02; // Very short click (20ms)
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        
        // Frequencies vary for space, backspace, and normal keys
        if (isSpace) {
            noiseFilter.frequency.setValueAtTime(1500, now);
            noiseFilter.Q.setValueAtTime(4, now);
        } else if (isBackspace) {
            noiseFilter.frequency.setValueAtTime(2200, now);
            noiseFilter.Q.setValueAtTime(5, now);
        } else {
            // Slight pitch randomization for organic feel
            const randFreq = 3500 + Math.random() * 800;
            noiseFilter.frequency.setValueAtTime(randFreq, now);
            noiseFilter.Q.setValueAtTime(8, now);
        }

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.015 : 0.008));

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        // 2. Low frequency cap bottoming out (Sine wave)
        const osc = ctx.createOscillator();
        osc.type = "sine";

        let baseFreq = 180;
        if (isSpace) baseFreq = 95;
        else if (isBackspace) baseFreq = 140;
        else baseFreq = 180 + Math.random() * 30; // pitch variation

        osc.frequency.setValueAtTime(baseFreq, now);
        // Quick sweep down
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.03);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.06 : 0.035));

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        // Play
        noiseNode.start(now);
        osc.start(now);

        noiseNode.stop(now + 0.1);
        osc.stop(now + 0.1);
    }

    // Muted, rounder thud (e.g. Cherry MX Brown)
    synthesizeTactile(isSpace, isBackspace) {
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(this.volume * 0.45, now);
        masterGain.connect(ctx.destination);

        // 1. Softer high frequency click
        const bufferSize = ctx.sampleRate * 0.015;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        
        if (isSpace) {
            noiseFilter.frequency.setValueAtTime(800, now);
            noiseFilter.Q.setValueAtTime(2, now);
        } else if (isBackspace) {
            noiseFilter.frequency.setValueAtTime(1200, now);
            noiseFilter.Q.setValueAtTime(2, now);
        } else {
            noiseFilter.frequency.setValueAtTime(1800 + Math.random() * 400, now);
            noiseFilter.Q.setValueAtTime(3, now);
        }

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        // 2. Deeper bottom out thud
        const osc = ctx.createOscillator();
        osc.type = "triangle";

        let baseFreq = 140;
        if (isSpace) baseFreq = 70;
        else if (isBackspace) baseFreq = 110;
        else baseFreq = 140 + Math.random() * 20;

        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.04);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.08 : 0.05));

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        noiseNode.start(now);
        osc.start(now);
        noiseNode.stop(now + 0.15);
        osc.stop(now + 0.15);
    }

    // Smooth, deep thud (e.g. Cherry MX Red / Lubed Linears / "Thocky")
    synthesizeLinear(isSpace, isBackspace) {
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(this.volume * 0.6, now); // Linears can be a bit louder for rich thock
        masterGain.connect(ctx.destination);

        // 1. Very subtle high end tap
        const bufferSize = ctx.sampleRate * 0.01;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "lowpass";
        
        if (isSpace) {
            noiseFilter.frequency.setValueAtTime(600, now);
        } else if (isBackspace) {
            noiseFilter.frequency.setValueAtTime(800, now);
        } else {
            noiseFilter.frequency.setValueAtTime(1200 + Math.random() * 200, now);
        }

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.005);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        // 2. Rich, heavy, low frequency "thock"
        const osc = ctx.createOscillator();
        osc.type = "sine";

        let baseFreq = 110;
        if (isSpace) baseFreq = 65;
        else if (isBackspace) baseFreq = 90;
        else baseFreq = 110 + Math.random() * 15;

        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.05);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.7, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.09 : 0.06));

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        noiseNode.start(now);
        osc.start(now);
        noiseNode.stop(now + 0.2);
        osc.stop(now + 0.2);
    }
}
