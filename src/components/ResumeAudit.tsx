import React, { useState, useCallback } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, ArrowRight, User, GraduationCap, Briefcase, MapPin, X, Loader2, Sparkles, Target, BarChart3, Key, Linkedin } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { sendMessage } from '../utils/difyApi';
import { parseLinkedInPDF } from '../utils/linkedinParser';
import type { NeevScore } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ResumeAuditProps {
  onComplete: (score: NeevScore, resumeText: string, skills: string[], profileData: { name: string; email: string; college: string; major: string; skills: string[]; targetJob: string; location: string }) => void;
  initialName?: string;
  initialEmail?: string;
}

type Mode = 'choose' | 'upload' | 'manual' | 'analyzing' | 'results';

interface ManualProfile {
  college: string;
  major: string;
  skills: string;
  targetJob: string;
  location: string;
}

function parseNeevScore(raw: string): { total: number; metrics: number; structure: number; keywords: number; topSkills: string[]; criticalGaps: string[]; rewrittenBullets: string[] } | null {
  try {
    // Try to extract JSON from ```json ... ``` blocks
    const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
    let jsonStr = jsonBlockMatch ? jsonBlockMatch[1].trim() : null;

    // Fallback: look for raw JSON object
    if (!jsonStr) {
      const rawMatch = raw.match(/\{[\s\S]*"total"[\s\S]*\}/);
      jsonStr = rawMatch ? rawMatch[0] : null;
    }

    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    return {
      total: Number(parsed.total) || 0,
      metrics: Number(parsed.metrics) || 0,
      structure: Number(parsed.structure) || 0,
      keywords: Number(parsed.keywords) || 0,
      topSkills: Array.isArray(parsed.topSkills) ? parsed.topSkills : [],
      criticalGaps: Array.isArray(parsed.criticalGaps) ? parsed.criticalGaps : [],
      rewrittenBullets: Array.isArray(parsed.rewrittenBullets) ? parsed.rewrittenBullets : [],
    };
  } catch {
    return null;
  }
}

