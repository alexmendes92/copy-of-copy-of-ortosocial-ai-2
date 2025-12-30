
import React, { useEffect, useState } from 'react';
import { TrendTopic, PostState, PostCategory, Tone, PostFormat } from '../types';
import { generateTrendSuggestions } from '../services/geminiService';
import { TrendingUp, ArrowUpRight, Flame, Loader2, Plus, RefreshCw, Search, Sparkles, Globe, Radio, BarChart3, SignalHigh, ChevronRight } from 'lucide-react';

interface TrendAnalyzerProps {
  onUseTrend: (partialState: Partial<PostState>) => void;
}

const TrendAnalyzer: React.FC<TrendAnalyzerProps> = ({ onUseTrend }) => {
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);
    try {
        const data = await generateTrendSuggestions();
        setTrends(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  // Premium Radar Loading Animation - "Onyx Style"
  const RadarLoading = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fadeIn bg-black rounded-[2rem] relative overflow-hidden border border-neutral-800 shadow-2xl">
        {/* Background Grid - Subtle Gray */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="relative w-64 h-64 mb-8">
            {/* Concentric Circles - White/Gray */}
            <div className="absolute inset-0 rounded-full border border-white/10"></div>
            <div className="absolute inset-8 rounded-full border border-white/5"></div>
            <div className="absolute inset-16 rounded-full border border-white/5"></div>
            
            {/* Scanning Line - White Gradient */}
            <div className="absolute inset-0 rounded-full overflow-hidden animate-[spin_3s_linear_infinite]">
                <div className="w-full h-1/2 bg-gradient-to-t from-white/10 to-transparent blur-md origin-bottom"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10">
                <Globe className="w-16 h-16 text-white/50" />
            </div>
        </div>
        
        <div className="text-center z-10">
            <h3 className="text-xl font-medium text-white mb-2 tracking-widest font-mono">SYSTEM_SCAN</h3>
            <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <p className="text-neutral-500 text-xs font-mono uppercase">Analisando dados...</p>
            </div>
        </div>
    </div>
  );

  // Minimalist Sparkline
  const Sparkline = ({ className = "" }) => (
      <svg className={`w-24 h-8 ${className}`} viewBox="0 0 100 30" fill="none">
          <path d="M0 25 C 10 25, 10 15, 20 15 S 30 28, 40 28 S 50 5, 60 10 S 70 20, 80 15 S 90 5, 100 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );

  return (
    <div className="h-full flex flex-col animate-fadeIn bg-white pb-24 lg:pb-0">
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-8 space-y-8">
            
            {/* Header Section */}
            <div className="flex justify-between items-end mb-2 pt-2">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-neutral-900" />
                        Trends Intel
                    </h2>
                    <p className="text-sm text-neutral-500 font-medium mt-1">Inteligência de dados em tempo real.</p>
                </div>
                <button 
                    onClick={fetchTrends}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs font-bold text-neutral-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </div>

            {loading ? (
                <RadarLoading />
            ) : (
                <>
                    {/* Hero Trend (Pure Black Premium Card) */}
                    {trends.length > 0 && (
                        <div 
                            onClick={() => onUseTrend({ 
                                topic: trends[0].keyword, 
                                customInstructions: `Trend Viral: ${trends[0].keyword}. Headline: ${trends[0].suggestedHeadline}. Foco: ${trends[0].growth}`,
                                category: PostCategory.LIFESTYLE,
                                tone: Tone.EDUCATIONAL,
                                format: PostFormat.FEED
                            })}
                            className="relative group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-black rounded-[2rem] shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"></div>
                            
                            {/* Subtle Texture */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 rounded-[2rem] pointer-events-none"></div>

                            <div className="relative p-8 lg:p-10 text-white">
                                <div className="flex justify-between items-start mb-16">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest uppercase">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                        Top Tópico #1
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase tracking-widest opacity-60 font-mono">Crescimento</div>
                                        <div className="text-3xl font-mono font-light text-white flex items-center gap-2 justify-end tracking-tighter">
                                            {trends[0].growth}
                                            <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-4xl lg:text-6xl font-black mb-3 tracking-tighter leading-none text-white">
                                            {trends[0].keyword}
                                        </h3>
                                        <p className="text-neutral-400 text-sm font-medium max-w-lg border-l border-neutral-700 pl-4">
                                            "{trends[0].suggestedHeadline}"
                                        </p>
                                    </div>
                                    
                                    <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-white text-black group-hover:scale-110 transition-transform duration-500">
                                        <ArrowUpRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Secondary Trends (Clean Grid) */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Outras Oportunidades</span>
                            <div className="h-px bg-neutral-100 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {trends.slice(1).map((trend, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => onUseTrend({ 
                                        topic: trend.keyword, 
                                        customInstructions: `Trend: ${trend.keyword}. Headline: ${trend.suggestedHeadline}`,
                                        category: PostCategory.LIFESTYLE,
                                        tone: Tone.EDUCATIONAL,
                                        format: PostFormat.FEED
                                    })}
                                    className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 hover:bg-white hover:shadow-xl hover:border-neutral-200 hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between h-48 relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest border border-neutral-200 px-2 py-1 rounded bg-white">
                                                {trend.category}
                                            </span>
                                            <div className="text-xs font-mono font-bold text-neutral-900 flex items-center gap-1">
                                                {trend.volume}
                                                <SignalHigh className="w-3 h-3" />
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-neutral-900 text-lg leading-tight group-hover:text-black transition-colors line-clamp-2 mb-2">
                                            {trend.keyword}
                                        </h4>
                                        <p className="text-xs text-neutral-500 leading-snug line-clamp-2 font-medium">
                                            {trend.suggestedHeadline}
                                        </p>
                                    </div>

                                    {/* Footer / Action */}
                                    <div className="relative z-10 mt-auto pt-4 flex items-center justify-between border-t border-neutral-200/50">
                                        <Sparkline className="stroke-neutral-300 group-hover:stroke-black transition-colors" />
                                        <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {trends.length === 0 && !loading && (
                        <div className="text-center py-20 opacity-50">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                            <p className="text-sm font-bold text-neutral-400">Sistema em Standby</p>
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default TrendAnalyzer;
