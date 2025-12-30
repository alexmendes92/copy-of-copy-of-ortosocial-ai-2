
import React, { useEffect, useState } from 'react';
import { getWordPressPosts, WPPost } from '../services/wordpressService';
import { Search, Globe, ExternalLink, Loader2, Calendar, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

const SiteContentList: React.FC = () => {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWordPressPosts(term);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Não foi possível carregar os posts. Verifique sua conexão.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts('');
  }, []);

  const PostSkeleton = () => (
    <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm flex flex-col h-80 animate-pulse">
        <div className="w-full h-40 bg-slate-200 rounded-2xl mb-4"></div>
        <div className="flex-1 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] animate-fadeIn pb-32 lg:pb-0 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>

      {/* Header Area */}
      <div className="px-6 pt-8 pb-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
              <div>
                  <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      Biblioteca Digital
                  </h1>
                  <p className="text-sm text-slate-500 font-medium mt-1">Artigos educativos do seujoelho.com</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                  <Globe className="w-6 h-6" />
              </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por patologia, cirurgia..." 
              className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPosts(searchTerm)}
            />
            {loading && <div className="absolute right-4 top-4"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div>}
          </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 relative z-10 no-scrollbar">
        {loading && (!posts || posts.length === 0) ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
             </div>
        ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-[2rem] border border-red-100 text-red-600 text-sm font-bold flex flex-col items-center gap-3">
                <p>{error}</p>
                <button onClick={() => fetchPosts(searchTerm)} className="px-6 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-red-700">Tentar novamente</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts && posts.map(post => {
                    const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                    
                    return (
                        <div 
                            key={post.id} 
                            onClick={() => window.open(post.link, '_blank')}
                            className="group bg-white rounded-[2rem] p-3 border border-slate-100 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
                        >
                            {/* Card Image */}
                            <div className="w-full aspect-video bg-slate-100 rounded-2xl overflow-hidden relative mb-4">
                                {featuredImg ? (
                                    <img src={featuredImg} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                        <Globe className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-900 shadow-sm flex items-center gap-1">
                                    Ler <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="px-2 pb-2 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(post.date).toLocaleDateString()}
                                </div>
                                
                                <h3 
                                    className="font-black text-slate-800 text-lg mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
                                />
                                
                                <div 
                                    className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                />

                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-600 group-hover:underline">Ler artigo completo</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {posts && posts.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300 animate-bounce">
                            <Search className="w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">Nenhum artigo encontrado.</p>
                        <p className="text-sm text-slate-400 mt-1">Tente buscar por outro termo como "LCA", "Prótese" ou "Menisco".</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SiteContentList;
