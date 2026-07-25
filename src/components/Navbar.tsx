import React from 'react';
import { User } from '../types';
import { Shield, AlertCircle, Heart, UserCheck, Sparkles, Phone } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCrisisModal: () => void;
  onSwitchUser: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenCrisisModal,
  onSwitchUser,
}) => {
  const isCaregiver = currentUser?.role === 'caregiver';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/30">
              <Shield className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
                  RecoverPath
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-teal-500/10 text-teal-300 rounded-full border border-teal-500/20">
                  GenAI Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Zero-Typing Recovery & Crisis Support</p>
            </div>
          </div>

          {/* Quick Demo Switcher & Emergency Panic Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Quick Demo Profile Selector */}
            <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 px-2 font-medium">Demo Profile:</span>
              <button
                onClick={() => onSwitchUser('maya@recoverpath.org')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  currentUser?.email === 'maya@recoverpath.org'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Maya (Individual)</span>
              </button>
              <button
                onClick={() => onSwitchUser('david@recoverpath.org')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  currentUser?.email === 'david@recoverpath.org'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>David (Caregiver)</span>
              </button>
            </div>

            {/* Direct Hotline Quick Call Button */}
            <a
              href="tel:988"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
              title="Call 988 Crisis Lifeline"
            >
              <Phone className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>988 Hotline</span>
            </a>

            {/* Emergency Panic Button - ZERO TYPING CRISIS INTERVENTION */}
            <button
              onClick={onOpenCrisisModal}
              id="panic-button-header"
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-900/40 ring-4 ring-rose-500/20 hover:ring-rose-400/40 transition-all transform active:scale-95 flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
              <span className="uppercase tracking-wider">I Need Help Now</span>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar text-xs font-medium space-x-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'home' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          
          {isCaregiver ? (
            <button
              onClick={() => setActiveTab('caregiver_scripts')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1 ${
                activeTab === 'caregiver_scripts' ? 'bg-slate-800 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Emergency Scripts</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('grounding')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'grounding' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grounding Toolkit
            </button>
          )}

          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'education' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Education Hub
          </button>

          <button
            onClick={() => setActiveTab('safety_plan')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'safety_plan' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Safety Plan
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'directory' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nearest Help
          </button>

          {isCaregiver && (
            <button
              onClick={() => setActiveTab('caregiver_dash')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'caregiver_dash' ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Caregiver Dashboard
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
