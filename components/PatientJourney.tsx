
import React, { useState, useEffect } from 'react';
import { PatientJourneyState, ProtocolType, TimelineEvent, Tone } from '../types';
import { PROTOCOLS } from '../services/protocolTemplates';
import { generateAppointmentMessage } from '../services/geminiService'; // Reusing existing message gen or create new
import { 
    Calendar, CheckCircle2, MessageCircle, Clock, Video, FileText, 
    Share2, User, ChevronRight, Wand2, ArrowRight, PlayCircle, Syringe
} from 'lucide-react';

const PatientJourney: React.FC = () => {
  // Wizard State
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<PatientJourneyState>({
      patientName: '',
      surgeryDate: new Date().toISOString().split('T')[0],
      protocolType: 'LCA',
      tone: Tone.EMPATHETIC
  });

  // Timeline Data
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);

  // Helper to calculate dates
  const calculateTimeline = () => {
      const baseDate = new Date(config.surgeryDate);
      const template = PROTOCOLS[config.protocolType];
      
      const events: TimelineEvent[] = template.steps.map((step, idx) => {
          const eventDate = new Date(baseDate);
          eventDate.setDate(eventDate.getDate() + step.dayOffset);
          
          return {
              ...step,
              id: `evt-${idx}`,
              calculatedDate: eventDate.toISOString().split('T')[0],
              status: 'pending'
          };
      });
      setTimeline(events);
      setStep(2);
  };

  // Mock Generate Message (In real app, move to geminiService specific function)
  const handleGenerateMessage = async (event: TimelineEvent) => {
      setLoadingMsg(event.id);
      
      // Simulate AI delay & content generation based on event type
      setTimeout(() => {
          const names = config.patientName.split(' ');
          const firstName = names[0];
          
          let msg = `Olá ${firstName}, aqui é a equipe do Dr. Carlos. \n\n`;
          msg += `Hoje completamos ${event.dayOffset} dias da sua cirurgia de ${PROTOCOLS[config.protocolType].title.split('(')[0]}.\n\n`;
          msg += `*${event.title}*: ${event.description}\n\n`;
          
          if (event.type === 'appointment') msg += "Estamos aguardando você no consultório. Confirma?";
          else if (event.type === 'rehab') msg += "Lembre-se: A constância na fisioterapia é o segredo do sucesso.";
          else msg += "Qualquer dor fora do comum, nos avise imediatamente.";

          setTimeline(prev => prev.map(e => e.id === event.id ? { ...e, generatedMessage: msg } : e));
          setLoadingMsg(null);
      }, 1500);
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'message': return <MessageCircle className="w-4 h-4 text-white" />;
          case 'appointment': return <Calendar className="w-4 h-4 text-white" />;
          case 'rehab': return <Video className="w-4 h-4 text-white" />;
          case 'exam': return <FileText className="w-4 h-4 text-white" />;
          default: return <CheckCircle2 className="w-4 h-4 text-white" />;
      }
  };

  const getColor = (type: string) => {
      switch(type) {
          case 'message': return 'bg-green-500';
          case 'appointment': return 'bg-blue-500';
          case 'rehab': return 'bg-purple-500';
          case 'exam': return 'bg-orange-500';
          default: return 'bg-slate-500';
      }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col pb-24 lg:pb-0 animate-fadeIn">
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            
            {step === 1 && (
                <div className="max-w-lg mx-auto bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 animate-slideUp">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Configurar Protocolo</h2>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Paciente</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={config.patientName}
                                    onChange={e => setConfig({...config, patientName: e.target.value})}
                                    placeholder="Ex: João da Silva"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cirurgia Realizada</label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.keys(PROTOCOLS).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setConfig({...config, protocolType: key as ProtocolType})}
                                        className={`p-3 rounded-xl border font-bold transition-all
                                        ${config.protocolType === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'}`}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data da Cirurgia</label>
                            <input 
                                type="date" 
                                value={config.surgeryDate}
                                onChange={e => setConfig({...config, surgeryDate: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium text-slate-700 transition-all"
                            />
                        </div>

                        <button 
                            onClick={calculateTimeline}
                            disabled={!config.patientName}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Gerar Linha do Tempo <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-2xl mx-auto animate-fadeIn">
                    
                    {/* Patient Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">{config.patientName}</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                {PROTOCOLS[config.protocolType].title} • {new Date(config.surgeryDate).toLocaleDateString()}
                            </p>
                        </div>
                        <button onClick={() => setStep(1)} className="text-xs font-bold text-indigo-600 hover:underline">Editar</button>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                        {timeline.map((event, idx) => {
                            const isPast = new Date(event.calculatedDate) < new Date();
                            const isToday = new Date(event.calculatedDate).toDateString() === new Date().toDateString();

                            return (
                                <div key={idx} className="relative pl-12 group">
                                    {/* Icon Marker */}
                                    <div className={`absolute left-0 top-0 w-14 h-14 rounded-2xl border-4 border-slate-50 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110
                                        ${getColor(event.type)}`}>
                                        {getIcon(event.type)}
                                    </div>

                                    {/* Content Card */}
                                    <div className={`bg-white p-5 rounded-2xl border transition-all relative
                                        ${isToday ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'}`}>
                                        
                                        {isToday && <span className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl">HOJE</span>}

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base">{event.title}</h3>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">
                                                    {new Date(event.calculatedDate).toLocaleDateString()} • Dia {event.dayOffset}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{event.description}</p>

                                        {/* Generated Message Area */}
                                        {event.generatedMessage && (
                                            <div className="bg-green-50 p-3 rounded-xl border border-green-100 mb-4 text-xs text-green-800 whitespace-pre-line animate-scaleIn relative">
                                                {event.generatedMessage}
                                                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-green-100">
                                                    <Wand2 className="w-3 h-3 text-green-600" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {!event.generatedMessage ? (
                                                <button 
                                                    onClick={() => handleGenerateMessage(event)}
                                                    disabled={loadingMsg === event.id}
                                                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-100"
                                                >
                                                    {loadingMsg === event.id ? <Wand2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                    Gerar Mensagem
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(event.generatedMessage || '')}`)}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                >
                                                    <Share2 className="w-3 h-3" /> Enviar WhatsApp
                                                </button>
                                            )}

                                            {event.type === 'rehab' && (
                                                <button className="px-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors">
                                                    <PlayCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PatientJourney;
