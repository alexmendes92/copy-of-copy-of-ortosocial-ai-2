
import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Loader2, FileSearch } from 'lucide-react';
import { auditContent } from '../services/geminiService';
import { ComplianceAuditResult } from '../types';

interface CFMComplianceGuideProps {
  contentToAudit?: string; // Optional: If provided, it runs the active audit
}

const CFMComplianceGuide: React.FC<CFMComplianceGuideProps> = ({ contentToAudit }) => {
  const [result, setResult] = useState<ComplianceAuditResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contentToAudit) {
      // Debounce the audit call to avoid spamming the API while typing
      const timer = setTimeout(() => {
        runAudit(contentToAudit);
      }, 1000); // Wait 1 second after last change

      return () => clearTimeout(timer);
    }
  }, [contentToAudit]);

  const runAudit = async (text: string) => {
    if (!text) return;
    setLoading(true);
    // Do not clear result immediately to avoid flickering during debounce
    try {
      const audit = await auditContent(text);
      setResult(audit);
    } catch (e) {
      console.error("Compliance audit failed", e);
    } finally {
      setLoading(false);
    }
  };

  // 1. ACTIVE AUDITING MODE
  if (contentToAudit) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mt-4">
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-sm">Auditoria CFM (IA)</span>
           </div>
           {loading && <Loader2 className="w-4 h-4 text-white animate-spin" />}
        </div>

        <div className="p-4">
           {loading && !result ? (
             <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
                <FileSearch className="w-8 h-8 animate-pulse text-blue-500" />
                <p className="text-xs font-medium">Analisando infrações éticas...</p>
             </div>
           ) : result ? (
             <div className={`space-y-4 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {/* Status Banner */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    result.riskLevel === 'safe' ? 'bg-green-50 border-green-200' :
                    result.riskLevel === 'warning' ? 'bg-amber-50 border-amber-200' :
                    'bg-red-50 border-red-200'
                }`}>
                    {result.riskLevel === 'safe' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                    {result.riskLevel === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                    {result.riskLevel === 'danger' && <XCircle className="w-6 h-6 text-red-600" />}
                    
                    <div>
                        <h4 className={`text-sm font-bold ${
                            result.riskLevel === 'safe' ? 'text-green-800' :
                            result.riskLevel === 'warning' ? 'text-amber-800' : 'text-red-800'
                        }`}>
                            {result.riskLevel === 'safe' ? 'Conteúdo Aprovado' : 
                             result.riskLevel === 'warning' ? 'Atenção Necessária' : 
                             'Risco de Infração Ética'}
                        </h4>
                        <p className="text-xs opacity-80">Baseado na Resolução 2.336/2023</p>
                    </div>
                </div>

                {/* Issues List */}
                {result.issues.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase">Pontos de Atenção</p>
                        {result.issues.map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                {issue}
                            </div>
                        ))}
                    </div>
                )}

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase">Sugestões de Correção</p>
                        {result.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-blue-50 p-2 rounded border border-blue-100">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
             </div>
           ) : (
             <p className="text-xs text-slate-400 text-center">Aguardando conteúdo...</p>
           )}
        </div>
      </div>
    );
  }

  // 2. STATIC REFERENCE MODE (Default if no content provided)
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="bg-slate-900 p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-yellow-500/20 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg leading-none">Guia de Compliance</h3>
          <p className="text-slate-400 text-xs mt-1">Gere um post para ativar a auditoria automática.</p>
        </div>
      </div>
      <div className="p-6 flex flex-col items-center justify-center text-center h-64 text-slate-400">
          <ShieldCheck className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm">A IA analisará automaticamente seu conteúdo aqui.</p>
      </div>
    </div>
  );
};

export default CFMComplianceGuide;
