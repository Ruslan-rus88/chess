// Sound Manager - Generates sounds programmatically using Web Audio API
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;

    // Initialize Web Audio API
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported, sounds disabled");
      this.enabled = false;
    }
  }

  // Generate a beep sound with specified frequency and duration
  generateBeep(frequency, duration, type = "sine") {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Generate a click/tap sound
  generateClick() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.1
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Generate a capture sound (lower, more dramatic)
  generateCapture() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start high, drop down
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      this.audioContext.currentTime + 0.15
    );
    oscillator.type = "sawtooth";

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.15
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // Generate a check sound (urgent, higher pitch)
  generateCheck() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Quick high-pitched beep
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      1200,
      this.audioContext.currentTime + 0.1
    );
    oscillator.type = "square";

    gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.1
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  play(soundName) {
    if (!this.enabled) return;

    // Resume audio context if it's suspended (browser autoplay policy)
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    switch (soundName) {
      case "select":
        this.generateClick();
        break;
      case "move":
        this.generateBeep(600, 0.1, "sine");
        break;
      case "capture":
        this.generateCapture();
        break;
      case "check":
        this.generateCheck();
        break;
      default:
        break;
    }
  }
}
