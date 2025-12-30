
export enum Tone {
  PROFESSIONAL = 'Profissional/Cirúrgico',
  EMPATHETIC = 'Empático/Acolhedor',
  EDUCATIONAL = 'Didático/Anatômico',
  MOTIVATIONAL = 'Motivacional/Recuperação',
  DIRECT = 'Direto/Objetivo',
}

export enum PostCategory {
  PATHOLOGY = 'Doenças e Dores',
  SURGERY = 'Cirurgias e Procedimentos',
  SPORTS = 'Esporte e Prevenção',
  REHAB = 'Reabilitação e Pós-Op',
  LIFESTYLE = 'Qualidade de Vida',
  MYTHS = 'Mitos da Ortopedia',
}

export enum PostFormat {
  FEED = 'Feed (Quadrado)',
  STORY = 'Story (Vertical)',
  REMIX = 'Remix (Feed + Story + Thread)',
  YOUTUBE_SCRIPT = 'Roteiro YouTube (Longo)', 
  PODCAST_OUTLINE = 'Pauta de Podcast', 
}

export enum ArticleLength {
  SHORT = 'Curto (500-800 palavras)',
  MEDIUM = 'Médio (800-1200 palavras)',
  LONG = 'Longo/Completo (1500+ palavras)',
}

export enum TargetAudience {
  PATIENT = 'Paciente Leigo',
  ATHLETE = 'Atleta/Esportista',
  ELDERLY = 'Idosos/Terceira Idade',
  PARENTS = 'Pais (Ortopedia Pediátrica)',
}

export enum PatientProfile {
  CHILD = 'Criança (Pediátrico)',
  ADULT = 'Adulto',
  ELDERLY = 'Idoso',
  ATHLETE = 'Atleta de Alta Performance',
  SEDENTARY = 'Sedentário',
}

// --- USER PERSONA (NEW) ---
export interface UserProfile {
  name: string;
  specialty: string;
  crm: string;
  defaultTone: Tone;
  bio?: string; // Short bio to inject context
}

// --- NEWS TYPES ---

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'Industry' | 'Clinical' | 'Event' | 'Tech';
  source: string;
  date: string;
  url?: string;
}

// --- CLINICAL TOOLS TYPES (NEW) ---

export interface WoundAnalysisResult {
  riskLevel: 'Baixo' | 'Moderado' | 'Alto';
  signs: string[];
  recommendation: string;
  disclaimer: string;
}

export interface DrugInteractionResult {
  hasInteraction: boolean;
  severity: 'Nenhuma' | 'Leve' | 'Moderada' | 'Grave';
  details: string;
  recommendation: string;
}

export interface SupplementPlan {
  injuryType: string;
  supplements: Array<{
    name: string;
    dosage: string;
    reason: string;
    timing: string;
  }>;
}

// --- COMPLIANCE AUDIT TYPES ---

export interface ComplianceAuditResult {
  compliant: boolean;
  riskLevel: 'safe' | 'warning' | 'danger';
  issues: string[];
  suggestions: string[];
}

// --- INSTAGRAM TYPES ---

export interface InstagramConfig {
  accessToken: string;
  accountId: string; // The Instagram Business Account ID
  isConnected: boolean;
}

export interface InstagramPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// --- PUBMED TYPES ---

export interface PubMedArticle {
  uid: string;
  title: string;
  source: string;
  pubdate: string;
  authors: { name: string }[];
  volume?: string;
  url: string;
  abstract?: string; // New field for RAG
}

// --- CORE GENERATION TYPES ---

export interface GeneratedPostContent {
  headline: string;
  caption: string;
  hashtags: string[];
  imagePromptDescription: string;
}

// NEW: Supports multiple formats in one result
export interface RemixContent {
  feed: GeneratedPostContent;
  story: {
    textOverlay: string; // Text to put on image
    stickerIdea: string; // "Enquete: Voce sente isso?"
    caption: string;
  };
  thread: string[]; // Twitter/Threads format
}

export interface GeneratedArticle {
  title: string;
  slug: string;
  metaDescription: string;
  contentHtml: string;
  wordCount: number;
  seoSuggestions: string[];
  keywordsUsed: string[];
}

// --- VIDEO & PODCAST TYPES ---

export interface VideoState {
  topic: string;
  targetAudience: TargetAudience;
  tone: Tone;
  customInstructions?: string;
  evidence?: PubMedArticle;
}

export interface VideoScriptSection {
  type: 'HOOK' | 'VINHETA' | 'INTRO' | 'CONTEUDO' | 'OBJECAO' | 'CTA' | 'OUTRO';
  duration: string;
  visual: string; // Camera/B-Roll instructions
  audio: string; // Spoken script
  notes?: string;
}

export interface VideoScriptResult {
  title: string;
  thumbnailText: string;
  thumbnailVisual: string;
  description: string;
  tags: string[];
  script: VideoScriptSection[];
}

// --- INFOGRAPHIC TYPES ---

export interface AnatomyPoint {
  label: string;
  text: string;
  x: number;
  y: number;
}

export interface MechanismStep {
  title: string;
  description: string;
  iconName: string;
}

