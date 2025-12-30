
import React, { useState } from 'react';
import { GeneratedInfographic } from '../types';
import { 
    Download, 
    Link, 
    Check, 
    ChevronDown, 
    Timer, 
    Activity, 
    AlertCircle, 
    ArrowRight,
    MapPin,
    ArrowLeft
} from 'lucide-react';

interface InfographicPreviewProps {
  data: GeneratedInfographic;
  heroImageUrl?: string;
  anatomyImageUrl?: string;
  onBack?: () => void;
}

const InfographicPreview: React.FC<InfographicPreviewProps> = ({ data, heroImageUrl, anatomyImageUrl, onBack }) => {
  const [activeTreatment, setActiveTreatment] = useState<'conservador' | 'cirurgico'>('cirurgico');
  const [activeAnatomyPoint, setActiveAnatomyPoint] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const treatmentOptions = {
    conservador: data.treatment?.options?.find(o => o.type === 'conservador'),
    cirurgico: data.treatment?.options?.find(o => o.type === 'cirurgico')
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden relative animate-fadeIn">
        
        <style>{`
            @media print {
                @page { margin: 0; size: auto; }
                body { background: white; }
                body * { visibility: hidden; }
                #infographic-print-area, #infographic-print-area * { visibility: visible; }
                #infographic-print-area { 
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 100%; 
                    margin: 0;
                    padding: 0;
                    background: white;
                    overflow: visible;
                }
                .no-print { display: none !important; }
            }
        `}</style>

        {/* Toolbar - Relative position instead of sticky to avoid double headers */}
        <div className="bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 flex-shrink-0 z-20 shadow-sm no-print">
            <div className="flex items-center gap-4">
                {onBack && (
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors bg-slate-50 border border-slate-100"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                    </button>
                )}
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100"
                >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Copiado' : 'Link'}</span>
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-md"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">PDF</span>
                </button>
            </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth bg-slate-50 w-full" id="infographic-print-area">
            
            {/* HERO SECTION */}
            <header className="relative w-full min-h-[450px] flex flex-col justify-end pb-12 overflow-hidden bg-slate-900 text-white">
                {heroImageUrl ? (
                    <img src={heroImageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="absolute inset-0 bg-slate-800 opacity-60 flex items-center justify-center text-slate-600 font-bold text-2xl">Gerando Imagem...</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                
                <div className="relative container mx-auto px-6 z-10 max-w-5xl">
                    <span className="inline-block py-1.5 px-3 rounded-lg bg-blue-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-400/30 shadow-lg">
                        Guia Visual
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black leading-none mb-4 tracking-tight">
                        {data.heroTitle}
                    </h1>
                    <p className="text-base md:text-lg text-slate-200 max-w-2xl mb-8 leading-relaxed font-medium opacity-90">
                        {data.heroSubtitle}
                    </p>
                    <div className="flex items-center gap-2 text-blue-300 font-bold text-xs animate-bounce no-print uppercase tracking-wider">
                        Deslize para ver <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </header>

            {/* ANATOMY SECTION */}
            {data.anatomy && (
            <section className="py-12 bg-white">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-black mb-3 text-slate-900 tracking-tight">Anatomia Explicada</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{data.anatomy.intro}</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Interactive Image */}
                        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200">
                             {anatomyImageUrl ? (
                                <img src={anatomyImageUrl} alt="Anatomia" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">Gerando Anatomia...</div>
                            )}
                            
                            {/* Hotspots */}
                            {data.anatomy.points?.map((point, idx) => (
                                <button 
                                    key={idx}
                                    className="absolute w-10 h-10 -ml-5 -mt-5 cursor-pointer z-10 hover:z-20 group/hotspot focus:outline-none tap-highlight-transparent"
                                    style={{ top: `${point.y}%`, left: `${point.x}%` }}
                                    onClick={() => setActiveAnatomyPoint(idx)}
                                >
                                    <span className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping"></span>
                                    <span className={`absolute inset-0 rounded-full border-[3px] border-white shadow-lg transition-all duration-300 flex items-center justify-center text-sm font-black text-white
                                        ${activeAnatomyPoint === idx ? 'bg-blue-600 scale-125' : 'bg-blue-500'}`}>
                                        {idx + 1}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Info Panel */}
                        <div className="flex-1 w-full bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 min-h-[200px] flex flex-col justify-center transition-all duration-300 shadow-sm">
                             {activeAnatomyPoint !== null && data.anatomy.points && data.anatomy.points[activeAnatomyPoint] ? (
                                <div className="animate-fadeIn">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 mb-2">{data.anatomy.points[activeAnatomyPoint].label}</h3>
                                            <p className="text-slate-600 leading-relaxed text-sm">{data.anatomy.points[activeAnatomyPoint].text}</p>
                                        </div>
                                    </div>
                                </div>
                             ) : (
                                <div className="text-center text-slate-400">
                                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Toque nos pontos da imagem para ver detalhes.</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* MECHANISM SECTION */}
            {data.mechanism && (
            <section className="py-16 bg-slate-900 text-white">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h2 className="text-2xl md:text-3xl font-black mb-6 text-blue-400 tracking-tight">{data.mechanism.title}</h2>
                    <p className="text-base text-slate-300 mb-10 max-w-3xl leading-relaxed">{data.mechanism.intro}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.mechanism.steps?.map((step, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
                                <div className="text-5xl font-black text-white/10 mb-4 select-none">0{idx + 1}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

             {/* SYMPTOMS SECTION */}
             {data.symptoms && (
             <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-6 max-w-6xl">
                    <h2 className="text-2xl md:text-3xl font-black text-center mb-10 text-slate-900 tracking-tight">Sinais e Sintomas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.symptoms.items?.map((symptom, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                                <div className="w-10 h-1 bg-blue-500 rounded-full mb-4 group-hover:w-16 transition-all"></div>
                                <h3 className="font-bold text-lg mb-2 text-slate-900">{symptom.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{symptom.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* TREATMENT SECTION */}
            {data.treatment && (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-slate-900 tracking-tight">Opções de Tratamento</h2>
                    
                    {/* Toggle */}
                    <div className="bg-slate-100 p-1.5 rounded-2xl flex mb-10 max-w-sm mx-auto relative no-print shadow-inner">
                        <div 
                            className="absolute top-1.5 bottom-1.5 w-[49%] bg-white rounded-xl shadow-sm transition-all duration-300"
                            style={{ left: activeTreatment === 'conservador' ? '0.5%' : '50.5%' }}
                        ></div>
                        <button 
                            onClick={() => setActiveTreatment('conservador')} 
                            className={`flex-1 py-3 text-center relative z-10 font-bold text-xs uppercase tracking-wide transition-colors ${activeTreatment === 'conservador' ? 'text-slate-900' : 'text-slate-500'}`}
                        >
                            Conservador
                        </button>
                        <button 
                            onClick={() => setActiveTreatment('cirurgico')} 
                            className={`flex-1 py-3 text-center relative z-10 font-bold text-xs uppercase tracking-wide transition-colors ${activeTreatment === 'cirurgico' ? 'text-slate-900' : 'text-slate-500'}`}
                        >
                            Cirúrgico
                        </button>
                    </div>

                    {/* Content */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-100">
                        {treatmentOptions[activeTreatment] && (
                            <div className="animate-fadeIn">
                                <h3 className="text-2xl font-black text-blue-600 mb-4">{treatmentOptions[activeTreatment]?.title}</h3>
                                <p className="text-slate-600 mb-8 text-base leading-relaxed">{treatmentOptions[activeTreatment]?.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                        <h4 className="font-black text-green-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Check className="w-4 h-4" /> Vantagens</h4>
                                        <ul className="space-y-3">
                                            {treatmentOptions[activeTreatment]?.pros?.map((pro, i) => (
                                                <li key={i} className="text-sm text-green-800 flex items-start gap-2 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                                                    {pro}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                        <h4 className="font-black text-red-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><AlertCircle className="w-4 h-4" /> Pontos de Atenção</h4>
                                        <ul className="space-y-3">
                                            {treatmentOptions[activeTreatment]?.cons?.map((con, i) => (
                                                <li key={i} className="text-sm text-red-800 flex items-start gap-2 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                                    {con}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <div className="bg-slate-900 p-5 rounded-2xl text-white flex gap-4 items-start shadow-lg">
                                        <div className="bg-white/10 p-2 rounded-lg shrink-0">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-400 text-xs uppercase tracking-wider block mb-1">Indicação Principal</span>
                                            <p className="text-sm font-medium leading-relaxed">{treatmentOptions[activeTreatment]?.indication}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            )}

            {/* REHAB SECTION */}
            {data.rehab && (
            <section className="py-16 bg-slate-900 text-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight">Jornada de Recuperação</h2>
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full w-fit">
                            <Timer className="w-4 h-4" />
                            <span>Tempo estimado variável</span>
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-8 snap-x scroll-smooth no-scrollbar -mx-6 px-6">
                        {data.rehab.phases?.map((phase, idx) => (
                            <div key={idx} className="min-w-[280px] md:min-w-[320px] bg-slate-800 rounded-3xl p-6 border border-slate-700 snap-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl select-none leading-none -mt-4 -mr-4">
                                    {idx + 1}
                                </div>
                                <h3 className="text-blue-400 font-bold uppercase text-[10px] tracking-widest mb-3 bg-blue-900/30 w-fit px-2 py-1 rounded-md">{phase.phase}</h3>
                                <h4 className="text-lg font-bold mb-4 leading-tight">{phase.title}</h4>
                                <ul className="space-y-3 text-slate-300">
                                    {phase.items?.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* FOOTER */}
            <footer className="bg-slate-950 text-slate-500 py-16 text-center text-sm">
                <p className="max-w-2xl mx-auto px-6 leading-relaxed opacity-70">{data.footerText}</p>
                <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest opacity-30">
                    <Activity className="w-4 h-4" /> MediSocial AI
                </div>
            </footer>
        </div>
    </div>
  );
};

export default InfographicPreview;
