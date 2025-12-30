
import { ProtocolStep, ProtocolType } from '../types';

export const PROTOCOLS: Record<ProtocolType, { title: string, steps: ProtocolStep[] }> = {
    'LCA': {
        title: 'Reconstrução de Ligamento Cruzado Anterior',
        steps: [
            { dayOffset: 0, title: 'Dia da Cirurgia', description: 'Orientações imediatas de pós-op (Gelo, Elevação).', type: 'message', actionLabel: 'Enviar msg de conforto' },
            { dayOffset: 1, title: 'Alta Hospitalar', description: 'Cuidados com curativo e medicamentos.', type: 'message', actionLabel: 'Enviar Receita Digital' },
            { dayOffset: 7, title: 'Primeira Semana', description: 'Checar dor e extensão do joelho.', type: 'message', actionLabel: 'Perguntar como está' },
            { dayOffset: 14, title: 'Retirada de Pontos', description: 'Consulta presencial para avaliar cicatrização.', type: 'appointment', actionLabel: 'Confirmar Consulta' },
            { dayOffset: 30, title: 'Mês 1 - Desmame', description: 'Início do desmame das muletas (se aplicável).', type: 'rehab', actionLabel: 'Enviar Vídeo Exercício' },
            { dayOffset: 90, title: 'Mês 3 - Fortalecimento', description: 'Liberação para corrida leve (trote).', type: 'rehab', actionLabel: 'Enviar Guia de Corrida' },
            { dayOffset: 180, title: 'Mês 6 - Retorno', description: 'Avaliação RTS (Return to Sport).', type: 'exam', actionLabel: 'Agendar RTS Calc' }
        ]
    },
    'ATJ': {
        title: 'Artroplastia Total de Joelho (Prótese)',
        steps: [
            { dayOffset: 0, title: 'Cirurgia', description: 'Monitoramento de dor e anticoagulação.', type: 'message', actionLabel: 'Msg Pós-Op' },
            { dayOffset: 3, title: 'Casa Segura', description: 'Orientações para evitar quedas em casa.', type: 'message', actionLabel: 'Enviar Guia Casa' },
            { dayOffset: 15, title: 'Retirada de Pontos', description: 'Avaliação da ferida operatória.', type: 'appointment', actionLabel: 'Lembrar Consulta' },
            { dayOffset: 45, title: '6 Semanas', description: 'Avaliação de marcha sem andador.', type: 'rehab', actionLabel: 'Vídeo Marcha' },
            { dayOffset: 90, title: '3 Meses', description: 'RX de Controle e ganho de ADM.', type: 'exam', actionLabel: 'Pedido RX' }
        ]
    },
    'MENISCO': {
        title: 'Sutura de Menisco',
        steps: [
            { dayOffset: 0, title: 'Pós-Op Imediato', description: 'Restrição de carga e flexão.', type: 'message', actionLabel: 'Msg Cuidados' },
            { dayOffset: 14, title: 'Retirada de Pontos', description: 'Início de fisioterapia passiva.', type: 'appointment', actionLabel: 'Confirmar' },
            { dayOffset: 42, title: '6 Semanas', description: 'Liberação de carga total.', type: 'rehab', actionLabel: 'Orientação Carga' }
        ]
    },
    'OMBRO': {
        title: 'Manguito Rotador (Artroscopia)',
        steps: [
            { dayOffset: 0, title: 'Cirurgia', description: 'Uso correto da tipoia.', type: 'message', actionLabel: 'Vídeo Tipoia' },
            { dayOffset: 10, title: '10 Dias', description: 'Avaliação de ferida e pêndulo.', type: 'appointment', actionLabel: 'Confirmar' },
            { dayOffset: 45, title: 'Retirada da Tipoia', description: 'Início de ganho de ADM ativa.', type: 'rehab', actionLabel: 'Vídeo ADM' }
        ]
    }
};
