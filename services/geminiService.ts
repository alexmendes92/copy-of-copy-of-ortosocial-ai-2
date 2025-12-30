


import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { PostState, GeneratedPostContent, ArticleState, GeneratedArticle, InfographicState, GeneratedInfographic, ConversionState, ConversionResult, PostFormat, MessageTemplateState, TrendTopic, ComplianceAuditResult, NewsItem, VideoState, VideoScriptResult, WoundAnalysisResult, DrugInteractionResult, SupplementPlan, UserProfile, Appointment, Tone } from "../types";

// --- SINGLETON & CONFIG ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const commonSafetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// --- PERSONA MANAGEMENT (CONTEXT INJECTION) ---
let currentUserProfile: UserProfile = {
    name: "Dr. Carlos Franciozi",
    specialty: "Cirurgião de Joelho e Ombro",
    crm: "111501",
    defaultTone: Tone.PROFESSIONAL
};

export const updateUserProfile = (profile: UserProfile) => {
    currentUserProfile = profile;
};

const getPersonaContext = () => `
  *** CONTEXTO DO AUTOR (PERSONA) ***
  Você está agindo como: ${currentUserProfile.name}
  Especialidade: ${currentUserProfile.specialty}
  CRM: ${currentUserProfile.crm}
  
  ESTILO DE COMUNICAÇÃO:
  ${currentUserProfile.bio || "Médico experiente, focado em medicina baseada em evidência, mas com linguagem acessível ao paciente."}
  Sempre mantenha a autoridade médica, mas com empatia.
`;

const CFM_COMPLIANCE_INSTRUCTIONS = `
  *** DIRETRIZES OBRIGATÓRIAS DO CONSELHO FEDERAL DE MEDICINA (CFM 2.336/2023) ***
  1. IDENTIFICAÇÃO: Autor ${currentUserProfile.name} (CRM: ${currentUserProfile.crm}).
  2. VEDAÇÃO AO SENSACIONALISMO: Sem "o melhor", "garantido", "milagroso".
  3. SEM PREÇOS/PROMOÇÕES.
  4. ANTES E DEPOIS: Apenas caráter educativo, com aviso de variabilidade biológica.
  5. SEM EXCLUSIVIDADE: Não alegue ser o único capaz.
`;

// --- RESILIENCE LAYER (RETRY LOGIC) ---
async function callGeminiWithRetry<T>(
    operation: () => Promise<T>, 
    retries = 3, 
    delay = 1000
): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries > 0 && (error.status === 503 || error.status === 429 || error.message?.includes('overloaded'))) {
            console.warn(`Gemini API busy. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, delay));
            return callGeminiWithRetry(operation, retries - 1, delay * 2); // Exponential backoff
        }
        console.error("Gemini API Fatal Error:", error);
        throw error;
    }
}

// --- GENERATORS ---

export const transformScienceToContent = async (rawText: string, format: 'POST' | 'SCRIPT' | 'SIMPLIFIED' | 'EMAIL'): Promise<string> => {
    return callGeminiWithRetry(async () => {
        let instruction = "";
        
        switch(format) {
            case 'POST':
                instruction = "Crie uma legenda para Instagram engajadora, destacando a descoberta principal deste estudo e como ela beneficia o paciente. Use emojis e hashtags.";
                break;
            case 'SCRIPT':
                instruction = "Crie um roteiro de vídeo curto (Reels/TikTok) de 60 segundos. Use linguagem falada, gancho visual e Call to Action. Divida em: Gancho, Problema, Ciência (O Estudo), Solução.";
                break;
            case 'SIMPLIFIED':
                instruction = "Resuma este estudo científico em linguagem extremamente simples (nível 5ª série) para um paciente leigo entender. Use analogias.";
                break;
            case 'EMAIL':
                instruction = "Escreva um e-mail para colegas médicos recomendando a leitura deste estudo, destacando os pontos técnicos inovadores.";
                break;
        }

        const prompt = `
            ${getPersonaContext()}
            ${CFM_COMPLIANCE_INSTRUCTIONS}
            
            TAREFA: Transformar o seguinte texto científico no formato: ${format}.
            
            TEXTO CIENTÍFICO ORIGINAL:
            "${rawText.substring(0, 15000)}" // Limit check

            INSTRUÇÃO ESPECÍFICA:
            ${instruction}
            
            Retorne apenas o conteúdo gerado.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        return response.text || "Erro ao gerar conteúdo.";
    });
};