export interface SymptomCard {
  title: string;
  description: string;
  iconName: string;
}

export interface TreatmentOption {
  type: 'conservador' | 'cirurgico';
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  indication: string;
}

export interface RehabPhase {
  phase: string;
  title: string;
  items: string[];
}

export interface GeneratedInfographic {
  topic: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImagePrompt: string;
  anatomy: {
    intro: string;
    imagePrompt: string;
    points: AnatomyPoint[];
  };
  mechanism: {
    title: string;
    intro: string;
    steps: MechanismStep[];
  };
  symptoms: {
    intro: string;
    items: SymptomCard[];
  };
  treatment: {
    intro: string;
    options: TreatmentOption[];
  };
  rehab: {
    intro: string;
    phases: RehabPhase[];
  };
  footerText: string;
}

export interface InfographicResult {
  data: GeneratedInfographic;
  heroImageUrl?: string | null;
  anatomyImageUrl?: string | null;
}

// --- CONVERSION MODULE TYPES ---

export type ConversionFormat = 'REELS' | 'DEEP_ARTICLE';

export interface ConversionState {
  pathology: string;
  objection: string;
  format: ConversionFormat;
}

export interface ReelsScriptLine {
  time: string;
  visual: string;
  audio: string;
  textOverlay: string;
}

export interface ConversionResult {
  format: ConversionFormat;
  title: string;
  articleContent?: string; 
  script?: ReelsScriptLine[];
  caption?: string;
  CTA: string;
}

// --- SCHEDULING MODULE TYPES ---

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'checkin';
export type AppointmentType = 'first_visit' | 'return' | 'post_op' | 'infiltration' | 'surgery';
export type FinancialStatus = 'paid' | 'pending' | 'insurance';

export interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  phone: string;
  notes?: string;
  financialStatus?: FinancialStatus;
  value?: number;
  tags?: string[];
  surgeryChecklist?: {
      fasting: boolean;
      exams: boolean;
      materials: boolean;
      anesthetist: boolean;
  };
  voiceNotes?: string[];
}

export interface MessageTemplateState {
  appointment: Appointment;
  tone: Tone;
  customNote?: string;
}

// --- PROTOCOL / PATIENT JOURNEY TYPES ---

export type ProtocolType = 'LCA' | 'ATJ' | 'MENISCO' | 'OMBRO';

export interface ProtocolStep {
  dayOffset: number; // 0 = surgery day, 1 = day after, etc.
  title: string;
  description: string;
  type: 'message' | 'appointment' | 'rehab' | 'exam';
  actionLabel?: string;
}

export interface PatientJourneyState {
  patientName: string;
  surgeryDate: string;
  protocolType: ProtocolType;
  tone: Tone;
}

export interface TimelineEvent extends ProtocolStep {
  id: string;
  calculatedDate: string;
  generatedMessage?: string; // AI generated personalized message
}

// --- TRENDS & ANALYTICS ---

export interface TrendTopic {
    keyword: string;
    volume: string;
    growth: string;
    category: string;
    suggestedHeadline: string;
}

// --- SHARED STATE ---

export interface PostState {
  topic: string;
  category: PostCategory;
  tone: Tone;
  format: PostFormat;
  customInstructions: string;
  uploadedImage?: string | null;
  evidence?: PubMedArticle; // NEW: RAG Context
}

export interface ArticleState {
  topic: string;
  keywords: string;
  length: ArticleLength;
  audience: TargetAudience;
  tone: Tone;
  evidence?: PubMedArticle; // NEW: RAG Context
  articleType?: string; // NEW: Guide, List, Case Study
  mainQuestion?: string; // NEW: The main user pain point
}

export interface InfographicState {
  diagnosis: string;
  patientProfile: PatientProfile;
  tone: Tone;
  notes: string;
}

export interface GeneratedResult {
  id: string;
  date: string;
  remix?: RemixContent; // NEW: Supports the remix
  content?: GeneratedPostContent; // Legacy support
  imageUrl: string | null;
  isCustomImage: boolean;
  type: 'post' | 'article' | 'infographic' | 'conversion' | 'video'; // Added 'video'
  videoScript?: VideoScriptResult; // Added for video results
}

// --- RTS CALCULATOR TYPES ---

export interface RTSMetrics {
  patientName: string;
  limbSymmetry: number;
  painScore: number;
  romExtension: number;
  romFlexion: number;
  hopTest: number;
  psychologicalReadiness: number;
}

export interface RTSHistoryEntry {
  id: string;
  date: string;
  patientName: string;
  score: number;
  metrics: RTSMetrics;
}

// --- SCIENTIFIC PUBLICATIONS (RICH DATA) ---

export interface PublicationSection {
    header: string;
    body: string;
}

export interface ScientificPublication {
  external_id: number;
  title: string;
  authors_raw: string;
  journal: string;
  year: number;
  identifiers: {
      pmid?: string;
      pmcid?: string;
  };
  urls: {
      pubmed?: string;
  };
  access_type?: string;
  category?: string;
  content: {
      full_raw?: string;
      sections?: PublicationSection[];
  };
}
