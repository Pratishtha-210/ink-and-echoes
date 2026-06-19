import React, { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gainNodeRef = useRef(null);

  const startAmbientSynth = () => {
    try {
      // 1. Create Audio Context
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 2. Main lowpass filter for warm, dark academia texture
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime); // very warm, cuts harshness

      // 3. Main gain control (keep it extremely quiet and subtle)
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime); // start silent for fade-in
      mainGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 1.5); // fade to 1.5% vol

      filter.connect(mainGain);
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      // 4. Create multi-voice C Minor Pad (C2, G2, C3, Eb3)
      const freqs = [65.41, 98.00, 130.81, 155.56];
      const oscillators = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        // Soft triangle wave for rich harmonics
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Low volume per voice
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);

        // Connect oscillator to filter via voice gain
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(0);

        // Slow organic frequency drift (LFO simulation)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.05 + idx * 0.02, ctx.currentTime); // slow rate
        lfoGain.gain.setValueAtTime(0.5 + idx * 0.1, ctx.currentTime); // moderate depth

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(0);

        oscillators.push(osc);
        oscillators.push(lfo); // keep track to stop
      });

      oscillatorsRef.current = oscillators;
    } catch (e) {
      console.error('Web Audio API not supported or initialized failed:', e);
    }
  };

  const stopAmbientSynth = () => {
    const mainGain = gainNodeRef.current;
    const ctx = audioCtxRef.current;
    
    if (mainGain && ctx) {
      // Fade out
      mainGain.gain.cancelScheduledValues(ctx.currentTime);
      mainGain.gain.setValueAtTime(mainGain.gain.value, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

      setTimeout(() => {
        try {
          oscillatorsRef.current.forEach(osc => osc.stop());
          ctx.close();
        } catch (e) {}
        
        oscillatorsRef.current = [];
        audioCtxRef.current = null;
        gainNodeRef.current = null;
      }, 900);
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      stopAmbientSynth();
      setIsPlaying(false);
    } else {
      startAmbientSynth();
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-luxury-card/80 border border-luxury-border/60 text-luxury-gold hover:text-white hover:border-luxury-gold shadow-gold-glow transition-all duration-300 backdrop-blur-md flex items-center justify-center"
      title={isPlaying ? "Silence Music" : "Play Ambient Soundtrack"}
    >
      {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
    </button>
  );
};

export default MusicPlayer;
