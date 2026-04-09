import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  Lightbulb,
  Code2,
  Terminal,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Layout,
  Timer,
  Mic,
  MicOff,
} from 'lucide-react';
import { isDeepgramAvailable, startRecording, stopRecording, cancelRecording, hasActiveRecording, getRecordingDuration } from '../utils/deepgramSTT';

interface Message {
  id: string;
  role: 'coach' | 'student';
  text: string;
  timestamp: number;
  isCode?: boolean;
  language?: string;
}

interface TechChatInterfaceProps {
  messages: Message[];
  onSend: (message: string) => void;
  onHint: () => void;
  isCoachTyping: boolean;
  isHintLoading: boolean;
  questionNumber: number;
  error: string | null;
  onRequestScorecard: () => void;
  isStreaming?: boolean;
}

const TOTAL_QUESTIONS = 5;

const languages = ['Python', 'Java', 'C++', 'JavaScript', 'SQL'];

export const TechChatInterface: React.FC<TechChatInterfaceProps> = ({
  messages,
  onSend,
  onHint,
  isCoachTyping,
  isHintLoading,
  questionNumber,
  error,
  onRequestScorecard,
  isStreaming = false,
}) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'text' | 'code'>('text');
  const [language, setLanguage] = useState('Python');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const answerTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isCoachTyping]);

  // Timer: start when new coach message arrives (not the first one)
  useEffect(() => {
    if (!timerEnabled) return;
    const coachMsgs = messages.filter(m => m.role === 'coach');
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'coach' && coachMsgs.length > 1) {
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
    if (lastMsg && lastMsg.role === 'student') {
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current);
        answerTimerRef.current = null;
      }
      setTimerActive(false);
    }
  }, [messages, timerEnabled]);

  useEffect(() => {
    return () => { if (answerTimerRef.current) clearInterval(answerTimerRef.current); };
  }, []);

  const formatTimer = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const isVoiceSupported = (): boolean => {
    return isDeepgramAvailable() || !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  };

  const toggleVoice = useCallback(async () => {
    if (isListening) {
      // Stop recording
      setIsListening(false);
      if (hasActiveRecording()) {
        try {
          const { transcript } = await stopRecording();
          if (transcript) {
            setPendingTranscript(transcript);
          }
        } catch (err) {
          console.error('Deepgram stop error:', err);
        }
      } else if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    // Try Deepgram first
    if (isDeepgramAvailable()) {
      try {
        await startRecording();
        setIsListening(true);
        return;
      } catch (err) {
        console.warn('Deepgram start failed, falling back to Web Speech API:', err);
      }
    }

    // Fallback to Web Speech API
    if (!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = false; recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let finalT = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalT += event.results[i][0].transcript + ' ';
      }
      if (finalT.trim()) {
        setPendingTranscript(finalT.trim());
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      cancelRecording();
    };
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isCoachTyping) return;
    const sendText = mode === 'code' ? `\`\`\`${language}\n${trimmed}\n\`\`\`` : trimmed;
    onSend(sendText);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mode === 'text' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (mode === 'code' && e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const renderMessage = (msg: Message, idx: number) => {
    const isCoach = msg.role === 'coach';

    return (
      <div key={idx} className={`chat ${isCoach ? 'chat-start' : 'chat-end'}`}>
        <div className="chat-header text-xs opacity-70 mb-1">
          {isCoach ? '🤖 Tech Coach' : '👨‍💻 You'}
        </div>
        <div
          className={`chat-bubble max-w-[85%] ${
            isCoach ? 'chat-bubble-primary' : 'chat-bubble-neutral'
          }`}
        >
          {msg.isCode ? (
            <div className="relative">
              {msg.language && (
                <span className="badge badge-sm badge-ghost mb-2">{msg.language}</span>
              )}
              <button
                className="btn btn-ghost btn-xs absolute top-0 right-0"
                onClick={() => copyCode(msg.text, idx)}
              >
                {copiedIdx === idx ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              <pre className="bg-gray-100 text-gray-800 rounded-lg p-3 overflow-x-auto text-sm mt-1 border border-gray-200">
                <code>{msg.text}</code>
              </pre>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {msg.text}
              {isCoach && isStreaming && msg.id === messages[messages.length - 1]?.id && msg.text && (
                <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-md px-4">
        <div className="flex-1 gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            neevv Tech
          </span>
        </div>
        <div className="flex-none flex items-center gap-2">
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
            <Timer className="w-4 h-4" />
          </button>
          {timerEnabled && (timerActive || timerExpired || timerSeconds < 120) && (
            <span className={`badge badge-sm font-mono ${timerExpired ? 'badge-error animate-pulse' : 'badge-warning'}`}>
              {formatTimer(timerSeconds)}
            </span>
          )}
          <div className="badge badge-primary badge-outline font-mono">
            Q{questionNumber}/{TOTAL_QUESTIONS}
          </div>
          {questionNumber >= 3 && (
            <button
              className="btn btn-secondary btn-sm gap-1"
              onClick={onRequestScorecard}
              disabled={isCoachTyping}
            >
              <Layout className="w-4 h-4" />
              Scorecard
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error mx-4 mt-2 shadow-sm">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Voice Transcript Confirmation */}
      {pendingTranscript !== null && (
        <div className="alert alert-info mx-4 mt-2 shadow-sm">
          <Mic className="w-4 h-4 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold mb-1">🎤 Review your transcript:</p>
            <textarea
              className="textarea textarea-bordered textarea-sm w-full"
              rows={2}
              value={pendingTranscript}
              onChange={(e) => setPendingTranscript(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            <button className="btn btn-success btn-xs" onClick={() => {
              if (pendingTranscript.trim()) {
                const sendText = mode === 'code' ? `\`\`\`${language}\n${pendingTranscript}\n\`\`\`` : pendingTranscript;
                onSend(sendText);
              }
              setPendingTranscript(null);
            }}>✓ Send</button>
            <button className="btn btn-ghost btn-xs" onClick={() => setPendingTranscript(null)}>✗</button>
          </div>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 mx-4 mt-2 px-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
          </span>
          <span className="text-xs text-error font-medium">Listening... Speak your answer</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map(renderMessage)}

        {timerExpired && timerEnabled && (
          <div className="alert alert-warning text-sm shadow-sm mx-2">
            <Timer className="w-4 h-4" />
            <span>⏰ Time's up! In real interviews, concise answers win.</span>
          </div>
        )}

        {isCoachTyping && !isStreaming && (
          <div className="chat chat-start">
            <div className="chat-header text-xs opacity-70 mb-1">🤖 Tech Coach</div>
            <div className="chat-bubble chat-bubble-primary">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-base-100 border-t border-base-300 p-4">
        {/* Mode Tabs */}
        <div className="flex items-center gap-2 mb-2">
          <div className="tabs tabs-boxed tabs-sm bg-base-200">
            <button
              className={`tab ${mode === 'text' ? 'tab-active' : ''}`}
              onClick={() => setMode('text')}
            >
              <Layout className="w-3 h-3 mr-1" />
              Text Answer
            </button>
            <button
              className={`tab ${mode === 'code' ? 'tab-active' : ''}`}
              onClick={() => setMode('code')}
            >
              <Code2 className="w-3 h-3 mr-1" />
              Code Answer
            </button>
          </div>

          {mode === 'code' && (
            <select
              className="select select-bordered select-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          )}

          <div className="flex-1" />

          <button
            className={`btn btn-ghost btn-sm gap-1 ${isHintLoading ? 'loading' : ''}`}
            onClick={onHint}
            disabled={isHintLoading || isCoachTyping}
          >
            {isHintLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4 text-warning" />
            )}
            Hint
          </button>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          {mode === 'text' ? (
            <textarea
              ref={textareaRef}
              className="textarea textarea-bordered flex-1 resize-none"
              rows={2}
              placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCoachTyping}
            />
          ) : (
            <textarea
              ref={textareaRef}
              className="textarea flex-1 resize-none font-mono text-sm bg-gray-50 text-gray-800 border-gray-300 placeholder-gray-400"
              rows={5}
              placeholder={`Write your ${language} code here... (Ctrl+Enter to send)`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCoachTyping}
              spellCheck={false}
            />
          )}

          <div className="flex flex-col gap-1">
            <button
              className="btn btn-primary flex-1"
              onClick={handleSend}
              disabled={!input.trim() || isCoachTyping}
            >
              <Send className="w-5 h-5" />
            </button>
            {isVoiceSupported() && (
              <button
                className={`btn ${isListening ? 'btn-error animate-pulse' : 'btn-ghost'} flex-1`}
                onClick={toggleVoice}
                disabled={isCoachTyping}
                title={isListening ? 'Stop recording' : 'Start voice input (Deepgram AI)'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {mode === 'code' && (
          <p className="text-xs text-base-content/50 mt-1">
            💡 Ctrl+Enter to send code • The coach will evaluate your logic, complexity &amp; style
          </p>
        )}
      </div>
    </div>
  );
};
