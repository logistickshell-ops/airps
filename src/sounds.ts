/**
 * Звуковая система игры
 * Использует Web Audio API для генерации звуков
 */

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  /**
   * Звук выбора карты
   */
  playSelect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  /**
   * Звук обратного отсчёта
   */
  playCountdown() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  /**
   * Звук боя (при показе карт)
   */
  playBattle() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  /**
   * Звук победы в раунде
   */
  playWin() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    // Два осциллятора для аккорда
    [523.25, 659.25, 783.99].forEach((freq, i) => { // C5, E5, G5
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + 0.5);
    });
  }

  /**
   * Звук поражения в раунде
   */
  playLose() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  /**
   * Звук ничьи
   */
  playDraw() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  /**
   * Звук победы в матче (фанфары)
   */
  playVictory() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    // Торжественный аккорд
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';
      
      const startTime = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);
      
      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });
  }

  /**
   * Звук поражения в матче
   */
  playDefeat() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.6);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  }

  /**
   * Звук получения награды
   */
  playReward() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    // Звон монет
    [880, 1108.73, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = 'sine';
      
      const startTime = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  /**
   * Звук нажатия кнопки
   */
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }
}

export const soundSystem = new SoundSystem();
