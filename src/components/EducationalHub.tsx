import React, { useState, useEffect } from 'react';
import { EducationArticle } from '../types';
import { 
  BookOpen, Sparkles, Search, ChevronRight, Clock, ArrowLeft, RefreshCw, Layers, CheckCircle2 
} from 'lucide-react';

export const EducationalHub: React.FC = () => {
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<EducationArticle | null>(null);

  // Reformulation State
  const [reformulationMode, setReformulationMode] = useState<'one_sentence' | 'teenager' | 'crisis_50_words' | 'caregiver_summary' | null>(null);
  const [reformulatedText, setReformulatedText] = useState<string | null>(null);
  const [reformulating, setReformulating] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/education');
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReformulate = async (mode: 'one_sentence' | 'teenager' | 'crisis_50_words' | 'caregiver_summary') => {
    if (!activeArticle) return;
    setReformulationMode(mode);
    setReformulating(true);

    try {
      const res = await fetch('/api/education/reformulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: activeArticle.id,
          mode,
        }),
      });

      const data = await res.json();
      setReformulatedText(data.reformulatedText);
    } catch (err) {
      console.error(err);
      setReformulatedText(activeArticle.summary);
    } finally {
      setReformulating(false);
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-teal-500/30 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              Evidence-Based SUD Knowledge Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Educational Resources & AI Reformulation
            </h1>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
          Curated content grounded in SAMHSA, NIDA, and NIH clinical guidelines. 
          Use GenAI to instantly reformulate any article for high-cognitive-load crisis moments, teenagers, or caregiver takeaways.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
          <input
            type="text"
            placeholder="Search articles, topics, or terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-bold no-scrollbar">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'relapse_prevention', label: 'Relapse Prevention' },
          { id: 'caregiver_support', label: 'Caregiver Support' },
          { id: 'mat_treatment', label: 'MAT & Medications' },
          { id: 'harm_reduction', label: 'Harm Reduction & Narcan' },
          { id: 'understanding_sud', label: 'Understanding SUD' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-teal-500 text-slate-950 font-extrabold shadow-md shadow-teal-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ARTICLE READER DRAWER / MODAL */}
      {activeArticle ? (
        <div className="bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
          <button
            onClick={() => {
              setActiveArticle(null);
              setReformulatedText(null);
              setReformulationMode(null);
            }}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center space-x-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Article Directory</span>
          </button>

          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2">
              <span className="bg-teal-500/10 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono uppercase">
                {activeArticle.category.replace('_', ' ')}
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeArticle.readTime} read</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeArticle.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Source: {activeArticle.source}</p>
          </div>

          {/* AI REFORMULATION BAR */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-teal-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>GenAI Reformulate Mode (Select Reading Style):</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleReformulate('crisis_50_words')}
                className={`p-2.5 rounded-xl border transition-all ${
                  reformulationMode === 'crisis_50_words'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                🚨 Crisis Mode (50 words)
              </button>

              <button
                onClick={() => handleReformulate('one_sentence')}
                className={`p-2.5 rounded-xl border transition-all ${
                  reformulationMode === 'one_sentence'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                ⚡ 1-Sentence Summary
              </button>

              <button
                onClick={() => handleReformulate('teenager')}
                className={`p-2.5 rounded-xl border transition-all ${
                  reformulationMode === 'teenager'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                🎓 Simple / Teenager Style
              </button>

              <button
                onClick={() => handleReformulate('caregiver_summary')}
                className={`p-2.5 rounded-xl border transition-all ${
                  reformulationMode === 'caregiver_summary'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                🤝 Caregiver Takeaways
              </button>
            </div>
          </div>

          {/* Reformulated Text Result Display */}
          {reformulating ? (
            <div className="p-8 bg-slate-800/40 rounded-2xl border border-slate-700 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-400 mx-auto" />
              <p className="text-xs text-teal-300 animate-pulse">GenAI reformulating article text...</p>
            </div>
          ) : (
            reformulatedText && (
              <div className="bg-gradient-to-r from-teal-950/60 to-slate-900 p-5 rounded-2xl border-2 border-teal-500/40 space-y-2 animate-fadeIn">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                  GenAI Reformulated Output
                </span>
                <p className="text-sm font-semibold text-teal-100 leading-relaxed italic">
                  "{reformulatedText}"
                </p>
              </div>
            )
          )}

          {/* Full Article Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            {activeArticle.fullText}
          </div>

          {/* Key Takeaways */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">Key Takeaways:</h4>
            <div className="space-y-2">
              {activeArticle.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* ARTICLE DIRECTORY GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-slate-400 text-sm">
              Loading education resources...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-400 text-sm">
              No articles match your search or filter criteria.
            </div>
          ) : (
            filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setActiveArticle(art)}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all cursor-pointer space-y-3 group hover:shadow-xl hover:shadow-teal-950/30"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="bg-teal-500/10 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono text-[10px] uppercase">
                    {art.category.replace('_', ' ')}
                  </span>
                  <span className="flex items-center space-x-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{art.readTime}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>

                <div className="flex items-center justify-between pt-2 text-xs font-bold text-teal-400">
                  <span>Read & Reformulate</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
