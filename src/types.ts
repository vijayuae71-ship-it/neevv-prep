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
