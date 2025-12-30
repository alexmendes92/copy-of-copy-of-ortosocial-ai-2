
import React, { useState, useEffect } from 'react';
import { generateOrthopedicNews } from '../services/geminiService';
import { searchPubMed } from '../services/pubmedService';
import { NewsItem, PubMedArticle } from '../types';
import { Newspaper, FlaskConical, Calendar, ArrowUpRight, ExternalLink, Loader2, Globe, Bookmark } from 'lucide-react';

const MedicalNewsFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'science'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [science, setScience] = useState<PubMedArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
        if (activeTab === 'news' && news.length === 0) {
            const data = await generateOrthopedicNews();
            setNews(data);
        } else if (activeTab === 'science' && science.length === 0) {
            const data = await searchPubMed('orthopedic surgery new techniques');
            setScience(data);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'Clinical': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'Tech': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'Event': return 'bg-orange-100 text-orange-700 border-orange-200';
          default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fadeIn pb-24 lg:pb-0">
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
            
            {/* Inline Tabs */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-4">
                <button 
                    onClick={() => setActiveTab('news')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'news' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Globe className="w-3 h-3" /> Indústria
                </button>
                <button 
                    onClick={() => setActiveTab('science')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'science' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FlaskConical className="w-3 h-3" /> Ciência
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-slate-300 animate-spin mb-3" />
                    <p className="text-xs font-bold text-slate-400">Curando conteúdo...</p>
                </div>
            ) : activeTab === 'news' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {news.map(item => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCategoryColor(item.category)}`}>
                                        {item.category}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                    {item.summary}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Globe className="w-3 h-3 text-slate-400" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.source}</span>
                                </div>
                                <button className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <Bookmark className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {science.map(article => (
                        <div key={article.uid} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-1">
                                    <FlaskConical className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-xs mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
                                        {article.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mb-2">
                                        <span className="font-bold text-slate-700">{article.source}</span>
                                        <span>•</span>
                                        <span>{article.pubdate}</span>
                                    </div>
                                    <a 
                                        href={article.url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline mt-1"
                                    >
                                        Ler no PubMed <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default MedicalNewsFeed;
