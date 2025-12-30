
import React, { useState } from 'react';
import { Cuboid as Cube, Video, Camera, Info, ChevronRight, Maximize2, X } from 'lucide-react';

interface AnatomyModel {
  id: string;
  title: string;
  category: string;
  sketchfabId: string; // ID for Sketchfab embed
  description: string;
}

const models: AnatomyModel[] = [
  {
    id: 'knee',
    title: 'Articulação do Joelho',
    category: 'Membros Inferiores',
    sketchfabId: '98894277764d4726bf7b0c3454728551',
    description: 'Vista detalhada do fêmur distal, tíbia proximal, fíbula e patela, incluindo ligamentos cruzados e meniscos.'
  },
  {
    id: 'shoulder',
    title: 'Complexo do Ombro',
    category: 'Membros Superiores',
    sketchfabId: 'cd3284050b4a4574977464192631525a',
    description: 'Escápula, clavícula e úmero proximal. Ideal para explicar manguito rotador e luxações.'
  },
  {
    id: 'spine',
    title: 'Coluna Lombar',
    category: 'Coluna',
    sketchfabId: '0f8b1c1d0b7d46819c4d9302674251e6',
    description: 'Vértebras lombares com disco intervertebral. Útil para hérnias e estenoses.'
  },
  {
    id: 'hip',
    title: 'Articulação do Quadril',
    category: 'Membros Inferiores',
    sketchfabId: 'f6b2158970034606979208a513511116',
    description: 'Pelve e fêmur proximal. Foco em artrose e fraturas do colo do fêmur.'
  },
  {
    id: 'foot',
    title: 'Pé e Tornozelo',
    category: 'Membros Inferiores',
    sketchfabId: 'b2123899268641759080b0c6df63556f',
    description: 'Ossos do tarso, metatarso e falanges. Para entorses e fascite plantar.'
  }
];

const AnatomyLibrary: React.FC = () => {
  const [activeModel, setActiveModel] = useState<AnatomyModel>(models[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper to generate clean embed URL
  const getEmbedUrl = (id: string) => 
    `https://sketchfab.com/models/${id}/embed?autostart=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_hint=0`;

  return (
    <div className={`h-full flex flex-col bg-slate-50 animate-fadeIn ${isFullscreen ? 'fixed inset-0 z-[60] bg-black' : ''}`}>
      
      <div className={`flex flex-1 overflow-hidden ${isFullscreen ? 'flex-col' : 'flex-col lg:flex-row'}`}>
        
        {/* Sidebar List (Hidden in Fullscreen) */}
        {!isFullscreen && (
          <div className="w-full lg:w-80 bg-white border-b lg:border-r lg:border-b-0 border-slate-200 overflow-y-auto z-10 flex-shrink-0 max-h-[40vh] lg:max-h-full">
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Selecione o Modelo</h3>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setActiveModel(model)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group
                    ${activeModel.id === model.id 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm border' 
                      : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                >
                  <div>
                    <span className="block font-bold text-sm mb-0.5">{model.title}</span>
                    <span className="text-[10px] opacity-70 uppercase font-semibold">{model.category}</span>
                  </div>
                  {activeModel.id === model.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
            
            <div className="p-4 mt-4 bg-slate-50 border-t border-slate-100 hidden lg:block">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                        Use o mouse ou toque para rotacionar, ampliar e mover o modelo.
                    </p>
                </div>
            </div>
          </div>
        )}

        {/* Main Viewer Area */}
        <div className="flex-1 relative bg-slate-900 flex flex-col h-full">
           
           {/* Viewer Controls Overlay */}
           <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold border border-white/10"
              >
                {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? 'Sair' : 'Expandir'}
              </button>
           </div>

           {/* Content Creation Controls (Mockup) */}
           {!isFullscreen && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 w-full justify-center px-4">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-full shadow-lg font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap">
                      <Video className="w-4 h-4" /> Gravar
                  </button>
                  <button className="bg-white hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-full shadow-lg font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap">
                      <Camera className="w-4 h-4" /> Foto
                  </button>
               </div>
           )}

           {/* 3D Embed */}
           <div className="flex-1 w-full h-full relative">
              <iframe 
                title={activeModel.title} 
                src={getEmbedUrl(activeModel.sketchfabId)}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; vr" 
              />
              {/* Overlay for branding/protection if needed */}
              <div className="absolute bottom-2 right-2 text-[10px] text-white/30 pointer-events-none select-none">
                  Powered by MediSocial
              </div>
           </div>

           {/* Description Footer (Visible in normal mode) */}
           {!isFullscreen && (
             <div className="bg-white p-4 border-t border-slate-200">
                <h2 className="font-bold text-slate-900 text-sm">{activeModel.title}</h2>
                <p className="text-xs text-slate-500 mt-1">{activeModel.description}</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default AnatomyLibrary;
