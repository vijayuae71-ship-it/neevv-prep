import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Navbar, Page } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { FreeTools } from './components/FreeTools';
import { SetupScreen } from './components/SetupScreen';
import { ChatInterface } from './components/ChatInterface';
import { Scorecard } from './components/Scorecard';
import { QuestionBank } from './components/QuestionBank';
import { DailyPractice } from './components/DailyPractice';
import { CaseLibrary } from './components/CaseLibrary';
import { StoryBank } from './components/StoryBank';
import { Preferences } from './components/Preferences';
import { UpgradePlan } from './components/UpgradePlan';
import { GetHelp } from './components/GetHelp';
import { TechSetup } from './components/TechSetup';
import { TechChatInterface } from './components/TechChatInterface';
import { TechQuestionBank } from './components/TechQuestionBank';
import { TechScorecard } from './components/TechScorecard';
import { ProgressDashboard } from './components/ProgressDashboard';
import { LifecycleOrchestrator } from './components/LifecycleOrchestrator';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DomainQuestionBank } from './components/DomainQuestionBank';
import { DomainSetup, DomainInterviewConfig } from './components/DomainSetup';
import { DomainChatInterface } from './components/DomainChatInterface';
import { DomainScorecard } from './components/DomainScorecard';
import { DOMAIN_CONFIGS } from './data/domainQuestions';
import { Message, ScoreEntry, SpeechAnalyticsSummary } from './types';
import { sendMessageStreaming } from './utils/difyApi';
import { getJSON, setJSON } from './utils/localStorage';
import { analyzeSpeech, computeSummary } from './utils/speechAnalytics';
import { validateMath, isGuesstimateLikelyAnswer } from './utils/mathValidator';

