import React, { useState, useCallback } from 'react';
import {
  ArrowLeft, Send, Loader2, RotateCcw,
  Target, Calculator, BookOpen, GraduationCap, Sparkles
} from 'lucide-react';
import { sendMessage } from '../utils/difyApi';

interface FreeToolsProps {
  onBack: () => void;
  onStartInterview: () => void;
}

type ToolId = 'why-mba' | 'star-builder' | 'guesstimate' | 'bschool-fit';

interface Tool {
  id: ToolId;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  bg: string;
  placeholder: string;
  prompt: (input: string) => string;
}

const TOOLS: Tool[] = [
  {
    id: 'why-mba',
    icon: <Target size={24} />,
    title: '"Why MBA?" Answer Builder',
    desc: 'Craft a compelling "Why MBA?" answer. Enter your career goals, and the AI will structure a winning response.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    placeholder: 'I want to transition from software engineering to product management. My 5-year goal is to lead a tech product at a Fortune 500 company...',
    prompt: (input: string) => `[FREE TOOL — WHY MBA ANSWER BUILDER]
The student wants help crafting a compelling "Why MBA?" answer. Here is their input about their career goals and motivations:

"${input}"

Please:
1. Write a structured, compelling "Why MBA?" answer (200-250 words) based on their input
2. Use the framework: Past Achievement → Career Gap → Why MBA fills that gap → Future Goal
3. Highlight specific skills an MBA provides (leadership, cross-functional thinking, global network)
4. Then provide 3 specific tips to make their answer even stronger
5. Rate the strength of their underlying narrative (1-10) with brief explanation

Keep it practical and specific to their situation.`,
  },
  {
    id: 'star-builder',
    icon: <BookOpen size={24} />,
    title: 'STAR Story Builder',
    desc: 'Turn a raw work experience into a polished STAR-format story for behavioral interviews.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    placeholder: 'I led a team of 4 engineers to deliver a payment system migration from legacy to cloud. We had a tight deadline and the team was stressed...',
    prompt: (input: string) => `[FREE TOOL — STAR STORY BUILDER]
The student wants to convert this raw experience into a polished STAR-format story for B-school interviews:

"${input}"

Please:
1. Rewrite this as a complete STAR story with clearly labeled sections:
   - **Situation** (2-3 sentences, set the context)
   - **Task** (what was your specific responsibility)
   - **Action** (3-4 specific actions YOU took — be detailed and use strong action verbs)
   - **Result** (quantified outcomes wherever possible)
2. Then provide a "Coach's Critique" of the story — what's strong and what could be improved
3. Suggest 2 follow-up questions an interviewer might ask about this story
4. Rate the story's impact (1-10)

Focus on making the Action section especially strong with specific, personal contributions.`,
  },
  {
    id: 'guesstimate',
    icon: <Calculator size={24} />,
    title: 'Guesstimate Framework Practice',
    desc: 'Get a random guesstimate question with a data exhibit. Practice your estimation framework.',
    color: 'text-warning',
    bg: 'bg-warning/10',
    placeholder: '(Leave empty for a random question, or type a topic like "EV market in India" or "coffee shops in Mumbai")',
    prompt: (input: string) => `[FREE TOOL — GUESSTIMATE FRAMEWORK PRACTICE]
${input.trim() ? `The student wants a guesstimate question about: "${input}"` : 'Give the student a random, interesting guesstimate question.'}

Please:
1. Present a clear guesstimate question
2. Include a brief **Data Exhibit** (3-5 relevant data points or a mini market scenario to ground the estimation)
3. After presenting the question and data, provide:
   - The recommended **Framework** (top-down or bottom-up with segments)
   - A **step-by-step solution** with clear math at each step
   - The **final estimate** with a reasonable range
4. Rate the difficulty (Easy/Medium/Hard)
5. Include a "Common Mistakes" section (2-3 pitfalls students typically make on this type of question)

Make the data exhibit realistic with specific numbers the student can use in their estimation.`,
  },
  {
    id: 'bschool-fit',
    icon: <GraduationCap size={24} />,
    title: 'B-School Fit Analyzer',
    desc: 'Enter your profile and target school — get a fit analysis with strengths, gaps, and tips.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    placeholder: 'Profile: 4 years in management consulting at McKinsey, GMAT 740, strong extracurriculars in social impact. Target: ISB Hyderabad PGP...',
    prompt: (input: string) => `[FREE TOOL — B-SCHOOL FIT ANALYZER]
The student wants a fit analysis for their B-school application:

"${input}"

Please provide:
1. **Fit Score** (1-10) with brief justification
2. **Profile Strengths** (3-4 points) — what makes this profile competitive for this school
3. **Profile Gaps** (2-3 points) — areas that might raise concerns or need addressing
4. **Application Strategy Tips** (3-4 specific, actionable tips)
5. **Interview Prep Focus Areas** — what questions this profile is likely to face
6. **Comparable Schools** — suggest 2-3 other schools that would be a good fit

Be specific to the school mentioned. Reference the school's known culture, class profile, and values.`,
  },
];