export const generateKeywordsForTopic = async (topic: string): Promise<string> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Atue como um especialista em SEO Médico.
        Para o tópico "${topic}", gere 5 a 8 palavras-chave de cauda longa (long-tail keywords) otimizadas para busca no Google Brasil.
        Foque em termos que pacientes digitam (ex: "tratamento para...", "dor em...", "especialista em...").
        Retorne APENAS as palavras-chave separadas por vírgula, sem numeração ou texto adicional.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text || "";
    });
};

export const generatePostText = async (state: PostState): Promise<GeneratedPostContent> => {
  return callGeminiWithRetry(async () => {
      let prompt = '';
      let parts: any[] = [];
      let evidenceBlock = "";

      if (state.evidence) {
          evidenceBlock = `
            *** BASE CIENTÍFICA (RAG) ***
            Baseie-se neste estudo:
            "${state.evidence.title}" (${state.evidence.source}, ${state.evidence.pubdate}).
            Conteúdo: "${state.evidence.abstract || 'N/A'}"
          `;
      }

      if (state.uploadedImage) {
          const base64Data = state.uploadedImage.split(',')[1];
          const mimeType = state.uploadedImage.split(';')[0].split(':')[1];
          parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
          prompt = `Analise a imagem clínica. Crie legenda para Instagram. Tópico: "${state.topic}". Categoria: ${state.category}. Formato: ${state.format}.`;
      } else {
          prompt = `
            Crie um post para Instagram de alta performance.
            Tópico: ${state.topic}
            Categoria: ${state.category}
            Tom: ${state.tone}
            Formato: ${state.format}
            Instruções: ${state.customInstructions || "Nenhuma"}
            
            ${getPersonaContext()}
            ${evidenceBlock}
            ${CFM_COMPLIANCE_INSTRUCTIONS}
          `;
      }

      prompt += `
        Gere JSON:
        - headline (max 6 palavras, impactante)
        - caption (legenda formatada com quebras de linha)
        - hashtags (15 tags)
        - imagePromptDescription (descrição visual detalhada para gerar imagem, estilo premium medical illustration)
      `;

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: parts },
        config: {
          responseMimeType: "application/json",
          safetySettings: commonSafetySettings,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              caption: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              imagePromptDescription: { type: Type.STRING }
            },
            required: ["headline", "caption", "hashtags", "imagePromptDescription"]
          }
        }
      });

      if (!response.text) throw new Error("Sem resposta da IA.");
      return JSON.parse(response.text) as GeneratedPostContent;
  });
};