let _idCounter = 0;
function makeId(): string {
  _idCounter++;
  return _idCounter.toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// Detect scorecard in AI response
function detectScorecard(text: string): { isScorecard: boolean; scores: ScoreEntry[]; overallScore: number; coachNote: string } {
  const cleanText = text.replace(/\*\*(\d+)\*\*/g, '$1');
  const lower = cleanText.toLowerCase();
  const hasScorecard = (lower.includes('scorecard') || lower.includes('score')) &&
    (lower.includes('foundation') || lower.includes('logic') || lower.includes('communication'));

  if (!hasScorecard) return { isScorecard: false, scores: [], overallScore: 0, coachNote: '' };

  const scores: ScoreEntry[] = [];
  const categories = [
    { name: 'Foundation', patterns: ['foundation'] },
    { name: 'Logic', patterns: ['logic', 'analytical'] },
    { name: 'Communication', patterns: ['communication', 'articulation'] },
  ];

  for (const cat of categories) {
    for (const pattern of cat.patterns) {
      const scoreRegex = new RegExp(pattern + '[^\\d]*?(\\d{1,2})\\s*(?:\\/\\s*10|out of 10)?', 'i');
      const match = cleanText.match(scoreRegex);
      if (match) {
        const score = Math.min(10, Math.max(1, parseInt(match[1], 10)));
        const catIdx = lower.indexOf(pattern);
        const section = cleanText.substring(catIdx, catIdx + 500);
        const strengthMatch = section.match(/(?:strength|strong|positive)[:\s]*([^\n|*]+)/i);
        const gapMatch = section.match(/(?:gap|improve|weak|critical|area)[:\s]*([^\n|*]+)/i);
        scores.push({
          category: cat.name,
          score,
          strength: strengthMatch ? strengthMatch[1].trim().replace(/^\*+|\*+$/g, '').trim() : 'Demonstrated solid effort in this area.',
          gap: gapMatch ? gapMatch[1].trim().replace(/^\*+|\*+$/g, '').trim() : 'Room for improvement with focused practice.',
        });
        break;
      }
    }
  }

  if (scores.length === 0) return { isScorecard: false, scores: [], overallScore: 0, coachNote: '' };

  const overallScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
  const noteMatch = cleanText.match(/(?:overall|coach['']?s?\s*note|final\s*(?:thought|feedback|note))[:\s]*([^\n]+(?:\n[^\n#|]+)*)/i);
  const coachNote = noteMatch
    ? noteMatch[1].trim().replace(/^\*+|\*+$/g, '').trim()
    : `Your overall score is ${overallScore}/10. Keep practicing to strengthen your foundation!`;

  return { isScorecard: true, scores, overallScore, coachNote };
}

function estimateQuestion(messageCount: number): number {
  const pairs = Math.floor(messageCount / 2);
  if (pairs <= 1) return 0;
  if (pairs <= 2) return 1;
  if (pairs <= 3) return 2;
  if (pairs <= 4) return 3;
  if (pairs <= 5) return 4;
  return 5;
}

function formatScorecardText(
  studentName: string, targetSchool: string, scores: ScoreEntry[],
  overallScore: number, coachNote: string, speechSummary: SpeechAnalyticsSummary
): string {
  let text = `🎓 neevv Scorecard\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Student: ${studentName}\n`;
  text += `Target: ${targetSchool}\n`;
  text += `Overall Score: ${overallScore}/10\n\n`;
  text += `📊 Category Scores\n────────────────────\n`;

  for (const s of scores) {
    text += `\n${s.category}: ${s.score}/10\n`;
    text += `  ✅ Strength: ${s.strength}\n`;
    text += `  ⚠️ Gap: ${s.gap}\n`;
  }

  if (speechSummary.totalWordCount > 0) {
    text += `\n🎙️ Communication Analytics\n────────────────────\n`;
    text += `  Words Spoken: ${speechSummary.totalWordCount}\n`;
    if (speechSummary.avgWpm > 0) text += `  Pacing: ${speechSummary.avgWpm} wpm\n`;
    text += `  Filler Words: ${speechSummary.totalFillerCount} (${speechSummary.fillerRate}% rate)\n`;
    if (speechSummary.topFillers.length > 0) {
      text += `  Top Fillers: ${speechSummary.topFillers.map((f) => `"${f.word}" ×${f.count}`).join(', ')}\n`;
    }
    if (speechSummary.bschoolTermsUsed.length > 0) {
      text += `  B-School Terms Used: ${speechSummary.bschoolTermsUsed.join(', ')}\n`;
    }
  }

  text += `\n💬 Coach's Note\n────────────────────\n`;
  text += `${coachNote}\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Powered by neevv Prep · Your B-school interview foundation`;
  return text;
}

const App: React.FC = () => {
  // ═══════ AUTH STATE ═══════
  const [authUser, setAuthUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const raw = localStorage.getItem('neevv_auth');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const handleLogin = useCallback((name: string, email: string) => {
    const user = { name, email };
    setAuthUser(user);
    localStorage.setItem('neevv_auth', JSON.stringify(user));
  }, []);

  const handleLogout = useCallback(() => {
    setAuthUser(null);
    localStorage.removeItem('neevv_auth');
    setPage('landing');
  }, []);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('neevv_onboarding_complete');
  });

  const [page, setPage] = useState<Page>('landing');
  const [phase, setPhase] = useState<'setup' | 'interview' | 'scorecard'>('setup');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [profile, setProfile] = useState<{ name: string; targetSchool: string; background: string; email: string; resumeText: string } | null>(null);
  const [scorecardData, setScorecardData] = useState<{
    scores: ScoreEntry[]; overallScore: number; coachNote: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mathAlert, setMathAlert] = useState<string | null>(null);
  const [mentorSent, setMentorSent] = useState(false);

  // Tech Interview state
  const [techPhase, setTechPhase] = useState<'setup' | 'interview' | 'scorecard'>('setup');
  const [techMessages, setTechMessages] = useState<Message[]>([]);
  const [isTechCoachTyping, setIsTechCoachTyping] = useState(false);
  const [isTechStreaming, setIsTechStreaming] = useState(false);
  const [isTechHintLoading, setIsTechHintLoading] = useState(false);
  const [techProfile, setTechProfile] = useState<{ name: string; company: string; level: string; techStack: string[]; email: string } | null>(null);
  const [techScorecardData, setTechScorecardData] = useState<{
    scores: ScoreEntry[]; overallScore: number; coachNote: string;
  } | null>(null);
  const [techError, setTechError] = useState<string | null>(null);

  // Domain Interview state
  const [domainPhase, setDomainPhase] = useState<'setup' | 'interview' | 'scorecard'>('setup');
  const [domainMessages, setDomainMessages] = useState<Message[]>([]);
  const [isDomainCoachTyping, setIsDomainCoachTyping] = useState(false);
  const [isDomainStreaming, setIsDomainStreaming] = useState(false);
  const [isDomainHintLoading, setIsDomainHintLoading] = useState(false);
  const [domainConfig, setDomainConfig] = useState<DomainInterviewConfig | null>(null);
  const [domainScorecardData, setDomainScorecardData] = useState<{
    scores: ScoreEntry[]; overallScore: number; coachNote: string;
  } | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  const domainConversationIdRef = useRef<string>('');
  const domainUserIdRef = useRef<string>((() => {
    const stored = localStorage.getItem('neevv_domain_uid');
    if (stored) return stored;
    const id = 'domain-' + Date.now().toString(36);
    localStorage.setItem('neevv_domain_uid', id);
    return id;
  })());

  const techConversationIdRef = useRef<string>('');
  const techUserIdRef = useRef<string>((() => {
    const stored = localStorage.getItem('neevv_tech_uid');
    if (stored) return stored;
    const id = 'tech-' + Date.now().toString(36);
    localStorage.setItem('neevv_tech_uid', id);
    return id;
  })());

  const conversationIdRef = useRef<string>('');
  const userIdRef = useRef<string>((() => {
    const stored = localStorage.getItem('neevv_uid');
    if (stored) return stored;
    const id = 'user-' + Date.now().toString(36);
    localStorage.setItem('neevv_uid', id);
    return id;
  })());
  const voiceStartRef = useRef<number>(0);
  const isGuesstimateModeRef = useRef<boolean>(false);

  const speechSummary = useMemo(() => computeSummary(messages), [messages]);

  // Auto-save progress every 3 student turns
  const lastAutoSaveCount = useRef<number>(0);
  React.useEffect(() => {
    const studentCount = messages.filter(m => m.role === 'student').length;
    if (studentCount > 0 && studentCount % 3 === 0 && studentCount !== lastAutoSaveCount.current) {
      lastAutoSaveCount.current = studentCount;
      const partialRecord = {
        id: 'partial-' + Date.now().toString(36),
        date: new Date().toISOString().slice(0, 10),
        type: 'mba' as const,
        overallScore: 0,
        categories: [],
        targetSchool: profile?.targetSchool,
        partial: true,
        questionCount: studentCount,
      };
      const existing = getJSON<any[]>('neevv_progress', []);
      // Remove previous partial for this session
      const filtered = existing.filter((r: any) => !r.partial);
      filtered.push(partialRecord);
      setJSON('neevv_progress', filtered);
    }
  }, [messages, profile]);

  const updateGuesstimatMode = useCallback((coachText: string) => {
    const lower = coachText.toLowerCase();
    if (lower.includes('guesstimate') || lower.includes('estimate') || lower.includes('market size') ||
        lower.includes('how many') || lower.includes('how much') || lower.includes('data exhibit') ||
        lower.includes('calculation') || lower.includes('step-by-step')) {
      isGuesstimateModeRef.current = true;
    }
    if (lower.includes('why this') || lower.includes('why now') || lower.includes('why mba') ||
        lower.includes('scorecard')) {
      isGuesstimateModeRef.current = false;
    }
  }, []);

  // ═══════ SAVE SESSION TO PROGRESS ═══════

  const saveSessionToProgress = useCallback((
    type: 'mba' | 'tech' | 'domain',
    scores: ScoreEntry[],
    overallScore: number,
    targetSchool?: string,
    targetCompany?: string,
  ) => {
    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString().slice(0, 10),
      type,
      overallScore,
      categories: scores.map(s => ({ category: s.category, score: s.score })),
      targetSchool,
      targetCompany,
    };
    const existing = getJSON<any[]>('neevv_progress', []);
    existing.push(record);
    setJSON('neevv_progress', existing);
  }, []);

  // ═══════ TECH INTERVIEW HANDLERS ═══════

  function detectTechScorecard(text: string): { isScorecard: boolean; scores: ScoreEntry[]; overallScore: number; coachNote: string } {
    const cleanText = text.replace(/\*\*(\d+)\*\*/g, '$1');
    const lower = cleanText.toLowerCase();
    const hasScorecard = (lower.includes('scorecard') || lower.includes('score')) &&
      (lower.includes('problem solving') || lower.includes('code quality') || lower.includes('optimization') || lower.includes('fundamentals'));

    if (!hasScorecard) return { isScorecard: false, scores: [], overallScore: 0, coachNote: '' };

    const scores: ScoreEntry[] = [];
    const categories = [
      { name: 'Problem Solving', patterns: ['problem solving', 'problem-solving'] },
      { name: 'Code Quality', patterns: ['code quality', 'code-quality', 'syntax'] },
      { name: 'Optimization', patterns: ['optimization', 'complexity', 'time/space'] },
      { name: 'Fundamentals', patterns: ['fundamentals', 'concepts', 'foundation'] },
    ];

    for (const cat of categories) {
      for (const pattern of cat.patterns) {
        const scoreRegex = new RegExp(pattern + '[^\\d]*?(\\d{1,2})\\s*(?:\\/\\s*10|out of 10)?', 'i');
        const match = cleanText.match(scoreRegex);
        if (match) {
          const score = Math.min(10, Math.max(1, parseInt(match[1], 10)));
          const catIdx = lower.indexOf(pattern);
          const section = cleanText.substring(catIdx, catIdx + 500);
          const strengthMatch = section.match(/(?:strength|strong|positive)[:\s]*([^\n|*]+)/i);
          const gapMatch = section.match(/(?:gap|improve|weak|critical|area)[:\s]*([^\n|*]+)/i);
          scores.push({
            category: cat.name,
            score,
            strength: strengthMatch ? strengthMatch[1].trim().replace(/^\*+|\*+$/g, '').trim() : 'Good effort in this area.',
            gap: gapMatch ? gapMatch[1].trim().replace(/^\*+|\*+$/g, '').trim() : 'Room for improvement with more practice.',
          });
          break;
        }
      }
    }

    if (scores.length === 0) return { isScorecard: false, scores: [], overallScore: 0, coachNote: '' };

    const overallScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
    const noteMatch = cleanText.match(/(?:overall|coach['']?s?\s*note|final\s*(?:thought|feedback|note))[:\s]*([^\n]+(?:\n[^\n#|]+)*)/i);
    const coachNote = noteMatch
      ? noteMatch[1].trim().replace(/^\*+|\*+$/g, '').trim()
      : `Your overall technical score is ${overallScore}/10. Keep coding and improving!`;

    return { isScorecard: true, scores, overallScore, coachNote };
  }

  // ═══════ DOMAIN INTERVIEW HANDLERS ═══════

  function detectDomainScorecard(text: string): { isScorecard: boolean; scores: ScoreEntry[]; overallScore: number; coachNote: string } {
    const cleanText = text.replace(/\*\*(\d+)\*\*/g, '$1');
    const lower = cleanText.toLowerCase();
    const hasScorecard = (lower.includes('scorecard') || lower.includes('score')) &&
      (lower.includes('domain knowledge') || lower.includes('problem solving') || lower.includes('communication') || lower.includes('practical application'));

    if (!hasScorecard) return { isScorecard: false, scores: [], overallScore: 0, coachNote: '' };

    const scores: ScoreEntry[] = [];
    const categories = [
      { name: 'Domain Knowledge', patterns: ['domain knowledge', 'domain-knowledge', 'technical knowledge'] },
      { name: 'Problem Solving', patterns: ['problem solving', 'problem-solving', 'analytical'] },
      { name: 'Communication', patterns: ['communication', 'articulation', 'clarity'] },
      { name: 'Practical Application', patterns: ['practical application', 'practical-application', 'real-world', 'application'] },
    ];

    for (const cat of categories) {
      for (const pattern of cat.patterns) {
        const scoreRegex = new RegExp(pattern + '[^\\d]*?(\\d{1,2})\\s*(?:\\/\\s*10|out of 10)?', 'i');
        const match = cleanText.match(scoreRegex);
        if (match) {
          const score = Math.min(10, Math.max(1, parseInt(match[1], 10)));
          const catIdx = lower.indexOf(pattern);
          const section = cleanText.substring(catIdx, catIdx + 500);
          const strengthMatch = section.match(/(?:strength|strong|positive)[:\s]*([^\n|*]+)/i);
          const gapMatch = section.match(/(?:gap|improve|weak|critical|area)[:\s]*([^\n|*]+)/i);
          scores.push({
            category: cat.name,
            score,
            strength: strengthMatch ? strengthMatch[1].trim().replace(/^\*+|\*+$/g, '').trim() : 'Good effort in this area.',
            gap: gapMatch ? gapMatch[1].trim().replace(/^\*+|\*+$/g, '').trim() : 'Room for improvement with more practice.',
          });
          break;
        }
      }
    }

    if (scores.length === 0) return { isScorecard: false, scores: [], overallScore: 0, coachNote: '' };

    const overallScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
    const noteMatch = cleanText.match(/(?:overall|coach['']?s?\s*note|final\s*(?:thought|feedback|note))[:\s]*([^\n]+(?:\n[^\n#|]+)*)/i);
    const coachNote = noteMatch
      ? noteMatch[1].trim().replace(/^\*+|\*+$/g, '').trim()
      : `Your overall domain readiness score is ${overallScore}/10. Keep sharpening your expertise!`;

    return { isScorecard: true, scores, overallScore, coachNote };
  }

  const handleDomainStart = useCallback(async (config: DomainInterviewConfig) => {
    setDomainConfig(config);
    setDomainPhase('interview');
    setDomainMessages([]);
    setIsDomainCoachTyping(true);
    setIsDomainStreaming(true);
    setDomainError(null);

    const domainLabel = DOMAIN_CONFIGS.find(d => d.key === config.domain)?.label || config.domain;

    try {
      const intro = `Hi, I'm ${config.name}. I'm preparing for ${domainLabel} placement interviews. My experience: ${config.experience}. I'm targeting a ${config.targetRole} role, with focus on ${config.subSpecialization}.

I'm ready for my domain mock interview.

IMPORTANT COACHING INSTRUCTIONS (follow these strictly):
1. You are neev Coach — a ${domainLabel} interview coach specializing in placement preparation.
2. Ask me 5 ${domainLabel}-specific questions covering: core concepts (2 questions), problem solving/case scenarios (2 questions), and practical application (1 question). Focus questions on ${config.subSpecialization}.
3. Adjust difficulty based on my experience level: ${config.experience}. Start with medium difficulty and adjust.
4. After each answer, provide feedback AND include an enhanced version under "### ✨ Enhanced Answer" showing a stronger version of MY answer.
5. After 5 questions, generate the neevv Domain Scorecard with scores for: Domain Knowledge, Problem Solving, Communication, Practical Application (each out of 10), with one strength and one critical gap per category.
6. Scorecard Format: Use EXACTLY this format:
   - Domain Knowledge: X/10 | Strength: ... | Gap: ...
   - Problem Solving: X/10 | Strength: ... | Gap: ...
   - Communication: X/10 | Strength: ... | Gap: ...
   - Practical Application: X/10 | Strength: ... | Gap: ...
   - Overall: X/10
   - Coach's Note: (2-3 sentences of personalized advice)
7. Be encouraging but honest. Challenge me on depth and practical understanding.
8. Always end the interview with "[INTERVIEW_COMPLETE]" marker after generating the scorecard.`;

      const coachMsgId = makeId();
      setDomainMessages([{ id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(intro, '', domainUserIdRef.current, (partial) => {
        setDomainMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
      });
      domainConversationIdRef.current = response.conversation_id;
      setDomainMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: response.answer } : m));
    } catch (err) {
      console.error('Failed to start domain interview:', err);
      setDomainError('Failed to connect to neev Coach. Please try again.');
    } finally {
      setIsDomainCoachTyping(false);
      setIsDomainStreaming(false);
    }
  }, []);

  const handleDomainSend = useCallback(async (text: string) => {
    if (isDomainCoachTyping) return;

    const studentMsg: Message = { id: makeId(), role: 'student', text, timestamp: Date.now() };
    setDomainMessages((prev) => [...prev, studentMsg]);
    setIsDomainCoachTyping(true);
    setIsDomainStreaming(true);
    setDomainError(null);

    try {
      const coachMsgId = makeId();
      setDomainMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(text, domainConversationIdRef.current, domainUserIdRef.current, (partial) => {
        setDomainMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
      });
      domainConversationIdRef.current = response.conversation_id;
      const coachText = response.answer;
      setDomainMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: coachText } : m));

      const scoreResult = detectDomainScorecard(coachText);
      if (scoreResult.isScorecard && scoreResult.scores.length >= 2) {
        setDomainScorecardData({ scores: scoreResult.scores, overallScore: scoreResult.overallScore, coachNote: scoreResult.coachNote });
        saveSessionToProgress('domain', scoreResult.scores, scoreResult.overallScore, undefined, domainConfig?.targetRole);
        setTimeout(() => setDomainPhase('scorecard'), 2000);
      }
    } catch (err) {
      console.error('Failed to get domain coach response:', err);
      setDomainError('Failed to get a response. Please try sending again.');
    } finally {
      setIsDomainCoachTyping(false);
      setIsDomainStreaming(false);
    }
  }, [isDomainCoachTyping, domainConfig, saveSessionToProgress]);

  const handleDomainHint = useCallback(async () => {
    if (isDomainCoachTyping || isDomainHintLoading) return;
    setIsDomainHintLoading(true);
    setIsDomainStreaming(true);
    setDomainError(null);

    try {
      const coachMsgId = makeId();
      setDomainMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(
        '[HINT REQUEST] I\'m stuck. Give me a brief hint — key concepts to consider, framework to apply, or approach to structure my answer. Just a nudge, NOT the full answer. 2-3 bullet points max.',
        domainConversationIdRef.current, domainUserIdRef.current,
        (partial) => {
          setDomainMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: '💡 **Hint:**\n\n' + partial } : m));
        }
      );
      domainConversationIdRef.current = response.conversation_id;
      setDomainMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: '💡 **Hint:**\n\n' + response.answer } : m));
    } catch (err) {
      console.error('Failed to get hint:', err);
      setDomainError('Couldn\'t load a hint. Try again.');
    } finally {
      setIsDomainHintLoading(false);
      setIsDomainStreaming(false);
    }
  }, [isDomainCoachTyping, isDomainHintLoading]);

  const handleDomainRequestScorecard = useCallback(async () => {
    if (isDomainCoachTyping) return;
    setIsDomainCoachTyping(true);
    setIsDomainStreaming(true);
    setDomainError(null);

    try {
      const coachMsgId = makeId();
      setDomainMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(
        'Please generate my neevv Domain Scorecard now with scores for Domain Knowledge, Problem Solving, Communication, and Practical Application (each out of 10), with specific strengths and critical gaps for each category. Include a final coach\'s note.',
        domainConversationIdRef.current, domainUserIdRef.current,
        (partial) => {
          setDomainMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
        }
      );
      domainConversationIdRef.current = response.conversation_id;
      setDomainMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: response.answer } : m));

      const scoreResult = detectDomainScorecard(response.answer);
      if (scoreResult.isScorecard && scoreResult.scores.length >= 2) {
        setDomainScorecardData({ scores: scoreResult.scores, overallScore: scoreResult.overallScore, coachNote: scoreResult.coachNote });
        saveSessionToProgress('domain', scoreResult.scores, scoreResult.overallScore, undefined, domainConfig?.targetRole);
        setTimeout(() => setDomainPhase('scorecard'), 2000);
      }
    } catch (err) {
      console.error('Failed to generate domain scorecard:', err);
      setDomainError('Failed to generate scorecard. Please try again.');
    } finally {
      setIsDomainCoachTyping(false);
      setIsDomainStreaming(false);
    }
  }, [isDomainCoachTyping, domainConfig, saveSessionToProgress]);

  const handleDomainRestart = useCallback(() => {
    setDomainPhase('setup');
    setDomainMessages([]);
    setDomainConfig(null);
    setDomainScorecardData(null);
    setDomainError(null);
    domainConversationIdRef.current = '';
    const newDomainUid = 'domain-' + Date.now().toString(36); localStorage.setItem('neevv_domain_uid', newDomainUid); domainUserIdRef.current = newDomainUid;
  }, []);

  const handleDomainEmailScorecard = useCallback(async (): Promise<boolean> => {
    if (!domainConfig?.email || !domainScorecardData) return false;
    try {
      const domainLabel = DOMAIN_CONFIGS.find(d => d.key === domainConfig.domain)?.label || domainConfig.domain;
      let emailBody = `💼 neevv Domain Scorecard\n━━━━━━━━━━━━━━━━━━━━━━\n`;
      emailBody += `Student: ${domainConfig.name}\nDomain: ${domainLabel}\nTarget Role: ${domainConfig.targetRole}\n`;
      emailBody += `Experience: ${domainConfig.experience}\nOverall Score: ${domainScorecardData.overallScore}/10\n\n`;
      for (const s of domainScorecardData.scores) {
        emailBody += `${s.category}: ${s.score}/10\n  ✅ ${s.strength}\n  ⚠️ ${s.gap}\n\n`;
      }
      emailBody += `Coach's Note: ${domainScorecardData.coachNote}\n\n━━━━━━━━━━━━━━━━━━━━━━\nPowered by neevv Prep`;
      const subject = encodeURIComponent(`💼 Your neevv Domain Scorecard — ${domainScorecardData.overallScore}/10 | ${domainLabel}`);
      const body = encodeURIComponent(emailBody);
      window.open(`mailto:${domainConfig.email}?subject=${subject}&body=${body}`, '_blank');
      return true;
    } catch (err) {
      console.error('Failed to open email:', err);
      return false;
    }
  }, [domainConfig, domainScorecardData]);

  const handleTechStart = useCallback(async (name: string, company: string, level: string, techStack: string[], email: string) => {
    setTechProfile({ name, company, level, techStack, email });
    setTechPhase('interview');
    setTechMessages([]);
    setIsTechCoachTyping(true);
    setIsTechStreaming(true);
    setTechError(null);

    try {
      const intro = `Hi, I'm ${name}. I'm preparing for technical interviews at ${company}. My experience level: ${level}. My tech stack: ${techStack.join(', ')}.

I'm ready for my mock technical interview.

IMPORTANT COACHING INSTRUCTIONS (follow these strictly):
1. You are neev Coach — a technical interview coach. Ask me 5 technical questions covering: DSA/coding (2 questions), SQL/database (1 question), language-specific concepts for ${techStack[0] || 'Python'} (1 question), and system design or problem solving (1 question).
2. For coding questions: present the problem clearly, ask me to write code or pseudocode, then evaluate my approach, time complexity, space complexity, edge cases, and code quality. After evaluating, always provide the optimal time and space complexity analysis.
3. For SQL questions: ALWAYS give me a complete schema context with table names, column names, and sample data BEFORE asking the query. Evaluate correctness, efficiency, and understanding of joins/subqueries/window functions.
4. For concept questions: ask me to explain with examples. Probe deeper if my answer is surface-level.
5. After each answer, provide feedback AND include an enhanced version under "### ✨ Enhanced Answer" showing a stronger version of MY answer.
6. After 5 questions, generate the neevv Tech Scorecard with scores for: Problem Solving, Code Quality, Optimization, Fundamentals (each out of 10), with one strength and one critical gap per category.
7. Adjust difficulty based on my experience level: ${level}. Use progressive difficulty — start easy and increase to medium/hard.
8. Scorecard Format: When generating the neevv Tech Scorecard, use EXACTLY this format:
   - Problem Solving: X/10 | Strength: ... | Gap: ...
   - Code Quality: X/10 | Strength: ... | Gap: ...
   - Optimization: X/10 | Strength: ... | Gap: ...
   - Fundamentals: X/10 | Strength: ... | Gap: ...
   - Overall: X/10
   - Coach's Note: (2-3 sentences of personalized advice)
9. Be encouraging but honest. If my code or answer is incorrect, explain WHY and what the correct approach is.
10. Always end the interview with "[INTERVIEW_COMPLETE]" marker after generating the scorecard.`;

      const coachMsgId = makeId();
      setTechMessages([{ id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(intro, '', techUserIdRef.current, (partial) => {
        setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
      });
      techConversationIdRef.current = response.conversation_id;
      setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: response.answer } : m));
    } catch (err) {
      console.error('Failed to start tech interview:', err);
      setTechError('Failed to connect to neev Coach. Please try again.');
    } finally {
      setIsTechCoachTyping(false);
      setIsTechStreaming(false);
    }
  }, []);

  const handleTechSend = useCallback(async (text: string) => {
    if (isTechCoachTyping) return;

    const studentMsg: Message = { id: makeId(), role: 'student', text, timestamp: Date.now() };
    setTechMessages((prev) => [...prev, studentMsg]);
    setIsTechCoachTyping(true);
    setIsTechStreaming(true);
    setTechError(null);

    try {
      const coachMsgId = makeId();
      setTechMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(text, techConversationIdRef.current, techUserIdRef.current, (partial) => {
        setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
      });
      techConversationIdRef.current = response.conversation_id;
      const coachText = response.answer;
      setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: coachText } : m));

      const scoreResult = detectTechScorecard(coachText);
      if (scoreResult.isScorecard && scoreResult.scores.length >= 2) {
        setTechScorecardData({ scores: scoreResult.scores, overallScore: scoreResult.overallScore, coachNote: scoreResult.coachNote });
        saveSessionToProgress('tech', scoreResult.scores, scoreResult.overallScore, undefined, techProfile?.company);
        setTimeout(() => setTechPhase('scorecard'), 2000);
      }
    } catch (err) {
      console.error('Failed to get tech coach response:', err);
      setTechError('Failed to get a response. Please try sending again.');
    } finally {
      setIsTechCoachTyping(false);
      setIsTechStreaming(false);
    }
  }, [isTechCoachTyping, techProfile, saveSessionToProgress]);

  const handleTechHint = useCallback(async () => {
    if (isTechCoachTyping || isTechHintLoading) return;
    setIsTechHintLoading(true);
    setIsTechStreaming(true);
    setTechError(null);

    try {
      const coachMsgId = makeId();
      setTechMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(
        '[HINT REQUEST] I\'m stuck. Give me a brief hint — maybe the data structure to consider, the algorithm pattern, or the key concept. Just a nudge, NOT the full answer. 2-3 bullet points max.',
        techConversationIdRef.current, techUserIdRef.current,
        (partial) => {
          setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: '💡 **Hint:**\n\n' + partial } : m));
        }
      );
      techConversationIdRef.current = response.conversation_id;
      setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: '💡 **Hint:**\n\n' + response.answer } : m));
    } catch (err) {
      console.error('Failed to get hint:', err);
      setTechError('Couldn\'t load a hint. Try again.');
    } finally {
      setIsTechHintLoading(false);
      setIsTechStreaming(false);
    }
  }, [isTechCoachTyping, isTechHintLoading]);

  const handleTechRequestScorecard = useCallback(async () => {
    if (isTechCoachTyping) return;
    setIsTechCoachTyping(true);
    setIsTechStreaming(true);
    setTechError(null);

    try {
      const coachMsgId = makeId();
      setTechMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(
        'Please generate my neevv Tech Scorecard now with scores for Problem Solving, Code Quality, Optimization, and Fundamentals (each out of 10), with specific strengths and critical gaps for each category. Include a final coach\'s note.',
        techConversationIdRef.current, techUserIdRef.current,
        (partial) => {
          setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
        }
      );
      techConversationIdRef.current = response.conversation_id;
      setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: response.answer } : m));

      const scoreResult = detectTechScorecard(response.answer);
      if (scoreResult.isScorecard && scoreResult.scores.length >= 2) {
        setTechScorecardData({ scores: scoreResult.scores, overallScore: scoreResult.overallScore, coachNote: scoreResult.coachNote });
        saveSessionToProgress('tech', scoreResult.scores, scoreResult.overallScore, undefined, techProfile?.company);
        setTimeout(() => setTechPhase('scorecard'), 2000);
      }
    } catch (err) {
      console.error('Failed to generate tech scorecard:', err);
      setTechError('Failed to generate scorecard. Please try again.');
    } finally {
      setIsTechCoachTyping(false);
      setIsTechStreaming(false);
    }
  }, [isTechCoachTyping, techProfile, saveSessionToProgress]);

  const handleTechRestart = useCallback(() => {
    setTechPhase('setup');
    setTechMessages([]);
    setTechProfile(null);
    setTechScorecardData(null);
    setTechError(null);
    techConversationIdRef.current = '';
    const newTechUid = 'tech-' + Date.now().toString(36); localStorage.setItem('neevv_tech_uid', newTechUid); techUserIdRef.current = newTechUid;
  }, []);

  const handleTechEmailScorecard = useCallback(async (): Promise<boolean> => {
    if (!techProfile?.email || !techScorecardData) return false;
    try {
      let emailBody = `🖥️ neevv Tech Scorecard\n━━━━━━━━━━━━━━━━━━━━━━\n`;
      emailBody += `Student: ${techProfile.name}\nTarget: ${techProfile.company}\nLevel: ${techProfile.level}\n`;
      emailBody += `Tech Stack: ${techProfile.techStack.join(', ')}\nOverall Score: ${techScorecardData.overallScore}/10\n\n`;
      for (const s of techScorecardData.scores) {
        emailBody += `${s.category}: ${s.score}/10\n  ✅ ${s.strength}\n  ⚠️ ${s.gap}\n\n`;
      }
      emailBody += `Coach's Note: ${techScorecardData.coachNote}\n\n━━━━━━━━━━━━━━━━━━━━━━\nPowered by neevv Prep`;
      const subject = encodeURIComponent(`🖥️ Your neevv Tech Scorecard — ${techScorecardData.overallScore}/10 | Target: ${techProfile.company}`);
      const body = encodeURIComponent(emailBody);
      window.open(`mailto:${techProfile.email}?subject=${subject}&body=${body}`, '_blank');
      return true;
    } catch (err) {
      console.error('Failed to open email:', err);
      return false;
    }
  }, [techProfile, techScorecardData]);

  const handleTechPracticeQuestion = useCallback((question: string) => {
    setPage('techinterview');
    setTechPhase('interview');
    setTechMessages([]);
    setIsTechCoachTyping(true);
    setIsTechStreaming(true);
    setTechError(null);
    setTechProfile(prev => prev || { name: authUser?.name || 'Student', company: 'Tech Company', level: 'Fresher', techStack: ['Python'], email: authUser?.email || '' });

    (async () => {
      try {
        const prompt = `The student wants to practice this specific technical question: "${question}"\n\nPlease present this question naturally as a technical interviewer, provide any necessary context (like table schemas for SQL, constraints for coding problems), then wait for their answer. Evaluate their code quality, approach, and complexity analysis.`;

        const coachMsgId = makeId();
        setTechMessages([{ id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

        const response = await sendMessageStreaming(prompt, '', techUserIdRef.current, (partial) => {
          setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
        });
        techConversationIdRef.current = response.conversation_id;
        setTechMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: response.answer } : m));
      } catch (err) {
        console.error('Failed to start tech practice:', err);
        setTechError('Failed to start practice. Please try again.');
      } finally {
        setIsTechCoachTyping(false);
        setIsTechStreaming(false);
      }
    })();
  }, [authUser]);

  const handleNavigate = useCallback((p: Page) => {
    setPage(p);
    if (p === 'interview') {
      if (phase === 'scorecard') {
        setPhase('setup');
        setMessages([]);
        setProfile(null);
        setScorecardData(null);
      }
    }
    if (p === 'techinterview') {
      if (techPhase === 'scorecard') {
        handleTechRestart();
      }
    }
    if (p === 'domain-interview') {
      if (domainPhase === 'scorecard') {
        handleDomainRestart();
      }
    }
  }, [phase, techPhase, domainPhase, handleTechRestart, handleDomainRestart]);

  const handleStart = useCallback(async (name: string, targetSchool: string, background: string, email: string, resumeText: string) => {
    setProfile({ name, targetSchool, background, email, resumeText });
    setPhase('interview');
    setMessages([]);
    setIsCoachTyping(true);
    setIsStreaming(true);
    setError(null);
    setMathAlert(null);

    try {
      let intro = `Hi, I'm ${name}. I'm targeting ${targetSchool} for my MBA. My professional background: ${background}.`;

      if (resumeText) {
        intro += `\n\nHere is my detailed resume/CV for context — use this to personalize your questions, reference specific projects/roles I've worked on, and tailor feedback to my actual experience:\n\n--- RESUME START ---\n${resumeText}\n--- RESUME END ---\n`;
      }

      intro += `\n\nI'm ready for my mock interview.

IMPORTANT COACHING INSTRUCTIONS (follow these strictly):
1. For behavioral questions, enforce the STAR method. If my Action is weak or vague, pause and ask me to refine it before moving on.${resumeText ? ' Reference specific roles, projects, or achievements from my resume when asking behavioral questions.' : ''}
2. For the guesstimate question, ALWAYS present a brief data context or scenario first (like a mini data exhibit with 2-3 specific numbers or a market scenario), then ask me to estimate. ALWAYS ask me to show step-by-step math and calculations. Do NOT accept a final number without seeing the breakdown. Evaluate my framework (top-down/bottom-up segmentation), NOT the accuracy of the final number.
3. After each of my answers, provide your feedback AND include an enhanced version of my answer under the heading "### ✨ Enhanced Version" — this should be MY answer rewritten in a stronger, more structured way (not a generic model answer). Keep it concise.
4. After completing all 5 questions, generate the neevv Scorecard with scores for Foundation, Logic, and Communication (each out of 10), with one specific strength and one critical gap per category.
5. Track whether I use B-school vocabulary (ROI, stakeholder, cross-functional, data-driven, scalable, etc.) and mention it in feedback.${resumeText ? '\n6. Since you have my resume, ask questions that probe deeper into MY specific experiences rather than generic scenarios. Challenge me on gaps or transitions in my career.' : ''}
6. B-School Vocabulary Bonus: Track use of terms like ROI, stakeholder, cross-functional, data-driven, scalable, synergy, value proposition, competitive advantage, market penetration, and similar. Mention how many B-school terms the student used in the scorecard.
7. Transitions: Between questions, provide a smooth transition. Don't just jump to the next question. E.g., "Great effort on that behavioral question. Now let's test your analytical thinking..."
8. Scorecard Format: When generating the neevv Scorecard, use EXACTLY this format:
   - Foundation: X/10 | Strength: ... | Gap: ...
   - Logic: X/10 | Strength: ... | Gap: ...
   - Communication: X/10 | Strength: ... | Gap: ...
   - Overall: X/10
   - Coach's Note: (2-3 sentences of personalized advice)
9. Be encouraging but honest. If a student's answer is genuinely weak, say so diplomatically and explain why.
10. Always end the interview with "[INTERVIEW_COMPLETE]" marker after generating the scorecard.
11. For "Why this school?" — probe specifically about programs, faculty, or unique offerings of ${targetSchool}.
12. For "Why now?" — probe the timing, career trajectory, and opportunity cost of pursuing MBA now.
13. After the behavioral round, transition with "Let's switch gears to analytical thinking" before the guesstimate.`;

      const coachMsgId = makeId();
      setMessages([{ id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(intro, '', userIdRef.current, (partial) => {
        setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
      });
      conversationIdRef.current = response.conversation_id;
      const coachText = response.answer;
      updateGuesstimatMode(coachText);
      setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: coachText } : m));
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError('Failed to connect to the neev Coach. Please try again.');
    } finally {
      setIsCoachTyping(false);
      setIsStreaming(false);
    }
  }, [updateGuesstimatMode]);

  const handleSend = useCallback(async (text: string) => {
    if (isCoachTyping) return;

    if (isGuesstimateModeRef.current && isGuesstimateLikelyAnswer(text)) {
      const validation = validateMath(text);
      if (validation.hasErrors) {
        setMathAlert(validation.summary);
        const now = Date.now();
        const durationMs = voiceStartRef.current > 0 ? now - voiceStartRef.current : text.split(/\s+/).length * 400;
        const stats = analyzeSpeech(text, durationMs);
        voiceStartRef.current = 0;
        const studentMsg: Message = { id: makeId(), role: 'student', text, timestamp: now, speechStats: stats };
        setMessages((prev) => [...prev, studentMsg]);
        const mathErrorMsg: Message = {
          id: makeId(), role: 'coach', text: validation.summary + '\n\n*Your answer has been held — please correct your math and resubmit. The coach will review once the calculations are right.*',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, mathErrorMsg]);
        return;
      }
    }

    setMathAlert(null);
    const now = Date.now();
    const durationMs = voiceStartRef.current > 0 ? now - voiceStartRef.current : text.split(/\s+/).length * 400;
    const stats = analyzeSpeech(text, durationMs);
    voiceStartRef.current = 0;
    const studentMsg: Message = { id: makeId(), role: 'student', text, timestamp: now, speechStats: stats };
    setMessages((prev) => [...prev, studentMsg]);
    setIsCoachTyping(true);
    setIsStreaming(true);
    setError(null);

    try {
      const enhancedText = isGuesstimateModeRef.current
        ? text + '\n\n[SYSTEM NOTE: This student\'s arithmetic has been validated by our math checker — all calculations check out.]'
        : text;

      const coachMsgId = makeId();
      setMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(enhancedText, conversationIdRef.current, userIdRef.current, (partial) => {
        setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
      });
      conversationIdRef.current = response.conversation_id;
      const coachText = response.answer;
      setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: coachText } : m));
      updateGuesstimatMode(coachText);

      const scoreResult = detectScorecard(coachText);
      if (scoreResult.isScorecard && scoreResult.scores.length >= 2) {
        setScorecardData({ scores: scoreResult.scores, overallScore: scoreResult.overallScore, coachNote: scoreResult.coachNote });
        saveSessionToProgress('mba', scoreResult.scores, scoreResult.overallScore, profile?.targetSchool, undefined);
        setTimeout(() => setPhase('scorecard'), 2000);
      }
    } catch (err) {
      console.error('Failed to get coach response:', err);
      setError('Failed to get a response. Please try sending again.');
    } finally {
      setIsCoachTyping(false);
      setIsStreaming(false);
    }
  }, [isCoachTyping, updateGuesstimatMode, profile, saveSessionToProgress]);

  const handleHint = useCallback(async () => {
    if (isCoachTyping || isHintLoading) return;
    setIsHintLoading(true);
    setIsStreaming(true);
    setError(null);

    try {
      const coachMsgId = makeId();
      setMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(
        '[HINT REQUEST] I\'m stuck. Give me a brief framework hint or nudge to get started — just the approach, NOT the full answer. Keep it to 2-3 bullet points max.',
        conversationIdRef.current, userIdRef.current,
        (partial) => {
          setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: '💡 **Nudge:**\n\n' + partial } : m));
        }
      );
      conversationIdRef.current = response.conversation_id;
      setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: '💡 **Nudge:**\n\n' + response.answer } : m));
    } catch (err) {
      console.error('Failed to get hint:', err);
      setError('Couldn\'t load a hint. Try again.');
    } finally {
      setIsHintLoading(false);
      setIsStreaming(false);
    }
  }, [isCoachTyping, isHintLoading]);

  const handleFlagForMentor = useCallback(async (studentAnswer: string, questionContext: string) => {
    if (mentorSent) return;
    try {
      const subject = encodeURIComponent(`👨‍🏫 Mentor Review: ${profile?.name || 'Student'} — neevv Prep`);
      const body = encodeURIComponent(
        `neevv Prep — Student Answer Flagged for Mentor Review\n\n` +
        `Student: ${profile?.name || 'Unknown'}\n` +
        `Target School: ${profile?.targetSchool || 'Unknown'}\n` +
        `Background: ${profile?.background || 'Unknown'}\n\n` +
        `---\n\n` +
        `Coach Question:\n${questionContext}\n\n` +
        `Student Answer:\n${studentAnswer}\n\n` +
        `---\n\n` +
        `Please reply with your personal tip or advice.`
      );
      window.open(`mailto:vijayuae71@gmail.com?subject=${subject}&body=${body}`, '_blank');
      setMentorSent(true);
      setTimeout(() => setMentorSent(false), 60000);
      return true;
    } catch (err) {
      console.error('Failed to open mentor email:', err);
      return false;
    }
  }, [profile, mentorSent]);

  const handleRestart = useCallback(() => {
    setPhase('setup');
    setMessages([]);
    setProfile(null);
    setScorecardData(null);
    setError(null);
    setMathAlert(null);
    setMentorSent(false);
    conversationIdRef.current = '';
    const newUid = 'user-' + Date.now().toString(36); localStorage.setItem('neevv_uid', newUid); userIdRef.current = newUid;
    isGuesstimateModeRef.current = false;
  }, []);

  const handleBackToHome = useCallback(() => {
    setPage('landing');
  }, []);

  const handlePracticeQuestion = useCallback((question: string) => {
    setPage('interview');
    setPhase('interview');
    setMessages([]);
    setIsCoachTyping(true);
    setIsStreaming(true);
    setError(null);
    setMathAlert(null);
    setProfile(prev => prev || { name: authUser?.name || 'Student', targetSchool: 'IIM A', background: 'Professional', email: authUser?.email || '', resumeText: '' });

    (async () => {
      try {
        const prompt = `The student wants to practice this specific question: "${question}"\n\nPlease present this question naturally as if you're the interview coach, then wait for their answer. Follow all the same coaching rules (STAR method for behavioral, step-by-step math for guesstimates, etc.)`;

        const coachMsgId = makeId();
        setMessages([{ id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

        const response = await sendMessageStreaming(prompt, '', userIdRef.current, (partial) => {
          setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
        });
        conversationIdRef.current = response.conversation_id;
        updateGuesstimatMode(response.answer);
        setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: response.answer } : m));
      } catch (err) {
        console.error('Failed to start practice:', err);
        setError('Failed to start practice. Please try again.');
      } finally {
        setIsCoachTyping(false);
        setIsStreaming(false);
      }
    })();
  }, [updateGuesstimatMode, authUser]);

  const handleRequestScorecard = useCallback(async () => {
    if (isCoachTyping) return;
    setIsCoachTyping(true);
    setIsStreaming(true);
    setError(null);

    try {
      const coachMsgId = makeId();
      setMessages(prev => [...prev, { id: coachMsgId, role: 'coach', text: '', timestamp: Date.now() }]);

      const response = await sendMessageStreaming(
        'Please generate my neevv Scorecard now with scores for Foundation, Logic, and Communication (each out of 10), with specific strengths and critical gaps for each category. Include a final coach\'s note.',
        conversationIdRef.current, userIdRef.current,
        (partial) => {
          setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: partial } : m));
        }
      );
      conversationIdRef.current = response.conversation_id;
      setMessages(prev => prev.map(m => m.id === coachMsgId ? { ...m, text: response.answer } : m));

      const scoreResult = detectScorecard(response.answer);
      if (scoreResult.isScorecard && scoreResult.scores.length >= 2) {
        setScorecardData({ scores: scoreResult.scores, overallScore: scoreResult.overallScore, coachNote: scoreResult.coachNote });
        saveSessionToProgress('mba', scoreResult.scores, scoreResult.overallScore, profile?.targetSchool, undefined);
        setTimeout(() => setPhase('scorecard'), 2000);
      }
    } catch (err) {
      console.error('Failed to generate scorecard:', err);
      setError('Failed to generate scorecard. Please try again.');
    } finally {
      setIsCoachTyping(false);
      setIsStreaming(false);
    }
  }, [isCoachTyping, profile, saveSessionToProgress]);

  const handleEmailScorecard = useCallback(async (): Promise<boolean> => {
    if (!profile?.email || !scorecardData) return false;
    try {
      const emailBody = formatScorecardText(
        profile.name, profile.targetSchool, scorecardData.scores,
        scorecardData.overallScore, scorecardData.coachNote, speechSummary
      );
      const subject = encodeURIComponent(`🎓 Your neevv Scorecard — ${scorecardData.overallScore}/10 | Target: ${profile.targetSchool}`);
      const body = encodeURIComponent(emailBody);
      window.open(`mailto:${profile.email}?subject=${subject}&body=${body}`, '_blank');
      return true;
    } catch (err) {
      console.error('Failed to open email:', err);
      return false;
    }
  }, [profile, scorecardData, speechSummary]);

  // ═══════ RENDER ═══════

  // Auth gate
  if (!authUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={(school) => {
          localStorage.setItem('neevv_onboarding_complete', 'true');
          if (school) localStorage.setItem('neevv_target_school', school);
          setShowOnboarding(false);
        }}
        onSkip={() => {
          localStorage.setItem('neevv_onboarding_complete', 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (page === 'landing') {
    return (
      <>
        <Navbar currentPage="landing" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <LandingPage
          onStartInterview={() => handleNavigate('interview')}
          onGoToTools={() => handleNavigate('tools')}
          onStartTechInterview={() => handleNavigate('techinterview')}
          onStartLifecycle={() => handleNavigate('lifecycle')}
          onStartDomainInterview={() => handleNavigate('domain-interview')}
        />
      </>
    );
  }

  if (page === 'progress') {
    return (
      <>
        <Navbar currentPage="progress" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <ProgressDashboard />
      </>
    );
  }

  if (page === 'lifecycle') {
    return (
      <>
        <Navbar currentPage="lifecycle" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <LifecycleOrchestrator
          userName={authUser.name}
          userEmail={authUser.email}
          onGoToInterview={() => handleNavigate('interview')}
          onGoHome={() => handleNavigate('landing')}
        />
      </>
    );
  }

  if (page === 'tools') {
    return (
      <>
        <Navbar currentPage="tools" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <FreeTools
          onBack={handleBackToHome}
          onStartInterview={() => handleNavigate('interview')}
        />
      </>
    );
  }

  if (page === 'questionbank') {
    return (
      <>
        <Navbar currentPage="questionbank" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <QuestionBank onPractice={handlePracticeQuestion} />
      </>
    );
  }

  if (page === 'dailypractice') {
    return (
      <>
        <Navbar currentPage="dailypractice" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <DailyPractice onPractice={handlePracticeQuestion} />
      </>
    );
  }

  if (page === 'caselibrary') {
    return (
      <>
        <Navbar currentPage="caselibrary" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <CaseLibrary />
      </>
    );
  }

  if (page === 'storybank') {
    return (
      <>
        <Navbar currentPage="storybank" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <StoryBank />
      </>
    );
  }

  if (page === 'preferences') {
    return (
      <>
        <Navbar currentPage="preferences" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <Preferences />
      </>
    );
  }

  if (page === 'upgrade') {
    return (
      <>
        <Navbar currentPage="upgrade" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <UpgradePlan />
      </>
    );
  }

  if (page === 'help') {
    return (
      <>
        <Navbar currentPage="help" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <GetHelp />
      </>
    );
  }

  // ═══════ TECH INTERVIEW PAGES ═══════

  if (page === 'techquestionbank') {
    return (
      <>
        <Navbar currentPage="techquestionbank" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <TechQuestionBank onPractice={handleTechPracticeQuestion} />
      </>
    );
  }

  if (page === 'techinterview' && techPhase === 'setup') {
    return (
      <>
        <Navbar currentPage="techinterview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <TechSetup onStart={handleTechStart} onBack={handleBackToHome} />
      </>
    );
  }

  if (page === 'techinterview' && techPhase === 'scorecard' && techScorecardData && techProfile) {
    return (
      <>
        <Navbar currentPage="techinterview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <TechScorecard
          studentName={techProfile.name}
          targetCompany={techProfile.company}
          scores={techScorecardData.scores}
          overallScore={techScorecardData.overallScore}
          coachNote={techScorecardData.coachNote}
          studentEmail={techProfile.email}
          onRestart={handleTechRestart}
          onEmailScorecard={techProfile.email ? handleTechEmailScorecard : undefined}
          onBack={handleBackToHome}
        />
      </>
    );
  }

  if (page === 'techinterview' && techPhase === 'interview') {
    return (
      <>
        <Navbar currentPage="techinterview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <TechChatInterface
          messages={techMessages}
          onSend={handleTechSend}
          onHint={handleTechHint}
          isCoachTyping={isTechCoachTyping}
          isHintLoading={isTechHintLoading}
          questionNumber={Math.min(5, Math.floor(techMessages.length / 2))}
          error={techError}
          onRequestScorecard={handleTechRequestScorecard}
          isStreaming={isTechStreaming}
          onBack={handleBackToHome}
        />
      </>
    );
  }

  // ═══════ DOMAIN INTERVIEW PAGES ═══════

  if (page === 'domain-qbank') {
    return (
      <>
        <Navbar currentPage="domain-qbank" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <DomainQuestionBank
          onBack={handleBackToHome}
          onStartDomainInterview={(domain) => {
            setPage('domain-interview');
          }}
        />
      </>
    );
  }

  if (page === 'domain-interview' && domainPhase === 'setup') {
    return (
      <>
        <Navbar currentPage="domain-interview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <DomainSetup onStart={handleDomainStart} onBack={handleBackToHome} />
      </>
    );
  }

  if (page === 'domain-interview' && domainPhase === 'scorecard' && domainScorecardData && domainConfig) {
    return (
      <>
        <Navbar currentPage="domain-interview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <DomainScorecard
          config={domainConfig}
          scores={domainScorecardData.scores}
          overallScore={domainScorecardData.overallScore}
          coachNote={domainScorecardData.coachNote}
          onBack={handleBackToHome}
          onRetry={handleDomainRestart}
          onEmailScorecard={domainConfig.email ? handleDomainEmailScorecard : undefined}
        />
      </>
    );
  }

  if (page === 'domain-interview' && domainPhase === 'interview') {
    return (
      <>
        <Navbar currentPage="domain-interview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <DomainChatInterface
          config={domainConfig!}
          messages={domainMessages}
          onSend={handleDomainSend}
          onHint={handleDomainHint}
          isCoachTyping={isDomainCoachTyping}
          isHintLoading={isDomainHintLoading}
          questionNumber={Math.min(5, Math.floor(domainMessages.length / 2))}
          error={domainError}
          onRequestScorecard={handleDomainRequestScorecard}
          isStreaming={isDomainStreaming}
          onBack={handleBackToHome}
        />
      </>
    );
  }

  // ═══════ MBA INTERVIEW PAGES ═══════

  if (page === 'interview' && phase === 'setup') {
    return (
      <>
        <Navbar currentPage="interview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <SetupScreen onStart={handleStart} onBack={handleBackToHome} />
      </>
    );
  }

  if (page === 'interview' && phase === 'scorecard' && scorecardData && profile) {
    return (
      <>
        <Navbar currentPage="interview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
        <Scorecard
          studentName={profile.name}
          targetSchool={profile.targetSchool}
          scores={scorecardData.scores}
          overallScore={scorecardData.overallScore}
          coachNote={scorecardData.coachNote}
          studentEmail={profile.email}
          onRestart={handleRestart}
          onEmailScorecard={profile.email ? handleEmailScorecard : undefined}
          speechSummary={speechSummary}
          onBack={handleBackToHome}
        />
      </>
    );
  }

  // Interview chat
  return (
    <>
      <Navbar currentPage="interview" onNavigate={handleNavigate} userName={authUser.name} onLogout={handleLogout} />
      <ChatInterface
        messages={messages}
        onSend={handleSend}
        onHint={handleHint}
        isCoachTyping={isCoachTyping}
        isHintLoading={isHintLoading}
        questionNumber={estimateQuestion(messages.length)}
        error={error}
        onRequestScorecard={handleRequestScorecard}
        speechSummary={speechSummary}
        mathAlert={mathAlert}
        onFlagForMentor={handleFlagForMentor}
        mentorSent={mentorSent}
        isStreaming={isStreaming}
        onBack={handleBackToHome}
      />
    </>
  );
};

export default App;
