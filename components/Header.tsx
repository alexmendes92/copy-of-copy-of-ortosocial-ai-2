
import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ onBack, showBack, title, subtitle }) => {
  if (!showBack) return null; // Dashboard handles its own header

  return (
    <header className="bg-white/80 backdrop-blur-xl h-16 px-4 flex items-center justify-between sticky top-0 z-[50] border-b border-slate-100 pt-safe transition-all duration-300">
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <button 
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors active:scale-95 flex-shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col justify-center animate-fadeIn">
                <h2 className="text-sm font-bold text-slate-900 leading-none truncate tracking-tight">{title}</h2>
                {subtitle && <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5 uppercase tracking-wider opacity-80">{subtitle}</p>}
          </div>
      </div>
    </header>
  );
};

export default Header;
