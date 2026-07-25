import React, { useState } from 'react';
import { CaregiverSituation, CaregiverScriptResponse } from '../types';
import { 
  Sparkles, Volume2, VolumeX, AlertTriangle, CheckCircle2, XCircle, 
  ChevronRight, RefreshCw, HeartHandshake, ShieldAlert, ArrowRight 
} from 'lucide-react';

export const CaregiverScriptGenerator: React.FC = () => {
  const [selectedSituation, setSelectedSituation] = useState<CaregiverSituation>('intense_distress_craving');
  const [relationship, setRelationship] = useState('Father');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<CaregiverScriptResponse | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const situations = [
    { 
      id: 'intense_distress_craving', 
      label: 'Intense Distress / Craving Crisis', 
      desc: 'Loved one is panicking, overwhelmed by craving, or highly anxious.' 
    },
    { 
      id: 'seems_intoxicated', 
      label: 'Suspected Intoxication / Impairment', 
      desc: 'They appear under the influence or uncoordinated.' 
    },
    { 
      id: 'experiencing_withdrawal', 
      label: 'Experiencing Withdrawal Symptoms', 
      desc: 'Nausea, shaking, cold sweats, extreme agitation.' 
    },
    { 
      id: 'found_paraphernalia', 
      label: 'Found Paraphernalia or Evidence', 
      desc: 'Uncovered materials or evidence of active use.' 
    },
    { 
      id: 'communication_breakdown', 
      label: 'High-Conflict Argument / Defense', 
      desc: 'Shouting, accusation, or refusal to engage safely.' 
    },
  ];

  const handleGenerateScript = async (situationId: CaregiverSituation) => {
    setSelectedSituation(situationId);
    setLoading(true);

    try {
      const res = await fetch('/api/caregiver/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: situationId,
          relationship,
        }),
      });

      const data: CaregiverScriptResponse = await res.json();
      setScript(data);
    } catch (err) {
      console.error(err);
      // Fallback script
      setScript({
        id: 'fallback',
        situation: situationId,
        openingLine: `"I love you, I see how hard this moment is for you, and I am standing right here with zero judgment."`,
        doSay: [
          `"You don't have to carry this alone. Let's sit together and take a calm breath."`,
          `"I am here to support your health, not to lecture or argue."`,
          `"We can take this one minute at a time."`
        ],
        avoidSaying: [
          `"How could you do this again?" (Increases panic and defensiveness)`,
          `"You promised you were clean!" (Induces shame and isolation)`,
          `"You're ruining everything." (Destroys trust during crisis)`
        ],
        escalationLine: `If they show signs of severe respiratory distress or unresponsiveness, dial 911 immediately.`,
        closingLine: `"I am standing right here with you. We will get through this hour together."`,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleReadAloud = () => {
    if (!('speechSynthesis' in window) || !script) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();

      const textToRead = `
        Opening line: ${script.openingLine}.
        What to say: ${script.doSay.join('. ')}.
        Closing line: ${script.closingLine}.
      `;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.88; // Calm, deliberate pace for caregiver reading

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Caregiver Emergency Tool
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Personalized De-escalation Scripts
            </h1>
          </div>
        </div>
        
        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
          When a loved one is in crisis, intense fear can make it hard to find the right words. 
          Select the situation below to generate a real-time, clinically informed script you can read out loud to de-escalate tension and maintain connection.
        </p>

        {/* Relationship Context Selector */}
        <div className="flex items-center space-x-3 pt-2">
          <span className="text-xs text-slate-400 font-medium">Your Relationship:</span>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Father">Father / Parent</option>
            <option value="Mother">Mother / Parent</option>
            <option value="Partner">Spouse / Partner</option>
            <option value="Sponsor">Sponsor / Peer Guide</option>
            <option value="Sibling">Sibling / Family Member</option>
            <option value="Friend">Friend / Support Ally</option>
          </select>
        </div>
      </div>

      {/* Situation Selector Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Step 1: What situation are you facing right now?</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {situations.map((sit) => (
            <button
              key={sit.id}
              onClick={() => handleGenerateScript(sit.id as CaregiverSituation)}
              className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1.5 ${
                selectedSituation === sit.id && script
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-indigo-200">{sit.label}</h3>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedSituation === sit.id ? 'rotate-90 text-indigo-400' : 'text-slate-600'}`} />
              </div>
              <p className="text-xs text-slate-400">{sit.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Script Result Display */}
      {loading ? (
        <div className="bg-slate-900/90 p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-indigo-300 animate-pulse">
            GenAI drafting personalized de-escalation script for a {relationship}...
          </p>
        </div>
      ) : (
        script && (
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
            
            {/* Header with TTS button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  GenAI De-escalation Script
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">
                  What to Say Out Loud to Your Loved One
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleReadAloud}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                      : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-900/30'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isPlayingAudio ? 'Stop Reading' : 'Read Aloud'}</span>
                </button>

                <button
                  onClick={() => handleGenerateScript(selectedSituation)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all text-xs"
                  title="Regenerate script"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Opening Line */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-indigo-500/30 space-y-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                1. OPENING LINE (Start with this immediately in a calm tone)
              </span>
              <p className="text-base sm:text-lg font-semibold text-indigo-100 leading-relaxed italic bg-slate-900/60 p-4 rounded-xl border border-indigo-500/20">
                {script.openingLine}
              </p>
            </div>

            {/* Do Say vs Avoid Saying Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* DO SAY */}
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>DO SAY (Calm, Grounding Statements)</span>
                </div>

                <div className="space-y-2.5">
                  {script.doSay.map((line, idx) => (
                    <div key={idx} className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-xs sm:text-sm text-emerald-200 leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* AVOID SAYING */}
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-rose-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                  <XCircle className="w-5 h-5" />
                  <span>AVOID SAYING (Triggering Phrases)</span>
                </div>

                <div className="space-y-2.5">
                  {script.avoidSaying.map((line, idx) => (
                    <div key={idx} className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/20 text-xs sm:text-sm text-rose-200/90 leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Closing Line */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                CLOSING REASSURANCE
              </span>
              <p className="text-sm font-medium text-slate-200">
                {script.closingLine}
              </p>
            </div>

            {/* Escalation Warning */}
            <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-500/40 text-xs text-rose-200 flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 block mb-0.5">Emergency Threshold:</span>
                <span>{script.escalationLine}</span>
              </div>
            </div>

          </div>
        )
      )}

    </div>
  );
};
