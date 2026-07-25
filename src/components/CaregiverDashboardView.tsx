import React, { useState, useEffect } from 'react';
import { User, CrisisAlertLog, SafetyPlan } from '../types';
import { 
  UserCheck, Shield, AlertTriangle, Calendar, CheckCircle2, Heart, Lock, Eye, Bell 
} from 'lucide-react';

export const CaregiverDashboardView: React.FC = () => {
  const [data, setData] = useState<{
    linkedIndividual: Partial<User> | null;
    safetyPlan: SafetyPlan | null;
    alerts: CrisisAlertLog[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/caregiver/dashboard');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysSober = (startDate?: string) => {
    if (!startDate) return 0;
    const start = new Date(startDate).getTime();
    const diff = Date.now() - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading caregiver dashboard...</div>;
  }

  const individual = data?.linkedIndividual;
  const daysSober = calculateDaysSober(individual?.sobrietyStartDate);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Consent-Based Support Ally Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Caregiver Overview: {individual?.name || 'Maya Lin'}
            </h1>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
          Caregiver visibility is strictly consent-based. You receive real-time dispatch alerts when your loved one requests support during a zero-typing intervention.
        </p>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Sobriety Tracker Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400">
              <Calendar className="w-4 h-4" />
              <span>Recovery Milestone</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
              SHARED WITH CONSENT
            </span>
          </div>

          <div className="pt-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{daysSober}</span>
            <span className="text-sm font-bold text-emerald-400 ml-2">Days Sober</span>
          </div>

          <p className="text-xs text-slate-400">
            Substance: <span className="text-slate-200 font-semibold">{individual?.primarySubstance || 'Opioid Recovery'}</span>
          </p>
        </div>

        {/* Safety Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center space-x-1 text-teal-400">
              <Shield className="w-4 h-4" />
              <span>Current Status</span>
            </span>
            <span className="text-[10px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/20">
              REAL-TIME
            </span>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-lg font-bold text-white">Safe & Grounded</span>
          </div>

          <p className="text-xs text-slate-400">
            Last check-in: <span className="text-slate-200 font-semibold">Today @ 2:15 PM</span>
          </p>
        </div>

        {/* Consent Scope */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center space-x-1 text-indigo-400">
              <Lock className="w-4 h-4" />
              <span>Consent Permissions</span>
            </span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
              REVOCABLE BY MAYA
            </span>
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Share Sobriety Streak: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Emergency Dispatch Alerts: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Share Safety Plan: Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* Emergency Alert Log Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <span>Dispatched Emergency Alert Log</span>
        </h2>

        {data?.alerts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No emergency alerts dispatched recently.</p>
        ) : (
          <div className="space-y-3">
            {data?.alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      DISPATCH ALERT
                    </span>
                    <span className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {alert.individualName} triggered a crisis intervention for: <span className="text-amber-300">{alert.feeling}</span>
                  </p>
                </div>

                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                  Received & Acknowledged
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Safety Plan Preview */}
      {data?.safetyPlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span>Maya's Shared Safety Plan (For De-escalation Reference)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <span className="font-bold text-amber-300 uppercase tracking-wider block">Known Warning Signs</span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {data.safetyPlan.warningSigns.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <span className="font-bold text-teal-300 uppercase tracking-wider block">Personal Coping Strategies</span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {data.safetyPlan.copingStrategies.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
