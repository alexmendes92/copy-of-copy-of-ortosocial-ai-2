
import React, { useState, useEffect } from 'react';
import { GeneratedResult, PostFormat } from '../types';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Check, Edit2, Wand2, Battery, Wifi, Signal, Instagram, Loader2, Share2, RefreshCw, Video, ShieldCheck, Eye } from 'lucide-react';
import { refinePostCaption, remixContent } from '../services/geminiService';
import { publishToInstagram, getStoredInstagramConfig } from '../services/instagramService';
import InstagramConnect from './InstagramConnect';
import CFMComplianceGuide from './CFMComplianceGuide';

interface PostPreviewProps {
  result: GeneratedResult;
  onRegenerateText: () => void;
  onRegenerateImage: () => void;
  isRegenerating: boolean;
}

const PostPreview: React.FC<PostPreviewProps> = ({ 
  result, 
  onRegenerateText, 
  onRegenerateImage,
  isRegenerating 
}) => {
  const { content, imageUrl } = result;
  
  const [editableCaption, setEditableCaption] = useState(content?.caption || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  
  // Mobile Tab State (Preview vs Actions/Audit)
  const [mobileTab, setMobileTab] = useState<'preview' | 'audit'>('preview');

  useEffect(() => {
    if (content?.caption) setEditableCaption(content.caption);
  }, [content]);

  const handleSmartRefine = async (instruction: string) => {
    setIsRefining(true);
    try {
        const newText = await refinePostCaption(editableCaption, instruction);
        setEditableCaption(newText);
    } catch (error) {
        console.error("Refine failed", error);
    } finally {
        setIsRefining(false);
    }
  };

  const handlePublishClick = async () => {
    const config = getStoredInstagramConfig();
    if (!config.isConnected) {
        setShowConnectModal(true);
        return;
    }
    if (!imageUrl) {
        alert("Imagem ainda não gerada.");
        return;
    }
    const finalCaption = `${editableCaption}\n\n${content?.hashtags?.join(' ') || ''}`;
    setIsPublishing(true);
    setPublishStatus('idle');
    try {
        const result = await publishToInstagram(config, imageUrl, finalCaption);
        if (result.success) {
            setPublishStatus('success');
            setTimeout(() => setPublishStatus('idle'), 5000);
        } else {
            alert(`Erro ao publicar: ${result.error}`);
            setPublishStatus('error');
        }
    } catch (e) {
        console.error(e);
        setPublishStatus('error');
    } finally {
        setIsPublishing(false);
    }
  };

  const handleRemix = async (target: 'VIDEO_SCRIPT' | 'ARTICLE') => {
      setIsRemixing(true);
      try {
          const remixed = await remixContent(editableCaption, target);
          alert("Conteúdo remixado gerado! (Funcionalidade de visualização em breve)");
      } catch (e) {
          alert("Erro ao remixar.");
      } finally {
          setIsRemixing(false);
      }
  };

  return (
    <div className="animate-scaleIn w-full flex flex-col items-center justify-start pt-2 pb-24 lg:pb-8 relative px-4 lg:px-0 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
        
        {showConnectModal && (
            <InstagramConnect 
                onConnected={() => { setShowConnectModal(false); handlePublishClick(); }} 
                onClose={() => setShowConnectModal(false)} 
            />
        )}

        {/* MOBILE TABS SWITCHER (Visible only on mobile) */}
        <div className="lg:hidden w-full max-w-[320px] bg-slate-100 p-1 rounded-xl flex mb-4 shadow-inner">
            <button 
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mobileTab === 'preview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
            >
                <Eye className="w-4 h-4" /> Visualizar
            </button>
            <button 
                onClick={() => setMobileTab('audit')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mobileTab === 'audit' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
            >
                <ShieldCheck className="w-4 h-4" /> Auditoria & Ações
            </button>
        </div>

        {/* LEFT COLUMN: PHONE MOCKUP (Visible if Desktop OR Mobile Tab is Preview) */}
        <div className={`flex-shrink-0 w-full max-w-[320px] flex justify-center transition-all ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
            {/* Phone Frame */}
            <div className="relative w-full aspect-[9/19.5] max-h-[80vh] bg-white rounded-[2rem] shadow-[0_0_0_8px_#1e293b,0_15px_40px_-10px_rgba(0,0,0,0.4)] overflow-hidden border-[3px] border-slate-800 transform-gpu">
                
                {/* Notch */}
                <div className="absolute top-0 left-0 right-0 h-7 z-30 flex justify-center items-end pb-1">
                    <div className="w-20 h-5 bg-black rounded-b-xl"></div>
                </div>

                {/* Status Bar */}
                <div className="h-10 bg-white flex items-center justify-between px-5 pt-2 select-none text-slate-900 z-20 relative">
                    <span className="text-[11px] font-bold tracking-wide pl-1">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <div className="flex gap-1 items-center pr-1">
                        <Signal className="w-3 h-3" />
                        <Wifi className="w-3 h-3" />
                        <Battery className="w-4 h-4" />
                    </div>
                </div>

                {/* Instagram Header */}
                <div className="h-10 flex items-center justify-between px-3 border-b border-slate-50 bg-white/95 backdrop-blur z-20 relative sticky top-0">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                            <div className="w-full h-full rounded-full bg-white p-[1.5px] overflow-hidden">
                                <img src="https://seujoelho.com/wp-content/uploads/2021/01/Dr-Carlos-Franciozi-781x1024.jpg" className="w-full h-full object-cover object-top" />
                            </div>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-900 block leading-none tracking-tight">dr.carlos_franciozi</span>
                            <span className="text-[9px] text-slate-500 block leading-none mt-0.5 font-medium">Ortopedia</span>
                        </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-900" />
                </div>

                {/* Scrollable Feed Content */}
                <div className="h-[calc(100%-5rem)] overflow-y-auto no-scrollbar bg-white relative">
                    
                    {/* Image Area */}
                    <div className="relative w-full bg-slate-100 group/image">
                        <div className={`w-full relative aspect-square`}>
                            {isRegenerating && !imageUrl ? (
                                <div className="absolute inset-0 z-20 bg-slate-50 animate-pulse flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                                </div>
                            ) : imageUrl ? (
                                <>
                                    <img src={imageUrl} className={`w-full h-full object-cover transition-opacity duration-500 ${isRegenerating ? 'opacity-50 blur-sm' : 'opacity-100'}`} />
                                    {isRegenerating && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <Loader2 className="w-8 h-8 text-white animate-spin drop-shadow-md" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={onRegenerateImage}
                                            disabled={isRegenerating}
                                            className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover/image:translate-y-0 transition-all active:scale-95 flex items-center gap-2 hover:bg-white uppercase tracking-wide"
                                        >
                                            <Wand2 className="w-3 h-3" /> Nova Imagem
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                    <div className="w-8 h-8 border-2 border-slate-300 rounded-full animate-spin border-t-transparent"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Gerando...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interaction Bar */}
                    <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex gap-3 text-slate-900">
                            <Heart className="w-5 h-5 hover:text-red-500 hover:fill-red-500 transition-all cursor-pointer active:scale-90" />
                            <MessageCircle className="w-5 h-5 -rotate-90 hover:text-slate-600 cursor-pointer" />
                            <Send className="w-5 h-5 hover:text-slate-600 cursor-pointer" />
                        </div>
                        <Bookmark className="w-5 h-5 text-slate-900 hover:text-slate-600 cursor-pointer" />
                    </div>

                    {/* Caption Area */}
                    <div className="px-3 pb-20">
                        <p className="text-[11px] font-bold text-slate-900 mb-1">324 curtidas</p>
                        
                        <div className="relative group">
                            {isRegenerating && !editableCaption ? (
                                <div className="space-y-2 py-2">
                                    <div className="h-2.5 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-2.5 bg-slate-200 rounded w-full animate-pulse"></div>
                                    <div className="h-2.5 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                                </div>
                            ) : isEditing ? (
                                <div className="relative animate-fadeIn">
                                    <textarea 
                                        value={editableCaption}
                                        onChange={(e) => setEditableCaption(e.target.value)}
                                        className="w-full h-48 text-xs leading-relaxed p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 font-sans"
                                    />
                                    <button onClick={() => setIsEditing(false)} className="absolute bottom-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg hover:bg-green-600 transition-all active:scale-90"><Check className="w-3 h-3" /></button>
                                </div>
                            ) : (
                                <div className={`text-xs leading-relaxed text-slate-800 font-sans transition-opacity ${isRegenerating ? 'opacity-50' : 'opacity-100'}`}>
                                    <span className="font-bold mr-1 text-slate-900">dr.carlos_franciozi</span>
                                    <span className="whitespace-pre-wrap">{editableCaption}</span>
                                    <button onClick={() => setIsEditing(true)} className="ml-1 text-[9px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-600 uppercase tracking-wide"><Edit2 className="w-2.5 h-2.5 inline mr-0.5" /> Editar</button>
                                </div>
                            )}
                        </div>
                        
                        {content?.hashtags && !isEditing && (
                            <p className="text-xs text-blue-900 mt-1 font-medium leading-relaxed">{content.hashtags.join(' ')}</p>
                        )}
                        <p className="text-[9px] text-slate-400 uppercase mt-2 mb-4 font-medium tracking-wide">Há 2 horas</p>
                        
                        {!isEditing && (
                            <button onClick={onRegenerateText} disabled={isRegenerating} className="w-full py-1.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-100 active:scale-98 uppercase tracking-wide">
                                <Wand2 className="w-3 h-3" /> Regerar Legenda
                            </button>
                        )}
                    </div>
                </div>

                {/* AI Tools Overlay (Bottom of Phone) */}
                {!isEditing && (
                    <div className="absolute bottom-4 left-3 right-3 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_4px_15px_rgba(0,0,0,0.1)] rounded-xl p-1.5 z-30 flex gap-2 overflow-x-auto no-scrollbar">
                        {isRefining ? (
                            <div className="w-full text-center text-[10px] font-bold text-slate-600 py-1.5 flex items-center justify-center gap-2 uppercase tracking-wide"><Wand2 className="w-3 h-3 animate-spin" /> Refinando...</div>
                        ) : (
                            <>
                                <button onClick={() => handleSmartRefine("Mais curto")} className="flex-shrink-0 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[9px] font-bold text-slate-700 whitespace-nowrap transition-colors border border-slate-100 uppercase tracking-wide">✂️ Encurtar</button>
                                <button onClick={() => handleSmartRefine("Mais empático")} className="flex-shrink-0 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[9px] font-bold text-slate-700 whitespace-nowrap transition-colors border border-slate-100 uppercase tracking-wide">❤️ Empatia</button>
                                <button onClick={() => handleSmartRefine("Adicionar emojis")} className="flex-shrink-0 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[9px] font-bold text-slate-700 whitespace-nowrap transition-colors border border-slate-100 uppercase tracking-wide">😊 Emojis</button>
                            </>
                        )}
                    </div>
                )}
                {/* Home Indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/90 rounded-full z-40"></div>
            </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS & AUDIT (Visible if Desktop OR Mobile Tab is Audit) */}
        <div className={`w-full lg:max-w-[320px] flex flex-col gap-4 transition-all animate-fadeIn ${mobileTab === 'audit' ? 'block' : 'hidden lg:block'}`}>
            {/* Publish Actions */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <button onClick={handlePublishClick} disabled={isPublishing || isRegenerating || !imageUrl} className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] mb-3 text-sm uppercase tracking-wide ${publishStatus === 'success' ? 'bg-green-600 text-white shadow-green-500/30' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-purple-500/20'} ${(isPublishing || !imageUrl) ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {isPublishing ? <><Loader2 className="w-5 h-5 animate-spin" /> Publicando...</> : publishStatus === 'success' ? <><Check className="w-5 h-5" /> Postado!</> : <><Instagram className="w-5 h-5" /> Publicar no Instagram</>}
                </button>
                <div className="flex gap-2">
                    <button onClick={() => handleRemix('VIDEO_SCRIPT')} disabled={isRemixing} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-800 transition-all uppercase tracking-wide">
                        {isRemixing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />} Virar Vídeo
                    </button>
                    <button onClick={() => handleRemix('ARTICLE')} disabled={isRemixing} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-50 transition-all uppercase tracking-wide">
                        <RefreshCw className="w-3 h-3" /> Virar Artigo
                    </button>
                </div>
            </div>
            {/* CFM Audit Component */}
            <CFMComplianceGuide contentToAudit={editableCaption} />
        </div>
    </div>
  );
};

export default PostPreview;
