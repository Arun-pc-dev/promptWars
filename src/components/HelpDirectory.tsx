import React, { useState, useEffect } from 'react';
import { HelpResource } from '../types';
import { Phone, MapPin, MessageSquare, Clock, ShieldAlert, ExternalLink } from 'lucide-react';

export const HelpDirectory: React.FC = () => {
  const [resources, setResources] = useState<HelpResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Verified Crisis & Treatment Resources
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Nearest Help & 24/7 Lifelines
            </h1>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
          Direct 1-tap access to 24/7 national emergency hotlines, SAMHSA treatment navigators, and local recovery support groups.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading resources...</div>
      ) : (
        <div className="space-y-6">
          
          {/* National Hotlines */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider text-rose-300 flex items-center space-x-2">
              <Phone className="w-5 h-5 text-rose-400" />
              <span>National 24/7 Emergency Hotlines</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {resources.filter(r => r.isNational).map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-900 border-2 border-rose-500/30 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-rose-400 transition-all shadow-lg"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {res.hours}
                    </span>
                    <h3 className="font-bold text-sm text-white">{res.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{res.description}</p>
                  </div>

                  <a
                    href={res.phone.includes('741741') ? `sms:${res.phone}?body=HOME` : `tel:${res.phone}`}
                    className="p-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md mt-2"
                  >
                    {res.phone.includes('741741') ? <MessageSquare className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    <span>{res.phone.includes('741741') ? 'Text 741741' : `Call ${res.phone}`}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Local Centers & Support Groups */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider text-teal-300 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-teal-400" />
              <span>Local Treatment Centers & Recovery Groups</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.filter(r => !r.isNational).map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 space-y-3 shadow-lg"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono">
                      {res.type.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-base text-white">{res.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{res.description}</p>
                  </div>

                  {res.address && (
                    <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{res.address}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{res.hours}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <a
                      href={`tel:${res.phone}`}
                      className="flex-1 p-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {res.phone}</span>
                    </a>

                    {res.address && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(res.name + ' ' + res.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
