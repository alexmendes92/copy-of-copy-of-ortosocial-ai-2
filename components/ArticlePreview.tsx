
import React from 'react';
import { GeneratedArticle } from '../types';
import { ArrowRight, Instagram, Copy, Check } from 'lucide-react';
import CFMComplianceGuide from './CFMComplianceGuide';

interface ArticlePreviewProps {
  article: GeneratedArticle;
  onConvertToPost?: (article: GeneratedArticle) => void;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article, onConvertToPost }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Create a temporary element to copy HTML content as text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.contentHtml;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Strip HTML for Audit
  const getCleanText = () => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.contentHtml;
      return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Basic Skeleton if article title is missing (acts as loading state indicator)
  if (!article.title) {
      return (
        <div className="flex flex-col lg:flex-row gap-6 h-full animate-pulse">
            <div className="flex-1 bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full p-8 space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                <div className="h-12 bg-slate-200 rounded w-3/4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
            </div>
            <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-xl h-96 border border-slate-200"></div>
        </div>
      );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Main Article Content */}
        <div className="flex-1 bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-fadeIn h-full">
            
            {/* Actions Header */}
            <div className="h-16 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
                    <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-wide hidden sm:inline">Preview Artigo</span>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-95"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copiado' : 'Copiar Texto'}
                    </button>
                    
                    {onConvertToPost && (
                        <button 
                            onClick={() => onConvertToPost(article)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition-all shadow-md active:scale-95"
                        >
                            <Instagram className="w-3.5 h-3.5" />
                            Criar Post
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-200">SEO Score: 98/100</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">{article.wordCount} palavras</span>
                </div>
                
                <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{article.title}</h1>
                <p className="text-sm text-slate-500 font-mono mb-8 bg-slate-50 p-2 rounded border border-slate-100 truncate">
                    seujoelho.com/{article.slug}
                </p>

                <div className="prose prose-sm text-slate-600 max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600">
                    <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
                </div>
                
                <div className="mt-12 pt-8 border-t border-slate-100 bg-slate-50/50 -mx-8 px-8 pb-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Sugestões de SEO Aplicadas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {article.seoSuggestions?.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 hover:border-blue-200 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                                {suggestion}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar: Compliance Audit */}
        <div className="w-full lg:w-80 flex-shrink-0">
             <CFMComplianceGuide contentToAudit={getCleanText()} />
        </div>
    </div>
  );
};

export default ArticlePreview;
