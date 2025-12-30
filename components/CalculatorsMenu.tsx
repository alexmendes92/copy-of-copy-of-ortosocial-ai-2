
import React from 'react';
import { 
    Activity, ClipboardList, Bone, Calculator, 
    Scale, ChevronRight, TrendingUp, Syringe
} from 'lucide-react';

interface CalculatorsMenuProps {
    onSelectTool: (tool: string) => void;
}

const CalculatorsMenu: React.FC<CalculatorsMenuProps> = ({ onSelectTool }) => {
    
    const calculators = [
        {
            id: 'calculator', // Maps to RTS in App.tsx
            title: 'RTS Calculator',
            desc: 'Critérios de retorno ao esporte (ACL-RSI, LSI).',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            id: 'scores',
            title: 'Scores Funcionais',
            desc: 'Lysholm, IKDC, WOMAC e KOOS.',
            icon: ClipboardList,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            id: 'frax',
            title: 'FRAX Simplificado',
            desc: 'Risco de fratura por osteoporose.',
            icon: Bone,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            id: 'clinical', // Maps to Clinical Suite (BioAge, etc)
            title: 'Bio-Age & Clínica',
            desc: 'Idade biológica e análise de feridas.',
            icon: Activity,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
        {
            id: 'weight', // Will map to Clinical Suite -> Weight tool
            title: 'Carga Articular',
            desc: 'Simulador de impacto de peso no joelho.',
            icon: Scale,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50'
        },
        {
            id: 'visco', // Will map to Clinical Suite -> Visco tool
            title: 'Gestão de Visco',
            desc: 'Ciclo de ácido hialurônico.',
            icon: Syringe,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        }
    ];

    return (
        <div className="h-full bg-slate-50 flex flex-col animate-fadeIn pb-24 lg:pb-0">
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 no-scrollbar">
                
                {/* Header Banner */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-8 flex items-center gap-5 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl"></div>
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0 relative z-10 shadow-lg shadow-slate-900/20">
                        <Calculator className="w-8 h-8" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-xl font-black text-slate-900 leading-tight">Central de Cálculos</h1>
                        <p className="text-sm text-slate-500 font-medium">Ferramentas de precisão para tomada de decisão.</p>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calculators.map((calc) => (
                        <button 
                            key={calc.id}
                            onClick={() => onSelectTool(calc.id)}
                            className="group bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all text-left flex flex-col h-full active:scale-[0.98] relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-3 rounded-2xl ${calc.bg} ${calc.color}`}>
                                    <calc.icon className="w-6 h-6" />
                                </div>
                                <div className="p-2 bg-slate-50 rounded-full text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-900 mb-1 relative z-10 group-hover:text-blue-700 transition-colors">
                                {calc.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                {calc.desc}
                            </p>

                            {/* Hover Effect Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalculatorsMenu;
