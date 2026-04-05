import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';

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
}) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'text' | 'code'>('text');
  const [language, setLanguage] = useState('Python');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isCoachTyping]);

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
              <pre className="bg-neutral text-green-400 rounded-lg p-3 overflow-x-auto text-sm mt-1">
                <code>{msg.text}</code>
              </pre>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{msg.text}</div>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map(renderMessage)}

        {isCoachTyping && (
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
              className="textarea flex-1 resize-none font-mono text-sm bg-neutral text-green-400 border-neutral-focus placeholder-green-700"
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
