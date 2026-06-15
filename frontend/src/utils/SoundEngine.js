class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientLfo = null;
    this.ambientGain = null;
    this.masterGain = null;
    this.isMuted = true;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      
      // Master gain node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Initialize ambient hum
      this.initAmbientHum();

      this.isInitialized = true;
      this.isMuted = false;

      // Smooth master fade-in
      this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  initAmbientHum() {
    if (!this.ctx) return;

    // Deep low pad hum
    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc1.type = 'sine';
    this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    this.ambientOsc2 = this.ctx.createOscillator();
    this.ambientOsc2.type = 'triangle';
    this.ambientOsc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 note

    // Lowpass filter to keep it warm and non-distracting
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.Q.setValueAtTime(1, this.ctx.currentTime);

    // Ambient gain control
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    // LFO to create a slow undulating swell (breathing effect)
    this.ambientLfo = this.ctx.createOscillator();
    this.ambientLfo.type = 'sine';
    this.ambientLfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // 0.15 Hz

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    // Connect LFO to filter frequency or gain
    this.ambientLfo.connect(lfoGain);
    lfoGain.connect(this.ambientGain.gain);

    // Connect audio path
    this.ambientOsc1.connect(filter);
    this.ambientOsc2.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    // Start oscillators
    this.ambientOsc1.start();
    this.ambientOsc2.start();
    this.ambientLfo.start();
  }

  playHover() {
    if (this.isMuted || !this.isInitialized || !this.ctx) return;
    if (this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Retro-futuristic sliding pitch: 480Hz -> 540Hz
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  playClick() {
    if (this.isMuted || !this.isInitialized || !this.ctx) return;
    if (this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      
      // Dual-tone digital chime
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5 note
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now); // A4 note
      
      // Soft lowpass filter for the chime
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  playEntrance() {
    if (this.isMuted || !this.isInitialized || !this.ctx) return;
    
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.65);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.65);
      filter.Q.setValueAtTime(5, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      // Ignore
    }
  }

  toggle() {
    if (!this.isInitialized) {
      this.init();
      return true;
    }

    if (this.isMuted) {
      this.unmute();
      return true;
    } else {
      this.mute();
      return false;
    }
  }

  mute() {
    if (!this.isInitialized || !this.masterGain) return;
    this.isMuted = true;
    
    if (this.ctx) {
      // Fade out master gain smoothly
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.35);
    }
  }

  unmute() {
    if (!this.isInitialized || !this.masterGain) return;
    this.isMuted = false;
    
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      // Fade in master gain smoothly
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.5);
    }
  }
}

// Single instance for global reuse
const soundEngine = new SoundEngine();
export default soundEngine;