// Individual Tool Component
const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = React.useRef('tool-' + Date.now().toString(36));

  const [conversationId, setConversationId] = useState('');

  const handleSubmit = useCallback(async (followUpQuery?: string) => {
    if (loading) return;
    // For guesstimate, empty input is OK (random question)
    if (!followUpQuery && !input.trim() && tool.id !== 'guesstimate') {
      setError('Please fill in all fields before generating.');
      return;
    }

    setLoading(true);
    setError(null);
    if (!followUpQuery) setResult(null);

    try {
      const query = followUpQuery || tool.prompt(input);
      const response = await sendMessage(query, conversationId, userIdRef.current);
      setResult(response.answer);
      if (response.conversation_id) setConversationId(response.conversation_id);
    } catch (err) {
      console.error('Tool error:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input, loading, tool, conversationId]);

  const handleReset = () => {
    setInput('');
    setResult(null);
    setError(null);
    setConversationId('');
  };

  // Simple markdown rendering
  const renderResult = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) return <h4 key={i} className="font-bold text-sm mt-3 mb-1">{trimmed.slice(4)}</h4>;
      if (trimmed.startsWith('## ')) return <h3 key={i} className="font-bold mt-3 mb-1">{trimmed.slice(3)}</h3>;
      if (trimmed.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{trimmed.slice(2)}</h2>;
      if (trimmed.match(/^[-•*]\s+/)) return <li key={i} className="ml-4 list-disc text-sm">{formatBold(trimmed.replace(/^[-•*]\s+/, ''))}</li>;
      if (trimmed.match(/^\d+\.\s+/)) return <li key={i} className="ml-4 list-decimal text-sm">{formatBold(trimmed.replace(/^\d+\.\s+/, ''))}</li>;
      if (trimmed.match(/^---+$/)) return <hr key={i} className="border-base-300 my-2" />;
      if (trimmed === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm my-0.5">{formatBold(trimmed)}</p>;
    });
  };

  const formatBold = (str: string): React.ReactNode => {
    const parts = str.split(/\*\*(.+?)\*\*/);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
  };

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center`}>
            <span className={tool.color}>{tool.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-base-content">{tool.title}</h3>
            <p className="text-xs text-base-content/50">{tool.desc}</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-3">
            <textarea
              className="textarea textarea-bordered w-full h-28 text-sm"
              placeholder={tool.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              className={`btn btn-sm w-full ${loading ? 'btn-disabled' : 'btn-primary'}`}
              onClick={() => handleSubmit()}
              disabled={loading || (!input.trim() && tool.id !== 'guesstimate')}
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={14} /> Generate</>
              )}
            </button>
            {error && <p className="text-xs text-error">{error}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-base-100 rounded-xl p-4 max-h-96 overflow-y-auto text-base-content/80 leading-relaxed">
              {renderResult(result)}
            </div>
            <div className="flex gap-2">
              {conversationId && (
                <button
                  className={`btn btn-outline btn-sm flex-1 gap-1 ${loading ? 'btn-disabled' : 'btn-secondary'}`}
                  onClick={() => handleSubmit('Please refine and expand on your previous response. Go deeper, add more detail, and provide additional examples or tips.')}
                  disabled={loading}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Refine This
                </button>
              )}
              <button className="btn btn-ghost btn-sm flex-1 gap-1" onClick={handleReset}>
                <RotateCcw size={14} /> Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FreeTools: React.FC<FreeToolsProps> = ({ onBack, onStartInterview }) => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <button className="btn btn-ghost btn-sm gap-1 mb-4" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Free Interview Prep Tools</h1>
          <p className="text-base-content/50">Practice specific skills with neev-powered mini-tools — no sign-up needed</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid sm:grid-cols-2 gap-5">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="card-body py-8">
            <h3 className="font-bold text-base-content text-lg">Ready for the Full Experience?</h3>
            <p className="text-sm text-base-content/60">These tools are great for practice, but the real magic happens in a full mock interview.</p>
            <div className="mt-3">
              <button className="btn btn-primary gap-2" onClick={onStartInterview}>
                Start Full Mock Interview <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
