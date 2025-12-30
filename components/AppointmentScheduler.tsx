import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentStatus, AppointmentType, Tone } from '../types';
import { 
    Calendar, User, Bone, Syringe, Activity, Star, Send, DollarSign, FileText, Mic, 
    ChevronLeft, ChevronRight, Search, Filter, AlertOctagon, ClipboardList,
    Printer, Phone, Mail, PauseCircle, X, Sparkles, MessageCircle, CheckCircle2
} from 'lucide-react';
import { generateAppointmentMessage } from '../services/geminiService';

// Extended Mock Data
const initialAppointments: Appointment[] = [
    { 
        id: '1', patientName: 'Ana Clara Souza', date: '2024-10-25', time: '09:00', type: 'first_visit', status: 'confirmed', phone: '5511999999999',
        financialStatus: 'paid', value: 800, tags: ['VIP', 'Indicação'], notes: 'Dor há 3 meses.'
    },
    { 
        id: '2', patientName: 'Roberto Mendes', date: '2024-10-25', time: '10:30', type: 'post_op', status: 'checkin', phone: '5511988888888',
        financialStatus: 'insurance', tags: ['Pós-Op'], notes: 'Retirada de pontos.'
    },
    { 
        id: '3', patientName: 'Fernanda Oliveira', date: '2024-10-25', time: '14:00', type: 'surgery', status: 'confirmed', phone: '5511977777777',
        financialStatus: 'pending', value: 15000, tags: ['Prioridade', 'Atleta'], 
        surgeryChecklist: { fasting: true, exams: true, materials: false, anesthetist: true }
    },
    { 
        id: '4', patientName: 'Carlos Lima', date: '2024-10-25', time: '14:00', type: 'infiltration', status: 'pending', phone: '5511966666666',
        financialStatus: 'pending', value: 2500, tags: ['Dor Crônica']
    },
    { 
        id: '5', patientName: 'Mariana Costa', date: '2024-10-26', time: '11:00', type: 'first_visit', status: 'confirmed', phone: '5511955555555',
        financialStatus: 'paid', value: 800
    },
];

const waitlistData: Appointment[] = [
    { id: 'w1', patientName: 'João Silva', date: '', time: '', type: 'first_visit', status: 'pending', phone: '', notes: 'Prefere manhã', tags: ['Espera'] }
];

