
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Bone, Info, AlertTriangle, CheckCircle2, RotateCcw, Share2, Flame } from 'lucide-react';

const FraxCalculator: React.FC = () => {
  const [result, setResult] = useState<'low' | 'medium' | 'high' | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  
  // Inputs
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [fractureHistory, setFractureHistory] = useState(false);
  const [parentHip, setParentHip] = useState(false);
  const [smoking, setSmoking] = useState(false);
  const [glucocorticoids, setGlucocorticoids] = useState(false);
  const [ra, setRa] = useState(false);

  const calculateRisk = () => {
      // Very Simplified Logic for Demo Purpose (Real FRAX is complex algorithm)
      let riskScore = 0;
      const ageNum = parseInt(age);
      
      if (ageNum > 65) riskScore += 2;
      else if (ageNum > 50) riskScore += 1;

      if (fractureHistory) riskScore += 2;
      if (parentHip) riskScore += 1;
      if (smoking) riskScore += 1;
      if (glucocorticoids) riskScore += 1;
      if (ra) riskScore += 1;
      if (parseInt(weight) < 60) riskScore += 1;

      if (riskScore >= 4) setResult('high');
      else if (riskScore >= 2) setResult('medium');
      else setResult('low');
  };

  const getResultData = () => {
      switch(result) {
          case 'high': return { label: 'Alto Risco', color: 'bg-red-50 text-red-700 border-red-200', msg: 'Considerar intervenção farmacológica imediata.' };
          case 'medium': return { label: 'Risco Médio', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', msg: 'Avaliar Densitometria Óssea (DXA) para refinar.' };
          case 'low': return { label: 'Baixo Risco', color: 'bg-green-50 text-green-700 border-green-200', msg: 'Manter medidas preventivas e reavaliar.' };
          default: return { label: '', color: '', msg: '' };
      }
  };

  const handleShareImage = async () => {
      if (captureRef.current) {
          try {
              const canvas = await html2canvas(captureRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
              canvas.toBlob(async (blob) => {
                  if (blob) {
                      const file = new File([blob], 'resultado_frax.png', { type: 'image/png' });
                      if (navigator.share) {
                          try {
                              await navigator.share({ files: [file], title: 'Resultado FRAX', text: 'Avaliação de Risco' });
                          } catch (err) { console.log(err); }
                      } else {
                          const link = document.createElement('a');
                          link.download = 'frax.png';
                          link.href = canvas.toDataURL();
                          link.click();
                      }
                  }
              });
          } catch (e) { alert("Erro ao criar imagem."); }
      }
  };

  const Toggle = ({ label, value, onChange }: any) => (
      <div 
        onClick={() => onChange(!value)}
        className={`flex items-center justify-between p-4 bg-white rounded-2xl border shadow-sm transition-all cursor-pointer active:scale-[0.98] ${value ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-100'}`}
      >
          <span className="text-sm font-bold text-slate-700">{label}</span>
          <div className={`w-12 h-7 rounded-full transition-colors relative ${value ? 'bg-amber-500' : 'bg-slate-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${value ? 'left-6' : 'left-1'}`}></div>
          </div>
      </div>
  );

  return (
    <div className="h-full bg-slate-50 flex flex-col pb-24 lg:pb-0 animate-fadeIn font-sans">
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6">
            
            {result ? (
                <div className="flex flex-col items-center pt-4 animate-scaleIn max-w-lg mx-auto">
                    
                    {/* Capture Card */}
                    <div ref={captureRef} className="w-full bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl mb-6 relative overflow-hidden">
                        {/* Branding */}
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 justify-center">
                            <Flame className="w-4 h-4 text-slate-900" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Dr. Carlos Franciozi</span>
                        </div>

                        <div className={`w-full p-8 rounded-3xl border mb-6 text-center ${getResultData().color}`}>
                            <Bone className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <h2 className="text-3xl font-black mb-2 tracking-tight">{getResultData().label}</h2>
                            <p className="font-bold text-sm opacity-90 leading-relaxed">{getResultData().msg}</p>
                        </div>
                        
                        <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-slate-400" /> Recomendações
                            </h3>
                            <ul className="space-y-4 text-sm text-slate-600 font-medium">
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> 
                                    <span>Suplementação de Cálcio e Vitamina D.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> 
                                    <span>Exercícios de fortalecimento e equilíbrio.</span>
                                </li>
                                {result === 'high' && (
                                    <li className="flex gap-3 items-start text-red-700">
                                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> 
                                        <span>Avaliar Bisfosfonatos ou Denosumabe.</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={handleShareImage}
                            className="flex-1 flex items-center justify-center gap-2 text-white bg-slate-900 font-bold hover:bg-slate-800 transition-colors px-6 py-3 rounded-full shadow-lg active:scale-95"
                        >
                            <Share2 className="w-4 h-4" /> Gerar Imagem
                        </button>
                        <button 
                            onClick={() => setResult(null)}
                            className="flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm active:scale-95"
                        >
                            <RotateCcw className="w-4 h-4" /> Novo
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 max-w-lg mx-auto">
                    
                    {/* Intro Banner */}
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0">
                            <Bone className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-amber-900 text-sm">Estimativa de Risco (10 anos)</h2>
                            <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                                Ferramenta de triagem simplificada para osteoporose.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Idade</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={age} 
                                    onChange={e => setAge(e.target.value)} 
                                    className="w-full text-2xl font-black text-slate-900 placeholder:text-slate-200 outline-none bg-transparent"
                                    placeholder="00"
                                />
                                <span className="absolute right-0 bottom-1 text-xs font-bold text-slate-400">Anos</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Peso</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={weight} 
                                    onChange={e => setWeight(e.target.value)} 
                                    className="w-full text-2xl font-black text-slate-900 placeholder:text-slate-200 outline-none bg-transparent"
                                    placeholder="00"
                                />
                                <span className="absolute right-0 bottom-1 text-xs font-bold text-slate-400">Kg</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Toggle label="Fratura Prévia" value={fractureHistory} onChange={setFractureHistory} />
                        <Toggle label="Pais com Fratura de Quadril" value={parentHip} onChange={setParentHip} />
                        <Toggle label="Tabagismo Ativo" value={smoking} onChange={setSmoking} />
                        <Toggle label="Uso de Corticoides" value={glucocorticoids} onChange={setGlucocorticoids} />
                        <Toggle label="Artrite Reumatoide" value={ra} onChange={setRa} />
                    </div>

                    <button 
                        onClick={calculateRisk}
                        disabled={!age || !weight}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        Calcular Risco <Bone className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default FraxCalculator;
