
import React, { useState, useEffect } from 'react';
import { 
  Plus, Video, BookOpen, TrendingUp, Search, Bell, 
  Stethoscope, FileText, Activity, Bone, Briefcase, 
  Newspaper, PieChart, QrCode, Globe, Cuboid, GraduationCap,
  CalendarCheck2, PlayCircle, FlaskConical, ChevronRight,
  Calendar, AlertCircle, MessageCircle, Sparkles
} from 'lucide-react';
import { getUpcomingHolidays, Holiday } from '../services/externalApis';

interface DashboardProps {
  onSelectTool: (tool: string) => void;
  onQuickAction: (topic: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectTool, onQuickAction }) => {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [inputValue, setInputValue] = useState('');
  
  // API States
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingApis, setLoadingApis] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const date = new Date();
    setCurrentDate(date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));

    // Load External APIs
    const loadData = async () => {
        try {
            const holidayData = await getUpcomingHolidays();
            setHolidays(Array.isArray(holidayData) ? holidayData : []);
        } catch (e) {
            console.error("Dashboard API load error", e);
            setHolidays([]);
        } finally {
            setLoadingApis(false);
        }
    };
    loadData();
  }, []);

  const handleInputSubmit = () => {
      if (inputValue.trim()) {
          onQuickAction(inputValue);
      } else {
          onSelectTool('post');
      }
  };

  return (
    <div className="pb-32 lg:pb-12 animate-fadeIn min-h-full bg-[#F8FAFC]">
      
      {/* 1. HERO HEADER - REFORGED FOR IMPACT */}
      <div className="relative bg-white rounded-b-[3rem] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.06)] border-b border-slate-100 overflow-hidden">
          {/* Abstract BG Shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="px-6 pt-12 pb-8 relative z-10">
              <div className="flex justify-between items-start mb-8">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{currentDate}</p>
                      </div>
                      <h1 className="text-3xl lg:text-4xl font-medium text-slate-900 leading-tight tracking-tight">
                          {greeting}, <br />
                          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Dr. Carlos!</span>
                      </h1>
                  </div>
                  <div className="relative group cursor-pointer" onClick={() => onSelectTool('card')}>
                      <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                          <img 
                              src="https://seujoelho.com/wp-content/uploads/2021/01/Dr-Carlos-Franciozi-781x1024.jpg" 
                              className="w-full h-full rounded-2xl object-cover border-2 border-white" 
                              alt="Profile" 
                          />
                      </div>
                  </div>
              </div>

              {/* SEARCH PILL - THE CENTERPIECE */}
              <div className="relative w-full max-w-2xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[1.7rem] blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex items-center p-2 border border-slate-100">
                      <div className="pl-4 pr-3">
                          <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
                      </div>
                      <input 
                          type="text" 
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="O que vamos criar hoje?" 
                          className="flex-1 py-4 bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:outline-none text-lg font-medium"
                          onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  handleInputSubmit();
                              }
                          }}
                      />
                      <button 
                        onClick={handleInputSubmit}
                        className="bg-slate-900 text-white p-3.5 rounded-xl shadow-lg hover:bg-blue-600 transition-colors active:scale-95"
                      >
                          <ChevronRight className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <div className="px-6 mt-8 space-y-10 lg:space-y-12 max-w-7xl mx-auto">
        
        {/* NEW: API WIDGETS ROW */}
        {!loadingApis && holidays && holidays.length > 0 && (
            <div className="animate-slideUp">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[120px] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full blur-2xl -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-400">
                            <Calendar className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-900/50">Calendário Editorial</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {holidays.map((h, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{h.localName}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(h.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                                        </p>
                                    </div>
                                    <div className="bg-white text-slate-900 border border-slate-200 text-[10px] font-black px-2 py-1 rounded-lg">
                                        {h.daysUntil === 0 ? 'Hoje' : `+${h.daysUntil}d`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* 2. MAIN ACTIONS (Studio Grid) */}
        <div>
            <div className="flex justify-between items-end mb-5 px-1">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Studio de Criação</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Primary Action - Create Post */}
                <button 
                    onClick={() => onSelectTool('post')}
                    className="col-span-2 bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group active:scale-[0.98] transition-all"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors"></div>
                    
                    <div className="relative z-10 flex justify-between items-start h-full flex-col">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 rounded-2xl flex items-center justify-center mb-4 text-white border border-white/10">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1 tracking-tight">Post Instagram</h3>
                            <p className="text-slate-400 text-xs font-medium">Legenda, Hashtags & Imagem</p>
                        </div>
                    </div>
                </button>

                {/* Secondary - Blog/Article */}
                <button 
                    onClick={() => onSelectTool('seo')}
                    className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between h-48 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-slate-900 text-sm mb-0.5">Artigo SEO</h3>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">Blog Médico</p>
                    </div>
                </button>

                {/* Secondary - Video */}
                <button 
                    onClick={() => onSelectTool('video')}
                    className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:border-red-100 hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between h-48 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-50 to-transparent rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30 flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform">
                        <Video className="w-5 h-5" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-slate-900 text-sm mb-0.5">Vídeo</h3>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">Roteiros & Podcast</p>
                    </div>
                </button>

                {/* Tertiary - Publicações (Moved from List) */}
                <button 
                    onClick={() => onSelectTool('publications')}
                    className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between h-48 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-slate-900 text-sm mb-0.5">Publicações</h3>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">Acervo Científico (79)</p>
                    </div>
                </button>

                {/* Tertiary - Meu Site (Moved from List) */}
                <button 
                    onClick={() => onSelectTool('site')}
                    className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between h-48 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-slate-900 text-sm mb-0.5">Meu Site</h3>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">Biblioteca Digital</p>
                    </div>
                </button>

            </div>
        </div>

        {/* 3. CLINICAL TOOLS (Grid Layout with Premium Icons) */}
        <div>
            <div className="flex justify-between items-end mb-5 px-1">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" /> 
                    Ferramentas Clínicas
                </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* 1. Bio-Age */}
                <button 
                    onClick={() => onSelectTool('clinical')} 
                    className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all text-left group relative overflow-hidden active:scale-95"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-[3rem] -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white mb-3 relative z-10 group-hover:-translate-y-1 transition-transform">
                        <FlaskConical className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight relative z-10">Bio-Age</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 relative z-10">Idade Biológica</p>
                </button>

                {/* 2. Scores */}
                <button 
                    onClick={() => onSelectTool('scores')} 
                    className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all text-left group relative overflow-hidden active:scale-95"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-50 to-transparent rounded-bl-[3rem] -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-white mb-3 relative z-10 group-hover:-translate-y-1 transition-transform">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight relative z-10">Scores</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 relative z-10">Lysholm, IKDC</p>
                </button>

                {/* 3. RTS Calc */}
                <button 
                    onClick={() => onSelectTool('calculator')} 
                    className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all text-left group relative overflow-hidden active:scale-95"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-50 to-transparent rounded-bl-[3rem] -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center text-white mb-3 relative z-10 group-hover:-translate-y-1 transition-transform">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight relative z-10">RTS Calc</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 relative z-10">Retorno Esporte</p>
                </button>

                {/* 4. FRAX */}
                <button 
                    onClick={() => onSelectTool('frax')} 
                    className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all text-left group relative overflow-hidden active:scale-95"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-50 to-transparent rounded-bl-[3rem] -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 shadow-lg shadow-violet-500/30 flex items-center justify-center text-white mb-3 relative z-10 group-hover:-translate-y-1 transition-transform">
                        <Bone className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight relative z-10">FRAX</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 relative z-10">Risco Fratura</p>
                </button>

            </div>
        </div>

        {/* 4. MANAGEMENT LIST (Reduced) */}
        <div className="pb-8">
            <h2 className="text-lg font-black text-slate-900 mb-5 px-1 tracking-tight">Gestão & Marca</h2>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50 lg:grid lg:grid-cols-2 lg:gap-0 lg:divide-y-0 lg:divide-x">
                
                {[
                    { id: 'patient_content', label: 'Portal do Paciente', icon: MessageCircle, gradient: 'from-green-400 to-green-600', shadow: 'shadow-green-500/30' },
                    { id: 'marketing_roi', label: 'ROI Marketing', icon: PieChart, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/30' },
                    { id: 'card', label: 'Cartão Digital', icon: QrCode, gradient: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-500/30' },
                    { id: 'news', label: 'Notícias', icon: Newspaper, gradient: 'from-pink-400 to-pink-600', shadow: 'shadow-pink-500/30' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => onSelectTool(item.id)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors active:bg-slate-100 group lg:border-b lg:border-slate-50 lg:last:border-b-0 lg:nth-last-child-2:border-b-0"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadow} group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className="flex-1 text-left font-bold text-sm text-slate-900">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                    </button>
                ))}

            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
