import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Navbar } from './components/Navbar';
import { CrisisModal } from './components/CrisisModal';
import { CaregiverScriptGenerator } from './components/CaregiverScriptGenerator';
import { GroundingToolkit } from './components/GroundingToolkit';
import { EducationalHub } from './components/EducationalHub';
import { SafetyPlanView } from './components/SafetyPlanView';
import { HelpDirectory } from './components/HelpDirectory';
import { CaregiverDashboardView } from './components/CaregiverDashboardView';
import { 
  ShieldAlert, Sparkles, Heart, BookOpen, ShieldCheck, Phone, 
  ArrowRight, Calendar, Activity, UserCheck, CheckCircle2, MessageSquare 
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize active user on load
  useEffect(() => {
    loginAs('maya@recoverpath.org');
  }, []);

  const loginAs = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        // Default tab based on role
        if (data.user.role === 'caregiver') {
          setActiveTab('caregiver_scripts');
        } else {
          setActiveTab('home');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isCaregiver = currentUser?.role === 'caregiver';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-teal-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
        onSwitchUser={loginAs}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-teal-300">Loading RecoverPath Engine...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW / HOME VIEW */}
            {activeTab === 'home' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Hero Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/80 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                  
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

                  <div className="relative z-10 space-y-4 max-w-3xl">
                    <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-bold text-teal-300">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>Zero-Typing Recovery Architecture</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                      Crisis Support When <br className="hidden sm:inline" />
                      <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                        Cognitive Load Is Highest
                      </span>
                    </h1>

                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      During a craving, trigger, or caregiver emergency, typing or reading long menus fails. 
                      RecoverPath provides 1-tap GenAI interventions, personalized emergency scripts, and instant grounding tools.
                    </p>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => setIsCrisisModalOpen(true)}
                        className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-rose-950/50 flex items-center space-x-2 transition-all transform active:scale-95 ring-4 ring-rose-500/20"
                      >
                        <ShieldAlert className="w-5 h-5 animate-bounce" />
                        <span>I Need Help Now (Zero-Typing)</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('grounding')}
                        className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-sm border border-slate-700 flex items-center space-x-2 transition-all"
                      >
                        <Activity className="w-4 h-4 text-teal-400" />
                        <span>Grounding Toolkit</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Profile Summary Card */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold">
                        {currentUser?.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-white font-bold block">{currentUser?.name}</span>
                        <span>Role: {currentUser?.role === 'individual' ? 'Individual in Recovery' : 'Caregiver / Family'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                        <Calendar className="w-4 h-4" />
                        <span>8 Months Sober (~240 Days)</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>Primary Contact: <strong className="text-slate-200">David Lin (Father)</strong></span>
                    </div>
                  </div>

                </div>

                {/* THE 4 PILLARS FEATURE CARDS GRID */}
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    <span>The 4 Pillars of RecoverPath</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Pillar 1 Card */}
                    <div
                      onClick={() => setIsCrisisModalOpen(true)}
                      className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer space-y-3 group shadow-xl hover:shadow-rose-950/20"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                        Pillar 1
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                        Zero-Typing Crisis Intervention
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        1-tap flow that asks 1–2 simple questions, fetches GenAI grounding, reads steps aloud, and provides persistent 988 crisis contact buttons.
                      </p>
                      <div className="flex items-center space-x-1 text-xs font-bold text-rose-400 pt-2">
                        <span>Launch Crisis Intervention</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Pillar 2 Card */}
                    <div
                      onClick={() => setActiveTab('caregiver_scripts')}
                      className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-3 group shadow-xl hover:shadow-indigo-950/20"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                        <Heart className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        Pillar 2
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        Personalized Emergency Scripts (Caregivers)
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        GenAI generates real-time, speakable scripts for caregivers facing high-stress situations with opening lines, do's & don'ts, and audio reading.
                      </p>
                      <div className="flex items-center space-x-1 text-xs font-bold text-indigo-400 pt-2">
                        <span>Generate Emergency Script</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Pillar 3 Card */}
                    <div
                      onClick={() => setActiveTab('education')}
                      className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer space-y-3 group shadow-xl hover:shadow-teal-950/20"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                        Pillar 3
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                        Educational Resource Hub & Reformulation
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Evidence-based articles on SUD, relapse prevention, and MAT, with GenAI reformulation into 1-sentence, crisis-mode, or teenager formats.
                      </p>
                      <div className="flex items-center space-x-1 text-xs font-bold text-teal-400 pt-2">
                        <span>Explore Education Hub</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Pillar 4 Card */}
                    <div
                      onClick={() => setActiveTab('safety_plan')}
                      className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-3 group shadow-xl hover:shadow-emerald-950/20"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Pillar 4
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Contextual Safety Tools & Safety Plan
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        4-7-8 breathing visualizer, 5-4-3-2-1 sensory grounding, ambient soundscapes, and calm-state safety plan co-creation with GenAI.
                      </p>
                      <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400 pt-2">
                        <span>Build or View Safety Plan</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* PERSISTENT HOTLINE BANNER */}
                <div className="bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                      <Phone className="w-4 h-4 animate-pulse" />
                      <span>24/7 National Crisis Resources</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Always Available</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                    <a href="tel:988" className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center justify-center space-x-2 transition-all">
                      <Phone className="w-4 h-4" />
                      <span>Call or Text 988</span>
                    </a>
                    <a href="sms:741741?body=HOME" className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition-all">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Text HOME to 741741</span>
                    </a>
                    <a href="tel:18006624357" className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition-all">
                      <Phone className="w-4 h-4 text-teal-400" />
                      <span>SAMHSA: 1-800-662-4357</span>
                    </a>
                  </div>
                </div>

              </div>
            )}

            {/* TAB VIEWS */}
            {activeTab === 'caregiver_scripts' && <CaregiverScriptGenerator />}
            {activeTab === 'grounding' && <GroundingToolkit />}
            {activeTab === 'education' && <EducationalHub />}
            {activeTab === 'safety_plan' && <SafetyPlanView />}
            {activeTab === 'directory' && <HelpDirectory />}
            {activeTab === 'caregiver_dash' && <CaregiverDashboardView />}
          </>
        )}

      </main>

      {/* ZERO-TYPING CRISIS INTERVENTION MODAL */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>RecoverPath • GenAI-Powered Substance Use Disorder Recovery & Caregiver Platform</p>
        <p className="text-[11px] text-slate-600">Disclaimer: RecoverPath is a supportive recovery tool and not a medical device. In life-threatening emergencies, dial 911 or 988 immediately.</p>
      </footer>

    </div>
  );
}