export const generateVideoScript = async (state: VideoState): Promise<VideoScriptResult> => {
    return callGeminiWithRetry(async () => {
        const prompt = `
          Crie um roteiro de vídeo para YouTube EXTREMAMENTE detalhado e profissional.
          Tópico: ${state.topic}
          Público: ${state.targetAudience}
          Tom: ${state.tone}
          
          ${getPersonaContext()}
          ${CFM_COMPLIANCE_INSTRUCTIONS}

          ESTRUTURA DE RETENÇÃO (IMPORTANTE):
          1. HOOK (0-60s): Gancho magnético.
          2. INTRO: Breve apresentação.
          3. CONTEÚDO: Divida em passos ou dicas claras.
          4. OBJEÇÃO: Quebre uma crença limitante do paciente.
          5. CTA: Chamada para ação.

          Gere JSON com estrutura: 
          - title (Título viral)
          - thumbnailText (Texto curto para capa)
          - thumbnailVisual (Descrição da imagem da capa)
          - description (Descrição SEO para YouTube)
          - tags (Tags para YouTube)
          - script (array de objetos {type: "HOOK"|"INTRO"|"CONTEUDO"|"OBJECAO"|"CTA", duration: string, visual: string, audio: string, notes?: string}).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                safetySettings: commonSafetySettings
            }
        });

        if (!response.text) throw new Error("Erro no roteiro.");
        return JSON.parse(response.text) as VideoScriptResult;
    });
};

export const generateBlogFromAudio = async (audioBase64: string, mimeType: string): Promise<GeneratedArticle> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Transcreva e transforme em Artigo de Blog SEO. ${getPersonaContext()} ${CFM_COMPLIANCE_INSTRUCTIONS}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: audioBase64 } },
                    { text: prompt }
                ]
            },
            config: { responseMimeType: "application/json" }
        });

        if (!response.text) throw new Error("Erro no áudio.");
        return JSON.parse(response.text) as GeneratedArticle;
    });
};

export const remixContent = async (sourceContent: string, targetFormat: 'VIDEO_SCRIPT' | 'ARTICLE' | 'CAROUSEL'): Promise<any> => {
    return callGeminiWithRetry(async () => {
        const prompt = `
            REMIX DE CONTEÚDO.
            Transforme o seguinte conteúdo fonte (Post/Texto) para o formato: ${targetFormat}.
            
            CONTEÚDO FONTE:
            "${sourceContent.substring(0, 3000)}"

            ${getPersonaContext()}
            ${CFM_COMPLIANCE_INSTRUCTIONS}

            Se formato for VIDEO_SCRIPT, gere JSON de roteiro.
            Se formato for ARTICLE, gere JSON de artigo.
            Se formato for CAROUSEL, gere JSON com array de slides {title, text, imagePrompt}.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        if (!response.text) throw new Error("Erro no remix.");
        return JSON.parse(response.text);
    });
};

export const generatePostImage = async (promptDescription: string, format: PostFormat): Promise<string> => {
  return callGeminiWithRetry(async () => {
      const aspectRatio = format === PostFormat.STORY ? "9:16" : "1:1";
      const enhancedPrompt = `Medical illustration: ${promptDescription}. Premium, photorealistic, cinematic lighting. No text. ${getPersonaContext()}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: enhancedPrompt }] },
        config: { imageConfig: { aspectRatio } }
      });

      // Find the image part.
      let base64 = "";
      if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                  base64 = part.inlineData.data;
                  break;
              }
          }
      }

      if (!base64) throw new Error("Erro na imagem.");
      return `data:image/png;base64,${base64}`;
  });
};

export const analyzeWoundImage = async (base64Image: string): Promise<WoundAnalysisResult> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Analise esta imagem clínica de uma ferida cirúrgica ou lesão ortopédica.
        Identifique sinais de infecção, deiscência ou cicatrização normal.
        Gere JSON: riskLevel (Baixo/Moderado/Alto), signs (array de strings), recommendation, disclaimer (aviso legal padrão).`;
        
        const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
        let mimeType = 'image/jpeg';
        let data = base64Image;
        if (matches) {
            mimeType = matches[1];
            data = matches[2];
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                safetySettings: commonSafetySettings,
            }
        });
        if (!response.text) throw new Error("Sem resposta.");
        return JSON.parse(response.text) as WoundAnalysisResult;
    });
};

export const checkDrugInteractions = async (medList: string): Promise<DrugInteractionResult> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Analise interações medicamentosas para: ${medList}.
        Foco em ortopedia (AINES, analgésicos, anticoagulantes).
        Gere JSON: hasInteraction (bool), severity (Nenhuma/Leve/Moderada/Grave), details, recommendation.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!) as DrugInteractionResult;
    });
};

export const generateSupplementPlan = async (injuryType: string): Promise<SupplementPlan> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Crie um plano de suplementação para recuperação de: ${injuryType}.
        Baseado em evidências (Colágeno, Creatina, Whey, Curcuma, etc).
        Gere JSON: injuryType, supplements (array {name, dosage, reason, timing}).`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!) as SupplementPlan;
    });
};

export const auditContent = async (text: string): Promise<ComplianceAuditResult> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Auditoria CFM (Brasil) para o texto médico:
        "${text}"
        Verifique: Sensacionalismo, garantia de resultados, "o melhor", antes/depois abusivo.
        Gere JSON: compliant (bool), riskLevel (safe/warning/danger), issues (strings), suggestions (strings).`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!) as ComplianceAuditResult;
    });
};

