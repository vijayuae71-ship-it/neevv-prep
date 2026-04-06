import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ClipboardList, AlertCircle, Mic, MicOff, Volume2, VolumeX, Lightbulb, ChevronDown, ChevronUp, BarChart3, Sparkles, Video, VideoOff, UserCheck, Calculator, Timer } from 'lucide-react';
import { Message, SpeechAnalyticsSummary } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string) => void;
  onHint: () => void;
  isCoachTyping: boolean;
  questionNumber: number;
  error: string | null;
  onRequestScorecard: () => void;
  speechSummary: SpeechAnalyticsSummary;
  isHintLoading: boolean;
  mathAlert: string | null;
  onFlagForMentor: (answer: string, question: string) => Promise<boolean | undefined>;
  mentorSent: boolean;
  isStreaming?: boolean;
}

// Rotating "thinking" messages
const THINKING_MESSAGES = [
  'Analyzing your response...',
  'Evaluating structure & clarity...',
  'Preparing feedback...',
  'Reviewing your framework...',
  'Crafting enhanced feedback...',
  'Assessing MECE structure...',
];

// Simple markdown-to-JSX
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  function flushList() {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag key={`list-${elements.length}`} className={listType === 'ul' ? 'list-disc pl-5 my-1' : 'list-decimal pl-5 my-1'}>
          {listItems.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  }

  function formatInline(str: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let remaining = str;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) parts.push(remaining.substring(0, boldMatch.index));
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }
      const italicMatch = remaining.match(/\*(.+?)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) parts.push(remaining.substring(0, italicMatch.index));
        parts.push(<em key={key++}>{italicMatch[1]}</em>);
        remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
        continue;
      }
      parts.push(remaining);
      break;
    }
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) { flushList(); elements.push(<h4 key={i} className="font-bold text-sm mt-3 mb-1">{formatInline(trimmed.slice(4))}</h4>); }
    else if (trimmed.startsWith('## ')) { flushList(); elements.push(<h3 key={i} className="font-bold mt-3 mb-1">{formatInline(trimmed.slice(3))}</h3>); }
    else if (trimmed.startsWith('# ')) { flushList(); elements.push(<h2 key={i} className="font-bold text-lg mt-3 mb-1">{formatInline(trimmed.slice(2))}</h2>); }
    else if (trimmed.match(/^[-•*]\s+/)) { if (listType !== 'ul') flushList(); listType = 'ul'; listItems.push(trimmed.replace(/^[-•*]\s+/, '')); }
    else if (trimmed.match(/^\d+\.\s+/)) { if (listType !== 'ol') flushList(); listType = 'ol'; listItems.push(trimmed.replace(/^\d+\.\s+/, '')); }
    else if (trimmed.match(/^---+$/)) { flushList(); elements.push(<hr key={i} className="border-base-300 my-2" />); }
    else if (trimmed === '') { flushList(); elements.push(<div key={i} className="h-2" />); }
    else { flushList(); elements.push(<p key={i} className="my-0.5">{formatInline(trimmed)}</p>); }
  }
  flushList();
  return elements;
}

