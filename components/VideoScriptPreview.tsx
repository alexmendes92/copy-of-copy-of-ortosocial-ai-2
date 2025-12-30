
import React, { useState } from 'react';
import { VideoScriptResult } from '../types';
import { Clock, Copy, Check, Image as ImageIcon, MessageSquare, AlertCircle, PlayCircle, Layers, Download, Share2, Youtube, Video } from 'lucide-react';

interface VideoScriptPreviewProps {
  script: VideoScriptResult;
}

const VideoScriptPreview: React.FC<VideoScriptPreviewProps> = ({ script }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let text = `${script.title}\n\n`;
    text += `DESCRIÇÃO:\n${script.description}\n\n`;
    text += `ROTEIRO:\n`;
    script.script.forEach(section => {
        text += `[${section.type} - ${section.duration}]\n`;
        text += `VISUAL: ${section.visual}\n`;
        text += `ÁUDIO: ${section.audio}\n\n`;
    });
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepStyle = (type: string) => {
      switch(type) {
          case 'HOOK': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '🔴' };
          case 'INTRO': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '👋' };
          case 'CONTEUDO': return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '📚' };
          case 'OBJECAO': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🛡️' };
          case 'CTA': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '🚀' };
          default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '📹' };
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn rounded-2xl overflow-hidden border border-slate-200 shadow-xl relative">
        
        {/* Fixed Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center z-20 shadow-sm sticky top-0">
            <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-xl text-red-600">
                    <Youtube className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-900 leading-tight line-clamp-1 max-w-[200px] md:max-w-md">
                        {script.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Roteiro Otimizado</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar Roteiro'}</span>
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-8 bg-slate-50/50">
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                
                {/* Meta Info Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-1/3 aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-4 text-center text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <ImageIcon className="w-8 h-8 mb-2 opacity-80" />
                        <p className="font-black text-sm uppercase leading-tight relative z-10">{script.thumbnailText}</p>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conceito da Thumbnail</span>
                            <p className="text-sm text-slate-700 font-medium mt-1 leading-relaxed border-l-2 border-red-500 pl-3">
                                {script.thumbnailVisual}
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição SEO</span>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {script.description}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {script.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline Steps */}
                <div className="relative">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-slate-400" /> 
                        Storyboard do Vídeo
                    </h3>

                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-12 bottom-0 w-0.5 bg-slate-200"></div>

                    <div className="space-y-6">
                        {script.script.map((section, idx) => {
                            const style = getStepStyle(section.type);
                            return (
                                <div key={idx} className="relative pl-16 group">
                                    {/* Circle Marker */}
                                    <div className={`absolute left-0 top-0 w-14 h-14 rounded-2xl border-4 border-slate-50 shadow-sm flex flex-col items-center justify-center z-10 bg-white font-bold text-xs transition-transform group-hover:scale-110`}>
                                        <span className="text-[10px] text-slate-400 font-medium mb-0.5">{idx + 1}</span>
                                        <span className="text-lg">{style.icon}</span>
                                    </div>

                                    {/* Card */}
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
                                        {/* Header */}
                                        <div className={`px-5 py-3 border-b flex justify-between items-center ${style.bg} ${style.border}`}>
                                            <span className={`text-xs font-black uppercase tracking-wider ${style.text}`}>
                                                {section.type}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white/50 px-2 py-1 rounded-lg">
                                                <Clock className="w-3 h-3" /> {section.duration}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Visual */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                    <Video className="w-3.5 h-3.5" /> Visual (Câmera)
                                                </div>
                                                <p className="text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    {section.visual}
                                                </p>
                                            </div>

                                            {/* Audio */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest">
                                                    <MessageSquare className="w-3.5 h-3.5" /> Áudio (Falar)
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed italic bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                                    "{section.audio}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {section.notes && (
                                            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 flex gap-2 items-center font-medium">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {section.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-center pt-8">
                    <button className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:bg-slate-800 transition-transform active:scale-95 flex items-center gap-3">
                        <Download className="w-5 h-5" /> Exportar PDF
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
};

export default VideoScriptPreview;
