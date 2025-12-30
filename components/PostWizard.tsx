
import React, { useState, useRef, useEffect } from 'react';
import { PostCategory, Tone, PostState, PostFormat } from '../types';
import { 
    HeartPulse, BriefcaseMedical, Activity, User, ShieldCheck, HelpCircle, 
    Search, Sparkles, Image as ImageIcon, Smartphone, LayoutGrid, 
    AlertCircle, ArrowRight, ArrowLeft, Check, Flame, Edit3,
    Stethoscope, Heart, GraduationCap, Trophy, Target
} from 'lucide-react';

interface PostWizardProps {
  onGenerate: (state: PostState) => void;
  isGenerating: boolean;
  initialState?: PostState | null;
}

const PostWizard: React.FC<PostWizardProps> = ({ onGenerate, isGenerating, initialState }) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<PostCategory>(PostCategory.PATHOLOGY);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [format, setFormat] = useState<PostFormat>(PostFormat.FEED);
  const [customInstructions, setCustomInstructions] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{topic?: string}>({});
  const [loadingStage, setLoadingStage] = useState(0); 

  const isTrendMode = !!initialState?.customInstructions && !initialState.evidence;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialState) {
        setCategory(initialState.category);
        setTopic(initialState.topic);
        setTone(initialState.tone);
        setFormat(initialState.format);
        if (initialState.customInstructions) {
            setCustomInstructions(initialState.customInstructions);
        }
        if (initialState.customInstructions || initialState.evidence) {
            setStep(3);
        }
    }
  }, [initialState]);

  useEffect(() => {
      if (isGenerating) {
          setLoadingStage(1);
          const t1 = setTimeout(() => setLoadingStage(2), 2000);
          const t2 = setTimeout(() => setLoadingStage(3), 4000);
          return () => { clearTimeout(t1); clearTimeout(t2); };
      } else {
          setLoadingStage(0);
      }
  }, [isGenerating]);

  const validateStep2 = () => {
      if (!topic.trim()) {
          setErrors({ topic: 'Por favor, digite um tema para o post.' });
          if (navigator.vibrate) navigator.vibrate(200);
          return false;
      }
      if (topic.length < 3) {
          setErrors({ topic: 'O tema deve ter pelo menos 3 caracteres.' });
          return false;
      }
      setErrors({});
      return true;
  };

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    if (!topic.trim()) {
        setStep(2);
        setErrors({ topic: 'O tema é obrigatório.' });
        return;
    }
    onGenerate({ 
        category, 
        topic, 
        tone, 
        format, 
        customInstructions, // Uses the state which can be edited in Step 3
        uploadedImage, 
        evidence: initialState?.evidence 
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const categories = [
    { id: PostCategory.PATHOLOGY, icon: HeartPulse, label: "Doenças", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    { id: PostCategory.SURGERY, icon: BriefcaseMedical, label: "Cirurgias", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { id: PostCategory.SPORTS, icon: Activity, label: "Esporte", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { id: PostCategory.REHAB, icon: User, label: "Reabilitação", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
    { id: PostCategory.LIFESTYLE, icon: ShieldCheck, label: "Vida", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
    { id: PostCategory.MYTHS, icon: HelpCircle, label: "Mitos", color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-100" },
  ];

  const toneOptions = [
    { id: Tone.PROFESSIONAL, icon: Stethoscope, label: 'Profissional', desc: 'Técnico e sério.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: Tone.EMPATHETIC, icon: Heart, label: 'Empático', desc: 'Acolhedor.', color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: Tone.EDUCATIONAL, icon: GraduationCap, label: 'Didático', desc: 'Professor.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: Tone.MOTIVATIONAL, icon: Trophy, label: 'Motivacional', desc: 'Inspirador.', color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: Tone.DIRECT, icon: Target, label: 'Direto', desc: 'Sem rodeios.', color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  const progress = (step / 3) * 100;

  return (
    <div className="flex flex-col h-full animate-fadeIn w-full">
        {/* Header Progress */}
        <div className="mb-6 px-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                <span>Passo {step} de 3</span>
                <span>{step === 1 ? 'Formato' : step === 2 ? 'Conteúdo' : 'Estilo'}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500 ease-out relative" style={{ width: `${progress}%` }}></div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4 scroll-smooth">
            
            {step === 1 && (
                <div className="space-y-6 animate-slideUp">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Qual o formato?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setFormat(PostFormat.FEED)}
                            className={`relative p-6 rounded-[1.5rem] border-2 transition-all duration-300 text-left group active:scale-[0.98]
                            ${format === PostFormat.FEED 
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' 
                                : 'border-slate-100 bg-white hover:border-slate-200'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <LayoutGrid className={`w-8 h-8 ${format === PostFormat.FEED ? 'text-blue-600' : 'text-slate-300'}`} />
                                {format === PostFormat.FEED && <Check className="w-5 h-5 text-blue-600" />}
                            </div>
                            <span className={`block font-bold text-lg mb-1 ${format === PostFormat.FEED ? 'text-blue-900' : 'text-slate-900'}`}>Feed (Quadrado)</span>
                            <span className="text-xs font-medium text-slate-500 block leading-snug">Ideal para educação profunda e carrosséis.</span>
                        </button>

                        <button
                            onClick={() => setFormat(PostFormat.STORY)}
                            className={`relative p-6 rounded-[1.5rem] border-2 transition-all duration-300 text-left group active:scale-[0.98]
                            ${format === PostFormat.STORY 
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' 
                                : 'border-slate-100 bg-white hover:border-slate-200'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Smartphone className={`w-8 h-8 ${format === PostFormat.STORY ? 'text-blue-600' : 'text-slate-300'}`} />
                                {format === PostFormat.STORY && <Check className="w-5 h-5 text-blue-600" />}
                            </div>
                            <span className={`block font-bold text-lg mb-1 ${format === PostFormat.STORY ? 'text-blue-900' : 'text-slate-900'}`}>Story (Vertical)</span>
                            <span className="text-xs font-medium text-slate-500 block leading-snug">Rápido, viral e interativo.</span>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">Imagem de Referência (Opcional)</label>
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                        
                        {!uploadedImage ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-blue-300 hover:shadow-md transition-all text-slate-400 active:scale-[0.98] group"
                            >
                                <div className="p-2 bg-white rounded-full group-hover:bg-blue-50 transition-colors shadow-sm">
                                    <ImageIcon className="w-5 h-5 opacity-50 group-hover:text-blue-500 group-hover:opacity-100" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide group-hover:text-blue-600">Toque para carregar foto</span>
                            </div>
                        ) : (
                            <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-slate-200 shadow-lg group">
                                <img src={uploadedImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/10"></div>
                                <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 bg-white/90 text-red-500 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm uppercase tracking-wider hover:bg-white transition-colors">Remover</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-slideUp">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">O que vamos abordar?</h2>
                    
                    {/* Topic Input - Soft Style */}
                    <div className="relative pt-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1">
                            Tema Principal <span className="text-red-500">*</span>
                        </label>
                        <div className={`relative transition-all duration-300 transform ${errors.topic ? 'animate-shake' : ''}`}>
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => { setTopic(e.target.value); if (errors.topic) setErrors({}); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none text-lg font-medium shadow-sm transition-all placeholder:text-slate-400 text-slate-800
                                ${errors.topic 
                                    ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-100' 
                                    : 'focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`} 
                                placeholder="Ex: Dor no menisco..."
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                {errors.topic ? (
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                ) : (
                                    <Search className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                        </div>
                        {errors.topic && (
                            <p className="text-red-500 text-xs font-bold mt-2 ml-2 flex items-center gap-1 animate-fadeIn">
                                <AlertCircle className="w-3 h-3" /> {errors.topic}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-4">
                        {categories.map((cat) => (
                            <button 
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`p-4 rounded-[1.25rem] border text-left flex flex-col items-center justify-center gap-3 transition-all active:scale-[0.96] min-h-[110px] shadow-sm relative overflow-hidden group
                                ${category === cat.id 
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                    : `border-slate-100 bg-white text-slate-600 hover:border-slate-300`}`}
                            >
                                <div className={`p-2.5 rounded-full transition-colors ${category === cat.id ? 'bg-blue-600 text-white' : `${cat.bg} ${cat.color}`}`}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-bold text-center leading-tight tracking-wide ${category === cat.id ? 'text-blue-800' : ''}`}>{cat.label}</span>
                                {category === cat.id && (
                                    <div className="absolute top-2 right-2">
                                        <Check className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-slideUp">
                    {/* Strategy Cards */}
                    {isTrendMode && (
                        <div className="bg-orange-50 p-5 rounded-[1.5rem] border border-orange-100 flex items-start gap-4">
                            <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                                <Flame className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-900 text-sm uppercase tracking-wide">Modo Viral Ativado</h3>
                                <p className="text-xs text-orange-700 mt-1 leading-relaxed font-medium">Foco total em retenção e headline chamativa baseada nas trends.</p>
                            </div>
                        </div>
                    )}

                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Estilo & Contexto</h2>
                    
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tom de Voz</label>
                        <div className="grid grid-cols-2 gap-3">
                            {toneOptions.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTone(t.id)}
                                    className={`p-4 rounded-[1.25rem] border text-left flex flex-col justify-between transition-all active:scale-[0.98] min-h-[100px] relative overflow-hidden
                                    ${tone === t.id 
                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'}`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <div className={`p-2 rounded-lg transition-colors ${tone === t.id ? 'bg-blue-600 text-white' : `${t.bg} ${t.color}`}`}>
                                            <t.icon className="w-5 h-5" />
                                        </div>
                                        {tone === t.id && <Check className="w-4 h-4 text-blue-600" />}
                                    </div>
                                    <div>
                                        <span className={`block font-bold text-sm mb-0.5 ${tone === t.id ? 'text-blue-900' : ''}`}>{t.label}</span>
                                        <span className={`text-[10px] font-medium leading-tight ${tone === t.id ? 'text-blue-700' : 'text-slate-400'}`}>{t.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Instructions - Soft Style */}
                    <div className="pt-2 pb-4">
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1">
                            Instruções Extras / Palavras-chave
                        </label>
                        <div className="relative">
                            <textarea
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder="Ex: Citar que o repouso é relativo; Usar analogia do carro; Focar em prevenção..."
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none text-sm font-medium shadow-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 min-h-[100px] resize-none text-slate-800"
                            />
                            <div className="absolute top-4 right-4 text-slate-400 pointer-events-none">
                                <Edit3 className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200/60 flex items-center gap-4 bg-white/50 backdrop-blur-md md:bg-transparent -mx-4 px-6 pb-6 mt-auto">
            {isGenerating ? (
                <div className="w-full py-2 animate-fadeIn">
                    <div className="flex justify-between mb-2 px-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${loadingStage >= 1 ? 'text-blue-700' : 'text-slate-300'}`}>1. Copy</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${loadingStage >= 2 ? 'text-blue-700' : 'text-slate-300'}`}>2. Audit</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${loadingStage >= 3 ? 'text-blue-700' : 'text-slate-300'}`}>3. Image</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100 to-transparent skeleton-bg w-full"></div>
                        <div className="h-full bg-blue-600 transition-all duration-[2000ms] ease-linear" style={{ width: `${loadingStage * 33}%` }}></div>
                    </div>
                    <p className="text-center text-xs text-slate-500 font-bold mt-3 animate-pulse uppercase tracking-wide">
                        {loadingStage === 1 && "Escrevendo legenda..."}
                        {loadingStage === 2 && "Verificando regras do CFM..."}
                        {loadingStage === 3 && "Gerando imagem exclusiva..."}
                    </p>
                </div>
            ) : (
                <>
                    {step > 1 && (
                        <button onClick={handleBack} className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-95 shadow-sm transition-all">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    
                    {step < 3 ? (
                        <button onClick={handleNext} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-[0.98] text-sm uppercase tracking-wide transition-all">
                            Próximo <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className={`flex-1 bg-gradient-to-r ${isTrendMode ? 'from-orange-500 to-red-600' : 'from-blue-600 to-indigo-600'} text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] text-sm uppercase tracking-wide transition-all`}>
                            <Sparkles className="w-5 h-5" />
                            {isTrendMode ? 'Gerar Post Viral' : 'Gerar Post'}
                        </button>
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default PostWizard;
