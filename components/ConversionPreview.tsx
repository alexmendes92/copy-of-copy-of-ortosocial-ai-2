import React from 'react';
import { ConversionResult } from '../types';
import { Video, Type, Copy, Check, Clock, Eye, MessageSquare, ArrowRight } from 'lucide-react';

interface ConversionPreviewProps {
  result: ConversionResult;
}

const ConversionPreview: React.FC<ConversionPreviewProps> = ({ result }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    let textToCopy = "";
    if (result.format === 'REELS' && result.script) {
        textToCopy = result.script.map(line => `[${line.time}] VISUAL: ${line.visual} | ÁUDIO: ${line.audio}`).join('\n');
        textToCopy += `\n\nLEGENDA:\n${result.caption}`;
    } else if (result.format === 'DEEP_ARTICLE' && result.articleContent) {
        // Strip HTML for copy
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = result.articleContent;
        textToCopy = tempDiv.textContent || tempDiv.innerText || "";
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-fadeIn">
        {/* Header */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 text-white">
            <div className="flex items-center gap-2">
                {result.format === 'REELS' ? <Video className="w-4 h-4 text-red-500" /> : <Type className="w-4 h-4 text-red-500" />}
                <span className="font-bold text-sm tracking-wide uppercase">{result.format === 'REELS' ? 'Roteiro de Reels' : 'Artigo de Conversão'}</span>
            </div>
            <button onClick={handleCopy} className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado' : 'Copiar'}
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{result.title}</h1>
            <div className="h-1 w-20 bg-red-500 rounded-full mb-8"></div>

            {result.format === 'REELS' && result.script && (
                <div className="space-y-8">
                    {/* Script Table Style */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 bg-slate-50 p-3 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-2">Tempo</div>
                            <div className="col-span-4">Visual (O que fazer)</div>
                            <div className="col-span-4">Áudio (O que falar)</div>
                            <div className="col-span-2">Texto (Tela)</div>
                        </div>
                        {result.script.map((line, idx) => (
                            <div key={idx} className="grid grid-cols-12 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors text-sm">
                                <div className="col-span-2 font-mono text-slate-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {line.time}</div>
                                <div className="col-span-4 text-slate-700 font-medium pr-4 flex items-start gap-2">
                                    <Eye className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                    {line.visual}
                                </div>
                                <div className="col-span-4 text-slate-600 pr-4 italic flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    "{line.audio}"
                                </div>
                                <div className="col-span-2 text-red-600 font-bold text-xs bg-red-50 p-2 rounded self-start">
                                    {line.textOverlay}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase">Legenda Sugerida</h3>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{result.caption}</p>
                    </div>

                    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">CTA de Fechamento</span>
                            <p className="font-bold text-lg">"{result.CTA}"</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-red-500" />
                    </div>
                </div>
            )}

            {result.format === 'DEEP_ARTICLE' && result.articleContent && (
                <div className="max-w-3xl mx-auto">
                    <div className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-li:text-slate-600">
                        <div dangerouslySetInnerHTML={{ __html: result.articleContent }} />
                    </div>
                    
                    <div className="mt-12 p-8 bg-red-50 border border-red-100 rounded-xl text-center">
                        <h3 className="text-red-900 font-bold mb-2">Chamada para Ação (CTA)</h3>
                        <p className="text-red-700 text-lg font-medium">"{result.CTA}"</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ConversionPreview;