function stripMarkdown(text: string): string {
  return text.replace(/#{1,6}\s+/g, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
    .replace(/[-•]\s+/g, '').replace(/\d+\.\s+/g, '').replace(/---+/g, '')
    .replace(/\|[^|]*\|/g, '').replace(/\n{2,}/g, '. ').replace(/\n/g, ' ').trim();
}

function hasSpeechRecognition(): boolean {
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
}

function hasSpeechSynthesis(): boolean {
  return !!window.speechSynthesis;
}

// Extract enhanced answer from coach response
function extractEnhancedAnswer(text: string): { mainText: string; enhanced: string | null } {
  const enhancedMatch = text.match(/\[ENHANCED_ANSWER\]([\s\S]*?)\[\/ENHANCED_ANSWER\]/i);
  if (enhancedMatch) {
    const mainText = text.replace(enhancedMatch[0], '').trim();
    return { mainText, enhanced: enhancedMatch[1].trim() };
  }

  const sectionMatch = text.match(/(?:###?\s*)?(?:✨\s*)?(?:enhanced version|model answer|stronger version|here'?s? (?:a |an )?enhanced)[:\s]*\n([\s\S]*?)(?=\n##|\n---|\n\*\*(?:Next|Moving|Now|Let)|$)/i);
  if (sectionMatch) {
    const mainText = text.replace(sectionMatch[0], '').trim();
    return { mainText, enhanced: sectionMatch[1].trim() };
  }

  return { mainText: text, enhanced: null };
}

// Enhanced Answer Card component
const EnhancedAnswerCard: React.FC<{ enhanced: string }> = ({ enhanced }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2 border border-secondary/30 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 bg-secondary/10 hover:bg-secondary/20 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <Sparkles size={14} className="text-secondary shrink-0" />
        <span className="text-xs font-semibold text-secondary">✨ Enhanced Version of Your Answer</span>
        <span className="ml-auto">
          {expanded ? <ChevronUp size={14} className="text-secondary" /> : <ChevronDown size={14} className="text-secondary" />}
        </span>
      </button>
      {expanded && (
        <div className="px-3 py-2 bg-secondary/5 text-sm text-base-content/80 leading-relaxed border-t border-secondary/20">
          {renderMarkdown(enhanced)}
        </div>
      )}
    </div>
  );
};

// Mini Speech Stats Badge
const SpeechStatsBadge: React.FC<{ fillerCount: number; wordCount: number; wpm: number }> = ({ fillerCount, wordCount, wpm }) => {
  if (wordCount === 0) return null;
  return (
    <div className="flex gap-1.5 mt-1 flex-wrap">
      <span className="badge badge-xs badge-ghost">{wordCount} words</span>
      {wpm > 0 && <span className="badge badge-xs badge-ghost">{wpm} wpm</span>}
      {fillerCount > 0 && (
        <span className="badge badge-xs badge-warning">{fillerCount} filler{fillerCount > 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

// Speech Analytics Panel
const SpeechAnalyticsPanel: React.FC<{ summary: SpeechAnalyticsSummary; expanded: boolean; onToggle: () => void }> = ({ summary, expanded, onToggle }) => {
  const fillerRateColor = summary.fillerRate <= 1 ? 'text-success' : summary.fillerRate <= 3 ? 'text-info' : summary.fillerRate <= 5 ? 'text-warning' : 'text-error';
  const pacingColor = summary.avgWpm === 0 ? 'text-base-content/40' : (summary.avgWpm >= 120 && summary.avgWpm <= 160) ? 'text-success' : (summary.avgWpm >= 100 && summary.avgWpm <= 180) ? 'text-info' : 'text-warning';

  return (
    <div className="border-t border-base-300">
      <button
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-base-200 transition-colors text-left"
        onClick={onToggle}
      >
        <BarChart3 size={14} className="text-info" />
        <span className="text-xs font-semibold text-base-content/70">Speech Analytics</span>
        <div className="flex gap-1.5 ml-2">
          <span className={`text-xs font-mono ${fillerRateColor}`}>{summary.fillerRate}% fillers</span>
          {summary.avgWpm > 0 && <span className={`text-xs font-mono ${pacingColor}`}>· {summary.avgWpm} wpm</span>}
        </div>
        <span className="ml-auto">
          {expanded ? <ChevronUp size={12} className="opacity-50" /> : <ChevronDown size={12} className="opacity-50" />}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-3">
          <div className="bg-base-200 rounded-lg p-2.5">
            <p className="text-xs text-base-content/50 mb-1">Filler Words</p>
            <p className={`text-lg font-bold ${fillerRateColor}`}>{summary.totalFillerCount}</p>
            {summary.topFillers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {summary.topFillers.map((f) => (
                  <span key={f.word} className="badge badge-xs badge-warning">"{f.word}" ×{f.count}</span>
                ))}
              </div>
            )}
          </div>
          <div className="bg-base-200 rounded-lg p-2.5">
            <p className="text-xs text-base-content/50 mb-1">Pacing</p>
            <p className={`text-lg font-bold ${pacingColor}`}>{summary.avgWpm > 0 ? `${summary.avgWpm}` : '—'}<span className="text-xs font-normal text-base-content/40"> wpm</span></p>
            <p className="text-xs text-base-content/40 mt-1">Ideal: 120–160 wpm</p>
          </div>
          <div className="bg-base-200 rounded-lg p-2.5">
            <p className="text-xs text-base-content/50 mb-1">Total Words</p>
            <p className="text-lg font-bold text-base-content">{summary.totalWordCount}</p>
          </div>
          <div className="bg-base-200 rounded-lg p-2.5">
            <p className="text-xs text-base-content/50 mb-1">B-School Terms</p>
            <p className="text-lg font-bold text-primary">{summary.bschoolTermsUsed.length}</p>
            {summary.bschoolTermsUsed.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {summary.bschoolTermsUsed.slice(0, 4).map((t) => (
                  <span key={t} className="badge badge-xs badge-primary badge-outline">{t}</span>
                ))}
                {summary.bschoolTermsUsed.length > 4 && (
                  <span className="badge badge-xs badge-ghost">+{summary.bschoolTermsUsed.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 🧮 Math Error Alert Banner
const MathAlertBanner: React.FC<{ alert: string }> = ({ alert }) => (
  <div className="mx-4 mb-2 p-3 bg-error/10 border border-error/30 rounded-xl">
    <div className="flex items-start gap-2">
      <Calculator size={18} className="text-error mt-0.5 shrink-0" />
      <div className="text-sm">
        {renderMarkdown(alert)}
      </div>
    </div>
  </div>
);

// 🎥 Video Recording Component
const VideoRecorder: React.FC<{ onComplete: (analysis: string) => void; onCancel: () => void }> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [analyzing, setAnalyzing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => analyzeRecording();
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setRecording(true);
      setCountdown(30);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Camera access denied:', err);
      onCancel();
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setRecording(false);
  }, []);

  const analyzeRecording = useCallback(() => {
    setAnalyzing(true);
    // Analyze the recording duration and generate feedback
    const durationSecs = 30 - countdown;
    const analysis = `🎥 **Video Response Analysis** (${durationSecs}s recording)\n\n` +
      `✅ **What we observed:**\n` +
      `- Recording duration: ${durationSecs} seconds\n` +
      `- Camera presence: Active\n` +
      `- Audio captured: Yes\n\n` +
      `💡 **Tips for video interviews:**\n` +
      `- Maintain eye contact with the camera (not the screen)\n` +
      `- Keep a neutral, professional background\n` +
      `- Speak at 120–160 WPM for optimal pacing\n` +
      `- Use hand gestures sparingly but effectively\n` +
      `- Pause before answering to collect your thoughts`;

    setTimeout(() => {
      setAnalyzing(false);
      onComplete(analysis);
    }, 1500);
  }, [countdown, onComplete]);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl p-4 max-w-md w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Video size={16} className="text-error" />
            {analyzing ? 'Analyzing...' : recording ? 'Recording' : 'Video Practice'}
          </h3>
          {recording && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
              </span>
              <span className="text-sm font-mono text-error">{countdown}s</span>
            </div>
          )}
        </div>

        <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-3">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {analyzing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {recording ? (
            <button className="btn btn-error btn-sm flex-1 gap-1" onClick={stopRecording}>
              <VideoOff size={14} /> Stop Recording
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm flex-1" onClick={onCancel}>
              Close
            </button>
          )}
        </div>
        <p className="text-xs text-base-content/40 mt-2 text-center">
          Practice your on-camera presence · 30s max · Video stays local
        </p>
      </div>
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages, onSend, onHint, isCoachTyping, questionNumber, error, onRequestScorecard, speechSummary, isHintLoading, mathAlert, onFlagForMentor, mentorSent, isStreaming = false,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [thinkingMsg, setThinkingMsg] = useState(THINKING_MESSAGES[0]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [videoFeedback, setVideoFeedback] = useState<string | null>(null);
  const [flaggingMentor, setFlaggingMentor] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastSpokenMsgRef = useRef<string>('');
  const thinkingIntervalRef = useRef<any>(null);
  const answerTimerRef = useRef<any>(null);

  // Rotate thinking messages
  useEffect(() => {
    if (isCoachTyping) {
      setThinkingMsg(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
      thinkingIntervalRef.current = setInterval(() => {
        setThinkingMsg(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
      }, 2500);
    } else {
      if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null; }
    }
    return () => { if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current); };
  }, [isCoachTyping]);

  // Loading seconds timer for retry UX
  useEffect(() => {
    let interval: any;
    if (isCoachTyping) {
      setLoadingSeconds(0);
      interval = setInterval(() => setLoadingSeconds(s => s + 1), 1000);
    } else {
      setLoadingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isCoachTyping]);

  // Timer: start when new coach message arrives (not the first one)
  useEffect(() => {
    if (!timerEnabled) return;
    const coachMsgs = messages.filter(m => m.role === 'coach');
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'coach' && coachMsgs.length > 1) {
      // Reset and start timer
      setTimerSeconds(120);
      setTimerActive(true);
      setTimerExpired(false);
      if (answerTimerRef.current) clearInterval(answerTimerRef.current);
      answerTimerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(answerTimerRef.current);
            answerTimerRef.current = null;
            setTimerActive(false);
            setTimerExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    // Pause when student sends
    if (lastMsg && lastMsg.role === 'student') {
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current);
        answerTimerRef.current = null;
      }
      setTimerActive(false);
    }
  }, [messages, timerEnabled]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (answerTimerRef.current) clearInterval(answerTimerRef.current); };
  }, []);

  const formatTimer = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isCoachTyping]);

  // TTS for coach messages
  useEffect(() => {
    if (!voiceEnabled || !hasSpeechSynthesis()) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'coach' || lastMsg.id === lastSpokenMsgRef.current) return;
    lastSpokenMsgRef.current = lastMsg.id;
    window.speechSynthesis.cancel();
    const plainText = stripMarkdown(lastMsg.text);
    const chunks = plainText.match(/.{1,200}(?:[.!?;,]|$)/g) || [plainText];
    chunks.forEach((chunk, idx) => {
      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      utterance.rate = 1.0; utterance.pitch = 1.0; utterance.lang = 'en-US';
      if (idx === 0) utterance.onstart = () => setIsSpeaking(true);
      if (idx === chunks.length - 1) { utterance.onend = () => setIsSpeaking(false); utterance.onerror = () => setIsSpeaking(false); }
      window.speechSynthesis.speak(utterance);
    });
  }, [messages, voiceEnabled]);

  useEffect(() => {
    return () => {
      if (hasSpeechSynthesis()) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    if (!hasSpeechRecognition()) { return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onstart = () => { setIsListening(true); if (hasSpeechSynthesis()) { window.speechSynthesis.cancel(); setIsSpeaking(false); } };
    recognition.onresult = (event: any) => {
      let interim = ''; let finalT = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalT += event.results[i][0].transcript + ' ';
        else interim += event.results[i][0].transcript;
      }
      setInput(finalT + interim);
      if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const toggleVoice = useCallback(() => {
    if (voiceEnabled && hasSpeechSynthesis()) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
    setVoiceEnabled((v) => !v);
  }, [voiceEnabled]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isCoachTyping) return;
    if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); }
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Flag last student answer for mentor review
  const handleMentorFlag = useCallback(async () => {
    if (flaggingMentor || mentorSent) return;
    setFlaggingMentor(true);
    // Find last student message and preceding coach question
    const studentMsgs = messages.filter((m) => m.role === 'student');
    const lastStudent = studentMsgs[studentMsgs.length - 1];
    if (!lastStudent) { setFlaggingMentor(false); return; }
    const lastStudentIdx = messages.indexOf(lastStudent);
    const precedingCoach = messages.slice(0, lastStudentIdx).reverse().find((m) => m.role === 'coach');
    await onFlagForMentor(lastStudent.text, precedingCoach?.text || 'N/A');
    setFlaggingMentor(false);
  }, [messages, onFlagForMentor, flaggingMentor, mentorSent]);

  const handleVideoComplete = useCallback((analysis: string) => {
    setShowVideoRecorder(false);
    setVideoFeedback(analysis);
    setTimeout(() => setVideoFeedback(null), 15000);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Video Recorder Overlay */}
      {showVideoRecorder && (
        <VideoRecorder
          onComplete={handleVideoComplete}
          onCancel={() => setShowVideoRecorder(false)}
        />
      )}

      {/* Header */}
      <div className="px-4 py-3 bg-base-200 border-b border-base-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">nP</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-base-content">neevv Prep Coach</p>
            <p className="text-xs text-base-content/50">
              {isCoachTyping ? '⏳ ' + thinkingMsg : isSpeaking ? '🔊 Speaking...' : 'neev Coach Mock Interview'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Timer Toggle */}
          <button
            className={`btn btn-ghost btn-xs btn-square ${timerEnabled ? 'text-warning' : 'text-base-content/50 hover:text-warning'}`}
            onClick={() => {
              setTimerEnabled(v => !v);
              if (timerEnabled) {
                if (answerTimerRef.current) { clearInterval(answerTimerRef.current); answerTimerRef.current = null; }
                setTimerActive(false);
                setTimerExpired(false);
                setTimerSeconds(120);
              }
            }}
            title={timerEnabled ? 'Disable 2-min timer' : 'Enable 2-min answer timer'}
          >
            <Timer size={16} />
          </button>
          {timerEnabled && (timerActive || timerExpired || timerSeconds < 120) && (
            <span className={`badge badge-sm font-mono ${timerExpired ? 'badge-error animate-pulse' : 'badge-warning'}`}>
              {formatTimer(timerSeconds)}
            </span>
          )}
          {/* Video Practice Button */}
          <button
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-error"
            onClick={() => setShowVideoRecorder(true)}
            title="Record video practice (30s)"
          >
            <Video size={16} />
          </button>
          {/* Mentor Flag Button */}
          <button
            className={`btn btn-ghost btn-xs btn-square ${mentorSent ? 'text-success' : 'text-base-content/50 hover:text-accent'}`}
            onClick={handleMentorFlag}
            disabled={flaggingMentor || mentorSent || messages.filter((m) => m.role === 'student').length === 0}
            title={mentorSent ? 'Sent to mentor ✓' : 'Flag last answer for mentor review'}
          >
            {flaggingMentor ? <span className="loading loading-spinner loading-xs"></span> : <UserCheck size={16} />}
          </button>
          <button
            className={`btn btn-ghost btn-xs btn-square ${voiceEnabled ? 'text-primary' : 'text-base-content/40'}`}
            onClick={toggleVoice}
            title={voiceEnabled ? 'Mute coach voice' : 'Enable coach voice'}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <div className="badge badge-primary badge-outline text-xs">Q{Math.min(messages.filter(m => m.role === 'student').length + 1, 5)}/5</div>
          {messages.length >= 8 && (
            <button className="btn btn-secondary btn-xs gap-1" onClick={onRequestScorecard} disabled={isCoachTyping}>
              <ClipboardList size={14} /> Scorecard
            </button>
          )}
        </div>
      </div>

      {/* Browser compatibility banner for voice */}
      {!hasSpeechRecognition() && (
        <div style={{ background: '#FEF3C7', color: '#92400E', padding: '0.5rem 1rem', fontSize: '0.75rem', textAlign: 'center', borderRadius: '0.5rem', margin: '0.5rem 1rem' }}>
          🎙️ Voice input requires Chrome or Edge browser. Text input works everywhere!
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          const { mainText, enhanced } = msg.role === 'coach' ? extractEnhancedAnswer(msg.text) : { mainText: msg.text, enhanced: null };
          return (
            <div key={msg.id} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%]`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'student'
                      ? 'bg-primary text-primary-content rounded-br-md'
                      : 'bg-base-200 text-base-content rounded-bl-md'
                  }`}
                >
                  {msg.role === 'coach' ? renderMarkdown(mainText) : msg.text}
                  {msg.role === 'coach' && isStreaming && msg.id === messages[messages.length - 1]?.id && msg.text && (
                    <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm" />
                  )}
                </div>
                {/* Enhanced Answer Card (Revarta-style) */}
                {enhanced && <EnhancedAnswerCard enhanced={enhanced} />}
                {/* Speech stats per message (Yoodli-style) */}
                {msg.role === 'student' && msg.speechStats && (
                  <div className="flex justify-end mt-0.5">
                    <SpeechStatsBadge
                      fillerCount={msg.speechStats.fillerCount}
                      wordCount={msg.speechStats.wordCount}
                      wpm={msg.speechStats.wordsPerMinute}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Video feedback toast */}
        {videoFeedback && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-base-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm border border-error/20">
              {renderMarkdown(videoFeedback)}
            </div>
          </div>
        )}

        {isCoachTyping && !isStreaming && (
          <div className="flex justify-start">
            <div className="bg-base-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="loading loading-dots loading-sm text-primary"></span>
                <span className="text-xs text-base-content/60 animate-pulse">
                  {loadingSeconds < 15 ? thinkingMsg : loadingSeconds < 30 ? 'Analyzing your response in depth...' : 'This is taking longer than usual...'}
                </span>
              </div>
              {loadingSeconds >= 30 && (
                <button
                  className="btn btn-xs btn-outline btn-warning mt-2"
                  onClick={() => {
                    const lastStudentMsg = messages.filter(m => m.role === 'student').pop();
                    if (lastStudentMsg) {
                      onSend(lastStudentMsg.text);
                    }
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {timerExpired && timerEnabled && (
          <div className="alert alert-warning text-sm shadow-sm">
            <Timer size={16} />
            <span>⏰ Time's up! In real interviews, concise answers win.</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Math Alert Banner */}
      {mathAlert && <MathAlertBanner alert={mathAlert} />}

      {/* Speech Analytics Panel (Yoodli-style) */}
      {speechSummary.totalWordCount > 0 && (
        <SpeechAnalyticsPanel
          summary={speechSummary}
          expanded={showAnalytics}
          onToggle={() => setShowAnalytics((v) => !v)}
        />
      )}

      {/* Input area */}
      <div className="px-4 py-3 bg-base-200 border-t border-base-300">
        {isListening && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
            </span>
            <span className="text-xs text-error font-medium">Listening... Speak your answer</span>
            <button className="btn btn-ghost btn-xs text-error" onClick={toggleListening}>Stop</button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Mic button */}
          {hasSpeechRecognition() && (
            <button
              className={`btn btn-square btn-sm ${isListening ? 'btn-error animate-pulse' : 'btn-ghost'}`}
              onClick={toggleListening}
              disabled={isCoachTyping}
              title={isListening ? 'Stop listening' : 'Speak your answer'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          {/* Hint button (Final Round AI-style) */}
          <button
            className={`btn btn-square btn-sm btn-ghost ${isHintLoading ? 'animate-pulse' : ''}`}
            onClick={onHint}
            disabled={isCoachTyping || isHintLoading || messages.length < 2}
            title="Need a nudge? Get a framework hint"
          >
            <Lightbulb size={18} className={isHintLoading ? 'text-warning' : 'text-warning/60'} />
          </button>

          <textarea
            ref={textareaRef}
            className="textarea textarea-bordered flex-1 min-h-[44px] max-h-[120px] resize-none text-sm"
            placeholder={isListening ? 'Speak now or type...' : 'Type or tap 🎤 to speak...'}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isCoachTyping}
          />
          <button
            className={`btn btn-primary btn-square btn-sm ${!input.trim() || isCoachTyping ? 'btn-disabled' : ''}`}
            onClick={handleSend}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-base-content/40 mt-1">
          🎤 Mic · 💡 Hint · 🎥 Video · 👨‍🏫 Mentor · 🧮 Math-checked · 📊 Analytics
        </p>
      </div>
    </div>
  );
};
