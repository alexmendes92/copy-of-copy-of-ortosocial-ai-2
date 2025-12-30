
import React, { useState } from 'react';
import { searchPubMed } from '../services/pubmedService';
import { searchLocalPublications, mapLocalPublicationToPubMed } from '../services/publicationsData';
import { PubMedArticle } from '../types';
import { Search, BookOpen, ExternalLink, Loader2, FileText, FlaskConical, Instagram, PenTool, Crown } from 'lucide-react';

interface EvidenceFinderProps {
    onUseArticle?: (article: PubMedArticle, type: 'post' | 'seo') => void;
}

const EvidenceFinder: React.FC<EvidenceFinderProps> = ({ onUseArticle }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PubMedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
        // 1. Search Local Publications (Dr. Carlos's papers)
        const localMatches = searchLocalPublications(query);
        const mappedLocal = localMatches.map(mapLocalPublicationToPubMed);

        // 2. Search PubMed (External)
        const apiResults = await searchPubMed(query);

        // 3. Combine (Local first)
        setResults([...mappedLocal, ...apiResults]);

    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
  };

  const isAuthorPaper = (article: PubMedArticle) => {
      return article.abstract?.includes("[ARTIGO AUTORAL DO DR. CARLOS FRANCIOZI]") || 
             article.authors.some(a => a.name.toLowerCase().includes('franciozi'));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 leading-none">PubMed RAG + Autoral</h3>
                    <p className="text-[10px] text-slate-500">Busca em artigos próprios e PubMed</p>
                </div>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: ACL reconstruction, Meniscus..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="absolute right-2 top-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Buscar'}
                </button>
            </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 animate-fadeIn">
                    <div className="relative mb-3">
                         <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                         <FlaskConical className="w-8 h-8 text-blue-600 animate-bounce relative z-10" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">Consultando Base Científica...</p>
                    <p className="text-[10px] text-slate-400">Priorizando publicações do autor...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-3 p-1">
                    {results.map(article => {
                        const isMyPaper = isAuthorPaper(article);
                        return (
                            <div key={article.uid} className={`relative p-3 rounded-xl border transition-colors shadow-sm group animate-slideUp ${isMyPaper ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                                
                                {isMyPaper && (
                                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                                        <Crown className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                                        Minha Publicação
                                    </div>
                                )}

                                <h4 className={`font-bold text-sm mb-1 leading-snug line-clamp-2 ${isMyPaper ? 'text-indigo-900' : 'text-slate-800'}`}>{article.title}</h4>
                                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mb-3">
                                    <span className={`font-semibold px-1.5 py-0.5 rounded ${isMyPaper ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-50 text-blue-600'}`}>{article.source}</span>
                                    <span>{article.pubdate}</span>
                                    <span className="truncate max-w-[150px]">{article.authors?.[0]?.name} et al.</span>
                                </div>
                                
                                {/* Abstract Preview */}
                                {article.abstract && (
                                    <p className="text-[10px] text-slate-400 line-clamp-2 mb-3 italic">
                                        {article.abstract.substring(0, 100)}...
                                    </p>
                                )}

                                {/* Actions */}
                                <div className={`flex items-center gap-2 pt-2 border-t ${isMyPaper ? 'border-indigo-100' : 'border-slate-50'}`}>
                                    {onUseArticle && (
                                        <>
                                            <button 
                                                onClick={() => onUseArticle(article, 'post')}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-700 transition-colors"
                                            >
                                                <Instagram className="w-3 h-3" /> Post
                                            </button>
                                            <button 
                                                onClick={() => onUseArticle(article, 'seo')}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                            >
                                                <PenTool className="w-3 h-3" /> Artigo
                                            </button>
                                        </>
                                    )}
                                    <a 
                                        href={article.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                                        title="Abrir no PubMed"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : searched ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <BookOpen className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs">Nenhum artigo encontrado.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <FileText className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs text-center px-6">Pesquise termos em inglês para melhores resultados científicos.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default EvidenceFinder;
