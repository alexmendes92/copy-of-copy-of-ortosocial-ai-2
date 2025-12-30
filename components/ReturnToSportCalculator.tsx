
import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { RTSMetrics, RTSHistoryEntry } from '../types';
import { 
    Activity, Dumbbell, Brain, Ruler, CheckCircle, AlertTriangle, XCircle, 
    Save, History, ChevronRight, TrendingUp, TrendingDown, Minus, RefreshCw, Share2, Flame
} from 'lucide-react';

const ReturnToSportCalculator: React.FC = () => {
  const [metrics, setMetrics] = useState<RTSMetrics>({
    patientName: '',
    limbSymmetry: 85,
    painScore: 2,
    romExtension: 0,
    romFlexion: 135,
    hopTest: 80,
    psychologicalReadiness: 70
  });

  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<RTSHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const captureRef = useRef<HTMLDivElement>(null);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem('rts_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Calculation Logic
  const calculatedValues = useMemo(() => {
      const painFactor = Math.max(0, 10 - metrics.painScore) * 10; // 0-100 (100 is no pain)
      const romFactor = (metrics.romFlexion >= 130 && metrics.romExtension <= 5) ? 100 : (metrics.romFlexion / 140) * 100;
      
      const rawScore = (
        (metrics.limbSymmetry * 0.3) +
        (metrics.hopTest * 0.3) +
        (metrics.psychologicalReadiness * 0.2) +
        (painFactor * 0.1) +
        (romFactor * 0.1)
      );

      return {
          final: Math.min(100, Math.round(rawScore)),
          painNorm: painFactor,
          romNorm: Math.min(100, romFactor),
          lsi: metrics.limbSymmetry,
          hop: metrics.hopTest,
          psy: metrics.psychologicalReadiness
      };
  }, [metrics]);

  useEffect(() => {
    setScore(calculatedValues.final);
  }, [calculatedValues]);

  const handleSave = () => {
      if (!metrics.patientName.trim()) {
          alert("Digite o nome do paciente para salvar.");
          return;
      }
      const newEntry: RTSHistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          patientName: metrics.patientName,
          score: score,
          metrics: { ...metrics }
      };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('rts_history', JSON.stringify(updatedHistory));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleShareImage = async () => {
      if (captureRef.current) {
          try {
              const canvas = await html2canvas(captureRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
              canvas.toBlob(async (blob) => {
                  if (blob) {
                      const file = new File([blob], 'rts_report.png', { type: 'image/png' });
                      if (navigator.share) {
                          try { await navigator.share({ files: [file], title: 'Protocolo RTS' }); } catch (e) { console.log(e); }
                      } else {
                          const link = document.createElement('a');
                          link.download = 'rts.png';
                          link.href = canvas.toDataURL();
                          link.click();
                      }
                  }
              });
          } catch (e) { alert("Erro na imagem."); }
      }
  };

  const getStatus = (s: number) => {
      if (s >= 90) return { label: 'APTO', color: 'text-emerald-500', stroke: '#10b981', bg: 'bg-emerald-500', msg: 'Retorno total liberado.' };
      if (s >= 75) return { label: 'TREINO', color: 'text-amber-500', stroke: '#f59e0b', bg: 'bg-amber-500', msg: 'Retorno gradual/protegido.' };
      return { label: 'INAPTO', color: 'text-rose-500', stroke: '#f43f5e', bg: 'bg-rose-500', msg: 'Manter reabilitação.' };
  };

  const status = getStatus(score);

  // --- SVG RADAR CHART COMPONENT ---
  const RadarChart = ({ values }: { values: { lsi: number, hop: number, psy: number, pain: number, rom: number } }) => {
      const size = 160;
      const center = size / 2;
      const radius = 60;
      const axes = ['Força (LSI)', 'Salto (Hop)', 'Psico (ACL-RSI)', 'Dor (Inversa)', 'Mobilidade'];
      const dataValues = [values.lsi, values.hop, values.psy, values.pain, values.rom];
      
      const angleSlice = (Math.PI * 2) / 5;

      const getPoint = (val: number, i: number) => {
          const r = (val / 100) * radius;
          const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
          const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
          return `${x},${y}`;
      };

      const pointsString = dataValues.map((v, i) => getPoint(v, i)).join(' ');

      return (
          <div className="relative flex items-center justify-center">
              <svg width={size} height={size} className="overflow-visible">
                  {[25, 50, 75, 100].map((level, idx) => (
                      <polygon 
                        key={idx}
                        points={dataValues.map((_, i) => {
                            const r = (level / 100) * radius;
                            const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
                            const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none" stroke="#e2e8f0" strokeWidth="1" 
                      />
                  ))}
                  
                  {dataValues.map((_, i) => {
                      const end = getPoint(100, i).split(',');
                      return <line key={i} x1={center} y1={center} x2={end[0]} y2={end[1]} stroke="#e2e8f0" strokeWidth="1" />;
                  })}

                  <polygon points={pointsString} fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" />
                  
                  {dataValues.map((v, i) => {
                      const [x, y] = getPoint(v, i).split(',');
                      return <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />;
                  })}

                  {axes.map((label, i) => {
                      const rLabel = radius + 15;
                      const x = center + rLabel * Math.cos(i * angleSlice - Math.PI / 2);
                      const y = center + rLabel * Math.sin(i * angleSlice - Math.PI / 2);
                      return (
                          <text 
                            key={i} x={x} y={y} fontSize="8" textAnchor="middle" alignmentBaseline="middle" fill="#64748b" className="font-bold uppercase tracking-wider"
                          >
                              {label}
                          </text>
                      );
                  })}
              </svg>
          </div>
      );
  };

  const CustomSlider = ({ label, value, min, max, onChange, unit = '', color = 'bg-slate-900' }: any) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
        <div className="flex justify-between items-end mb-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
            <span className={`text-sm font-black ${color.replace('bg-', 'text-')}`}>
                {value}{unit}
            </span>
        </div>
        <div className="relative h-2 w-full bg-slate-100 rounded-full">
            <div 
                className={`absolute top-0 left-0 h-full rounded-full ${color}`} 
                style={{ width: `${((value - min) / (max - min)) * 100}%` }}
            ></div>
            <input 
                type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div 
                className="absolute w-4 h-4 bg-white border-2 border-slate-200 rounded-full shadow-md top-1/2 -translate-y-1/2 pointer-events-none transition-all"
                style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 8px)` }}
            ></div>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-fadeIn pb-24 lg:pb-0 font-sans bg-slate-50">
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
            
            {/* Context Bar & History Toggle */}
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Protocolo ACL-RSI</span>
                </div>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all border active:scale-95 ${showHistory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                    {showHistory ? (
                        <>Voltar <ChevronRight className="w-3 h-3" /></>
                    ) : (
                        <><History className="w-3 h-3" /> Histórico</>
                    )}
                </button>
            </div>

            {showHistory ? (
                <div className="space-y-3 animate-slideUp pb-20">
                    {history.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <History className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-sm font-medium">Nenhum cálculo salvo.</p>
                        </div>
                    )}
                    {history.map((entry, idx) => {
                        const prevScore = idx < history.length - 1 ? history[idx+1].score : entry.score;
                        const trend = entry.score - prevScore;
                        
                        return (
                            <div key={entry.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${entry.score >= 90 ? 'bg-emerald-100 text-emerald-600' : entry.score >= 75 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {entry.score}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">{entry.patientName}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                {idx < history.length - 1 && (
                                    <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                        {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                        {Math.abs(trend)}%
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-4 animate-slideUp pb-20">
                    
                    <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 relative">
                        <div className="absolute left-4 text-slate-400"><Activity className="w-5 h-5" /></div>
                        <input 
                            type="text"
                            placeholder="Nome do Paciente"
                            value={metrics.patientName}
                            onChange={(e) => setMetrics({...metrics, patientName: e.target.value})}
                            className="w-full pl-10 pr-10 py-3 bg-slate-50 rounded-xl outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                        <button onClick={() => setMetrics({ ...metrics, patientName: '' })} className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* SCORE DASHBOARD - CAPTURE TARGET */}
                    <div ref={captureRef} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                        {/* Capture Branding */}
                        <div className="flex items-center justify-center gap-2 mb-6 border-b border-slate-50 pb-2">
                            <Flame className="w-3 h-3 text-slate-900" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Dr. Carlos Franciozi</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-48 h-24 overflow-hidden mb-2">
                                    <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>
                                    <div 
                                        className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-transparent box-border transition-all duration-700 ease-out"
                                        style={{ 
                                            background: `conic-gradient(from 180deg, #f43f5e 0%, #f59e0b 50%, #10b981 100%)`,
                                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude',
                                            transform: 'rotate(0deg)'
                                        }}
                                    ></div>
                                    <div 
                                        className="absolute bottom-0 left-1/2 w-1 h-24 bg-slate-800 origin-bottom rounded-full transition-transform duration-1000 ease-out z-20 shadow-lg"
                                        style={{ transform: `translateX(-50%) rotate(${(score / 100) * 180 - 90}deg)` }}
                                    >
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rounded-full"></div>
                                    </div>
                                </div>
                                
                                <div className="text-center -mt-6 z-20">
                                    <span className={`text-5xl font-black tracking-tighter ${status.color}`}>
                                        {score}<span className="text-2xl text-slate-300">%</span>
                                    </span>
                                    <div className={`mt-2 inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${status.bg} text-white shadow-md`}>
                                        {status.label}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <RadarChart values={{ 
                                    lsi: calculatedValues.lsi, 
                                    hop: calculatedValues.hop, 
                                    psy: calculatedValues.psy, 
                                    pain: calculatedValues.painNorm, 
                                    rom: calculatedValues.romNorm 
                                }} />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                            <p className="text-xs font-medium text-slate-500">
                                {status.msg} <span className="font-bold text-slate-800">Foque nos pontos mais próximos do centro.</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleSave}
                            className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]
                            ${saveStatus === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-900 text-white shadow-slate-900/30 hover:bg-slate-800'}`}
                        >
                            {saveStatus === 'saved' ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                            {saveStatus === 'saved' ? 'Salvo!' : 'Salvar'}
                        </button>
                        <button 
                            onClick={handleShareImage}
                            className="py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
                        >
                            <Share2 className="w-5 h-5" /> Gerar Imagem
                        </button>
                    </div>

                    {/* Inputs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomSlider label="Simetria (LSI)" value={metrics.limbSymmetry} min={0} max={100} unit="%" onChange={(v: number) => setMetrics({...metrics, limbSymmetry: v})} color="bg-indigo-500" />
                        <CustomSlider label="Hop Test" value={metrics.hopTest} min={0} max={100} unit="%" onChange={(v: number) => setMetrics({...metrics, hopTest: v})} color="bg-violet-500" />
                        <CustomSlider label="Psicológico" value={metrics.psychologicalReadiness} min={0} max={100} onChange={(v: number) => setMetrics({...metrics, psychologicalReadiness: v})} color="bg-blue-500" />
                        
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escala de Dor (EVA)</label>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${metrics.painScore > 3 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{metrics.painScore}</span>
                            </div>
                            <div className="flex gap-1">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
                                    <button key={v} onClick={() => setMetrics({...metrics, painScore: v})} className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all ${metrics.painScore === v ? 'bg-slate-900 text-white scale-110 shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}>{v}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest ml-1">Flexão</label>
                            <div className="relative">
                                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="number" value={metrics.romFlexion} onChange={(e) => setMetrics({...metrics, romFlexion: parseInt(e.target.value)})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-lg text-slate-900" />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest ml-1">Extensão</label>
                            <div className="relative">
                                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="number" value={metrics.romExtension} onChange={(e) => setMetrics({...metrics, romExtension: parseInt(e.target.value)})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-lg text-slate-900" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ReturnToSportCalculator;
