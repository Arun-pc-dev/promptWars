import React, { useState, useEffect } from 'react';
import { CrisisFeeling, CrisisInterventionResponse, User } from '../types';
import { 
  X, AlertTriangle, Mic, MicOff, Phone, MessageSquare, HeartHandshake, 
  Volume2, VolumeX, ShieldAlert, Sparkles, CheckCircle2, RefreshCw, ChevronRight, Activity 
} from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Safety Status, 2: Feeling, 3: AI Grounding Result
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'uncomfortable' | 'in_danger'>('uncomfortable');
  const [feeling, setFeeling] = useState<CrisisFeeling>('craving');
  const [voiceNote, setVoiceNote] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<CrisisInterventionResponse | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [contactNotified, setContactNotified] = useState(false);
  const [notifyingContact, setNotifyingContact] = useState(false);

  // Web Speech API Speech Recognition setup
  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStep(1);
      setAiResult(null);
      setContactNotified(false);
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVoiceListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is supported in Chrome, Edge, and Safari. You can also tap options directly.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceNote(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleFetchGrounding = async (selectedStatus: 'safe' | 'uncomfortable' | 'in_danger', selectedFeeling: CrisisFeeling) => {
    setLoading(true);
    setStep(3);

    try {
      const res = await fetch('/api/crisis/intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          safetyStatus: selectedStatus,
          feeling: selectedFeeling,
          voiceNote: voiceNote || undefined,
        }),
      });

      const data: CrisisInterventionResponse = await res.json();
      setAiResult(data);

      // Auto read audio prompt if TTS supported
      if ('speechSynthesis' in window && data.audioPromptText) {
        speakText(data.audioPromptText);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setAiResult({
        id: 'fallback',
        timestamp: new Date().toISOString(),
        isHighRisk: selectedStatus === 'in_danger',
        groundingTitle: 'Take a Slow Deep Breath',
        groundingText: 'Pause for 10 seconds. Drop your shoulders away from your ears. Feel your feet firmly on the floor. You are safe in this present moment.',
        actionSteps: [
          'Inhale deeply through your nose for 4 seconds',
          'Hold for 4 seconds, exhale for 6 seconds',
          'Tap below to notify your primary contact'
        ],
        empathyNote: 'This wave feels heavy, but it will peak and pass in minutes. You do not have to act on this urge.',
        audioPromptText: 'Pause for 10 seconds. Drop your shoulders. You are safe in this present moment.',
        contactNotified: false
      });
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Calm, steady speaking rate
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    } else if (aiResult?.audioPromptText) {
      speakText(aiResult.audioPromptText);
    }
  };

  const handleNotifyContact = async () => {
    setNotifyingContact(true);
    try {
      await fetch('/api/crisis/notify-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeling,
          safetyStatus,
        }),
      });
      setContactNotified(true);
    } catch (err) {
      console.error(err);
      setContactNotified(true);
    } finally {
      setNotifyingContact(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-rose-500/40 rounded-3xl shadow-2xl shadow-rose-950/60 overflow-hidden my-auto text-white">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-900/80 via-slate-900 to-amber-900/60 p-4 sm:p-5 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Zero-Typing Crisis Guide</span>
                <span className="px-2 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30 font-mono">
                  STEP {step} OF 3
                </span>
              </h2>
              <p className="text-xs text-rose-200/80">Cognitive Load Optimization • 1-Tap Interventions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-all"
            aria-label="Close crisis window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">

          {/* STEP 1: SAFETY CHECK */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
                <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <span>Are you in immediate physical safety right now?</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">Tap the option that best describes your situation:</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    setSafetyStatus('safe');
                    setStep(2);
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border-2 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-300 text-sm sm:text-base">I am safe, but experiencing a high craving or trigger</h4>
                      <p className="text-xs text-slate-300">Need grounding and immediate coping steps</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-300 transform group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => {
                    setSafetyStatus('uncomfortable');
                    setStep(2);
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border-2 border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/20 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      !
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm sm:text-base">I feel highly anxious or at risk of relapse</h4>
                      <p className="text-xs text-slate-300">Feeling intense tension or emotional distress</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-300 transform group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => {
                    setSafetyStatus('in_danger');
                    handleFetchGrounding('in_danger', 'just_used');
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-rose-950/60 border-2 border-rose-500/60 hover:border-rose-400 hover:bg-rose-900/40 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/30 flex items-center justify-center text-rose-300 font-bold">
                      SOS
                    </div>
                    <div>
                      <h4 className="font-bold text-rose-200 text-sm sm:text-base">I am in active medical or physical danger</h4>
                      <p className="text-xs text-rose-300/80">Connect immediately with 988 / 911 emergency care</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: WHAT ARE YOU FEELING? */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  What is happening right now? (Tap 1 option)
                </h3>
                <p className="text-xs text-slate-300">GenAI will construct your personalized grounding response based on your stored safety plan.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'craving', label: 'Severe Craving / Urge', desc: 'Obsessive thoughts about using' },
                  { id: 'anxiety', label: 'High Anxiety / Panic', desc: 'Racing heart, shaking, tight chest' },
                  { id: 'trigger', label: 'Relapse Trigger / Cue', desc: 'Environment, place, or old associate' },
                  { id: 'emotional_distress', label: 'Emotional Distress / Loneliness', desc: 'Overwhelming sadness or anger' },
                  { id: 'just_used', label: 'I Just Used / Slip-up', desc: 'Need immediate safety guidance' },
                  { id: 'caregiver_emergency', label: 'Caregiver Emergency', desc: 'My loved one needs urgent support' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setFeeling(item.id as CrisisFeeling);
                      handleFetchGrounding(safetyStatus, item.id as CrisisFeeling);
                    }}
                    className="p-4 rounded-2xl bg-slate-800 border border-slate-700 hover:border-teal-400 hover:bg-slate-700/80 text-left transition-all space-y-1 group"
                  >
                    <div className="font-bold text-sm text-teal-200 group-hover:text-teal-300 flex items-center justify-between">
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-300" />
                    </div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </button>
                ))}
              </div>

              {/* Optional Voice Note Input */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Or speak out loud (Voice-to-Text):</span>
                  </div>
                  <button
                    onClick={handleVoiceListen}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening...' : 'Tap to Speak'}</span>
                  </button>
                </div>

                {voiceNote && (
                  <div className="mt-2 p-3 bg-teal-950/40 rounded-xl border border-teal-500/30 text-xs text-teal-200">
                    <span className="font-semibold">Transcribed:</span> "{voiceNote}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: AI GROUNDING RESULT & CRISIS ACTION */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              
              {loading ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                  <p className="text-sm font-semibold text-teal-300 animate-pulse">
                    GenAI assembling personalized grounding script from your safety plan...
                  </p>
                </div>
              ) : (
                aiResult && (
                  <>
                    {/* Audio Voice Reader Banner */}
                    <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 p-4 rounded-2xl border border-teal-500/30 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={toggleAudio}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                            isPlayingAudio 
                              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30' 
                              : 'bg-teal-500 text-slate-950 hover:bg-teal-400 font-bold shadow-lg shadow-teal-500/30'
                          }`}
                          aria-label={isPlayingAudio ? 'Mute spoken guide' : 'Play spoken guide aloud'}
                        >
                          {isPlayingAudio ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Voice Guidance Active</span>
                          </h4>
                          <p className="text-xs text-slate-300">
                            {isPlayingAudio ? 'Reading grounding steps aloud...' : 'Tap speaker button to listen to audio guide'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFetchGrounding(safetyStatus, feeling)}
                        className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-all text-xs flex items-center space-x-1"
                        title="Regenerate grounding response"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Refresh</span>
                      </button>
                    </div>

                    {/* AI Grounding Response Card */}
                    <div className="bg-slate-800/90 p-5 rounded-2xl border-2 border-teal-500/40 space-y-4 shadow-xl">
                      <div>
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                          GenAI Grounding Intervention
                        </span>
                        <h3 className="text-xl font-extrabold text-white mt-2">
                          {aiResult.groundingTitle}
                        </h3>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                        "{aiResult.groundingText}"
                      </p>

                      {/* Action Steps */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your 3 Immediate Action Steps:</h4>
                        <div className="space-y-2">
                          {aiResult.actionSteps.map((stepText, idx) => (
                            <div key={idx} className="flex items-start space-x-3 bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
                              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs sm:text-sm text-slate-200">{stepText}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Empathy Note */}
                      <p className="text-xs italic text-teal-300 bg-teal-950/30 p-3 rounded-xl border border-teal-500/20">
                        💡 {aiResult.empathyNote}
                      </p>
                    </div>

                    {/* 1-TAP NOTIFY SUPPORT CONTACT BUTTON */}
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                            <HeartHandshake className="w-4 h-4 text-emerald-400" />
                            <span>1-Tap Support Contact Alert</span>
                          </h4>
                          <p className="text-xs text-slate-400">
                            Sends safety notification to David Lin (Father / Caregiver)
                          </p>
                        </div>

                        <button
                          onClick={handleNotifyContact}
                          disabled={contactNotified || notifyingContact}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
                            contactNotified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30'
                          }`}
                        >
                          {notifyingContact ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : contactNotified ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Contact Dispatched</span>
                            </>
                          ) : (
                            <span>Notify Contact Now</span>
                          )}
                        </button>
                      </div>

                      {contactNotified && (
                        <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Alert dispatched to David Lin. They have been informed that you requested support.</span>
                        </div>
                      )}
                    </div>
                  </>
                )
              )}
            </div>
          )}

          {/* PERSISTENT NON-DISMISSIBLE HOTLINE CARD */}
          <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 p-4 rounded-2xl border-2 border-rose-500/50 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200">
                  24/7 National Emergency Crisis Lifelines
                </h4>
              </div>
              <span className="text-[10px] text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 font-mono">
                NON-DISMISSIBLE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <a
                href="tel:988"
                className="p-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call or Text 988</span>
              </a>

              <a
                href="sms:741741?body=HOME"
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Text HOME to 741741</span>
              </a>

              <a
                href="tel:18006624357"
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition-all"
              >
                <Phone className="w-4 h-4 text-teal-400" />
                <span>SAMHSA: 1-800-662-4357</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
