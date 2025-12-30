import React, { useState } from 'react';
import { InfographicState, PatientProfile, Tone } from '../types';
import { Sparkles, Stethoscope, UserCircle, MessageSquare, StickyNote, ArrowRight, ArrowLeft, ScanLine, Activity } from 'lucide-react';

interface InfographicWizardProps {
  onGenerate: (state: InfographicState) => void;
  isGenerating: boolean;
}

const InfographicWizard: React.FC<InfographicWizardProps> = ({ onGenerate, isGenerating }) => {
  const [step, setStep] = useState(1);
  const [diagnosis, setDiagnosis] = useState('');
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(PatientProfile.ADULT);
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onGenerate({ diagnosis, patientProfile, tone, notes });
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn pb-24 lg:pb-0">
        
        {/* Simple Steps */}
        <div className="flex gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-100'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-100'}`} />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-1">
            
            {/* STEP 1: Diagnosis */}
            {step === 1 && (
                <div className="space-y-8 animate-slideUp">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                             <Stethoscope className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Qual o caso clínico?</h2>
                        <p className="text-slate-500 mt-2 text-sm">A IA criará anatomia, sintomas e tratamentos baseados nisso.</p>
                    </div>

                    <div>
                        <input 
                            type="text" 
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Ex: Ruptura de LCA, Tendinite..."
                            autoFocus
                            className="w-full text-center px-4 py-6 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-xl font-bold text-slate-800 placeholder:text-slate-300"
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                         <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                         <div className="text-sm text-blue-800">
                             <span className="font-bold block">Dica Pro:</span>
                             Seja específico. "LCA em Atleta" gera resultados diferentes de "LCA em Idoso".
                         </div>
                    </div>
                </div>
            )}

            {/* STEP 2: Customization */}
            {step === 2 && (
                <div className="space-y-6 animate-slideUp">
                    <h2 className="text-xl font-bold text-slate-900">Ajustes Finos</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Perfil do Paciente</label>
                             <select
                                value={patientProfile}
                                onChange={(e) => setPatientProfile(e.target.value as PatientProfile)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                {Object.values(PatientProfile).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tom de Voz</label>
                             <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value as Tone)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Notas Específicas</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ex: Focar apenas no tratamento conservador..."
                            rows={4}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-colors resize-none"
                        />
                    </div>
                </div>
            )}
        </div>

         {/* Navigation / Animation */}
         <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-3">
             {isGenerating ? (
                 <div className="w-full flex flex-col items-center justify-center py-4 animate-fadeIn">
                     <div className="relative mb-3">
                        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-white p-4 rounded-full shadow-lg border border-indigo-100 overflow-hidden">
                            <ScanLine className="w-8 h-8 text-indigo-600 animate-pulse" />
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30 animate-slideUp" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }}></div>
                        </div>
                     </div>
                     <p className="text-sm font-bold text-slate-700">Mapeando Anatomia...</p>
                     <p className="text-xs text-slate-400 animate-pulse">Estruturando sintomas e tratamentos</p>
                 </div>
             ) : (
                 <>
                    {step > 1 && (
                        <button onClick={() => setStep(1)} className="p-4 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    
                    {step === 1 ? (
                        <button 
                            onClick={() => diagnosis && setStep(2)}
                            disabled={!diagnosis}
                            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                            ${diagnosis ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                            Continuar <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-indigo-700 group">
                             <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" /> Gerar Visual
                        </button>
                    )}
                 </>
             )}
        </div>
    </div>
  );
};

export default InfographicWizard;