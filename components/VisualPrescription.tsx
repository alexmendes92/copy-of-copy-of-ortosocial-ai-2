
import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, Share2, Plus, X, Video } from 'lucide-react';

// Mock Data reusing the concept from MaterialsLibrary
const exerciseLibrary = [
    { id: 1, title: 'Isometria de Quadríceps', duration: '2 min', category: 'Fortalecimento', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Elevação da Perna Reta', duration: '3 séries', category: 'Fortalecimento', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'Mobilização de Patela', duration: '5 min', category: 'Mobilidade', img: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=400&q=80' },
    { id: 4, title: 'Extensão Passiva (Prone)', duration: '10 min', category: 'Amplitude', img: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=400&q=80' },
    { id: 5, title: 'Bom dia (Good Morning)', duration: '3 séries', category: 'Posterior', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80' },
    { id: 6, title: 'Cadeira Extensora', duration: '4 séries', category: 'Academia', img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80' },
];

const VisualPrescription: React.FC = () => {
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const toggleSelection = (id: number) => {
      setSelectedVideos(prev => 
        prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      );
  };

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: 'Sua Reabilitação - Dr. Carlos',
              text: 'Aqui está sua playlist de exercícios para casa.',
              url: 'https://seujoelho.com/prescricao/xyz123'
          });
      } else {
          alert("Link copiado para a área de transferência!");
      }
  };

  if (showSummary) {
      return (
          <div className="h-full bg-slate-50 flex flex-col pb-24 animate-fadeIn">
              <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Resumo da Playlist</h2>
                  
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                      <div className="bg-slate-900 p-8 text-white text-center">
                          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                             <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                          <h2 className="text-2xl font-black mb-1">Reabilitação</h2>
                          <p className="text-slate-400 text-sm font-medium">{selectedVideos.length} exercícios selecionados</p>
                      </div>
                      <div className="p-2 divide-y divide-slate-50">
                          {exerciseLibrary.filter(ex => selectedVideos.includes(ex.id)).map(ex => (
                              <div key={ex.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors rounded-xl">
                                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 shadow-sm">
                                      <img src={ex.img} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-900 text-sm leading-tight mb-1">{ex.title}</p>
                                      <p className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md w-fit">{ex.duration} • {ex.category}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="mt-6 space-y-3 px-2">
                      <button 
                        onClick={handleShare}
                        className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors active:scale-95"
                      >
                          <Share2 className="w-5 h-5" /> Enviar no WhatsApp
                      </button>
                      
                      <button 
                        onClick={() => setShowSummary(false)}
                        className="w-full py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                      >
                          Voltar e Editar
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full bg-slate-50 flex flex-col pb-32 animate-fadeIn">
        
        {/* Banner */}
        <div className="bg-white p-5 mx-4 mt-4 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
                <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    Biblioteca
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">Toque para selecionar.</p>
            </div>
            {selectedVideos.length > 0 && (
                <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl animate-scaleIn shadow-lg">
                    {selectedVideos.length} vídeos
                </div>
            )}
        </div>

        {/* Video Grid - Single Column on Mobile for better visibility */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto no-scrollbar">
            {exerciseLibrary.map(video => {
                const isSelected = selectedVideos.includes(video.id);
                return (
                    <div 
                        key={video.id}
                        onClick={() => toggleSelection(video.id)}
                        className={`bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 relative group
                        ${isSelected ? 'border-purple-600 shadow-lg ring-1 ring-purple-600' : 'border-slate-100 shadow-sm hover:border-purple-200'}`}
                    >
                        <div className="aspect-video bg-slate-200 relative">
                            <img src={video.img} className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-90' : ''}`} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isSelected ? 'bg-purple-600 text-white' : 'bg-black/30 text-white'}`}>
                                    {isSelected ? <CheckCircle2 className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{video.category}</span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{video.duration}</span>
                            </div>
                            <h3 className={`font-bold text-sm line-clamp-1 transition-colors ${isSelected ? 'text-purple-700' : 'text-slate-900'}`}>{video.title}</h3>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-[100px] left-0 right-0 p-6 pointer-events-none flex justify-center z-30">
            <button 
                onClick={() => setShowSummary(true)}
                disabled={selectedVideos.length === 0}
                className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-3 pointer-events-auto transition-all active:scale-90 disabled:opacity-0 disabled:translate-y-10 duration-300 min-w-[200px]"
            >
                <Plus className="w-5 h-5" />
                Criar Prescrição
            </button>
        </div>
    </div>
  );
};

export default VisualPrescription;
