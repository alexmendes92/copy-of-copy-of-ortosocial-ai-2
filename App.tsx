
import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid,
  PlusSquare,
  History,
  Activity,
  CheckCircle2,
  Flame,
  Video,
  BookOpen,
  Route,
  PieChart,
  Globe,
  QrCode
} from 'lucide-react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PostWizard from './components/PostWizard';
import ArticleWizard from './components/ArticleWizard';
import InfographicWizard from './components/InfographicWizard';
import ConversionWizard from './components/ConversionWizard';
import TrendAnalyzer from './components/TrendAnalyzer';
import ReturnToSportCalculator from './components/ReturnToSportCalculator';
import AnatomyLibrary from './components/AnatomyLibrary';
import DigitalBusinessCard from './components/DigitalBusinessCard';
import PostPreview from './components/PostPreview';
import ArticlePreview from './components/ArticlePreview';
import InfographicPreview from './components/InfographicPreview';
import ConversionPreview from './components/ConversionPreview';
import MaterialsLibrary from './components/MaterialsLibrary';
import SiteContentList from './components/SiteContentList';
import PublicationsList from './components/PublicationsList';
import ScoreCalculator from './components/ScoreCalculator';
import FraxCalculator from './components/FraxCalculator';
import VisualPrescription from './components/VisualPrescription';
import MedicalNewsFeed from './components/MedicalNewsFeed';
import PatientJourney from './components/PatientJourney';
import VideoWizard from './components/VideoWizard';
import ClinicalSuite from './components/ClinicalSuite';
import MarketingROI from './components/MarketingROI';

import { generatePostImage, generatePostText, generateSEOArticle, generateInfographicContent, generateConversionContent, updateUserProfile } from './services/geminiService';
import { GeneratedResult, PostState, GeneratedArticle, ArticleState, InfographicState, InfographicResult, ConversionState, ConversionResult, PostFormat, PostCategory, Tone, PubMedArticle, UserProfile } from './types';

type ViewMode = 'dashboard' | 'post' | 'seo' | 'materials' | 'infographic' | 'conversion' | 'history' | 'site' | 'trends' | 'calculator' | 'publications' | 'anatomy' | 'card' | 'scores' | 'frax' | 'prescription' | 'news' | 'journey' | 'video' | 'clinical' | 'marketing_roi';

