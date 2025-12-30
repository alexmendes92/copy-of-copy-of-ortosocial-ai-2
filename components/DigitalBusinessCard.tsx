
import React, { useState, useEffect } from 'react';
import { Share2, Download, Smartphone, Check, UserPlus, QrCode, MessageCircle, Edit3, Save, Eye, MapPin, Globe, Activity, Cuboid, Weight, ArrowRight, ToggleRight, ToggleLeft } from 'lucide-react';

const DigitalBusinessCard: React.FC = () => {
  // State for Edit Mode
  const [isEditing, setIsEditing] = useState(false);

  // Doctor Data State
  const [doctorData, setDoctorData] = useState({
    name: "Dr. Carlos Franciozi",
    title: "Cirurgião de Joelho e Ombro",
    org: "Instituto de Ortopedia",
    phone: "5511998447964", 
    displayPhone: "(11) 99844-7964",
    email: "contato@seujoelho.com",
    website: "seujoelho.com",
    address: "Av. Albert Einstein, 627 - Bloco A1",
    crm: "CRM 111501 / TEOT 10930",
    // NEW: Shared Tools Configuration with default values
    sharedTools: {
        rts: true,
        anatomy: true,
        weight: false
    }
  });

  // Save to local storage simulation
  useEffect(() => {
      const saved = localStorage.getItem('patient_portal_data');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              // Merge saved data with default structure to ensure new fields (like sharedTools) exist
              setDoctorData(prev => ({
                  ...prev,
                  ...parsed,
                  sharedTools: {
                      ...prev.sharedTools,
                      ...(parsed.sharedTools || {})
                  }
              }));
          } catch (e) {
              console.error("Failed to parse patient portal data", e);
          }
      }
  }, []);

  const handleSave = () => {
      localStorage.setItem('patient_portal_data', JSON.stringify(doctorData));
      setIsEditing(false);
  };

  // Toggle tool visibility
  const toggleTool = (tool: keyof typeof doctorData.sharedTools) => {
      setDoctorData(prev => ({
          ...prev,
          sharedTools: {
              ...prev.sharedTools,
              [tool]: !prev.sharedTools[tool]
          }
      }));
  };

  // WhatsApp Link Generation
  const whatsappUrl = `https://wa.me/${doctorData.phone}`;
  // QR Code Generation
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(whatsappUrl)}`;

  // VCard Generation
  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${doctorData.name}
N:Franciozi;Carlos;;Dr.;
ORG:${doctorData.org}
TITLE:${doctorData.title}
TEL;TYPE=CELL:${doctorData.phone}
EMAIL:${doctorData.email}
URL:https://${doctorData.website}
ADR;TYPE=WORK:;;${doctorData.address};São Paulo;SP;;Brasil
NOTE:${doctorData.crm}
END:VCARD`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: doctorData.name,
          text: `Agende sua consulta com ${doctorData.name}`,
          url: whatsappUrl
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(whatsappUrl);
      alert("Link copiado!");
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col pb-24 lg:pb-0 animate-fadeIn">
      
      {/* Header Controls */}
      <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Portal do Paciente</h2>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95
            ${isEditing ? 'bg-green-500 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
              {isEditing ? <><Save className="w-4 h-4" /> Salvar</> : <><Edit3 className="w-4 h-4" /> Editar</>}
          </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6 flex flex-col items-center">
        
        {/* EDIT MODE */}
        {isEditing ? (
            <div className="w-full max-w-md bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 space-y-6 animate-slideUp">
                <div className="text-center mb-2">
                    <p className="text-sm text-slate-500 font-medium">Personalize as informações que seus pacientes verão.</p>
                </div>
                
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Informações Básicas</h3>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome Profissional</label>
                        <input type="text" value={doctorData.name} onChange={e => setDoctorData({...doctorData, name: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-800" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Especialidade / Título</label>
                        <input type="text" value={doctorData.title} onChange={e => setDoctorData({...doctorData, title: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registro (CRM/RQE)</label>
                        <input type="text" value={doctorData.crm} onChange={e => setDoctorData({...doctorData, crm: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp (Número)</label>
                            <input type="text" value={doctorData.phone} onChange={e => setDoctorData({...doctorData, phone: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telefone (Exibição)</label>
                            <input type="text" value={doctorData.displayPhone} onChange={e => setDoctorData({...doctorData, displayPhone: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Endereço do Consultório</label>
                        <input type="text" value={doctorData.address} onChange={e => setDoctorData({...doctorData, address: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Site / Link</label>
                        <input type="text" value={doctorData.website} onChange={e => setDoctorData({...doctorData, website: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm" />
                    </div>
                </div>

                {/* Shared Tools Section */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600" /> Ferramentas Compartilhadas
                    </h3>
                    <p className="text-xs text-slate-500">Selecione quais aplicativos o paciente poderá acessar no cartão.</p>
                    
                    <div 
                        onClick={() => toggleTool('rts')}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${doctorData.sharedTools?.rts ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${doctorData.sharedTools?.rts ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <span className={`block text-sm font-bold ${doctorData.sharedTools?.rts ? 'text-orange-900' : 'text-slate-500'}`}>Calculadora RTS</span>
                                <span className="text-[10px] text-slate-400">Score de retorno ao esporte</span>
                            </div>
                        </div>
                        {doctorData.sharedTools?.rts ? <ToggleRight className="w-8 h-8 text-orange-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                    </div>

                    <div 
                        onClick={() => toggleTool('anatomy')}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${doctorData.sharedTools?.anatomy ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${doctorData.sharedTools?.anatomy ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                <Cuboid className="w-5 h-5" />
                            </div>
                            <div>
                                <span className={`block text-sm font-bold ${doctorData.sharedTools?.anatomy ? 'text-indigo-900' : 'text-slate-500'}`}>Anatomia 3D</span>
                                <span className="text-[10px] text-slate-400">Modelos interativos</span>
                            </div>
                        </div>
                        {doctorData.sharedTools?.anatomy ? <ToggleRight className="w-8 h-8 text-indigo-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                    </div>

                    <div 
                        onClick={() => toggleTool('weight')}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${doctorData.sharedTools?.weight ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${doctorData.sharedTools?.weight ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                <Weight className="w-5 h-5" />
                            </div>
                            <div>
                                <span className={`block text-sm font-bold ${doctorData.sharedTools?.weight ? 'text-emerald-900' : 'text-slate-500'}`}>Peso & Carga</span>
                                <span className="text-[10px] text-slate-400">Simulador de impacto</span>
                            </div>
                        </div>
                        {doctorData.sharedTools?.weight ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                    </div>
                </div>
            </div>
        ) : (
            /* PREVIEW MODE (The Card) */
            <div className="w-full max-w-sm relative group perspective-1000 my-auto animate-scaleIn">
                
                {/* Card Container */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative">
                    
                    {/* Header / Brand Background */}
                    <div className="h-44 bg-gradient-to-br from-slate-900 to-slate-800 relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[50px]"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px]"></div>
                        
                        <div className="relative z-10 flex flex-col items-center pt-8">
                            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Cartão Digital</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-8 pt-0 flex flex-col items-center text-center relative z-10 -mt-20">
                        
                        {/* Profile Picture */}
                        <div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-2xl mb-4 relative">
                            <img 
                                src="https://seujoelho.com/wp-content/uploads/2021/01/Dr-Carlos-Franciozi-781x1024.jpg" 
                                className="w-full h-full rounded-full object-cover object-top bg-slate-100"
                                alt="Dr. Carlos"
                            />
                            <div className="absolute bottom-2 right-2 w-7 h-7 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-sm">
                                <MessageCircle className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        {/* Name & Title */}
                        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">{doctorData.name}</h1>
                        <p className="text-sm font-bold text-blue-600 mb-2">{doctorData.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{doctorData.crm}</p>

                        {/* Links Section */}
                        <div className="w-full space-y-3 mb-6">
                            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-100 gap-3 group/item">
                                <div className="bg-green-500 p-2 rounded-lg text-white group-hover/item:scale-110 transition-transform">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-bold opacity-70 uppercase">Agendar Consulta</span>
                                    <span className="block text-sm font-bold">{doctorData.displayPhone}</span>
                                </div>
                            </a>

                            <div className="flex items-center p-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 gap-3">
                                <div className="bg-slate-200 p-2 rounded-lg text-slate-600">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <span className="block text-[10px] font-bold opacity-50 uppercase">Endereço</span>
                                    <span className="block text-xs font-bold truncate">{doctorData.address}</span>
                                </div>
                            </div>

                            <a href={`https://${doctorData.website}`} target="_blank" rel="noreferrer" className="flex items-center p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100 gap-3">
                                <div className="bg-blue-500 p-2 rounded-lg text-white">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-bold opacity-70 uppercase">Website</span>
                                    <span className="block text-sm font-bold">{doctorData.website}</span>
                                </div>
                            </a>
                        </div>

                        {/* Shared Tools (PATIENT APPS) - Only show if at least one is enabled */}
                        {doctorData.sharedTools && (doctorData.sharedTools.rts || doctorData.sharedTools.anatomy || doctorData.sharedTools.weight) && (
                            <div className="w-full mb-6">
                                <h3 className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Ferramentas do Paciente</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {doctorData.sharedTools.rts && (
                                        <button className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex flex-col items-center gap-2 hover:bg-orange-100 transition-colors group/tool">
                                            <div className="bg-orange-500 text-white p-2 rounded-lg shadow-sm group-hover/tool:scale-110 transition-transform">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-orange-900">Calculadora RTS</span>
                                        </button>
                                    )}
                                    {doctorData.sharedTools.anatomy && (
                                        <button className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex flex-col items-center gap-2 hover:bg-indigo-100 transition-colors group/tool">
                                            <div className="bg-indigo-500 text-white p-2 rounded-lg shadow-sm group-hover/tool:scale-110 transition-transform">
                                                <Cuboid className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-900">Anatomia 3D</span>
                                        </button>
                                    )}
                                    {doctorData.sharedTools.weight && (
                                        <button className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex flex-col items-center gap-2 hover:bg-emerald-100 transition-colors group/tool">
                                            <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-sm group-hover/tool:scale-110 transition-transform">
                                                <Weight className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-900">Carga Articular</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* QR Code Area */}
                        <div className="w-full bg-slate-900 p-5 rounded-3xl mb-6 flex items-center gap-5 shadow-xl text-white relative overflow-hidden group/qr cursor-pointer" onClick={() => window.open(whatsappUrl, '_blank')}>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/qr:opacity-20 transition-opacity"></div>
                            <div className="bg-white p-1.5 rounded-xl shadow-sm cursor-pointer shrink-0">
                                <img src={qrCodeUrl} alt="QR" className="w-16 h-16 rounded-lg" />
                            </div>
                            <div className="text-left flex-1 relative z-10">
                                <p className="text-xs font-bold text-white mb-1">Escaneie para Agendar</p>
                                <p className="text-[10px] text-slate-400 leading-snug font-medium">Aponte a câmera do celular para iniciar conversa no WhatsApp.</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button 
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 bg-slate-100 text-slate-900 py-3.5 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all active:scale-95"
                            >
                                <Share2 className="w-4 h-4" /> Compartilhar
                            </button>
                            
                            <a 
                                href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`} 
                                download="Dr_Carlos_Franciozi.vcf"
                                className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                            >
                                <Download className="w-4 h-4" /> Salvar
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default DigitalBusinessCard;
