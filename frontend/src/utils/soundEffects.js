// Synthetic Page Turn Sound Effect generator utilizing Web Audio API
export const playPageTurnSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // 1. Create a White Noise Buffer for the paper rustling rustle
    const bufferSize = ctx.sampleRate * 0.4; // 0.4 seconds duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // 2. Bandpass filter to make the noise sound like paper sliding
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(1.5, ctx.currentTime);
    // Sweep the frequency down as the page turns
    filter.frequency.setValueAtTime(2500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.35);

    // 3. Gain node for noise volume envelope
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    // Smooth volume fade-in and quick fade-out
    noiseGain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 4. Low-frequency sine wave oscillator for the page settling flap thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.18);

    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    // Trigger thud slightly after rustle begins
    oscGain.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    oscGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.15);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    // Play both parts
    noiseSource.start(0);
    osc.start(ctx.currentTime + 0.1);
    
    // Stop oscillators and close context when finished
    setTimeout(() => {
      try {
        noiseSource.stop();
        osc.stop();
        ctx.close();
      } catch (e) {}
    }, 450);

  } catch (err) {
    console.warn('Web Audio API is not supported or was blocked by browser autoplay policy:', err.message);
  }
};