export const ResumeAudit: React.FC<ResumeAuditProps> = ({ onComplete, initialName = '', initialEmail = '' }) => {
  const [mode, setMode] = useState<Mode>('choose');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [error, setError] = useState('');
  const [neevResult, setNeevResult] = useState<{
    total: number; metrics: number; structure: number; keywords: number;
    topSkills: string[]; criticalGaps: string[]; rewrittenBullets: string[];
  } | null>(null);

  const [extracting, setExtracting] = useState(false);

  const [manual, setManual] = useState<ManualProfile>({
    college: '', major: '', skills: '', targetJob: '', location: '',
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        setExtracting(true);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setResumeText(text.trim());
      } catch (err) {
        setError('Failed to extract text from PDF. Please try pasting your resume text instead.');
      } finally {
        setExtracting(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text === 'string') setResumeText(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const analyzeResume = useCallback(async (text: string) => {
    setMode('analyzing');
    setError('');

    const prompt = `You are a VP-level career mentor with 25 years of experience. Analyze this resume and provide a Neev Score.

RESUME:
${text}

Respond with ONLY a JSON block in this exact format:
\`\`\`json
{
  "total": <0-100>,
  "metrics": <0-40 based on quantified numbers/percentages>,
  "structure": <0-30 based on STAR/XYZ format usage>,
  "keywords": <0-30 based on industry keyword relevance>,
  "topSkills": ["skill1", "skill2", "skill3"],
  "criticalGaps": ["gap1", "gap2", "gap3"],
  "rewrittenBullets": [
    "Accomplished [X] as measured by [Y], by doing [Z]",
    "Accomplished [X] as measured by [Y], by doing [Z]",
    "Accomplished [X] as measured by [Y], by doing [Z]"
  ]
}
\`\`\`
Be strict. Only give scores above 85 for truly exceptional resumes with clear metrics, strong structure, and relevant keywords.`;

    try {
      const userId = `neevv-${Date.now()}`;
      const res = await sendMessage(prompt, conversationId || '', userId);
      if (res.conversation_id) setConversationId(res.conversation_id);

      const parsed = parseNeevScore(res.answer);
      if (!parsed) {
        setError('Could not parse the AI analysis. Please try again.');
        setMode('upload');
        return;
      }
      setNeevResult(parsed);
      setMode('results');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      if (errMsg.includes('404') || errMsg.toLowerCase().includes('not exist')) {
        setConversationId('');
      }
      setError(errMsg);
      setMode('upload');
    }
  }, [conversationId]);

  const handleManualSubmit = useCallback(() => {
    const manualText = `CANDIDATE PROFILE:
College: ${manual.college}
Major: ${manual.major}
Key Skills: ${manual.skills}
Target Job: ${manual.targetJob}
Location: ${manual.location}

This is a manually entered profile — no formatted resume available.`;
    setResumeText(manualText);
    analyzeResume(manualText);
  }, [manual, analyzeResume]);

  const handleProceed = useCallback(() => {
    if (!neevResult) return;
    const skillsArr = neevResult.topSkills.length > 0
      ? neevResult.topSkills
      : manual.skills.split(',').map(s => s.trim()).filter(Boolean);

    const score: NeevScore = {
      total: neevResult.total,
      metrics: neevResult.metrics,
      structure: neevResult.structure,
      keywords: neevResult.keywords,
      criticalGaps: neevResult.criticalGaps,
      rewrittenBullets: neevResult.rewrittenBullets,
    };

    onComplete(score, resumeText, skillsArr, {
      name: initialName,
      email: initialEmail,
      college: manual.college,
      major: manual.major,
      skills: skillsArr,
      targetJob: manual.targetJob,
      location: manual.location,
    });
  }, [neevResult, resumeText, manual, initialName, initialEmail, onComplete]);

  // --- CHOOSE MODE ---
  if (mode === 'choose') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold gradient-text mb-2">Phase 1: Foundation Audit</h2>
          <p className="text-base-content/60">Let&apos;s assess your professional foundation before entering the market.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload/Paste Resume */}
          <button
            onClick={() => setMode('upload')}
            className="glass-card p-8 text-left hover-lift cursor-pointer group transition-all duration-300 border-2 border-transparent hover:border-primary/30"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload / Paste Resume</h3>
            <p className="text-sm text-base-content/60">
              Get a comprehensive Neev Score with AI-powered analysis of your resume&apos;s structure, metrics, and keywords.
            </p>
            <div className="mt-4 flex items-center text-primary text-sm font-medium">
              Recommended <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>

          {/* Manual Profile */}
          <button
            onClick={() => setMode('manual')}
            className="glass-card p-8 text-left hover-lift cursor-pointer group transition-all duration-300 border-2 border-transparent hover:border-secondary/30"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
              <User className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Build Profile Manually</h3>
            <p className="text-sm text-base-content/60">
              No resume yet? Answer 5 quick questions and we&apos;ll build your foundation profile from scratch.
            </p>
            <div className="mt-4 flex items-center text-secondary text-sm font-medium">
              Quick start <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>

          {/* LinkedIn Import */}
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                setExtracting(true);
                setMode('upload');
                try {
                  const profile = await parseLinkedInPDF(file);
                  setResumeText(profile.fullText);
                  setFileName(file.name);
                } catch {
                  setError('Could not parse LinkedIn PDF. Please paste your resume text instead.');
                } finally {
                  setExtracting(false);
                }
              };
              input.click();
            }}
            className="glass-card p-8 text-left hover-lift cursor-pointer group transition-all duration-300 border-2 border-transparent hover:border-info/30"
          >
            <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
              <Linkedin className="w-7 h-7 text-info" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Import LinkedIn PDF</h3>
            <p className="text-sm text-base-content/60">
              Download your LinkedIn profile as PDF and upload it — we&apos;ll extract everything automatically.
            </p>
            <div className="mt-4 flex items-center text-info text-sm font-medium">
              <span className="badge badge-xs badge-info mr-2">NEW</span> Quick &amp; easy <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // --- UPLOAD MODE ---
  if (mode === 'upload') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold gradient-text">Resume Analysis</h2>
          <button onClick={() => setMode('choose')} className="btn btn-ghost btn-sm gap-1">
            <X className="w-4 h-4" /> Back
          </button>
        </div>

        {error && (
          <div className="alert alert-error shadow-lg">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="glass-card p-6 space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-base-300 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 mx-auto mb-3 text-base-content/30" />
              {extracting ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <p className="text-sm font-medium text-primary">Extracting text from PDF...</p>
                </div>
              ) : fileName ? (
                <p className="text-sm font-medium text-primary">{fileName}</p>
              ) : (
                <>
                  <p className="font-medium">Drop your resume or click to upload</p>
                  <p className="text-xs text-base-content/40 mt-1">.txt, .pdf, .doc supported</p>
                </>
              )}
              
            </label>
          </div>

          <div className="divider text-xs text-base-content/40">OR PASTE BELOW</div>

          {/* Text Paste Area */}
          <textarea
            className="textarea textarea-bordered w-full h-48 text-sm font-mono"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />

          <button
            onClick={() => analyzeResume(resumeText)}
            disabled={!resumeText.trim()}
            className="btn btn-primary w-full glow-primary gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Analyze with Neev Score
          </button>
        </div>
      </div>
    );
  }

  // --- MANUAL MODE ---
  if (mode === 'manual') {
    const canSubmit = manual.college && manual.major && manual.skills && manual.targetJob && manual.location;
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold gradient-text">Build Your Profile</h2>
          <button onClick={() => setMode('choose')} className="btn btn-ghost btn-sm gap-1">
            <X className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="glass-card p-6 space-y-5">
          <p className="text-sm text-base-content/60 mb-2">Answer these 5 questions — we&apos;ll construct your foundation profile.</p>

          <div className="form-control">
            <label className="label"><span className="label-text flex items-center gap-2"><GraduationCap className="w-4 h-4" /> College / University</span></label>
            <input type="text" className="input input-bordered" placeholder="e.g. IIM Ahmedabad" value={manual.college} onChange={e => setManual(p => ({ ...p, college: e.target.value }))} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text flex items-center gap-2"><FileText className="w-4 h-4" /> Major / Specialization</span></label>
            <input type="text" className="input input-bordered" placeholder="e.g. MBA Finance" value={manual.major} onChange={e => setManual(p => ({ ...p, major: e.target.value }))} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text flex items-center gap-2"><Target className="w-4 h-4" /> 3 Key Skills</span></label>
            <input type="text" className="input input-bordered" placeholder="e.g. Financial Modeling, Valuation, Strategy" value={manual.skills} onChange={e => setManual(p => ({ ...p, skills: e.target.value }))} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text flex items-center gap-2"><Briefcase className="w-4 h-4" /> Target Job Title</span></label>
            <input type="text" className="input input-bordered" placeholder="e.g. Investment Banking Analyst" value={manual.targetJob} onChange={e => setManual(p => ({ ...p, targetJob: e.target.value }))} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text flex items-center gap-2"><MapPin className="w-4 h-4" /> Preferred Location</span></label>
            <input type="text" className="input input-bordered" placeholder="e.g. Mumbai, India" value={manual.location} onChange={e => setManual(p => ({ ...p, location: e.target.value }))} />
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={!canSubmit}
            className="btn btn-primary w-full glow-primary gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Neev Score
          </button>
        </div>
      </div>
    );
  }

  // --- ANALYZING MODE ---
  if (mode === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
        <h3 className="text-xl font-bold mb-2">Analyzing Your Foundation</h3>
        <p className="text-base-content/60 text-sm text-center max-w-md">
          Our VP-level AI mentor is reviewing your resume against industry benchmarks for metrics, structure, and keyword relevance.
        </p>
        <div className="mt-8 space-y-3 w-full max-w-sm">
          {['Scanning metrics & numbers', 'Evaluating STAR/XYZ structure', 'Matching industry keywords'].map((step, i) => (
            <div key={i} className="glass-card p-3 flex items-center gap-3 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {i === 0 && <BarChart3 className="w-4 h-4 text-primary" />}
                {i === 1 && <FileText className="w-4 h-4 text-primary" />}
                {i === 2 && <Key className="w-4 h-4 text-primary" />}
              </div>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RESULTS MODE ---
  if (mode === 'results' && neevResult) {
    const score = neevResult;
    const canProceed = score.total >= 80;

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold gradient-text mb-1">Your Neev Score</h2>
          <p className="text-base-content/60 text-sm">Foundation strength assessment</p>
        </div>

        {/* Score Circle */}
        <div className="glass-card p-8 flex flex-col items-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-base-300" />
            <circle
              cx="70" cy="70" r="52" fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score.total / 100) * 327} 327`}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <text x="70" y="65" textAnchor="middle" className="text-4xl font-bold fill-base-content">{score.total}</text>
            <text x="70" y="84" textAnchor="middle" className="text-xs fill-base-content/50">Neev Score</text>
          </svg>

          <div className={`mt-4 badge ${score.total >= 85 ? 'badge-success' : score.total >= 70 ? 'badge-warning' : 'badge-error'} badge-lg gap-1`}>
            {score.total >= 85 ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {score.total >= 85 ? 'Strong Foundation' : score.total >= 70 ? 'Needs Reinforcement' : 'Critical Gaps Found'}
          </div>
        </div>

        {/* Breakdown */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-base-content/50">Score Breakdown</h3>

          {[
            { label: 'Metrics & Quantification', value: score.metrics, max: 40, icon: <BarChart3 className="w-4 h-4" /> },
            { label: 'Structure (STAR/XYZ)', value: score.structure, max: 30, icon: <FileText className="w-4 h-4" /> },
            { label: 'Keyword Relevance', value: score.keywords, max: 30, icon: <Key className="w-4 h-4" /> },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-base-content/70">{item.icon} {item.label}</span>
                <span className="font-semibold">{item.value}/{item.max}</span>
              </div>
              <progress
                className={`progress ${item.value / item.max >= 0.7 ? 'progress-success' : item.value / item.max >= 0.5 ? 'progress-warning' : 'progress-error'} w-full`}
                value={item.value}
                max={item.max}
              />
            </div>
          ))}
        </div>

        {/* Critical Gaps */}
        {score.criticalGaps.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-error/80 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Critical Gaps
            </h3>
            <ul className="space-y-2">
              {score.criticalGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="badge badge-error badge-xs mt-1.5" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewritten Bullets */}
        {score.rewrittenBullets.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-primary/80 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> VP-Rewritten Bullets
            </h3>
            <div className="space-y-3">
              {score.rewrittenBullets.map((bullet, i) => (
                <div key={i} className="bg-base-200/50 rounded-xl p-3 text-sm border-l-2 border-primary/40">
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verdict */}
        {score.total < 85 && (
          <div className="alert alert-warning shadow-md">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Your foundation has structural cracks.</p>
              <p className="text-xs mt-1">We cannot move to Infinite Match until these {score.criticalGaps.length} areas are reinforced. Revise your resume and re-upload.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => { setMode('upload'); setNeevResult(null); }} className="btn btn-outline flex-1 gap-2">
            <Upload className="w-4 h-4" /> Re-upload Resume
          </button>
          {canProceed && (
            <button onClick={handleProceed} className="btn btn-primary flex-1 glow-primary gap-2">
              Proceed to Infinite Match <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
