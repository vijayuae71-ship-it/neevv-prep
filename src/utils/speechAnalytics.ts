import { SpeechStats, SpeechAnalyticsSummary, Message } from '../types';

// Filler words to detect (Yoodli-inspired)
const FILLER_PATTERNS: RegExp[] = [
  /\b(um+)\b/gi,
  /\b(uh+)\b/gi,
  /\b(like)\b/gi,
  /\b(you know)\b/gi,
  /\b(basically)\b/gi,
  /\b(actually)\b/gi,
  /\b(sort of)\b/gi,
  /\b(kind of)\b/gi,
  /\b(i mean)\b/gi,
  /\b(right)\b/gi,
  /\b(so)\b(?=\s*,)/gi, // "so" only when followed by comma (filler usage)
];

// B-school vocabulary to track (Google Warmup-inspired)
const BSCHOOL_TERMS = [
  // Core business terms
  'roi', 'return on investment', 'leadership', 'stakeholder', 'cross-functional',
  'strategic', 'scalable', 'value proposition', 'competitive advantage', 'market sizing',
  'top-down', 'bottom-up', 'segmentation', 'framework', 'hypothesis', 'data-driven',
  'kpi', 'p&l', 'revenue', 'margin', 'growth rate', 'mece', 'impact', 'initiative',
  'collaboration', 'innovation', 'transformation', 'entrepreneurial', 'quantifiable',
  'metrics', 'pipeline', 'synergy', 'disruptive', 'pivot', 'global perspective',
  'networking', 'thought leadership', 'value creation', 'due diligence',
  // Exams & programs
  'gmat', 'gre', 'mba', 'pgdm',
  // Top B-schools
  'iim', 'isb', 'xlri', 'fms', 'mdi',
  // Academic & campus
  'case study', 'cohort', 'pedagogy', 'peer learning', 'campus placement', 'alumni',
  // Career tracks
  'entrepreneurship', 'consulting', 'investment banking', 'product management',
  // Interview & soft skills
  'star method', 'elevator pitch', 'diversity', 'inclusion',
  // Strategy & frameworks
  'market share', 'swot', 'porter', 'bcg matrix', 'ansoff',
  'profitability', 'break-even', 'unit economics', 'ltv', 'cac',
  'supply chain', 'operations', 'go-to-market', 'pricing strategy',
  'brand equity', 'customer acquisition', 'retention',
];

export function analyzeSpeech(text: string, durationMs: number): SpeechStats {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  const fillerWords: string[] = [];
  let fillerCount = 0;

  for (const pattern of FILLER_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      fillerWords.push(match[0].toLowerCase());
      fillerCount++;
    }
  }

  const durationMin = Math.max(durationMs / 60000, 0.1); // min 6 seconds
  const wordsPerMinute = Math.round(wordCount / durationMin);

  // Detect B-school terms — reuse the main BSCHOOL_TERMS list
  const bschoolTerms: string[] = [];
  const lowerText = text.toLowerCase();
  for (const term of BSCHOOL_TERMS) {
    if (lowerText.includes(term) && !bschoolTerms.includes(term)) {
      bschoolTerms.push(term);
    }
  }

  return {
    fillerCount,
    fillerWords,
    wordCount,
    durationMs,
    speakingDurationMs: durationMs,
    wordsPerMinute,
    bschoolTerms,
  };
}

export function computeSummary(messages: Message[]): SpeechAnalyticsSummary {
  const studentMsgs = messages.filter((m) => m.role === 'student');

  let totalFillerCount = 0;
  let totalWordCount = 0;
  let totalDurationMs = 0;
  const fillerCounts: Record<string, number> = {};
  const termsFound = new Set<string>();

  for (const msg of studentMsgs) {
    if (msg.speechStats) {
      totalFillerCount += msg.speechStats.fillerCount;
      totalWordCount += msg.speechStats.wordCount;
      totalDurationMs += msg.speechStats.speakingDurationMs;

      for (const f of msg.speechStats.fillerWords) {
        fillerCounts[f] = (fillerCounts[f] || 0) + 1;
      }
    } else {
      // Analyze text-only messages too
      const words = msg.text.trim().split(/\s+/).filter((w) => w.length > 0);
      totalWordCount += words.length;
    }

    // Check for B-school terms
    const lower = msg.text.toLowerCase();
    for (const term of BSCHOOL_TERMS) {
      if (lower.includes(term)) {
        termsFound.add(term);
      }
    }
  }

  const topFillers = Object.entries(fillerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  const fillerRate = totalWordCount > 0 ? Math.round((totalFillerCount / totalWordCount) * 100 * 10) / 10 : 0;
  const avgWpm = totalDurationMs > 0 ? Math.round(totalWordCount / (totalDurationMs / 60000)) : 0;

  return {
    totalFillerCount,
    totalWordCount,
    avgWpm,
    fillerRate,
    topFillers,
    bschoolTermsUsed: Array.from(termsFound),
  };
}

export function getFillerRating(rate: number): { label: string; color: string } {
  if (rate <= 1) return { label: 'Excellent', color: 'text-success' };
  if (rate <= 3) return { label: 'Good', color: 'text-info' };
  if (rate <= 5) return { label: 'Needs Work', color: 'text-warning' };
  return { label: 'High', color: 'text-error' };
}

export function getPacingRating(wpm: number): { label: string; color: string } {
  if (wpm === 0) return { label: 'N/A', color: 'text-base-content/40' };
  if (wpm >= 120 && wpm <= 160) return { label: 'Ideal', color: 'text-success' };
  if (wpm >= 100 && wpm <= 180) return { label: 'Good', color: 'text-info' };
  if (wpm < 100) return { label: 'Too Slow', color: 'text-warning' };
  return { label: 'Too Fast', color: 'text-error' };
}
