
import React, { useState, useEffect, useRef } from 'react';
import { generateAppointmentMessage } from '../services/geminiService';
import { Appointment, Tone } from '../types';
import html2canvas from 'html2canvas';
import { 
    User, MessageCircle, Send, CheckCircle2, 
    Stethoscope, Sparkles, ArrowRight, Copy, Check, FileText,
    Activity, Hospital, ChevronRight, Calendar, Clock, MapPin, Undo2, Share2, Flame
} from 'lucide-react';

type ScenarioType = 'surgery_sched' | 'post_op_check' | 'exam_result' | 'conservative';

const PatientContentWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // --- DATA STATE ---
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.EMPATHETIC);
  const [generatedMessage, setGeneratedMessage] = useState('');
  
  // Scenario Selection
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  
  // Dynamic Form Data
  const [formData, setFormData] = useState({
      date: '',
      time: '',
      location: '',
      examType: '',
      diagnosis: '',
      daysPostOp: '',
      painLevel: '',
      physioStatus: ''
  });

  const scenarios = [
      { 
          id: 'surgery_sched', 
          label: 'Agendar Cirurgia', 
          icon: Hospital, 
          color: 'bg-blue-50 border-blue-200 text-blue-700',
          desc: 'Confirmar data e jejum.'
      },
      { 
          id: 'post_op_check', 
          label: 'Pós-Operatório', 
          icon: Stethoscope, 
          color: 'bg-green-50 border-green-200 text-green-700',
          desc: 'Acompanhar dor e curativo.'
      },
      { 
          id: 'exam_result', 
          label: 'Explicar Exame', 
          icon: FileText, 
          color: 'bg-purple-50 border-purple-200 text-purple-700',
          desc: 'Resultado de RM ou RX.'
      },
      { 
          id: 'conservative', 
          label: 'Tratamento', 
          icon: Activity, 
          color: 'bg-orange-50 border-orange-200 text-orange-700',
          desc: 'Fisioterapia e remédios.'
      }
  ];

  const handleScenarioSelect = (id: string) => {
      setSelectedScenario(id as ScenarioType);
      setStep(3);
  };

  const buildContextPrompt = () => {
      let prompt = `CENÁRIO: ${scenarios.find(s => s.id === selectedScenario)?.label}.\n`;
      
      if (selectedScenario === 'surgery_sched') {
          prompt += `DETALHES: Cirurgia agendada para ${formData.date} às ${formData.time} no ${formData.location}. Reforçar jejum de 8h e levar exames.`;
      } else if (selectedScenario === 'post_op_check') {
          prompt += `DETALHES: Paciente com ${formData.daysPostOp} dias de operado. Perguntar sobre nível de dor (0-10) e se o curativo está limpo/seco.`;
      } else if (selectedScenario === 'exam_result') {
          prompt += `DETALHES: Resultado de ${formData.examType}. Diagnóstico resumido: ${formData.diagnosis}. Explicar de forma calma e propor conduta.`;
      } else if (selectedScenario === 'conservative') {
          prompt += `DETALHES: Orientar início de Fisioterapia. Status atual: ${formData.physioStatus}. Motivar a constância no tratamento.`;
      }
      return prompt;
  };

  // Mock Appointment for service compatibility
  const createMockAppointment = (): Appointment => ({
      id: 'temp',
      patientName: patientName,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      type: 'first_visit',
      status: 'confirmed',
      phone: patientPhone
  });

  const handleGenerate = async () => {
      setIsGenerating(true);
      try {
          const contextNote = buildContextPrompt();
          const msg = await generateAppointmentMessage({ 
              appointment: createMockAppointment(), 
              tone: tone,
              customNote: contextNote 
          });
          setGeneratedMessage(msg);
          setStep(4);
      } catch (e) {
          console.error(e);
          alert("Erro ao gerar mensagem. Verifique sua conexão.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleShareImage = async () => {
      if (captureRef.current) {
          try {
              const canvas = await html2canvas(captureRef.current, {
                  scale: 2, // High resolution
                  backgroundColor: '#ffffff',
                  useCORS: true
              });
              
              canvas.toBlob(async (blob) => {
                  if (blob) {
                      const file = new File([blob], 'orientacao_medica.png', { type: 'image/png' });
                      if (navigator.share) {
                          try {
                              await navigator.share({
                                  files: [file],
                                  title: 'Orientação Médica',
                                  text: `Olá ${patientName}, segue orientação médica.`
                              });
                          } catch (err) {
                              console.log('Compartilhamento cancelado ou falhou', err);
                          }
                      } else {
                          // Fallback download
                          const link = document.createElement('a');
                          link.download = 'orientacao.png';
                          link.href = canvas.toDataURL();
                          link.click();
                      }
                  }
              }, 'image/png');
          } catch (e) {
              console.error("Erro ao gerar imagem", e);
              alert("Erro ao criar imagem. Tente novamente.");
          }
      }
  };

  const resetForm = () => {
      setStep(1);
      setPatientName('');
      setPatientPhone('');
      setSelectedScenario(null);
      setFormData({
          date: '', time: '', location: '', examType: '', diagnosis: '', daysPostOp: '', painLevel: '', physioStatus: ''
      });
      setGeneratedMessage('');
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col pb-24 lg:pb-0">
        
        {/* Header Strip */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 sticky top-0 z-20 shadow-sm flex items-center justify-between">
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Portal do Paciente
            </h1>
            <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                Passo {step}/4
            </span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            
            {/* STEP 1: IDENTIFICATION */}
            {step === 1 && (
                <div className="max-w-md mx-auto space-y-6">
                    <div className="text-center pt-4 pb-6">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                            <User className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Quem é o paciente?</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome Completo</label>
                            <input 
                                type="text" 
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="w-full text-lg font-bold text-slate-900 outline-none bg-transparent placeholder:text-slate-300"
                                placeholder="Ex: João da Silva"
                                autoFocus
                            />
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp</label>
                            <input 
                                type="tel" 
                                value={patientPhone}
                                onChange={(e) => setPatientPhone(e.target.value)}
                                className="w-full text-lg font-mono font-medium text-slate-700 outline-none bg-transparent placeholder:text-slate-300"
                                placeholder="11 99999-9999"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => setStep(2)}
                        disabled={!patientName}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 active:scale-[0.98]"
                    >
                        Continuar <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* STEP 2: SCENARIO */}
            {step === 2 && (
                <div className="max-w-lg mx-auto space-y-6 animate-slideUp">
                    <div className="text-center mb-6 pt-2">
                        <h2 className="text-2xl font-black text-slate-900">Motivo do Contato</h2>
                        <p className="text-sm text-slate-500">Selecione o contexto para a IA.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {scenarios.map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => handleScenarioSelect(scenario.id)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left bg-white hover:shadow-md active:scale-[0.98] group relative overflow-hidden ${scenario.color}`}
                            >
                                <div className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm shrink-0`}>
                                    <scenario.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="block font-black text-slate-900 text-sm">{scenario.label}</span>
                                    <span className="text-xs font-bold opacity-70 block mt-0.5">{scenario.desc}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-40" />
                            </button>
                        ))}
                    </div>
                    
                    <button onClick={() => setStep(1)} className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 flex items-center justify-center gap-2">
                        <Undo2 className="w-4 h-4" /> Voltar
                    </button>
                </div>
            )}

            {/* STEP 3: FORM */}
            {step === 3 && selectedScenario && (
                <div className="max-w-lg mx-auto space-y-6 animate-slideUp">
                    <div className="flex items-center gap-3 mb-4 bg-slate-100 p-3 rounded-xl border border-slate-200">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            {React.createElement(scenarios.find(s => s.id === selectedScenario)?.icon || MessageCircle, { className: "w-5 h-5 text-slate-900" })}
                        </div>
                        <h2 className="font-bold text-slate-900 text-sm">
                            {scenarios.find(s => s.id === selectedScenario)?.label}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* SURGERY FIELDS */}
                        {selectedScenario === 'surgery_sched' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data</label>
                                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full outline-none font-bold text-slate-900 bg-transparent text-sm" />
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horário</label>
                                        <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full outline-none font-bold text-slate-900 bg-transparent text-sm" />
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hospital / Local</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-0 top-0.5 w-4 h-4 text-slate-300" />
                                        <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full pl-6 outline-none font-bold text-slate-900 placeholder:text-slate-300 bg-transparent text-sm" placeholder="Ex: Hospital Albert Einstein" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* POST OP FIELDS */}
                        {selectedScenario === 'post_op_check' && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dias de Pós-Operatório</label>
                                <input type="number" value={formData.daysPostOp} onChange={e => setFormData({...formData, daysPostOp: e.target.value})} className="w-full outline-none font-bold text-slate-900 placeholder:text-slate-300 bg-transparent" placeholder="Ex: 3 dias" />
                            </div>
                        )}

                        {/* EXAM FIELDS */}
                        {selectedScenario === 'exam_result' && (
                            <>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo do Exame</label>
                                    <input type="text" value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value})} className="w-full outline-none font-bold text-slate-900 placeholder:text-slate-300 bg-transparent" placeholder="Ex: Ressonância do Joelho" />
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Diagnóstico Resumido</label>
                                    <textarea value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} className="w-full outline-none font-medium text-slate-700 placeholder:text-slate-300 h-24 resize-none bg-transparent text-sm" placeholder="Ex: Lesão de menisco." />
                                </div>
                            </>
                        )}

                        {/* CONSERVATIVE FIELDS */}
                        {selectedScenario === 'conservative' && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status do Tratamento</label>
                                <input type="text" value={formData.physioStatus} onChange={e => setFormData({...formData, physioStatus: e.target.value})} className="w-full outline-none font-bold text-slate-900 placeholder:text-slate-300 bg-transparent" placeholder="Ex: Iniciando fortalecimento" />
                            </div>
                        )}

                        {/* Tone Selector */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Tom da Mensagem</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                <button onClick={() => setTone(Tone.PROFESSIONAL)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tone === Tone.PROFESSIONAL ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Sério</button>
                                <button onClick={() => setTone(Tone.EMPATHETIC)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tone === Tone.EMPATHETIC ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Empático</button>
                                <button onClick={() => setTone(Tone.MOTIVATIONAL)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tone === Tone.MOTIVATIONAL ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Motivador</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setStep(2)} className="flex-1 bg-white border border-slate-200 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
                            Voltar
                        </button>
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                        >
                            {isGenerating ? <Sparkles className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Gerar Mensagem</>}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: RESULT */}
            {step === 4 && (
                <div className="max-w-lg mx-auto space-y-6 animate-scaleIn">
                    <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 text-center shadow-sm">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-green-900">Tudo Pronto!</h2>
                        <p className="text-sm text-green-700 font-medium mt-1">Mensagem criada para <strong>{patientName}</strong></p>
                    </div>

                    {/* CAPTURE AREA */}
                    <div className="relative">
                        <div 
                            ref={captureRef}
                            className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            
                            {/* Branding Header for Capture */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                    <Flame className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Dr. Carlos Franciozi</h3>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Orientação Médica</p>
                                </div>
                            </div>

                            <textarea 
                                value={generatedMessage}
                                onChange={(e) => setGeneratedMessage(e.target.value)}
                                className="w-full h-64 resize-none outline-none text-slate-600 font-medium leading-relaxed bg-transparent text-sm pr-10"
                            />

                            {/* Footer for Capture */}
                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <span>CRM 111501</span>
                                <span>seujoelho.com</span>
                            </div>
                        </div>

                        {/* Copy Button (Floating) */}
                        <div className="absolute top-4 right-4 z-10">
                            <button 
                                onClick={handleCopy}
                                className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors border border-slate-100 hover:border-slate-300"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleShareImage}
                            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                        >
                            <Share2 className="w-5 h-5" /> Gerar Imagem
                        </button>
                        <button 
                            onClick={() => window.open(`https://wa.me/${patientPhone ? '55' + patientPhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(generatedMessage)}`, '_blank')}
                            className="flex-[2] bg-[#25D366] text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 hover:brightness-105 transition-all active:scale-[0.98]"
                        >
                            <Send className="w-5 h-5" /> WhatsApp Direto
                        </button>
                    </div>
                    
                    <button 
                        onClick={resetForm}
                        className="w-full text-slate-400 font-bold text-xs uppercase tracking-wide py-2 hover:text-slate-600"
                    >
                        Criar Nova Mensagem
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default PatientContentWizard;