const AppointmentScheduler = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [currentDate, setCurrentDate] = useState(new Date('2024-10-25'));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'agenda' | 'waitlist'>('agenda');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const displayDate = (date: Date) => date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  
  const handleDateChange = (days: number) => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);
      setCurrentDate(newDate);
  };

  const getStatusColor = (status: AppointmentStatus) => {
      switch(status) {
          case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
          case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
          case 'checkin': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'completed': return 'bg-slate-100 text-slate-500 border-slate-200';
          default: return 'bg-gray-100 text-gray-500';
      }
  };

  const getTypeIcon = (type: AppointmentType) => {
      switch(type) {
          case 'surgery': return <Bone className="w-4 h-4 text-red-500" />;
          case 'infiltration': return <Syringe className="w-4 h-4 text-purple-500" />;
          case 'post_op': return <Activity className="w-4 h-4 text-blue-500" />;
          default: return <User className="w-4 h-4 text-slate-500" />;
      }
  };

  const filteredAppointments = useMemo(() => {
      let filtered = appointments.filter(a => {
          if (activeTab === 'agenda') return a.date === formatDate(currentDate);
          return true;
      });

      if (searchTerm) {
          filtered = filtered.filter(a => a.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      
      if (filterType !== 'all') {
          filtered = filtered.filter(a => a.type === filterType);
      }

      return filtered.sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, currentDate, searchTerm, activeTab, filterType]);

  const stats = useMemo(() => {
      const total = filteredAppointments.length;
      const revenue = filteredAppointments.reduce((acc, curr) => acc + (curr.value || 0), 0);
      const surgeries = filteredAppointments.filter(a => a.type === 'surgery').length;
      return { total, revenue, surgeries };
  }, [filteredAppointments]);

  const toggleFinancial = (id: string) => {
      setAppointments(prev => prev.map(a => {
          if (a.id !== id) return a;
          const nextStatus = a.financialStatus === 'paid' ? 'pending' : 'paid';
          return { ...a, financialStatus: nextStatus };
      }));
  };

  const toggleChecklist = (id: string, item: keyof NonNullable<Appointment['surgeryChecklist']>) => {
      setAppointments(prev => prev.map(a => {
          if (a.id !== id || !a.surgeryChecklist) return a;
          return {
              ...a,
              surgeryChecklist: { ...a.surgeryChecklist, [item]: !a.surgeryChecklist[item] }
          };
      }));
  };

  const handleGenerateMessage = async (apt: Appointment) => {
      setIsGenerating(true);
      setSelectedAppointment(apt);
      try {
          const msg = await generateAppointmentMessage({ appointment: apt, tone: Tone.PROFESSIONAL });
          setGeneratedMessage(msg);
      } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[140px]">
          <div className={`p-2 rounded-xl ${color} bg-opacity-10 text-current`}>
              <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
              <p className="text-base font-black text-slate-900 leading-none mt-0.5">{value}</p>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fadeIn pb-24 lg:pb-0">
        
        {/* Inline Controls (Replacing Sticky Header) */}
        <div className="p-4 space-y-4">
            
            {/* Date Navigator */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                <button onClick={() => handleDateChange(-1)} className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-500 active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                <div className="text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agenda</span>
                    <span className="block text-sm font-black text-slate-900 capitalize">{displayDate(currentDate)}</span>
                </div>
                <button onClick={() => handleDateChange(1)} className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-500 active:scale-95"><ChevronRight className="w-5 h-5" /></button>
            </div>

            {/* Stats Scroller */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                <StatCard icon={User} label="Pacientes" value={stats.total} color="text-blue-600 bg-blue-600" />
                <StatCard icon={Bone} label="Cirurgias" value={stats.surgeries} color="text-red-500 bg-red-500" />
                <StatCard icon={DollarSign} label="Previsão" value={`R$ ${stats.revenue.toLocaleString()}`} color="text-green-600 bg-green-600" />
            </div>

            {/* Search & Tabs */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar paciente..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <button className="p-3 bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 active:scale-95 transition-transform"><Filter className="w-5 h-5" /></button>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('agenda')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'agenda' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                        Agenda do Dia
                    </button>
                    <button 
                        onClick={() => setActiveTab('waitlist')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'waitlist' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                        Espera <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">{waitlistData.length}</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Appointment List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
            {(activeTab === 'agenda' ? filteredAppointments : waitlistData).map((apt, idx, arr) => {
                const hasConflict = idx > 0 && arr[idx-1].time === apt.time && apt.time !== '';

                return (
                <div key={apt.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${apt.status === 'confirmed' ? 'bg-green-500' : apt.type === 'surgery' ? 'bg-red-500' : 'bg-slate-300'}`}></div>

                    <div className="p-4 pl-5">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-lg font-black text-slate-700">{apt.time || '--:--'}</span>
                                {hasConflict && (
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                        <AlertOctagon className="w-3 h-3" /> Conflito
                                    </span>
                                )}
                                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(apt.status)}`}>
                                    {apt.status}
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={() => window.open(`https://wa.me/${apt.phone}`)} className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"><MessageCircle className="w-4 h-4" /></button>
                                <button onClick={() => handleGenerateMessage(apt)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Sparkles className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                {apt.patientName}
                                {apt.tags?.includes('VIP') && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase bg-slate-50 px-1.5 py-0.5 rounded">
                                    {getTypeIcon(apt.type)} {apt.type.replace('_', ' ')}
                                </div>
                                {apt.tags?.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {apt.type === 'surgery' && apt.surgeryChecklist && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase">
                                    <ClipboardList className="w-3 h-3" /> Checklist Pré-Op
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(apt.surgeryChecklist).map(([key, checked]) => (
                                        <button 
                                            key={key}
                                            onClick={() => toggleChecklist(apt.id, key as any)}
                                            className={`flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg border transition-all ${
                                                checked ? 'bg-green-100 border-green-200 text-green-800 font-bold' : 'bg-white border-slate-200 text-slate-400'
                                            }`}
                                        >
                                            {checked ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-slate-300"></div>}
                                            <span className="capitalize">{key === 'anesthetist' ? 'Anestesista' : key === 'fasting' ? 'Jejum' : key}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                             <div className="flex gap-2">
                                <button className="p-1.5 text-slate-400 bg-slate-50 rounded-lg hover:text-slate-600"><FileText className="w-4 h-4" /></button>
                                <button className="p-1.5 text-slate-400 bg-slate-50 rounded-lg hover:text-slate-600"><Printer className="w-4 h-4" /></button>
                             </div>
                             
                             <button 
                                onClick={() => toggleFinancial(apt.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border flex items-center gap-1.5 transition-all ${
                                    apt.financialStatus === 'paid' ? 'bg-green-50 border-green-200 text-green-700' : 
                                    apt.financialStatus === 'insurance' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-orange-50 border-orange-200 text-orange-700'
                                }`}
                            >
                                <DollarSign className="w-3 h-3" />
                                {apt.financialStatus === 'paid' ? 'Pago' : apt.financialStatus === 'insurance' ? 'Convênio' : 'Pendente'}
                            </button>
                        </div>
                    </div>
                </div>
            )})}
            
            {filteredAppointments.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Nenhum agendamento encontrado.</p>
                </div>
            )}
        </div>

        {/* Message Modal */}
        {selectedAppointment && (
            <div className="fixed inset-0 bg-black/60 z-[70] flex items-end lg:items-center justify-center p-0 lg:p-4 animate-fadeIn backdrop-blur-sm">
                <div className="bg-white w-full lg:max-w-md rounded-t-3xl lg:rounded-3xl p-6 shadow-2xl animate-slideUp">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900">Mensagem WhatsApp</h3>
                        <button onClick={() => setSelectedAppointment(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
                    </div>
                    
                    {isGenerating ? (
                        <div className="h-40 flex flex-col items-center justify-center gap-3 text-blue-600 font-bold bg-blue-50 rounded-2xl border border-blue-100">
                            <Sparkles className="w-8 h-8 animate-spin" /> 
                            <span className="text-sm">Criando texto personalizado...</span>
                        </div>
                    ) : (
                        <textarea 
                            value={generatedMessage} 
                            onChange={e => setGeneratedMessage(e.target.value)} 
                            className="w-full h-40 p-4 bg-slate-50 rounded-2xl text-base border-2 border-slate-100 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                        />
                    )}
                    
                    <button 
                        onClick={() => window.open(`https://wa.me/${selectedAppointment.phone}?text=${encodeURIComponent(generatedMessage)}`)}
                        className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                    >
                        <Send className="w-5 h-5" /> Enviar no WhatsApp
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default AppointmentScheduler;