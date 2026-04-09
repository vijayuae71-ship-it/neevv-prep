import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Linkedin, Key, Copy, CheckCircle, Loader2, ArrowRight, ArrowLeft, Download, RefreshCw, Sparkles, Shield } from 'lucide-react';
import { sendMessage } from '../utils/difyApi';
import type { JobMatch, ApplicationKit as ApplicationKitType } from '../types';

interface ApplicationKitProps {
  job: JobMatch;
  resumeText: string;
  onComplete: () => void;
  onBack: () => void;
}

function parseApplicationKit(raw: string): ApplicationKitType | null {
  try {
    const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
    let jsonStr = jsonBlockMatch ? jsonBlockMatch[1].trim() : null;
    if (!jsonStr) {
      const rawMatch = raw.match(/\{[\s\S]*"coverLetter"[\s\S]*\}/);
      jsonStr = rawMatch ? rawMatch[0] : null;
    }
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    return {
      coverLetter: String(parsed.coverLetter || ''),
      linkedInNote: String(parsed.linkedInNote || ''),
      atsKeywords: Array.isArray(parsed.atsKeywords) ? parsed.atsKeywords.map(String) : [],
      jobTitle: '',
      company: '',
    };
  } catch {
    return null;
  }
}

export const ApplicationKitComponent: React.FC<ApplicationKitProps> = ({ job, resumeText, onComplete, onBack }) => {
  const [kit, setKit] = useState<ApplicationKitType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState('');

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  const generateKit = useCallback(async () => {
    setLoading(true);
    setError('');

    const resumeSummary = resumeText.length > 800 ? resumeText.slice(0, 800) + '...' : resumeText;

    const prompt = `You are a VP-level career strategist with 25 years of cross-border experience (India & UAE). Create a high-conversion application kit.

CANDIDATE RESUME:
${resumeSummary}

TARGET JOB:
- Title: ${job.title}
- Company: ${job.company}
- Match reason: ${job.whyMatch}

Create:
1. COVER LETTER: Short, punchy, data-driven. Use "VP-Speak" — focus on bottom-line impact, NOT "passion" or "excitement". Max 200 words.
2. LINKEDIN NOTE: A connect request for the hiring manager. EXACTLY under 200 characters.
3. ATS KEYWORDS: 5 keywords that the candidate MUST add to their resume to pass ATS screening.

Respond with ONLY a JSON block:
\`\`\`json
{
  "coverLetter": "...",
  "linkedInNote": "...",
  "atsKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
\`\`\``;

    try {
      const userId = `neevv-${Date.now()}`;
      const res = await sendMessage(prompt, conversationId || '', userId);
      if (res.conversation_id) setConversationId(res.conversation_id);

      const parsed = parseApplicationKit(res.answer);
      if (!parsed) {
        setError('Could not parse the application kit. Please retry.');
        setLoading(false);
        return;
      }

      setKit({
        ...parsed,
        jobTitle: job.title,
        company: job.company,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [job, resumeText, conversationId]);

  useEffect(() => {
    generateKit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadKit = useCallback(() => {
    if (!kit) return;
    const text = `APPLICATION KIT — ${kit.jobTitle} at ${kit.company}
${'='.repeat(50)}

COVER LETTER:
${kit.coverLetter}

${'—'.repeat(30)}

LINKEDIN NOTE (${kit.linkedInNote.length} chars):
${kit.linkedInNote}

${'—'.repeat(30)}

ATS KEYWORDS:
${kit.atsKeywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neevv-kit-${kit.company.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [kit]);

  // --- LOADING ---
  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">Phase 3: Door Opener</h2>
          <p className="text-base-content/60 text-sm">
            Crafting your application kit for <span className="font-semibold text-primary">{job.title}</span> at <span className="font-semibold">{job.company}</span>
          </p>
        </div>

        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <p className="text-sm text-base-content/60">Our VP mentor is writing your kit...</p>
        </div>

        <div className="space-y-4">
          {['Cover Letter', 'LinkedIn Note', 'ATS Keywords'].map((label, i) => (
            <div key={i} className="glass-card p-5 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
              <div className="h-4 bg-base-300 rounded w-1/4 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-base-300 rounded w-full" />
                <div className="h-3 bg-base-300 rounded w-5/6" />
                <div className="h-3 bg-base-300 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- ERROR ---
  if (error && !kit) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">Phase 3: Door Opener</h2>
        </div>
        <div className="alert alert-error shadow-lg">
          <span>{error}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="btn btn-outline flex-1 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={generateKit} className="btn btn-primary flex-1 gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!kit) return null;

  // --- RESULTS ---
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Your Door Opener Kit</h2>
          <p className="text-base-content/60 text-sm">
            {job.title} at {job.company}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateKit} className="btn btn-ghost btn-sm gap-1">
            <RefreshCw className="w-4 h-4" /> Regenerate
          </button>
          <button onClick={downloadKit} className="btn btn-ghost btn-sm gap-1">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Cover Letter */}
      <div className="glass-card p-6 hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            VP-Speak Cover Letter
          </h3>
          <button
            onClick={() => copyToClipboard(kit.coverLetter, 'cover')}
            className="btn btn-ghost btn-sm gap-1"
          >
            {copiedField === 'cover' ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copiedField === 'cover' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="bg-base-200/50 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap border border-base-300/50">
          {kit.coverLetter}
        </div>
      </div>

      {/* LinkedIn Note */}
      <div className="glass-card p-6 hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Linkedin className="w-4 h-4 text-blue-500" />
            </div>
            LinkedIn Connect Note
          </h3>
          <button
            onClick={() => copyToClipboard(kit.linkedInNote, 'linkedin')}
            className="btn btn-ghost btn-sm gap-1"
          >
            {copiedField === 'linkedin' ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copiedField === 'linkedin' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="bg-base-200/50 rounded-xl p-4 text-sm border border-base-300/50">
          <p className="mb-2">{kit.linkedInNote}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300/50">
            <span className="text-xs text-base-content/40">Character count</span>
            <span className={`text-xs font-mono font-semibold ${kit.linkedInNote.length <= 200 ? 'text-success' : 'text-error'}`}>
              {kit.linkedInNote.length}/200
            </span>
          </div>
        </div>
      </div>

      {/* ATS Keywords */}
      <div className="glass-card p-6 hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-warning" />
            </div>
            ATS Hack — Must-Have Keywords
          </h3>
          <button
            onClick={() => copyToClipboard(kit.atsKeywords.join(', '), 'ats')}
            className="btn btn-ghost btn-sm gap-1"
          >
            {copiedField === 'ats' ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copiedField === 'ats' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {kit.atsKeywords.map((keyword, i) => (
            <span key={i} className="badge badge-lg badge-outline badge-primary gap-1 py-3">
              <Shield className="w-3 h-3" />
              {keyword}
            </span>
          ))}
        </div>
        <p className="text-xs text-base-content/50 mt-3">
          Add these exact keywords to your resume to pass ATS screening filters for this role.
        </p>
      </div>

      {/* VP Insight */}
      <div className="glass-card p-5 border-l-4 border-primary">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold mb-1">VP Directive</p>
            <p className="text-xs text-base-content/70">
              Apply within 48 hours of the job posting. Speed is your competitive advantage. Use the cover letter as-is — do not add &quot;passion&quot; or filler phrases. The data speaks.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onBack} className="btn btn-outline flex-1 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </button>
        <button onClick={onComplete} className="btn btn-primary flex-1 glow-primary gap-2">
          Proceed to Mock Interview <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
