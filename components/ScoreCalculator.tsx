
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { ClipboardList, CheckCircle2, Calculator, Info, ChevronRight, ArrowLeft, Activity, AlertCircle, RotateCcw, Check, Share2, Flame } from 'lucide-react';

type ScoreType = 'lysholm' | 'ikdc' | 'koos' | 'womac';

interface Question {
    id: string;
    title: string;
    options: { l: string; v: number }[];
}

const ScoreCalculator: React.FC = () => {
  const [activeScore, setActiveScore] = useState<ScoreType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [displayScore, setDisplayScore] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const scores = [
    { id: 'lysholm', name: 'Lysholm Score', desc: 'Avaliação de sintomas e função (Ligamentar/Meniscal).', color: 'text-blue-600 bg-blue-50' },
    { id: 'ikdc', name: 'IKDC Subjetivo', desc: 'Padrão-ouro para diversas patologias do joelho.', color: 'text-purple-600 bg-purple-50' },
    { id: 'womac', name: 'WOMAC', desc: 'Específico para Artrose (Dor, Rigidez, Função).', color: 'text-orange-600 bg-orange-50' },
    { id: 'koos', name: 'KOOS-12', desc: 'Monitoramento rápido de resultados (Short Form).', color: 'text-teal-600 bg-teal-50' }
  ];

  // --- CLINICAL DATA SOURCES ---

  const questions: Record<ScoreType, Question[]> = {
      // Lysholm: 0-100 (Higher is Better). Max Score: 100.
      lysholm: [
        { id: 'claudicacao', title: 'Claudicação (Mancar)', options: [{l:'Nenhuma', v:5}, {l:'Leve ou periódica', v:3}, {l:'Grave e constante', v:0}] },
        { id: 'apoio', title: 'Uso de Apoio', options: [{l:'Nenhum', v:5}, {l:'Bengala ou muleta', v:2}, {l:'Impossível apoiar', v:0}] },
        { id: 'bloqueio', title: 'Bloqueio', options: [{l:'Nenhum', v:15}, {l:'Sensação de bloqueio, mas não trava', v:10}, {l:'Bloqueio ocasional', v:6}, {l:'Bloqueio frequente', v:2}, {l:'Joelho travado no exame', v:0}] },
        { id: 'instabilidade', title: 'Instabilidade (Falseio)', options: [{l:'Nunca falseia', v:25}, {l:'Raramente, durante esporte', v:20}, {l:'Frequentemente no esporte', v:15}, {l:'Ocasionalmente no dia a dia', v:10}, {l:'Frequentemente no dia a dia', v:5}, {l:'A cada passo', v:0}] },
        { id: 'dor', title: 'Dor', options: [{l:'Nenhuma', v:25}, {l:'Inconstante / Leve no esforço', v:20}, {l:'Marcada no esporte', v:15}, {l:'Marcada ao caminhar < 2km', v:10}, {l:'Marcada ao caminhar < 200m', v:5}, {l:'Constante', v:0}] },
        { id: 'inchaco', title: 'Inchaço', options: [{l:'Nenhum', v:10}, {l:'Após esforço intenso', v:6}, {l:'Após esforço leve', v:2}, {l:'Constante', v:0}] },
        { id: 'escadas', title: 'Subir Escadas', options: [{l:'Sem problemas', v:10}, {l:'Leve dificuldade', v:6}, {l:'Um degrau por vez', v:2}, {l:'Impossível', v:0}] },
        { id: 'agachamento', title: 'Agachamento', options: [{l:'Sem problemas', v:5}, {l:'Leve dificuldade', v:4}, {l:'Não consegue além de 90°', v:2}, {l:'Impossível', v:0}] },
      ],
      
      // IKDC 2000 Subjective: Normalized to 0-100 (Higher is Better).
      ikdc: [
          { id: 'atv_nivel', title: 'Nível mais alto de atividade sem dor significativa', options: [{l:'Muito extenuante (futebol, basquete)', v:4}, {l:'Extenuante (esqui, tênis)', v:3}, {l:'Moderado (corrida leve)', v:2}, {l:'Leve (caminhada)', v:1}, {l:'Incapaz', v:0}] },
          { id: 'dor_freq', title: 'Com que frequência sente dor? (Últimas 4 semanas)', options: [{l:'Nunca', v:10}, {l:'Raramente', v:9}, {l:'As vezes', v:8}, {l:'Frequentemente', v:7}, {l:'Sempre', v:0}] }, 
          { id: 'dor_grav', title: 'Gravidade da dor (0-10)', options: [{l:'0-1 (Mínima)', v:10}, {l:'2-3', v:8}, {l:'4-6', v:5}, {l:'7-8', v:2}, {l:'9-10 (Pior)', v:0}] },
          { id: 'rigidez', title: 'Rigidez ou inchaço', options: [{l:'Nunca', v:2}, {l:'Raramente', v:1}, {l:'Frequentemente', v:0}] },
          { id: 'func_escada', title: 'Dificuldade: Subir/Descer Escadas', options: [{l:'Nenhuma', v:4}, {l:'Leve', v:3}, {l:'Moderada', v:2}, {l:'Extrema', v:1}, {l:'Incapaz', v:0}] },
          { id: 'func_agachar', title: 'Dificuldade: Agachar', options: [{l:'Nenhuma', v:4}, {l:'Leve', v:3}, {l:'Moderada', v:2}, {l:'Extrema', v:1}, {l:'Incapaz', v:0}] },
          { id: 'func_pular', title: 'Dificuldade: Pular', options: [{l:'Nenhuma', v:4}, {l:'Leve', v:3}, {l:'Moderada', v:2}, {l:'Extrema', v:1}, {l:'Incapaz', v:0}] },
          { id: 'func_correr', title: 'Dificuldade: Correr', options: [{l:'Nenhuma', v:4}, {l:'Leve', v:3}, {l:'Moderada', v:2}, {l:'Extrema', v:1}, {l:'Incapaz', v:0}] },
          { id: 'func_ajoelhar', title: 'Dificuldade: Ajoelhar', options: [{l:'Nenhuma', v:4}, {l:'Leve', v:3}, {l:'Moderada', v:2}, {l:'Extrema', v:1}, {l:'Incapaz', v:0}] },
          { id: 'func_geral', title: 'Como avalia o joelho hoje? (0-10)', options: [{l:'Normal (10)', v:10}, {l:'Quase normal (8-9)', v:8}, {l:'Regular (5-7)', v:5}, {l:'Ruim (0-4)', v:0}] }
      ],

      // WOMAC
      womac: [
          { id: 'p1', title: 'Dor: Andando no plano', options: [{l:'Nenhuma', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Forte', v:3}, {l:'Muito Forte', v:4}] },
          { id: 'p2', title: 'Dor: Subindo/Descendo escadas', options: [{l:'Nenhuma', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Forte', v:3}, {l:'Muito Forte', v:4}] },
          { id: 'p3', title: 'Dor: À noite na cama', options: [{l:'Nenhuma', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Forte', v:3}, {l:'Muito Forte', v:4}] },
          { id: 'p4', title: 'Dor: Sentado ou deitado', options: [{l:'Nenhuma', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Forte', v:3}, {l:'Muito Forte', v:4}] },
          { id: 'p5', title: 'Dor: Ficando de pé', options: [{l:'Nenhuma', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Forte', v:3}, {l:'Muito Forte', v:4}] },
          { id: 's1', title: 'Rigidez: Ao acordar', options: [{l:'Nenhuma', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Forte', v:3}, {l:'Muito Forte', v:4}] },
          { id: 's2', title: 'Rigidez: Durante o dia', options: [{l:'Nenhuma', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Forte', v:3}, {l:'Muito Forte', v:4}] },
          { id: 'f1', title: 'Função: Descer escadas', options: [{l:'Nenhuma dif.', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Difícil', v:3}, {l:'Incapaz', v:4}] },
          { id: 'f2', title: 'Função: Subir escadas', options: [{l:'Nenhuma dif.', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Difícil', v:3}, {l:'Incapaz', v:4}] },
          { id: 'f3', title: 'Função: Levantar sentada', options: [{l:'Nenhuma dif.', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Difícil', v:3}, {l:'Incapaz', v:4}] },
          { id: 'f4', title: 'Função: Ficar em pé', options: [{l:'Nenhuma dif.', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Difícil', v:3}, {l:'Incapaz', v:4}] },
          { id: 'f5', title: 'Função: Entrar/Sair carro', options: [{l:'Nenhuma dif.', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Difícil', v:3}, {l:'Incapaz', v:4}] },
          { id: 'f6', title: 'Função: Andar no plano', options: [{l:'Nenhuma dif.', v:0}, {l:'Leve', v:1}, {l:'Moderada', v:2}, {l:'Difícil', v:3}, {l:'Incapaz', v:4}] },
      ],

      // KOOS-12
      koos: [
          { id: 'k1', title: 'Com que frequência sente dor?', options: [{l:'Nunca', v:100}, {l:'Mensalmente', v:75}, {l:'Semanalmente', v:50}, {l:'Diariamente', v:25}, {l:'Sempre', v:0}] },
          { id: 'k2', title: 'Dor ao esticar totalmente?', options: [{l:'Nenhuma', v:100}, {l:'Leve', v:75}, {l:'Moderada', v:50}, {l:'Forte', v:25}, {l:'Extrema', v:0}] },
          { id: 'k3', title: 'Dor ao dobrar totalmente?', options: [{l:'Nenhuma', v:100}, {l:'Leve', v:75}, {l:'Moderada', v:50}, {l:'Forte', v:25}, {l:'Extrema', v:0}] },
          { id: 'k4', title: 'Inchaço no joelho?', options: [{l:'Nunca', v:100}, {l:'Raramente', v:75}, {l:'As vezes', v:50}, {l:'Frequentemente', v:25}, {l:'Sempre', v:0}] },
          { id: 'k5', title: 'Dificuldade: Descer escadas', options: [{l:'Nenhuma', v:100}, {l:'Leve', v:75}, {l:'Moderada', v:50}, {l:'Forte', v:25}, {l:'Extrema', v:0}] },
          { id: 'k6', title: 'Dificuldade: Ficar em pé', options: [{l:'Nenhuma', v:100}, {l:'Leve', v:75}, {l:'Moderada', v:50}, {l:'Forte', v:25}, {l:'Extrema', v:0}] },
          { id: 'k7', title: 'Dificuldade: Correr', options: [{l:'Nenhuma', v:100}, {l:'Leve', v:75}, {l:'Moderada', v:50}, {l:'Forte', v:25}, {l:'Extrema', v:0}] },
          { id: 'k8', title: 'Dificuldade: Ajoelhar', options: [{l:'Nenhuma', v:100}, {l:'Leve', v:75}, {l:'Moderada', v:50}, {l:'Forte', v:25}, {l:'Extrema', v:0}] },
          { id: 'k9', title: 'Consciência do joelho', options: [{l:'Nunca', v:100}, {l:'Mensalmente', v:75}, {l:'Semanalmente', v:50}, {l:'Diariamente', v:25}, {l:'Sempre', v:0}] },
          { id: 'k10', title: 'Modificou estilo de vida?', options: [{l:'Não', v:100}, {l:'Um pouco', v:75}, {l:'Moderadamente', v:50}, {l:'Muito', v:25}, {l:'Totalmente', v:0}] },
          { id: 'k11', title: 'Confiança no joelho', options: [{l:'Total', v:100}, {l:'Muita', v:75}, {l:'Moderada', v:50}, {l:'Pouca', v:25}, {l:'Nenhuma', v:0}] },
          { id: 'k12', title: 'Dificuldade geral', options: [{l:'Nenhuma', v:100}, {l:'Leve', v:75}, {l:'Moderada', v:50}, {l:'Forte', v:25}, {l:'Extrema', v:0}] },
      ]
  };

  // --- LOGIC ---

  const handleSelectOption = (value: number) => {
      if (!activeScore) return;
      const currentQuestions = questions[activeScore];
      const currentQId = currentQuestions[currentQuestionIndex].id;

      // Save answer
      const newAnswers = { ...answers, [currentQId]: value };
      setAnswers(newAnswers);

      // Advance
      if (currentQuestionIndex < currentQuestions.length - 1) {
          setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 150); // Small delay for visual feedback
      } else {
          calculateScore(newAnswers);
      }
  };

  const calculateScore = (finalAnswers: Record<string, number>) => {
      if (!activeScore) return;
      const currentQuestions = questions[activeScore];
      
      let calcScore = 0;
      const totalPoints = (Object.values(finalAnswers) as number[]).reduce((a, b) => a + b, 0);

      if (activeScore === 'lysholm') {
          calcScore = totalPoints;
      } 
      else if (activeScore === 'ikdc') {
          const maxPossible = currentQuestions.reduce((acc, q) => acc + Math.max(...q.options.map(o => o.v)), 0);
          calcScore = (totalPoints / maxPossible) * 100;
      } 
      else if (activeScore === 'womac') {
          const numItems = currentQuestions.length;
          const maxPossible = numItems * 4;
          calcScore = 100 - ((totalPoints / maxPossible) * 100);
      }
      else if (activeScore === 'koos') {
          calcScore = totalPoints / currentQuestions.length;
      }

      setFinalScore(Math.round(calcScore));
      setShowResult(true);
  };

  const handleShareImage = async () => {
      if (resultRef.current) {
          try {
              const canvas = await html2canvas(resultRef.current, {
                  scale: 2,
                  backgroundColor: '#ffffff',
                  useCORS: true
              });
              
              canvas.toBlob(async (blob) => {
                  if (blob) {
                      const file = new File([blob], 'resultado_score.png', { type: 'image/png' });
                      if (navigator.share) {
                          try {
                              await navigator.share({
                                  files: [file],
                                  title: 'Resultado de Avaliação',
                                  text: `Avaliação do Paciente - Score: ${finalScore}`
                              });
                          } catch (err) {
                              console.log('Cancelado', err);
                          }
                      } else {
                          const link = document.createElement('a');
                          link.download = 'resultado.png';
                          link.href = canvas.toDataURL();
                          link.click();
                      }
                  }
              });
          } catch (e) {
              alert("Erro ao capturar imagem.");
          }
      }
  };

  // Animation for score counting
  useEffect(() => {
      if (showResult) {
          const duration = 1500;
          const startTime = performance.now();
          const startScore = 0;
          
          const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Cubic ease out
              const ease = 1 - Math.pow(1 - progress, 3);
              
              setDisplayScore(Math.floor(startScore + (finalScore - startScore) * ease));

              if (progress < 1) {
                  requestAnimationFrame(animate);
              }
          };
          requestAnimationFrame(animate);
      } else {
          setDisplayScore(0);
      }
  }, [showResult, finalScore]);

  const getInterpretation = (val: number) => {
      if (val >= 90) return { label: 'Excelente', color: 'text-green-600', stroke: '#16a34a', bg: 'bg-green-50 text-green-800', msg: 'Função articular preservada.' };
      if (val >= 80) return { label: 'Bom', color: 'text-blue-600', stroke: '#2563eb', bg: 'bg-blue-50 text-blue-800', msg: 'Limitações leves no dia a dia.' };
      if (val >= 60) return { label: 'Regular', color: 'text-yellow-600', stroke: '#ca8a04', bg: 'bg-yellow-50 text-yellow-800', msg: 'Sintomas impactam a qualidade de vida.' };
      return { label: 'Ruim', color: 'text-red-600', stroke: '#dc2626', bg: 'bg-red-50 text-red-800', msg: 'Disfunção articular significativa.' };
  };

  const reset = () => {
      setActiveScore(null);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResult(false);
      setFinalScore(0);
      setDisplayScore(0);
  }

  // --- RENDER ---

  // 1. RESULT SCREEN
  if (showResult) {
      const interpretation = getInterpretation(finalScore);
      const radius = 90; 
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (circumference * displayScore) / 100;

      return (
          <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-6 animate-fadeIn pb-24 lg:pb-0">
              
              {/* CAPTURABLE AREA */}
              <div ref={resultRef} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 text-center relative overflow-hidden w-full max-w-sm mb-4">
                  {/* Branding Header in Capture */}
                  <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-slate-50">
                      <Flame className="w-4 h-4 text-slate-900" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Dr. Carlos Franciozi</span>
                  </div>

                  {/* Circle Chart */}
                  <div className="relative w-64 h-64 mx-auto mb-6">
                      <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 256 256">
                          <circle cx="128" cy="128" r={radius} stroke="#f1f5f9" strokeWidth="16" fill="transparent" strokeLinecap="round" />
                          <circle 
                              cx="128" cy="128" r={radius} 
                              stroke={interpretation.stroke} 
                              strokeWidth="16" 
                              fill="transparent" 
                              strokeDasharray={circumference} 
                              strokeDashoffset={offset} 
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out" 
                          />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                          <span className={`text-8xl font-black tracking-tighter leading-none ${interpretation.color}`}>
                              {displayScore}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pontos</span>
                      </div>
                  </div>

                  <div className="mb-4">
                      <h2 className={`text-4xl font-black mb-4 ${interpretation.color} tracking-tight`}>
                          {interpretation.label}
                      </h2>
                      <div className={`inline-block px-4 py-2.5 rounded-xl text-xs font-bold border border-transparent ${interpretation.bg}`}>
                          {interpretation.msg}
                      </div>
                  </div>
                  
                  {/* Footer Branding */}
                  <div className="mt-4 pt-2 border-t border-slate-50 text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                      {scores.find(s => s.id === activeScore)?.name}
                  </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-3">
                  <button 
                    onClick={handleShareImage}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                      <Share2 className="w-4 h-4" /> Compartilhar Imagem
                  </button>

                  <button 
                    onClick={reset}
                    className="w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                      <RotateCcw className="w-4 h-4" /> Novo Cálculo
                  </button>
              </div>
          </div>
      );
  }

  // 2. QUESTION WIZARD (Remaining code unchanged)
  if (activeScore) {
      const activeQuestions = questions[activeScore];
      const question = activeQuestions[currentQuestionIndex];
      const progress = ((currentQuestionIndex) / activeQuestions.length) * 100;

      return (
          <div className="h-full bg-slate-50 flex flex-col pb-24 lg:pb-0">
              {/* Header */}
              <div className="px-6 pt-6 pb-2">
                  <div className="flex justify-between items-center mb-4">
                        <button 
                            onClick={() => currentQuestionIndex > 0 ? setCurrentQuestionIndex(prev => prev - 1) : setActiveScore(null)} 
                            className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            Questão {currentQuestionIndex + 1} de {activeQuestions.length}
                        </span>
                        <div className="w-8"></div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>

              {/* Question Card */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="max-w-md mx-auto animate-slideUp" key={question.id}>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight mb-8">
                          {question.title}
                      </h2>

                      <div className="space-y-3">
                          {question.options.map((opt, idx) => {
                              const isSelected = answers[question.id] === opt.v;
                              return (
                                  <button
                                      key={idx}
                                      onClick={() => handleSelectOption(opt.v)}
                                      className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between group active:scale-[0.98]
                                      ${isSelected 
                                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'}`}
                                  >
                                      <span className="font-bold text-base">{opt.l}</span>
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                          ${isSelected ? 'border-white bg-white text-slate-900' : 'border-slate-200 group-hover:border-slate-400'}`}>
                                          {isSelected && <Check className="w-3 h-3" />}
                                      </div>
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // 3. MENU (Grid Selection - Unchanged)
  return (
    <div className="h-full bg-slate-50 flex flex-col pb-24 lg:pb-0 animate-fadeIn">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 mb-8 flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 relative z-10">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-xl font-black text-slate-900 leading-tight mb-1">Scores Funcionais</h1>
                        <p className="text-sm text-slate-500">Selecione o questionário para iniciar a avaliação passo a passo.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scores.map((score) => (
                        <button 
                            key={score.id}
                            onClick={() => setActiveScore(score.id as ScoreType)}
                            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all text-left group active:scale-[0.98] relative overflow-hidden h-full flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${score.color} bg-opacity-20`}>
                                    <ClipboardList className={`w-6 h-6 ${score.color.split(' ')[0]}`} />
                                </div>
                                <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{score.name}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1">{score.desc}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                        <strong>Nota Técnica:</strong> Todos os resultados são normalizados para uma escala de 0 a 100, onde <strong>100 representa a melhor condição clínica</strong>.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ScoreCalculator;
