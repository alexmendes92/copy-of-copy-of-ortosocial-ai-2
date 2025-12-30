
import React, { useState } from 'react';
import { InstagramConfig } from '../types';
import { saveInstagramConfig } from '../services/instagramService';
import { Instagram, Lock, CheckCircle2, AlertCircle, HelpCircle, X } from 'lucide-react';

interface InstagramConnectProps {
  onConnected: () => void;
  onClose: () => void;
}

const InstagramConnect: React.FC<InstagramConnectProps> = ({ onConnected, onClose }) => {
  const [token, setToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!token.trim() || !accountId.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    const config: InstagramConfig = {
      accessToken: token,
      accountId: accountId,
      isConnected: true
    };

    saveInstagramConfig(config);
    onConnected();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Conectar Instagram</h2>
          </div>
          <p className="text-white/90 text-sm">Permita que a MediSocial AI publique diretamente no seu perfil Business.</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3">
             <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
             <div className="text-xs text-blue-800">
                <p className="font-bold mb-1">Como obter as credenciais?</p>
                Acesse o <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="underline hover:text-blue-900">Graph API Explorer</a>.
                Selecione seu App e obtenha o "User Access Token" com permissões: <code>instagram_content_publish</code> e <code>pages_show_list</code>.
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instagram Business Account ID</label>
            <input 
              type="text" 
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Ex: 17841400000000000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-500 outline-none text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Access Token</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="EAAG..."
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-500 outline-none text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button 
            onClick={handleSave}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" /> Salvar e Conectar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramConnect;
