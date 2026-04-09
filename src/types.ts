export interface SpeechStats {
  wordCount: number;
  fillerCount: number;
  fillerWords: string[];
  wordsPerMinute: number;
  durationMs: number;
  speakingDurationMs: number;
  bschoolTerms: string[];
}

export interface Message {
  id: string;
  role: 'coach' | 'student';
  text: string;
  timestamp: number;
  speechStats?: SpeechStats;
}

export interface ScoreEntry {
  category: string;
  score: number;
  strength: string;
  gap: string;
}

export interface SpeechAnalyticsSummary {
  totalWordCount: number;
  totalFillerCount: number;
  fillerRate: number;
  avgWpm: number;
  topFillers: { word: string; count: number }[];
  bschoolTermsUsed: string[];
}

// ══════ Lifecycle Orchestrator Types ══════

export type LifecycleStage = 'foundation' | 'matching' | 'application' | 'interview';

export interface NeevScore {
  total: number; // 0-100
  metrics: number; // 0-40
  structure: number; // 0-30
  keywords: number; // 0-30
  criticalGaps: string[];
  rewrittenBullets: string[];
}

export interface JobMatch {
  title: string;
  company: string;
  matchScore: number;
  whyMatch: string;
  link: string;
  source: string;
}

export interface ApplicationKit {
  coverLetter: string;
  linkedInNote: string;
  atsKeywords: string[];
  jobTitle: string;
  company: string;
}

export interface LifecycleState {
  stage: LifecycleStage;
  resumeText: string;
  neevScore: NeevScore | null;
  skills: string[];
  jobMatches: JobMatch[];
  selectedJob: JobMatch | null;
  applicationKit: ApplicationKit | null;
  profileData: {
    name: string;
    email: string;
    college: string;
    major: string;
    skills: string[];
    targetJob: string;
    location: string;
  };
}
