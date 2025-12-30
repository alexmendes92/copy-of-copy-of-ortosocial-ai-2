
import React, { useState, useRef } from 'react';
import { Tone, TargetAudience, VideoState, VideoScriptResult, GeneratedArticle } from '../types';
import { generateVideoScript, generateBlogFromAudio } from '../services/geminiService';
import VideoScriptPreview from './VideoScriptPreview';
import ArticlePreview from './ArticlePreview';
import { 
    Video, Mic, FileText, Youtube, UploadCloud, 
    Wand2, ArrowRight, CheckCircle2, PlayCircle, Film, Radio, Music, X
} from 'lucide-react';

const VideoWizard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'script' | 'podcast'>('script');
  const [loading, setLoading] = useState(false);
  
  // Script State
  const [videoState, setVideoState] = useState<VideoState>({
      topic: '',
      targetAudience: TargetAudience.PATIENT,
      tone: Tone.EDUCATIONAL,
      customInstructions: ''
  });
  const [scriptResult, setScriptResult] = useState<VideoScriptResult | null>(null);

  // Podcast State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [blogResult, setBlogResult] = useState<GeneratedArticle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateScript = async () => {
      if (!videoState.topic) return;
      setLoading(true);
      try {
          const result = await generateVideoScript(videoState);
          setScriptResult(result);
      } catch (e) {
          console.error(e);
          alert("Erro ao gerar roteiro.");
      } finally {
          setLoading(false);
      }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setAudioFile(e.target.files[0]);
      }
  };

  const handlePodcastConversion = async () => {
      if (!audioFile) return;
      setLoading(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
          try {
              const base64Audio = (reader.result as string).split(',')[1];
              const mimeType = audioFile.type;
              const result = await generateBlogFromAudio(base64Audio, mimeType);
              setBlogResult(result);
          } catch (e) {
              console.error(e);
              alert("Erro ao processar áudio. Verifique se o arquivo é válido e tente novamente.");
          } finally {
              setLoading(false);
          }
      };
      reader.readAsDataURL(audioFile);
  };

  if (loading) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-slate-950 animate-fadeIn p-8 relative overflow-hidden">
              {/* Cinematic Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-8">
                      <div className="absolute inset-0 bg-red-600 rounded-full blur-[60px] opacity-40 animate-pulse"></div>
                      <div className="relative w-32 h-32 bg-slate-900 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] border border-red-500/30 flex items-center justify-center">
                          {activeTab === 'script' ? (
                              <Film className="w-12 h-12 text-red-500 animate-bounce" />
                          ) : (
                              <div className="flex gap-1 items-end h-12">
                                  <div className="w-2 bg-purple-500 rounded-full animate-[bounce_1s_infinite] h-6"></div>
                                  <div className="w-2 bg-purple-500 rounded-full animate-[bounce_1.2s_infinite] h-10"></div>
                                  <div className="w-2 bg-purple-500 rounded-full animate-[bounce_0.8s_infinite] h-8"></div>
                                  <div className="w-2 bg-purple-500 rounded-full animate-[bounce_1.1s_infinite] h-12"></div>
                              </div>
                          )}
                      </div>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                      {activeTab === 'script' ? 'Produzindo Roteiro...' : 'Processando Áudio...'}
                  </h2>
                  <p className="text-slate-400 text-sm font-medium animate-pulse">
                      {activeTab === 'script' 
                        ? 'A IA está estruturando hook, retenção e quebra de objeções.' 
                        : 'Transcrevendo e formatando conteúdo para blog.'}
                  </p>
              </div>
          </div>
      );
  }

  if (scriptResult) {
      return (
          <div className="h-full flex flex-col animate-fadeIn">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
                  <button onClick={() => setScriptResult(null)} className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 rotate-180" /> Voltar ao Studio
                  </button>
                  <span className="font-bold text-sm tracking-wide bg-red-600/20 px-3 py-1 rounded-full text-red-400 border border-red-500/20">ROTEIRO FINALIZADO</span>
                  <div className="w-10"></div>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-50">
                  <VideoScriptPreview script={scriptResult} />
              </div>
          </div>
      );
  }

  if (blogResult) {
      return (
          <div className="h-full flex flex-col animate-fadeIn">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
                  <button onClick={() => setBlogResult(null)} className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 rotate-180" /> Voltar ao Studio
                  </button>
                  <span className="font-bold text-sm tracking-wide bg-purple-600/20 px-3 py-1 rounded-full text-purple-400 border border-purple-500/20">ARTIGO GERADO</span>
                  <div className="w-10"></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
                  <ArticlePreview article={blogResult} />
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 pb-24 lg:pb-0 animate-fadeIn relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Studio Header - Minimalist */}
        <div className="p-6 relative z-10 flex justify-center">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-xl">
                <button 
                    onClick={() => setActiveTab('script')}
                    className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'script' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Video className="w-4 h-4" /> Vídeo
                </button>
                <button 
                    onClick={() => setActiveTab('podcast')}
                    className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'podcast' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Mic className="w-4 h-4" /> Podcast
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 relative z-10">
            
            {/* SCRIPT WIZARD */}
            {activeTab === 'script' && (
                <div className="max-w-2xl mx-auto space-y-8 animate-slideUp">
                    
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                        
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                <Youtube className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Roteiro Otimizado</h2>
                                <p className="text-slate-400 text-sm">Geração de scripts com retenção magnética para YouTube e Reels.</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Tema do Vídeo</label>
                                <input 
                                    type="text" 
                                    value={videoState.topic}
                                    onChange={e => setVideoState({...videoState, topic: e.target.value})}
                                    placeholder="Ex: Como evitar cirurgia de menisco..."
                                    className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-red-500 text-white font-medium placeholder:text-slate-600 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Público-Alvo</label>
                                    <div className="relative">
                                        <select 
                                            value={videoState.targetAudience}
                                            onChange={e => setVideoState({...videoState, targetAudience: e.target.value as TargetAudience})}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-red-500 text-sm text-slate-300 appearance-none"
                                        >
                                            {Object.values(TargetAudience).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-4 w-2 h-2 border-r-2 border-b-2 border-slate-500 rotate-45 pointer-events-none"></div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Estilo & Tom</label>
                                    <div className="relative">
                                        <select 
                                            value={videoState.tone}
                                            onChange={e => setVideoState({...videoState, tone: e.target.value as Tone})}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-red-500 text-sm text-slate-300 appearance-none"
                                        >
                                            {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-4 w-2 h-2 border-r-2 border-b-2 border-slate-500 rotate-45 pointer-events-none"></div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Instruções de Direção</label>
                                <textarea 
                                    value={videoState.customInstructions}
                                    onChange={e => setVideoState({...videoState, customInstructions: e.target.value})}
                                    placeholder="Ex: Usar metáfora do carro, enfatizar o pós-operatório..."
                                    rows={3}
                                    className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-red-500 text-slate-300 text-sm resize-none"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerateScript}
                            disabled={!videoState.topic}
                            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-900/20 hover:scale-[1.01] hover:shadow-red-900/40 transition-all flex items-center justify-center gap-3 mt-8 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                        >
                            <Video className="w-5 h-5 group-hover/btn:animate-pulse" /> Produzir Roteiro
                        </button>
                    </div>
                </div>
            )}

            {/* PODCAST WIZARD */}
            {activeTab === 'podcast' && (
                <div className="max-w-2xl mx-auto space-y-8 animate-slideUp">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 text-center relative overflow-hidden">
                        {/* Audio Wave Visuals */}
                        <div className="absolute top-1/2 left-0 right-0 h-32 -translate-y-1/2 flex items-center justify-center gap-1 opacity-10 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-2 bg-purple-500 rounded-full" style={{ height: `${Math.random() * 100}%` }}></div>
                            ))}
                        </div>

                        <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30 relative z-10">
                            <Music className="w-10 h-10 text-purple-400" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Audio to Blog Converter</h2>
                        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto relative z-10">
                            Faça upload do seu podcast ou nota de voz. Nossa IA transcreve e reformata em um artigo SEO.
                        </p>

                        <input 
                            type="file" 
                            accept="audio/*" 
                            ref={fileInputRef}
                            onChange={handleAudioUpload}
                            className="hidden" 
                        />

                        {!audioFile ? (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-slate-700 bg-slate-950/50 text-slate-400 py-10 rounded-2xl font-bold hover:bg-slate-900 hover:border-purple-500 hover:text-purple-400 transition-all flex flex-col items-center justify-center gap-3 relative z-10 group"
                            >
                                <UploadCloud className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                <span className="text-sm uppercase tracking-wide">Selecionar Arquivo de Áudio</span>
                                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-500">MP3, WAV, M4A</span>
                            </button>
                        ) : (
                            <div className="w-full bg-slate-950 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between relative z-10 shadow-lg shadow-purple-900/20">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="p-3 bg-purple-600 rounded-xl text-white">
                                        <PlayCircle className="w-6 h-6" />
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <span className="block font-bold text-white text-sm truncate">{audioFile.name}</span>
                                        <span className="text-[10px] text-purple-400 font-bold uppercase">Pronto para processar</span>
                                    </div>
                                </div>
                                <button onClick={() => setAudioFile(null)} className="text-slate-500 hover:text-red-400 px-3">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={handlePodcastConversion}
                            disabled={!audioFile}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-900/20 hover:scale-[1.01] hover:shadow-purple-900/40 transition-all flex items-center justify-center gap-3 mt-8 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                        >
                            <Wand2 className="w-5 h-5" /> Converter Agora
                        </button>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default VideoWizard;