function App() {
  // --- PERSISTENT STATE ---
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
      return (localStorage.getItem('medisocial_last_view') as ViewMode) || 'dashboard';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
      const saved = localStorage.getItem('medisocial_profile');
      return saved ? JSON.parse(saved) : {
          name: "Dr. Carlos Franciozi",
          specialty: "Cirurgião de Joelho",
          crm: "111501",
          defaultTone: Tone.PROFESSIONAL
      };
  });
  
  const [history, setHistory] = useState<GeneratedResult[]>([]);
  
  // Post State
  const [postResult, setPostResult] = useState<GeneratedResult | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [postLastState, setPostLastState] = useState<PostState | null>(null);
  const [wizardInitialState, setWizardInitialState] = useState<PostState | null>(null);
  
  const [regenTextLoading, setRegenTextLoading] = useState(false);
  const [regenImageLoading, setRegenImageLoading] = useState(false);

  // Article State
  const [articleResult, setArticleResult] = useState<GeneratedArticle | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleWizardState, setArticleWizardState] = useState<ArticleState | null>(null);

  // Other Tools
  const [infographicResult, setInfographicResult] = useState<InfographicResult | null>(null);
  const [infographicLoading, setInfographicLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // EFFECTS
  useEffect(() => {
    localStorage.setItem('medisocial_last_view', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('medisocial_profile', JSON.stringify(userProfile));
    updateUserProfile(userProfile); // Sync service singleton
  }, [userProfile]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('medisocial_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedDraft = localStorage.getItem('medisocial_last_post');
    if (savedDraft) setPostResult(JSON.parse(savedDraft));
  }, []);

  useEffect(() => {
    localStorage.setItem('medisocial_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (postResult) localStorage.setItem('medisocial_last_post', JSON.stringify(postResult));
  }, [postResult]);

  useEffect(() => {
    setError(null);
  }, [viewMode]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // HANDLERS
  const handleGeneratePost = async (state: PostState) => {
    setPostLoading(true);
    setError(null);
    setPostLastState(state);

    try {
      const content = await generatePostText(state);
      
      let imageUrl = null;
      let isCustomImage = false;

      if (state.uploadedImage) {
          imageUrl = state.uploadedImage;
          isCustomImage = true;
      } else {
          imageUrl = await generatePostImage(content.imagePromptDescription, state.format);
      }

      const newResult = { 
          id: Date.now().toString(),
          date: new Date().toISOString(),
          content, 
          imageUrl, 
          isCustomImage,
          type: 'post' as const
      };

      setPostResult(newResult);
      setHistory(prev => [newResult, ...prev]); 
      showToast('Post gerado com sucesso!'); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao gerar o post.");
    } finally {
      setPostLoading(false);
    }
  };

  const handleRegeneratePostText = async () => { if (!postLastState || !postResult) return; setRegenTextLoading(true); try { const newContent = await generatePostText(postLastState); setPostResult({ ...postResult, content: newContent }); showToast('Texto atualizado!'); } catch (err: any) { setError("Falha ao regerar o texto"); } finally { setRegenTextLoading(false); } };
  const handleRegeneratePostImage = async () => { if (!postResult?.content?.imagePromptDescription || postResult.isCustomImage) return; setRegenImageLoading(true); try { const newImageUrl = await generatePostImage(postResult.content.imagePromptDescription, postLastState?.format || PostFormat.FEED); setPostResult({ ...postResult, imageUrl: newImageUrl }); showToast('Nova imagem gerada!'); } catch (err: any) { setError("Falha ao regerar a imagem"); } finally { setRegenImageLoading(false); } };
  const handleGenerateArticle = async (state: ArticleState) => { setArticleLoading(true); setError(null); try { const article = await generateSEOArticle(state); setArticleResult(article); showToast('Artigo SEO criado!'); } catch (err: any) { setError(err.message || "Erro ao gerar artigo."); } finally { setArticleLoading(false); } };
  const handleTransformArticleToPost = (article: GeneratedArticle) => { const newState: PostState = { topic: article.title, category: PostCategory.PATHOLOGY, tone: Tone.EDUCATIONAL, format: PostFormat.FEED, customInstructions: `Baseie o post EXATAMENTE neste artigo: "${article.title}". Resuma os pontos principais para o Instagram.` }; setWizardInitialState(newState); setViewMode('post'); showToast('Iniciando Post do Artigo...'); };
  const handleGenerateInfographic = async (state: InfographicState) => { setInfographicLoading(true); setError(null); try { const data = await generateInfographicContent(state); setInfographicResult({ data }); showToast('Infográfico estruturado!'); generatePostImage(data.heroImagePrompt, PostFormat.FEED).then(url => setInfographicResult(prev => prev ? { ...prev, heroImageUrl: url } : null)); if(data.anatomy.imagePrompt) { generatePostImage(data.anatomy.imagePrompt, PostFormat.FEED).then(url => setInfographicResult(prev => prev ? { ...prev, anatomyImageUrl: url } : null)); } } catch (err: any) { setError(err.message || "Erro no infográfico."); } finally { setInfographicLoading(false); } };
  const handleGenerateConversion = async (state: ConversionState) => { setConversionLoading(true); setError(null); try { const result = await generateConversionContent(state); setConversionResult(result); showToast('Estratégia de conversão pronta!'); } catch (err: any) { setError(err.message || "Erro na estratégia."); } finally { setConversionLoading(false); } };
  const handleUseTrend = (partialState: Partial<PostState>) => { const fullState: PostState = { topic: '', category: partialState.category!, tone: partialState.tone!, format: partialState.format!, customInstructions: partialState.customInstructions || '', ...partialState }; setWizardInitialState(fullState); setViewMode('post'); };
  const handleUseEvidence = (article: PubMedArticle, type: 'post' | 'seo') => { if (type === 'post') { setWizardInitialState({ topic: article.title, category: PostCategory.PATHOLOGY, tone: Tone.EDUCATIONAL, format: PostFormat.FEED, customInstructions: '', evidence: article }); setViewMode('post'); } else { setArticleWizardState({ topic: article.title, keywords: '', length: 2, audience: 0, tone: Tone.EDUCATIONAL, evidence: article } as any); setViewMode('seo'); } showToast('Contexto científico carregado!'); };

  // New Quick Start Handler
  const handleQuickStart = (topic: string) => {
      const newState: PostState = {
          topic: topic,
          category: PostCategory.PATHOLOGY, // Default
          tone: Tone.PROFESSIONAL, // Default
          format: PostFormat.FEED, // Default
          customInstructions: ''
      };
      setWizardInitialState(newState);
      setViewMode('post');
  };

  const getPageInfo = () => {
    switch (viewMode) {
      case 'post': return { title: 'Criar Post', subtitle: 'Instagram Feed/Story' };
      case 'seo': return { title: 'Blog Médico', subtitle: 'Artigo SEO (Prioridade)' };
      case 'history': return { title: 'Histórico', subtitle: 'Criações Anteriores' };
      case 'clinical': return { title: 'Clínica', subtitle: 'Ferramentas de Consultório' };
      case 'trends': return { title: 'Trends', subtitle: 'Google Trends' };
      case 'video': return { title: 'Vídeo', subtitle: 'Studio de Gravação' };
      case 'marketing_roi': return { title: 'Financeiro', subtitle: 'ROI de Marketing' };
      case 'journey': return { title: 'Jornada', subtitle: 'Acompanhamento do Paciente' };
      case 'site': return { title: 'Site', subtitle: 'Conteúdo Web' };
      case 'card': return { title: 'Cartão', subtitle: 'Business Card' };
      default: return { title: 'MediSocial', subtitle: 'Dr. Carlos Franciozi' };
    }
  };

  const { title, subtitle } = getPageInfo();
  const hasResult = postResult || articleResult || infographicResult || conversionResult;
  const isGenerating = postLoading || articleLoading || infographicLoading || conversionLoading;
  const isFullPageTool = ['trends', 'calculator', 'materials', 'site', 'publications', 'anatomy', 'card', 'scores', 'frax', 'prescription', 'news', 'journey', 'video', 'clinical', 'marketing_roi'].includes(viewMode);
  const showPreview = hasResult || isGenerating;

  // --- MENU CONFIGURATION ---
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutGrid },
    { id: 'trends', label: 'Trends', icon: Flame },
    { id: 'post', label: 'Criar', icon: PlusSquare },
    { id: 'video', label: 'Vídeo', icon: Video },
    { id: 'seo', label: 'Blog', icon: BookOpen },
    { id: 'clinical', label: 'Clínica', icon: Activity },
    { id: 'journey', label: 'Jornada', icon: Route },
    { id: 'marketing_roi', label: 'ROI', icon: PieChart },
    { id: 'site', label: 'Site', icon: Globe },
    { id: 'card', label: 'Card', icon: QrCode },
    { id: 'history', label: 'Hist.', icon: History },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans relative selection:bg-blue-100 selection:text-blue-700">
      
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[120px] animate-blob mix-blend-multiply filter"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] bg-indigo-200/30 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply filter"></div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slideUp bg-slate-900/90 backdrop-blur-md text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 text-sm font-bold border border-white/10">
            <div className="bg-green-500 rounded-full p-1"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>
            {toast}
        </div>
      )}

      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative z-10">
          
          {/* Global Header (Only for non-dashboard pages) */}
          {viewMode !== 'dashboard' && (
            <Header 
                onBack={() => {
                    if (showPreview && !isFullPageTool) {
                        setPostResult(null);
                        setArticleResult(null);
                        setInfographicResult(null);
                        setConversionResult(null);
                    } else {
                        setViewMode('dashboard');
                    }
                }}
                showBack={true}
                title={title}
                subtitle={subtitle}
            />
          )}

          {/* Main Scrollable Area */}
          <main className="flex-1 overflow-hidden relative flex flex-col w-full">
              
              {/* DASHBOARD VIEW */}
              {viewMode === 'dashboard' && (
                  <div className="w-full h-full overflow-y-auto no-scrollbar pb-32">
                      <Dashboard onSelectTool={(tool) => setViewMode(tool as ViewMode)} onQuickAction={handleQuickStart} />
                  </div>
              )}

              {/* HISTORY VIEW */}
              {viewMode === 'history' && (
                  <div className="w-full h-full overflow-y-auto no-scrollbar p-4 pb-32 bg-slate-50/50 backdrop-blur-sm">
                      <h2 className="text-2xl font-black text-slate-900 mb-6 px-2">Histórico</h2>
                      {history.length === 0 ? (
                          <div className="text-center text-slate-400 mt-20 flex flex-col items-center">
                              <History className="w-16 h-16 mb-4 opacity-10" />
                              <p className="font-medium">Nenhum histórico encontrado.</p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {history.map(item => (
                                  <div key={item.id} onClick={() => { setPostResult(item); setViewMode('post'); }} className="bg-white p-3 rounded-[1.5rem] shadow-card border border-slate-100 flex gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                      <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                          {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                                      </div>
                                      <div className="overflow-hidden py-1">
                                          <p className="font-bold text-sm truncate text-slate-800">{item.content?.headline || 'Sem título'}</p>
                                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.content?.caption}</p>
                                          <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(item.date).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}

              {/* TOOLS RENDERING (Conditional) */}
              {viewMode !== 'dashboard' && viewMode !== 'history' && (
                  <div className="flex flex-col h-full relative">
                       {/* Input Area (Hidden on Desktop if preview active, visible on mobile) */}
                       <div className={`flex-1 relative flex flex-col ${(showPreview && !isFullPageTool) ? 'hidden lg:flex' : 'flex'} ${!isFullPageTool ? 'overflow-hidden' : 'overflow-hidden'}`}>
                            <div className={`flex-1 overflow-y-auto no-scrollbar ${isFullPageTool ? 'w-full' : 'p-0 lg:p-6 w-full lg:max-w-2xl lg:mx-auto'}`}>
                                {error && (
                                    <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 text-sm animate-fadeIn mx-6 mt-6 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        {error}
                                        <button onClick={() => setError(null)} className="ml-auto underline text-xs">Dispensar</button>
                                    </div>
                                )}

                                {viewMode === 'post' && <div className="h-full flex flex-col p-4 pb-32 lg:pb-0"><PostWizard onGenerate={handleGeneratePost} isGenerating={postLoading} initialState={wizardInitialState} /></div>}
                                {viewMode === 'seo' && <div className="p-4 pb-32 lg:pb-0"><ArticleWizard onGenerate={handleGenerateArticle} isGenerating={articleLoading} initialState={articleWizardState} /></div>}
                                {viewMode === 'infographic' && <div className="p-4 pb-32 lg:pb-0"><InfographicWizard onGenerate={handleGenerateInfographic} isGenerating={infographicLoading} /></div>}
                                {viewMode === 'conversion' && <div className="p-4 pb-32 lg:pb-0"><ConversionWizard onGenerate={handleGenerateConversion} isGenerating={conversionLoading} /></div>}
                                {viewMode === 'materials' && <MaterialsLibrary onUseArticle={handleUseEvidence} />}
                                {viewMode === 'trends' && <TrendAnalyzer onUseTrend={handleUseTrend} />}
                                {viewMode === 'calculator' && <ReturnToSportCalculator />}
                                {viewMode === 'site' && <SiteContentList />}
                                {viewMode === 'publications' && <PublicationsList />}
                                {viewMode === 'anatomy' && <AnatomyLibrary />}
                                {viewMode === 'card' && <DigitalBusinessCard />}
                                {viewMode === 'scores' && <ScoreCalculator />}
                                {viewMode === 'frax' && <FraxCalculator />}
                                {viewMode === 'prescription' && <VisualPrescription />}
                                {viewMode === 'news' && <MedicalNewsFeed />}
                                {viewMode === 'journey' && <PatientJourney />}
                                {viewMode === 'video' && <VideoWizard />}
                                {viewMode === 'clinical' && <ClinicalSuite />}
                                {viewMode === 'marketing_roi' && <MarketingROI />}
                            </div>
                       </div>

                       {/* Preview Area (Desktop: Right Side, Mobile: Separate View) */}
                       <div className={`flex-1 bg-white relative flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] ${showPreview ? 'flex h-full' : 'hidden lg:flex'} ${isFullPageTool ? '!hidden' : ''}`}>
                            <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar pb-32 lg:pb-0 relative">
                                {isGenerating && (
                                    <div className="h-full flex flex-col items-center justify-center p-8 animate-fadeIn bg-white/80 backdrop-blur-xl absolute inset-0 z-50">
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
                                            <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-100">
                                                <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-blue-600 animate-spin"></div>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Criando Conteúdo</h3>
                                        <p className="text-slate-500 text-sm animate-pulse text-center max-w-xs font-medium leading-relaxed">
                                            {postLoading ? "A IA está analisando compliance e gerando copy..." : "Processando requisição..."}
                                        </p>
                                    </div>
                                )}

                                {viewMode === 'post' && postResult && <div className="py-4 px-4 flex justify-center min-h-full bg-slate-50"><PostPreview result={postResult} onRegenerateText={handleRegeneratePostText} onRegenerateImage={handleRegeneratePostImage} isRegenerating={regenTextLoading || regenImageLoading} /></div>}
                                {viewMode === 'seo' && articleResult && <div className="p-4 lg:p-12 max-w-6xl mx-auto h-full"><ArticlePreview article={articleResult} onConvertToPost={handleTransformArticleToPost} /></div>}
                                {viewMode === 'infographic' && infographicResult && <div className="w-full h-full min-h-screen lg:min-h-0"><InfographicPreview data={infographicResult.data} heroImageUrl={infographicResult.heroImageUrl} anatomyImageUrl={infographicResult.anatomyImageUrl} onBack={() => setInfographicResult(null)} /></div>}
                                {viewMode === 'conversion' && conversionResult && <div className="p-4 lg:p-12 max-w-4xl mx-auto"><ConversionPreview result={conversionResult} /></div>}
                            </div>
                       </div>
                  </div>
              )}
          </main>

          {/* FLOATING SCROLLABLE DOCK (Glassmorphism & Center Fixed) */}
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-[2rem] flex items-center p-2 z-50 gap-1 overflow-x-auto no-scrollbar snap-x max-w-[95%] w-auto transition-all duration-300 ring-1 ring-slate-900/5">
              {menuItems.map((item) => {
                  const isActive = item.id === viewMode || (item.id === 'clinical' && ['scores', 'frax', 'calculator', 'prescription', 'clinical'].includes(viewMode));
                  
                  return (
                      <button 
                        key={item.id}
                        onClick={() => setViewMode(item.id as ViewMode)} 
                        className={`min-w-[4rem] h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative group snap-center shrink-0
                        ${isActive ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'}`}
                      >
                          <item.icon className={`w-5 h-5 mb-0.5 transition-all ${isActive ? 'animate-bounceClick' : 'opacity-70 group-hover:opacity-100'}`} />
                          <span className={`text-[9px] font-bold absolute bottom-2.5 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                              {item.label}
                          </span>
                      </button>
                  );
              })}
          </nav>

      </div>
    </div>
  );
}

export default App;
