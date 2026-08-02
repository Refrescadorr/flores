// Sintetizador de piano

class AmbientAudio {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.masterGain = null;
        this.musicInterval = null;

        // notas del piano (Hz)
        this.NOTES = {
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'B5': 987.77
        };

        // melodia de Für Elise
        this.furEliseMelody = [
            { note: 'E5', dur: 0.28 }, { note: 'D#5', dur: 0.28 }, { note: 'E5', dur: 0.28 }, { note: 'D#5', dur: 0.28 },
            { note: 'E5', dur: 0.28 }, { note: 'B4', dur: 0.28 }, { note: 'D5', dur: 0.28 }, { note: 'C5', dur: 0.28 },
            { note: 'A4', dur: 0.70 }, { note: 'C4', dur: 0.28 }, { note: 'E4', dur: 0.28 }, { note: 'A4', dur: 0.28 },
            { note: 'B4', dur: 0.70 }, { note: 'E4', dur: 0.28 }, { note: 'G#4', dur: 0.28 }, { note: 'B4', dur: 0.28 },
            { note: 'C5', dur: 0.70 }, { note: 'E4', dur: 0.28 }, { note: 'E5', dur: 0.28 }, { note: 'D#5', dur: 0.28 },
            { note: 'E5', dur: 0.28 }, { note: 'D#5', dur: 0.28 }, { note: 'E5', dur: 0.28 }, { note: 'B4', dur: 0.28 },
            { note: 'D5', dur: 0.28 }, { note: 'C5', dur: 0.28 }, { note: 'A4', dur: 0.70 }, { note: 'C4', dur: 0.28 },
            { note: 'E4', dur: 0.28 }, { note: 'A4', dur: 0.28 }, { note: 'B4', dur: 0.70 }, { note: 'E4', dur: 0.28 },
            { note: 'C5', dur: 0.28 }, { note: 'B4', dur: 0.28 }, { note: 'A4', dur: 0.90 }
        ];

        // bajo de acompañamiento
        this.furEliseBass = [
            { note: 'A3', dur: 1.2 }, { note: 'E3', dur: 1.2 }, { note: 'A3', dur: 1.2 }, { note: 'E3', dur: 1.2 },
            { note: 'A3', dur: 1.2 }, { note: 'E3', dur: 1.2 }, { note: 'A3', dur: 1.2 }, { note: 'E3', dur: 1.2 }
        ];

        this.noteIndex = 0;
        this.bassIndex = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSound() {
        this.init();
        if (this.isPlaying) {
            this.stopMusic();
        } else {
            this.startMusic();
        }
        return this.isPlaying;
    }

    startMusic() {
        this.isPlaying = true;
        this.noteIndex = 0;
        this.bassIndex = 0;

        this.playNextBeethovenNote();
    }

    stopMusic() {
        this.isPlaying = false;
        if (this.musicInterval) {
            clearTimeout(this.musicInterval);
            this.musicInterval = null;
        }
    }

    playNextBeethovenNote() {
        if (!this.isPlaying || !this.ctx) return;

        const currentMelody = this.furEliseMelody[this.noteIndex];
        if (currentMelody) {
            this.playPianoNote(currentMelody.note, currentMelody.dur * 0.9, 0.22);

            // bajo cada 4 notas
            if (this.noteIndex % 4 === 0) {
                const bass = this.furEliseBass[this.bassIndex % this.furEliseBass.length];
                this.playPianoNote(bass.note, bass.dur, 0.14);
                this.bassIndex++;
            }

            this.noteIndex = (this.noteIndex + 1) % this.furEliseMelody.length;

            const delayMs = currentMelody.dur * 1000;
            this.musicInterval = setTimeout(() => {
                this.playNextBeethovenNote();
            }, delayMs);
        }
    }

    // toca una nota de piano
    playPianoNote(noteName, duration = 0.5, volume = 0.2) {
        if (!this.ctx || !this.NOTES[noteName]) return;

        const freq = this.NOTES[noteName];
        const now = this.ctx.currentTime;

        // osciladores: uno triangular + uno seno (armónico) (alto musico soy :sob:)
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now); // armónico

        // filtro para suavizar el sonido
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + duration);

        // envolvente de ataque y caída (ADSR)
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(volume, now + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + duration);
        osc2.stop(now + duration);
    }

    // nota al interactuar con flores :D mw voy a matar
    playBloomChime() {
        this.init();
        if (!this.ctx) return;

        const chimeNotes = ['A4', 'C5', 'E5', 'A5'];
        const randomNote = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
        this.playPianoNote(randomNote, 1.4, 0.28);
    }
}
