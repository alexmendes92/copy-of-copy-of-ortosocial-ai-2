import React, { useState } from 'react';
import { ConversionState, ConversionFormat } from '../types';
import { Video, BookOpen, Target, AlertTriangle, ArrowRight, ArrowLeft, Zap, BrainCircuit, Lightbulb } from 'lucide-react';

interface ConversionWizardProps {
  onGenerate: (state: ConversionState) => void;
  isGenerating: boolean;
}

const ConversionWizard: React.FC<ConversionWizardProps> = ({ onGenerate, isGenerating }) => {
  const [step, setStep] = useState(1);
  const [pathology, setPathology] = useState('Artrose de Joelho');
  const [objection, setObjection] = useState('Medo de que a prótese não dure');
  const [format, setFormat] = useState<ConversionFormat>('REELS');

  const handleSubmit = () => {
    onGenerate({ pathology, objection, format });
  };

  const pathologies = ["Artrose de Joelho", "Condromalácia", "Menisco", "LCA", "Quadril"];
  const objections = [
    "Medo da dor pós-operatória",
    "Medo de ficar 'travado'",
    "Achar que é 'muito novo'",
    "Achar que é 'muito velho'",
    "Custo / Convênio",
    "Tempo de recuperação"
  ];

  return (
    <div className="flex flex-col h-full animate-fadeIn pb-24 lg:pb-0">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
            <div className={`flex flex-col items-center gap-2 ${step === 1 ? 'text-red-600' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === 1 ? 'border-red-600 bg-red-50' : 'border-slate-200'}`}>1</div>
                <span className="text-[10px] font-bold uppercase">Estratégia</span>
            </div>
            <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
            <div className={`flex flex-col items-center gap-2 ${step === 2 ? 'text-red-600' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === 2 ? 'border-red-600 bg-red-50' : 'border-slate-200'}`}>2</div>
                <span className="text-[10px] font-bold uppercase">Objeção</span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-1">
            
            {/* STEP 1: Format & Pathology */}
            {step === 1 && (
                <div className="space-y-8 animate-slideUp">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Qual formato usar?</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setFormat('REELS')}
                                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3
                                ${format === 'REELS' ? 'border-red-500 bg-red-50 scale-[1.02] shadow-md' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                                <div className={`p-3 rounded-full ${format === 'REELS' ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-400'}`}>
                                    <Video className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-900">Reels (Vídeo)</span>
                                    <span className="block text-xs text-slate-500 mt-1">60s para atrair atenção</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => setFormat('DEEP_ARTICLE')}
                                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3
                                ${format === 'DEEP_ARTICLE' ? 'border-red-500 bg-red-50 scale-[1.02] shadow-md' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                                <div className={`p-3 rounded-full ${format === 'DEEP_ARTICLE' ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-400'}`}>
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-900">Artigo Fundo</span>
                                    <span className="block text-xs text-slate-500 mt-1">Persuasão detalhada</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">Patologia Principal</h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {pathologies.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPathology(p)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border
                                    ${pathology === p 
                                        ? 'bg-slate-800 text-white border-slate-800' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <input 
                            type="text"
                            value={pathology}
                            onChange={(e) => setPathology(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-colors"
                            placeholder="Outra patologia..."
                        />
                    </div>
                </div>
            )}

            {/* STEP 2: Objection */}
            {step === 2 && (
                <div className="space-y-6 animate-slideUp">
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center">
                        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Qual o medo do paciente?</h2>
                        <p className="text-sm text-slate-600">A IA usará psicologia comportamental para reverter este pensamento.</p>
                    </div>

                    <div className="space-y-2">
                        {objections.map(obj => (
                            <button
                                key={obj}
                                onClick={() => setObjection(obj)}
                                className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between
                                ${objection === obj 
                                    ? 'border-red-500 bg-red-50 text-red-900 font-medium' 
                                    : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'}`}
                            >
                                {obj}
                                {objection === obj && <Target className="w-4 h-4 text-red-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>

        {/* Navigation / Animation */}
        <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-3">
             {isGenerating ? (
                 <div className="w-full flex flex-col items-center justify-center py-4 animate-fadeIn">
                     <div className="relative mb-3">
                        <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-white p-4 rounded-full shadow-lg border border-red-100">
                            <BrainCircuit className="w-8 h-8 text-red-600 animate-pulse" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                             <Lightbulb className="w-4 h-4 text-yellow-500 animate-bounce" />
                        </div>
                     </div>
                     <p className="text-sm font-bold text-slate-700">Analisando Psicologia...</p>
                     <p className="text-xs text-slate-400 animate-pulse">Criando argumentos irrefutáveis</p>
                 </div>
             ) : (
                 <>
                    {step > 1 && (
                        <button onClick={() => setStep(1)} className="p-4 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    
                    {step === 1 ? (
                        <button onClick={() => setStep(2)} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            Continuar <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all group">
                             <Zap className="w-5 h-5 group-hover:text-yellow-300 transition-colors" /> Quebrar Objeção
                        </button>
                    )}
                 </>
             )}
        </div>
    </div>
  );
};

export default ConversionWizard;