export const refinePostCaption = async (original: string, instruction: string): Promise<string> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Refine este texto de post médico seguindo a instrução: "${instruction}".
        Texto original: "${original}"
        Mantenha tom profissional e compliance CFM. Retorne apenas o texto melhorado.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text || original;
    });
};

export const generateAppointmentMessage = async (state: { appointment: Appointment, tone: Tone, customNote?: string }): Promise<string> => {
    return callGeminiWithRetry(async () => {
        const { appointment, tone, customNote } = state;
        const prompt = `Escreva uma mensagem de WhatsApp para o paciente ${appointment.patientName}.
        Motivo: ${appointment.type}. Data: ${appointment.date} ${appointment.time}.
        Tom: ${tone}.
        Status: ${appointment.status}.
        ${customNote ? `Observação Específica do Médico: ${customNote}` : ''}
        
        A mensagem deve ser empática, clara e profissional. Não coloque 'Assunto:'. Comece com uma saudação amigável.
        Retorne apenas o texto da mensagem.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text || "";
    });
};

export const generateTrendSuggestions = async (): Promise<TrendTopic[]> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Gere 4 trending topics de saúde/ortopedia para o Brasil hoje.
        Gere JSON: array de {keyword, volume (Alta/Média), growth (+XX%), category, suggestedHeadline}.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!) as TrendTopic[];
    });
};

export const generateOrthopedicNews = async (): Promise<NewsItem[]> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Gere 4 notícias recentes fictícias (baseadas em tendências reais) sobre mercado de ortopedia, tecnologia médica ou eventos.
        Gere JSON: array de {id, title, summary, category (Industry/Clinical/Event/Tech), source, date}.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!) as NewsItem[];
    });
};

export const generateSEOArticle = async (state: ArticleState): Promise<GeneratedArticle> => {
    return callGeminiWithRetry(async () => {
        let evidenceText = "";
        if (state.evidence) {
            evidenceText = `Baseie-se no estudo: ${state.evidence.title} (${state.evidence.abstract})`;
        }

        const prompt = `Escreva um artigo médico SEO completo.
        Tópico: ${state.topic}. 
        ${state.articleType ? `Formato do Artigo: ${state.articleType}.` : ''}
        ${state.mainQuestion ? `Foque em responder a esta dor/dúvida do paciente: "${state.mainQuestion}".` : ''}
        Keywords: ${state.keywords}.
        Público: ${state.audience}. Tom: ${state.tone}.
        ${evidenceText}
        
        Gere JSON: title, slug, metaDescription, contentHtml (com tags h2, h3, p, ul), wordCount, seoSuggestions (array), keywordsUsed (array).`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Pro for longer content
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!) as GeneratedArticle;
    });
};

export const generateInfographicContent = async (state: InfographicState): Promise<GeneratedInfographic> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Crie conteúdo para infográfico médico sobre: ${state.diagnosis}.
        Perfil: ${state.patientProfile}. Tom: ${state.tone}. Notas: ${state.notes}.
        Gere JSON completo conforme estrutura GeneratedInfographic (anatomy, mechanism, symptoms, treatment, rehab).
        Inclua prompts de imagem para heroImagePrompt e anatomy.imagePrompt.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!) as GeneratedInfographic;
    });
};

export const generateConversionContent = async (state: ConversionState): Promise<ConversionResult> => {
    return callGeminiWithRetry(async () => {
        const prompt = `Crie conteúdo de conversão (venda ética).
        Patologia: ${state.pathology}. Objeção: ${state.objection}. Formato: ${state.format}.
        Se REELS: gere script (array de {time, visual, audio, textOverlay}).
        Se DEEP_ARTICLE: gere articleContent (HTML).
        Gere JSON: format, title, articleContent?, script?, caption, CTA.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!) as ConversionResult;
    });
};
