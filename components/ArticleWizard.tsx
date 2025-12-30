
import React, { useState, useEffect } from 'react';
import { ArticleLength, ArticleState, TargetAudience, Tone } from '../types';
import { generateKeywordsForTopic } from '../services/geminiService';
import { 
    FileText, Key, Sparkles, Users, ArrowRight, ArrowLeft, Check, 
    PenTool, BookOpen, FlaskConical, AlertCircle, Wand2, Loader2,
    List, HelpCircle, Layers, Newspaper, Heart, Zap, Search, AlignJustify,
    Target
} from 'lucide-react';

interface ArticleWizardProps {
  onGenerate: (state: ArticleState) => void;
  isGenerating: boolean;
  initialState?: ArticleState | null;
}

const ArticleWizard: React.FC<ArticleWizardProps> = ({ onGenerate, isGenerating, initialState }) => {
  const [step, setStep] = useState(1);
  
  // State Fields
  const [topic, setTopic] = useState('');
  const [articleType, setArticleType] = useState('Guia Completo');
  const [keywords, setKeywords] = useState('');
  const [length, setLength] = useState<ArticleLength>(ArticleLength.MEDIUM);
  const [audience, setAudience] = useState<TargetAudience>(TargetAudience.PATIENT);
  const [mainQuestion, setMainQuestion] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.EMPATHETIC);
  
  const [errors, setErrors] = useState<{topic?: string, keywords?: string}>({});
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);

  const isEvidenceMode = !!initialState?.evidence;

  // Pre-fill State from Evidence
  useEffect(() => {
    if (initialState) {
        setTopic(initialState.topic);
        setTone(initialState.tone);
        if (initialState.evidence) {
            setKeywords(`Estudo Científico, ${initialState.evidence.source}, ${initialState.topic}`);
        }
        if (initialState.articleType) setArticleType(initialState.articleType);
        if (initialState.mainQuestion) setMainQuestion(initialState.mainQuestion);
    }
  }, [initialState]);

  const handleGenerateKeywords = async () => {
      if (!topic.trim()) {
          setErrors({ topic: "Digite um tema primeiro para gerar palavras-chave." });
          return;
      }
      setIsGeneratingKeywords(true);
      try {
          const generated = await generateKeywordsForTopic(topic);
          setKeywords(generated);
          setErrors({});
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingKeywords(false);
      }
  };

  const validateStep1 = () => {
      if (!topic.trim()) {
          setErrors({ topic: "O tema do artigo é obrigatório." });
          return false;
      }
      setErrors({});
      return true;
  };

  const handleNext = () => {
      if (step === 1 && !validateStep1()) return;
      setStep(prev => prev + 1);
  };
  
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    onGenerate({ 
        topic, 
        keywords, 
        length, 
        audience, 
        tone, 
        articleType,
        mainQuestion,
        evidence: initialState?.evidence 
    });
  };

  const progress = (step / 5) * 100;

  const articleTypes = [
      { id: 'Guia Completo', label: 'Guia Completo', icon: BookOpen, desc: 'Explicação profunda de A a Z.' },
      { id: 'Lista', label: 'Lista (5 Dicas)', icon: List, desc: 'Formato rápido e direto.' },
      { id: 'Mitos e Verdades', label: 'Mitos e Verdades', icon: HelpCircle, desc: 'Quebra de objeções.' },
      { id: 'Estudo de Caso', label: 'Estudo de Caso', icon: Layers, desc: 'História real (anonimizada).' },
  ];

  const tones = [
      { id: Tone.EMPATHETIC, label: 'Empático', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
      { id: Tone.PROFESSIONAL, label: 'Profissional', icon: PenTool, color: 'text-blue-600', bg: 'bg-blue-50' },
      { id: Tone.EDUCATIONAL, label: 'Didático', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { id: Tone.DIRECT, label: 'Direto', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const stepTitles = ['Conceito', 'Persona', 'Dores', 'Estilo', 'SEO'];

  return (
    <div className="flex flex-col h-full animate-fadeIn pb-24 lg:pb-0">
        
        {/* Progress Header */}
        <div className="mb-6 px-1">
             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <span>Fase {step} de 5</span>
                <span>{stepTitles[step - 1]}</span>
             </div>
             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out shadow-sm" style={{ width: `${progress}%` }}></div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-4">
            
            {/* Step 1: Concept */}
            {step === 1 && (
                <div className="space-y-6 animate-slideUp">
                     {/* Evidence Banner */}
                     {isEvidenceMode && (
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3 items-center shadow-sm">
                            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                                <FlaskConical className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest block mb-0.5">Modo Científico (RAG)</span>
                                <p className="text-xs font-bold text-slate-700 line-clamp-1">{initialState?.evidence?.title}</p>
                            </div>
                        </div>
                     )}

                    <div>
                        <label className="text-xl font-black text-slate-900 mb-4 block">Sobre o que vamos escrever?</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => { setTopic(e.target.value); if(errors.topic) setErrors({...errors, topic: undefined}); }}
                                className={`w-full px-5 py-5 bg-white border-2 rounded-2xl outline-none transition-all text-lg font-bold shadow-sm ${errors.topic ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
                                placeholder="Ex: Dor no Joelho ao Agachar"
                                autoFocus
                            />
                            {errors.topic && <div className="absolute right-4 top-5 text-red-500"><AlertCircle className="w-6 h-6" /></div>}
                        </div>
                        {errors.topic && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{errors.topic}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block ml-1">Formato do Artigo</label>
                        <div className="grid grid-cols-2 gap-3">
                            {articleTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setArticleType(type.id)}
                                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-28 relative overflow-hidden group active:scale-[0.98]
                                    ${articleType === type.id 
                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                        : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                >
                                    <div className={`p-2 rounded-xl w-fit ${articleType === type.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <type.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className={`block font-bold text-sm ${articleType === type.id ? 'text-blue-900' : 'text-slate-700'}`}>{type.label}</span>
                                        <span className="text-[10px] text-slate-400 font-medium leading-tight">{type.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Target Persona */}
            {step === 2 && (
                <div className="space-y-6 animate-slideUp">
                    <h2 className="text-xl font-black text-slate-900">Quem é o leitor?</h2>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block ml-1">Perfil do Paciente</label>
                        <div className="space-y-2">
                             {Object.values(TargetAudience).map(a => (
                                <button
                                    key={a}
                                    onClick={() => setAudience(a)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.98]
                                    ${audience === a ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm' : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span className="font-bold text-sm">{a}</span>
                                    {audience === a && <Check className="w-5 h-5 text-purple-600" />}
                                </button>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Pain Points */}
            {step === 3 && (
                <div className="space-y-6 animate-slideUp">
                    <h2 className="text-xl font-black text-slate-900">Qual a dor real?</h2>
                    
                    <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                                <Target className="w-5 h-5" />
                            </div>
                            <label className="text-xs font-bold text-orange-800 uppercase tracking-widest">
                                Dúvida Principal (Pain Point)
                            </label>
                        </div>
                        
                        <textarea 
                            value={mainQuestion}
                            onChange={(e) => setMainQuestion(e.target.value)}
                            placeholder="Ex: É perigoso esperar para operar? Vai doer muito? Quanto tempo de muleta?"
                            className="w-full bg-white p-4 rounded-xl border border-orange-200 text-sm font-medium outline-none focus:ring-4 focus:ring-orange-200/50 text-slate-700 placeholder:text-slate-300 resize-none h-32"
                        />
                        <p className="text-xs text-orange-600 mt-3 font-medium px-1">
                            💡 Seja específico. A IA usará isso para criar empatia profunda no texto.
                        </p>
                    </div>
                </div>
            )}

            {/* Step 4: Style */}
            {step === 4 && (
                <div className="space-y-6 animate-slideUp">
                    <h2 className="text-xl font-black text-slate-900">Qual a sua voz?</h2>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {tones.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTone(t.id)}
                                className={`p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-[0.98]
                                ${tone === t.id 
                                    ? `border-slate-900 bg-slate-900 text-white shadow-lg` 
                                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                            >
                                <div className={`p-2 rounded-xl ${tone === t.id ? 'bg-white/20 text-white' : `${t.bg} ${t.color}`}`}>
                                    <t.icon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm flex-1 text-left">{t.label}</span>
                                {tone === t.id && <Check className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 5: SEO & Details */}
            {step === 5 && (
                <div className="space-y-6 animate-slideUp">
                    <h2 className="text-xl font-black text-slate-900">Alcance & Tamanho</h2>
                    
                    {/* Keyword Gen */}
                    <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="w-full pl-4 pr-24 py-4 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                placeholder="Palavras-chave..."
                            />
                            <button 
                                onClick={handleGenerateKeywords}
                                disabled={isGeneratingKeywords || !topic}
                                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md active:scale-95"
                            >
                                {isGeneratingKeywords ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                IA
                            </button>
                        </div>
                    </div>

                    {/* Length Selection */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block ml-1">Tamanho do Texto</label>
                        <div className="space-y-3">
                             {Object.values(ArticleLength).map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLength(l)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-center gap-3
                                    ${length === l ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'}`}
                                >
                                    <div className={`p-2 rounded-lg ${length === l ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <AlignJustify className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${length === l ? 'text-slate-900' : ''}`}>{l.split('(')[0]}</div>
                                        <div className="text-[10px] text-slate-400 font-bold">{l.split('(')[1].replace(')', '')}</div>
                                    </div>
                                </button>
                             ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Navigation / Loading Animation */}
        <div className="pt-4 border-t border-slate-200/60 bg-white/50 backdrop-blur-md -mx-4 px-6 pb-6 mt-auto">
             {isGenerating ? (
                 <div className="w-full flex flex-col items-center justify-center py-2 animate-fadeIn">
                     <div className="flex gap-1 mb-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                     </div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Escrevendo Artigo...</p>
                 </div>
             ) : (
                 <div className="flex gap-3">
                    {step > 1 && (
                        <button onClick={handleBack} className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-95 shadow-sm transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    
                    {step < 5 ? (
                        <button onClick={handleNext} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-[0.98] text-sm uppercase tracking-wide transition-all">
                            Próximo <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all uppercase tracking-wide text-sm">
                            <BookOpen className="w-5 h-5" /> Gerar Artigo
                        </button>
                    )}
                 </div>
             )}
        </div>
    </div>
  );
};

export default ArticleWizard;
