import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, Eye, Volume2, VolumeX, Sparkles, Play, Pause, RotateCcw, Activity, ShieldCheck 
} from 'lucide-react';

export const GroundingToolkit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'sensory' | 'soundscape'>('breathing');

  // --- 4-7-8 Breathing State ---
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isBreathingActive) {
      if (secondsLeft > 0) {
        timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      } else {
        // Transition to next phase
        if (breathPhase === 'Ready' || breathPhase === 'Exhale') {
          setBreathPhase('Inhale');
          setSecondsLeft(4);
          if (breathPhase === 'Exhale') setCyclesCompleted(c => c + 1);
        } else if (breathPhase === 'Inhale') {
          setBreathPhase('Hold');
          setSecondsLeft(7);
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Exhale');
          setSecondsLeft(8);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isBreathingActive, secondsLeft, breathPhase]);

  const startBreathing = () => {
    setIsBreathingActive(true);
    setBreathPhase('Inhale');
    setSecondsLeft(4);
    setCyclesCompleted(0);
  };

  const stopBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('Ready');
    setSecondsLeft(0);
  };

  // --- 5-4-3-2-1 Sensory Grounding State ---
  const [sensoryStep, setSensoryStep] = useState(0);
  const sensoryCards = [
    { num: 5, sense: 'SEE', label: '5 things you can SEE around you right now', detail: 'Look for colors, shadows, shapes, or details on the floor or wall.', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300' },
    { num: 4, sense: 'FEEL', label: '4 things you can physically TOUCH', detail: 'Notice the texture of your shirt, the chair against your back, or cold air on skin.', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300' },
    { num: 3, sense: 'HEAR', label: '3 sounds in your immediate environment', detail: 'Listen for hum of air conditioning, distant traffic, or your own slow breathing.', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300' },
    { num: 2, sense: 'SMELL', label: '2 distinct scents you can smell', detail: 'Smell your coffee cup, fresh soap on your hands, or ambient room air.', color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300' },
    { num: 1, sense: 'TASTE', label: '1 thing you can TASTE in your mouth', detail: 'Notice residual mint, water, or press tongue gently against palate.', color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-300' },
  ];

  // --- Web Audio API Ambient Soundscape ---
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundType, setSoundType] = useState<'rain' | 'ocean' | 'pink_noise'>('ocean');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const startAmbientSound = () => {
    if (isPlayingSound) {
      stopAmbientSound();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Create white/pink noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise filter approximation
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter for ocean/rain atmosphere
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = soundType === 'ocean' ? 400 : 800;

      // LFO for ocean wave modulation
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12; // wave rhythm every ~8 seconds
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 250;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.15; // Safe gentle volume

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise as any;
      setIsPlayingSound(true);
    } catch (e) {
      console.error(e);
      setIsPlayingSound(false);
    }
  };

  const stopAmbientSound = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlayingSound(false);
  };

  useEffect(() => {
    return () => stopAmbientSound();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Tab Navigation Header */}
      <div className="bg-slate-900/90 p-2 sm:p-3 rounded-2xl border border-slate-800 flex items-center justify-around space-x-2 text-xs sm:text-sm font-bold text-slate-300">
        <button
          onClick={() => setActiveTab('breathing')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'breathing' ? 'bg-teal-500 text-slate-950 font-extrabold shadow-lg shadow-teal-500/20' : 'hover:bg-slate-800'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>4-7-8 Breathing</span>
        </button>

        <button
          onClick={() => setActiveTab('sensory')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'sensory' ? 'bg-teal-500 text-slate-950 font-extrabold shadow-lg shadow-teal-500/20' : 'hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>5-4-3-2-1 Sensory Reset</span>
        </button>

        <button
          onClick={() => setActiveTab('soundscape')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'soundscape' ? 'bg-teal-500 text-slate-950 font-extrabold shadow-lg shadow-teal-500/20' : 'hover:bg-slate-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Ambient Waves</span>
        </button>
      </div>

      {/* --- TAB 1: 4-7-8 BREATHING ANIMATION --- */}
      {activeTab === 'breathing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center space-y-8 shadow-2xl animate-fadeIn">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              Vagus Nerve Nervous System Regulation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              4-7-8 Parasympathetic Breathing
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1">
              Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. This ratio triggers parasympathetic calm within 3 cycles.
            </p>
          </div>

          {/* Animated Circle Stage */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto flex items-center justify-center">
            
            {/* Outer Glowing Ring */}
            <div 
              className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                breathPhase === 'Inhale' 
                  ? 'scale-110 border-teal-400 shadow-2xl shadow-teal-500/50 bg-teal-500/10'
                  : breathPhase === 'Hold'
                  ? 'scale-110 border-amber-400 shadow-2xl shadow-amber-500/50 bg-amber-500/10'
                  : breathPhase === 'Exhale'
                  ? 'scale-90 border-indigo-400 shadow-2xl shadow-indigo-500/50 bg-indigo-500/10'
                  : 'scale-100 border-slate-700 bg-slate-800/40'
              }`}
            />

            {/* Inner Content */}
            <div className="relative z-10 space-y-2">
              <span className="text-3xl sm:text-4xl font-black text-white block tracking-wider">
                {secondsLeft > 0 ? secondsLeft : '—'}
              </span>
              <span className={`text-base font-extrabold uppercase tracking-widest block ${
                breathPhase === 'Inhale' ? 'text-teal-300' :
                breathPhase === 'Hold' ? 'text-amber-300' :
                breathPhase === 'Exhale' ? 'text-indigo-300' : 'text-slate-400'
              }`}>
                {breathPhase}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isBreathingActive ? (
              <button
                onClick={startBreathing}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-teal-500/30 flex items-center space-x-2 transition-all transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Begin 4-7-8 Breathing</span>
              </button>
            ) : (
              <button
                onClick={stopBreathing}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center space-x-2 transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Cycle</span>
              </button>
            )}
          </div>

          {cyclesCompleted > 0 && (
            <p className="text-xs text-teal-300 bg-teal-950/40 px-4 py-2 rounded-xl inline-block border border-teal-500/30">
              ✓ Completed {cyclesCompleted} full breathing cycle{cyclesCompleted > 1 ? 's' : ''}. Heart rate and cortisol levels stabilizing.
            </p>
          )}
        </div>
      )}

      {/* --- TAB 2: 5-4-3-2-1 SENSORY RESET --- */}
      {activeTab === 'sensory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              Cognitive Re-anchoring
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              5-4-3-2-1 Sensory Grounding
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Forces the brain's prefrontal cortex to refocus on immediate physical surroundings, disrupting craving loops.
            </p>
          </div>

          {/* Active Card Deck */}
          <div className="space-y-4">
            {sensoryCards.map((card, idx) => (
              <div
                key={card.num}
                onClick={() => setSensoryStep(idx)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  sensoryStep === idx
                    ? `bg-gradient-to-r ${card.color} shadow-xl scale-[1.01]`
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-center font-black text-xl shrink-0 ${
                    sensoryStep === idx ? card.color.split(' ')[2] : 'text-slate-500'
                  }`}>
                    {card.num}
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-bold text-sm sm:text-base ${sensoryStep === idx ? 'text-white' : 'text-slate-300'}`}>
                      {card.label}
                    </h3>
                    {sensoryStep === idx && (
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                        {card.detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setSensoryStep(Math.max(0, sensoryStep - 1))}
              disabled={sensoryStep === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold disabled:opacity-40"
            >
              Previous Sense
            </button>

            <span className="text-xs text-slate-400 font-mono">STEP {sensoryStep + 1} OF 5</span>

            <button
              onClick={() => setSensoryStep(Math.min(sensoryCards.length - 1, sensoryStep + 1))}
              disabled={sensoryStep === sensoryCards.length - 1}
              className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold disabled:opacity-40"
            >
              Next Sense
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 3: AMBIENT SOUNDSCAPE --- */}
      {activeTab === 'soundscape' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center animate-fadeIn">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              Web Audio Synthesizer
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Calming Ambient Soundscapes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Generated locally in your browser using pure Web Audio API synthesis. No external audio files needed.
            </p>
          </div>

          <div className="flex justify-center space-x-3 text-xs font-bold">
            {[
              { id: 'ocean', label: 'Rhythmic Ocean Waves' },
              { id: 'rain', label: 'Gentle Rain' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => {
                  setSoundType(snd.id as any);
                  if (isPlayingSound) {
                    stopAmbientSound();
                  }
                }}
                className={`px-4 py-2.5 rounded-xl transition-all ${
                  soundType === snd.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>

          <div className="pt-4">
            <button
              onClick={startAmbientSound}
              className={`px-8 py-4 rounded-2xl font-extrabold text-sm flex items-center space-x-2 mx-auto transition-all shadow-xl ${
                isPlayingSound
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                  : 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-teal-500/30'
              }`}
            >
              {isPlayingSound ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              <span>{isPlayingSound ? 'Stop Ambient Waves' : 'Play Soundscape'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
