
import React, { useState, useMemo } from 'react';
import { publicationsData } from '../services/publicationsData';
import { transformScienceToContent } from '../services/geminiService';
import { ScientificPublication, PubMedArticle } from '../types';
import { 
    Search, ExternalLink, FileText, Calendar, Users, 
    Sparkles, Video, Instagram, Zap, Copy, 
    CheckCircle2, X, ChevronRight, BookOpen, Quote, GraduationCap, Lock, Unlock,
    ArrowLeft, SplitSquareHorizontal, PanelRightClose, PanelRightOpen
} from 'lucide-react';

interface PublicationsListProps {
    onUseArticle?: (article: PubMedArticle, type: 'post' | 'seo') => void;
}

const PublicationsList: React.FC<PublicationsListProps> = ({ onUseArticle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPub, setSelectedPub] = useState<ScientificPublication | null>(null);
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixResult, setRemixResult] = useState<string | null>(null);
  const [remixType, setRemixType] = useState<'POST' | 'SCRIPT' | 'SIMPLIFIED' | 'EMAIL' | null>(null);
  
  // Mobile/Hybrid Tab State: 'content' (Text) or 'studio' (AI Tools)
  const [mobileTab, setMobileTab] = useState<'content' | 'studio'>('content');

  const filteredPublications = useMemo(() => {
    if (!searchTerm) return publicationsData;
    const term = searchTerm.toLowerCase();
    return publicationsData.filter(pub => 
      pub.title.toLowerCase().includes(term) || 
      pub.journal.toLowerCase().includes(term) ||
      pub.year.toString().includes(term) ||
      pub.content.full_raw?.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleSmartRemix = async (type: 'POST' | 'SCRIPT' | 'SIMPLIFIED' | 'EMAIL') => {
      if (!selectedPub) return;
      setIsRemixing(true);
      setRemixType(type);
      setRemixResult(null);
      // On mobile, auto-switch to studio tab to see result
      setMobileTab('studio');

      try {
          const rawContent = selectedPub.content.full_raw || selectedPub.title; 
          const result = await transformScienceToContent(rawContent, type);
          setRemixResult(result);
      } catch (e) {
          console.error(e);
          setRemixResult("Erro ao gerar conteúdo. Tente novamente.");
      } finally {
          setIsRemixing(false);
      }
  };

  const handleCopy = () => {
      if (remixResult) {
          navigator.clipboard.writeText(remixResult);
          alert("Conteúdo copiado!");
      }
  };

  // Helper to format the raw text nicely
  const formatArticleContent = (text: string | undefined) => {
    if (!text) return <p className="text-slate-500 italic p-8 text-center">Conteúdo não disponível.</p>;

    // Split by newlines and process
    return text.split('\n').map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={index} />;

        // Headers marked with ##
        if (trimmed.startsWith('##')) {
            return (
                <h3 key={index} className="text-lg font-black text-slate-900 mt-8 mb-3 leading-tight tracking-tight border-b border-slate-100 pb-2">
                    {trimmed.replace(/#/g, '').trim()}
                </h3>
            );
        }
        
        // Headers marked with # (if any)
        if (trimmed.startsWith('# ')) {
             return (
                <h2 key={index} className="text-xl font-black text-slate-900 mt-10 mb-4 leading-tight tracking-tight">
                    {trimmed.replace(/#/g, '').trim()}
                </h2>
            );
        }

        // Citations like [ 1, 2 ]
        const highlighted = trimmed.replace(/\[\s*(\d+(?:\s*,\s*\d+)*)\s*\]/g, (match) => {
            return `<sup class="text-blue-600 font-bold text-[10px] ml-0.5">${match}</sup>`;
        });

        return (
            <p 
                key={index} 
                className="text-slate-600 mb-4 leading-7 text-sm text-justify"
                dangerouslySetInnerHTML={{ __html: highlighted }}
            />
        );
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fadeIn relative pb-24 lg:pb-0 font-sans">
        
        {/* --- ARTICLE READER MODAL (THE REFINERY) --- */}
        {selectedPub && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-0 lg:p-4 animate-scaleIn">
                <div className="bg-white w-full max-w-7xl h-full lg:h-[90vh] lg:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative">
                    
                    {/* MOBILE TAB CONTROLS (Visible only on mobile/tablet) */}
                    <div className="lg:hidden bg-white border-b border-slate-100 p-2 flex gap-2 shrink-0 z-30 sticky top-0">
                        <button 
                            onClick={() => setSelectedPub(null)}
                            className="p-3 bg-slate-100 rounded-xl text-slate-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1 bg-slate-100 p-1 rounded-xl flex relative">
                            {/* Sliding Indicator */}
                            <div className={`absolute top-1 bottom-1 w-[48%] bg-white rounded-lg shadow-sm transition-all duration-300 ${mobileTab === 'content' ? 'left-1' : 'left-[50%]'}`}></div>
                            
                            <button 
                                onClick={() => setMobileTab('content')}
                                className={`flex-1 relative z-10 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${mobileTab === 'content' ? 'text-blue-600' : 'text-slate-400'}`}
                            >
                                <BookOpen className="w-4 h-4" /> Leitura
                            </button>
                            <button 
                                onClick={() => setMobileTab('studio')}
                                className={`flex-1 relative z-10 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${mobileTab === 'studio' ? 'text-indigo-600' : 'text-slate-400'}`}
                            >
                                <Sparkles className="w-4 h-4" /> Estúdio IA
                            </button>
                        </div>
                    </div>

                    {/* Left Column: Source Content (Visible if Desktop OR MobileTab == 'content') */}
                    <div className={`flex-1 flex flex-col h-full bg-white lg:border-r border-slate-100 relative ${mobileTab === 'content' ? 'flex' : 'hidden lg:flex'}`}>
                        {/* Desktop Header */}
                        <div className="hidden lg:flex px-8 py-6 border-b border-slate-100 bg-white sticky top-0 z-10 justify-between items-start">
                             <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                                        {selectedPub.journal}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                        {selectedPub.year}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 leading-tight max-w-2xl">{selectedPub.title}</h2>
                             </div>
                             <button onClick={() => setSelectedPub(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                             </button>
                        </div>

                        {/* Mobile Header (Inline) */}
                        <div className="lg:hidden px-6 py-6 border-b border-slate-100 bg-white">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                    {selectedPub.journal}
                                </span>
                             </div>
                             <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedPub.title}</h2>
                        </div>

                        {/* Content Scroll */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/30 scroll-smooth">
                            <div className="max-w-3xl mx-auto p-6 lg:p-12">
                                <div className="article-content">
                                    {formatArticleContent(selectedPub.content.full_raw)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Refinery (Visible if Desktop OR MobileTab == 'studio') */}
                    <div className={`w-full lg:w-[450px] bg-slate-900 text-white flex flex-col relative overflow-hidden border-l border-slate-800 shrink-0 ${mobileTab === 'studio' ? 'flex h-full' : 'hidden lg:flex'}`}>
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="p-6 lg:p-8 relative z-10 flex-1 flex flex-col h-full overflow-hidden">
                            <div className="mb-8 shrink-0">
                                <div className="flex items-center gap-2 mb-2 text-yellow-400">
                                    <Sparkles className="w-6 h-6" />
                                    <h3 className="text-xl font-black">Refinaria de Conteúdo</h3>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Transforme este conhecimento científico em autoridade digital instantânea.
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
                            {!remixResult ? (
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => handleSmartRemix('POST')}
                                        disabled={isRemixing}
                                        className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-5 transition-all group active:scale-[0.98] text-left hover:border-white/20 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform shrink-0 relative z-10">
                                            <Instagram className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <span className="block font-bold text-base text-white mb-1 group-hover:text-pink-300 transition-colors">Post para Instagram</span>
                                            <span className="text-xs text-slate-400 leading-tight block">Legenda engajadora, hashtags e chamada para ação baseada no estudo.</span>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handleSmartRemix('SCRIPT')}
                                        disabled={isRemixing}
                                        className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-5 transition-all group active:scale-[0.98] text-left hover:border-white/20 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform shrink-0 relative z-10">
                                            <Video className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <span className="block font-bold text-base text-white mb-1 group-hover:text-orange-300 transition-colors">Roteiro Viral (60s)</span>
                                            <span className="text-xs text-slate-400 leading-tight block">Hook visual, problema, solução científica e CTA. Perfeito para Reels.</span>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handleSmartRemix('SIMPLIFIED')}
                                        disabled={isRemixing}
                                        className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-5 transition-all group active:scale-[0.98] text-left hover:border-white/20 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform shrink-0 relative z-10">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <span className="block font-bold text-base text-white mb-1 group-hover:text-cyan-300 transition-colors">Explicação para Leigos</span>
                                            <span className="text-xs text-slate-400 leading-tight block">Traduz termos técnicos como "artroplastia" para linguagem do dia a dia.</span>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handleSmartRemix('EMAIL')}
                                        disabled={isRemixing}
                                        className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-5 transition-all group active:scale-[0.98] text-left hover:border-white/20 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform shrink-0 relative z-10">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <span className="block font-bold text-base text-white mb-1 group-hover:text-emerald-300 transition-colors">E-mail para Colegas</span>
                                            <span className="text-xs text-slate-400 leading-tight block">Resumo técnico para networking e compartilhamento com outros médicos.</span>
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full animate-slideUp">
                                    <div className="flex items-center justify-between mb-4 shrink-0">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-500/20">
                                            {remixType === 'POST' ? 'Legenda Instagram' : remixType === 'SCRIPT' ? 'Roteiro de Vídeo' : 'Resultado Gerado'}
                                        </span>
                                        <button onClick={() => setRemixResult(null)} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Voltar</button>
                                    </div>
                                    
                                    <div className="flex-1 bg-slate-950/50 rounded-2xl p-5 overflow-y-auto border border-slate-800 font-mono text-sm text-slate-300 whitespace-pre-wrap shadow-inner leading-relaxed">
                                        {remixResult}
                                    </div>

                                    <button 
                                        onClick={handleCopy}
                                        className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 active:scale-95 mt-4 shrink-0 shadow-lg"
                                    >
                                        <Copy className="w-4 h-4" /> Copiar Conteúdo
                                    </button>
                                </div>
                            )}
                            </div>

                            {isRemixing && (
                                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-50">
                                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                    <p className="text-sm font-bold animate-pulse text-white">Lendo artigo completo...</p>
                                    <p className="text-xs text-slate-500 mt-2">Extraindo insights principais</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- MAIN LIST HEADER --- */}
        <div className="px-6 pt-8 pb-6 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                        Acervo Científico
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">79 Publicações do Dr. Carlos Franciozi</p>
                </div>
                
                {/* Stats - Hidden on Mobile */}
                <div className="hidden sm:flex gap-3">
                     <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                         <span className="text-lg font-black text-slate-900">{publicationsData.length}</span>
                     </div>
                     <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                         <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Recente</span>
                         <span className="text-lg font-black text-blue-600">2025</span>
                     </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="Pesquisar por título, revista ou ano..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            </div>
        </div>

        {/* --- LIST CONTENT --- */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 bg-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPublications.map(pub => (
                    <div key={pub.external_id} className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                        
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                                    {pub.journal}
                                </span>
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {pub.year}
                                </span>
                                {pub.access_type === 'Restricted' && (
                                    <span className="ml-auto text-[10px] font-bold text-amber-500 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                        <Lock className="w-3 h-3" /> Restrito
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="text-sm font-bold text-slate-800 mb-3 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                                {pub.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit max-w-full">
                                <Users className="w-3 h-3 shrink-0 text-slate-400" />
                                <span className="truncate">{pub.authors_raw.split(',')[0]} et al.</span>
                            </div>
                        </div>

                        {/* Quick Actions Footer */}
                        <div className="flex gap-2 mt-auto relative z-10 pt-2 border-t border-slate-50">
                            <button 
                                onClick={() => {
                                    setSelectedPub(pub);
                                    setMobileTab('studio'); // Open directly in creation mode if desired, or let modal default
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 group/btn"
                            >
                                <Sparkles className="w-3 h-3 text-yellow-400 group-hover/btn:animate-spin" /> 
                                Abrir & Remixar
                            </button>
                            
                            {pub.urls.pubmed && (
                                <a 
                                    href={pub.urls.pubmed} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
                                    title="Ver no PubMed"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPublications.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">Nenhuma publicação encontrada.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default PublicationsList;
