import React, { useState, useEffect } from 'react';
import { SafetyPlan } from '../types';
import { 
  ShieldCheck, Sparkles, Plus, Trash2, Save, CheckCircle2, AlertTriangle, Heart, RefreshCw 
} from 'lucide-react';

export const SafetyPlanView: React.FC = () => {
  const [plan, setPlan] = useState<SafetyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  // New item inputs
  const [newWarning, setNewWarning] = useState('');
  const [newCoping, setNewCoping] = useState('');
  const [newReason, setNewReason] = useState('');

  useEffect(() => {
    fetchSafetyPlan();
  }, []);

  const fetchSafetyPlan = async () => {
    try {
      const res = await fetch('/api/safety-plan');
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/safety-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });

      const updated = await res.json();
      setPlan(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAiSuggest = async () => {
    setAiSuggesting(true);
    try {
      const res = await fetch('/api/safety-plan/ai-suggest', { method: 'POST' });
      const data = await res.json();

      if (plan && data) {
        setPlan({
          ...plan,
          warningSigns: Array.from(new Set([...plan.warningSigns, ...(data.warningSigns || [])])),
          copingStrategies: Array.from(new Set([...plan.copingStrategies, ...(data.copingStrategies || [])])),
          reasonsToStaySober: Array.from(new Set([...plan.reasonsToStaySober, ...(data.reasonsToStaySober || [])])),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiSuggesting(false);
    }
  };

  const removeItem = (field: 'warningSigns' | 'copingStrategies' | 'reasonsToStaySober', idx: number) => {
    if (!plan) return;
    const updated = [...plan[field]];
    updated.splice(idx, 1);
    setPlan({ ...plan, [field]: updated });
  };

  const addItem = (field: 'warningSigns' | 'copingStrategies' | 'reasonsToStaySober', text: string, setText: (s: string) => void) => {
    if (!plan || !text.trim()) return;
    setPlan({ ...plan, [field]: [...plan[field], text.trim()] });
    setText('');
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading safety plan...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Calm-State Preparation
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Personal Crisis Safety Plan
              </h1>
            </div>
          </div>

          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Plan'}</span>
          </button>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
          Your Safety Plan is your external brain during a crisis moment. When cognitive load is highest, 
          RecoverPath automatically injects these pre-set coping steps into your zero-typing intervention screens.
        </p>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Safety Plan saved successfully! It is now active in your zero-typing crisis interventions.</span>
          </div>
        )}

        {/* AI Co-creation Assistant Button */}
        <div className="pt-2">
          <button
            onClick={handleAiSuggest}
            disabled={aiSuggesting}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center space-x-2 transition-all"
          >
            {aiSuggesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
            <span>{aiSuggesting ? 'GenAI generating suggestions...' : 'AI Co-create Safety Plan Ideas'}</span>
          </button>
        </div>
      </div>

      {/* PLAN SECTION 1: WARNING SIGNS */}
      {plan && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <h3>1. Early Warning Signs & Triggers</h3>
            </div>
            <p className="text-xs text-slate-400">Physical sensations, thoughts, or environments that signal elevated risk:</p>

            <div className="space-y-2">
              {plan.warningSigns.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs sm:text-sm text-slate-200">
                  <span>• {item}</span>
                  <button onClick={() => removeItem('warningSigns', idx)} className="text-slate-500 hover:text-rose-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Add new warning sign..."
                value={newWarning}
                onChange={(e) => setNewWarning(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem('warningSigns', newWarning, setNewWarning)}
                className="flex-1 bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => addItem('warningSigns', newWarning, setNewWarning)}
                className="p-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PLAN SECTION 2: COPING STRATEGIES */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-teal-400 font-bold text-base">
              <ShieldCheck className="w-5 h-5" />
              <h3>2. Internal Coping Strategies (No Person Needed)</h3>
            </div>
            <p className="text-xs text-slate-400">Actions you can take on your own to distract and regulate your nervous system:</p>

            <div className="space-y-2">
              {plan.copingStrategies.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs sm:text-sm text-slate-200">
                  <span>• {item}</span>
                  <button onClick={() => removeItem('copingStrategies', idx)} className="text-slate-500 hover:text-rose-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Add new coping strategy..."
                value={newCoping}
                onChange={(e) => setNewCoping(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem('copingStrategies', newCoping, setNewCoping)}
                className="flex-1 bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={() => addItem('copingStrategies', newCoping, setNewCoping)}
                className="p-2.5 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-teal-400 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PLAN SECTION 3: REASONS TO STAY SOBER */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-base">
              <Heart className="w-5 h-5" />
              <h3>3. Reasons to Stay Sober & Healthy</h3>
            </div>
            <p className="text-xs text-slate-400">People, goals, values, and futures that matter deeply to you:</p>

            <div className="space-y-2">
              {plan.reasonsToStaySober.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs sm:text-sm text-slate-200">
                  <span>• {item}</span>
                  <button onClick={() => removeItem('reasonsToStaySober', idx)} className="text-slate-500 hover:text-rose-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Add reason to stay sober..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem('reasonsToStaySober', newReason, setNewReason)}
                className="flex-1 bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                onClick={() => addItem('reasonsToStaySober', newReason, setNewReason)}
                className="p-2.5 bg-rose-500 text-white font-bold rounded-xl text-xs hover:bg-rose-400 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
