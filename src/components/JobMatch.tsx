import React, { useState, useEffect, useCallback } from 'react';
import { Search, ExternalLink, TrendingUp, TrendingDown, Minus, ArrowRight, Loader2, RefreshCw, ArrowLeft, Briefcase, Sparkles, Target } from 'lucide-react';
import { searchJobs } from '../utils/serperApi';
import { sendMessage } from '../utils/difyApi';
import type { JobMatch as JobMatchType } from '../types';

interface JobMatchProps {
  skills: string[];
  resumeText: string;
  profileData: { name: string; college: string; major: string; targetJob: string; location: string };
  onSelectJob: (job: JobMatchType) => void;
  onBackToFoundation: () => void;
}

interface SkillDemand {
  high: string[];
  medium: string[];
  low: string[];
}

function parseMatchResults(raw: string): { matches: JobMatchType[]; skillDemand: SkillDemand } | null {
  try {
    const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
    let jsonStr = jsonBlockMatch ? jsonBlockMatch[1].trim() : null;
    if (!jsonStr) {
      const rawMatch = raw.match(/\{[\s\S]*"matches"[\s\S]*\}/);
      jsonStr = rawMatch ? rawMatch[0] : null;
    }
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    const matches: JobMatchType[] = (parsed.matches || []).map((m: Record<string, unknown>) => ({
      title: String(m.title || ''),
      company: String(m.company || ''),
      matchScore: Number(m.matchScore) || 0,
      whyMatch: String(m.whyMatch || ''),
      link: String(m.link || '#'),
      source: 'serper',
    }));

    const sd = parsed.skillDemand || {};
    return {
      matches,
      skillDemand: {
        high: Array.isArray(sd.high) ? sd.high : [],
        medium: Array.isArray(sd.medium) ? sd.medium : [],
        low: Array.isArray(sd.low) ? sd.low : [],
      },
    };
  } catch {
    return null;
  }
}

export const JobMatchComponent: React.FC<JobMatchProps> = ({ skills, resumeText, profileData, onSelectJob, onBackToFoundation }) => {
  const [matches, setMatches] = useState<JobMatchType[]>([]);
  const [skillDemand, setSkillDemand] = useState<SkillDemand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState('');

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError('');
    setMatches([]);
    setSkillDemand(null);

    try {
      // Build search query
      const skillsStr = skills.slice(0, 3).join('" OR "');
      const query = `site:linkedin.com/jobs OR site:naukri.com "${profileData.major}" OR "${profileData.targetJob}" ${profileData.location} "${skillsStr}"`;

      const searchResults = await searchJobs(query, profileData.location);
      const organic = searchResults.organic || [];

      if (organic.length === 0) {
        setError('No job results found. Try adjusting your profile details.');
        setLoading(false);
        return;
      }

      // Format results for Dify
      const formatted = organic.slice(0, 10).map((r: { title?: string; link?: string; snippet?: string }, i: number) =>
        `${i + 1}. ${r.title || 'Untitled'}\n   URL: ${r.link || '#'}\n   Snippet: ${r.snippet || 'N/A'}`
      ).join('\n\n');

      const resumeSummary = resumeText.length > 500 ? resumeText.slice(0, 500) + '...' : resumeText;

      const prompt = `You are a VP-level career strategist. Given this candidate's profile and these job search results, provide match analysis.

CANDIDATE PROFILE:
- Skills: ${skills.join(', ')}
- Background: ${resumeSummary}
- Target: ${profileData.targetJob}

JOB RESULTS:
${formatted}

Respond with ONLY a JSON block:
\`\`\`json
{
  "matches": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "matchScore": <0-100>,
      "whyMatch": "Short reason why this is a match based on candidate's specific skills",
      "link": "original URL"
    }
  ],
  "skillDemand": {
    "high": ["skill1", "skill2"],
    "medium": ["skill3"],
    "low": ["skill4"]
  }
}
\`\`\`
Return top 5 matches sorted by match score. Be data-driven — reference specific skills from the resume.`;

      const userId = `neevv-${Date.now()}`;
      const res = await sendMessage(prompt, conversationId || '', userId);
      if (res.conversation_id) setConversationId(res.conversation_id);

      const parsed = parseMatchResults(res.answer);
      if (!parsed || parsed.matches.length === 0) {
        setError('Could not analyze job matches. Please retry.');
        setLoading(false);
        return;
      }

      setMatches(parsed.matches);
      setSkillDemand(parsed.skillDemand);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Job search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [skills, resumeText, profileData, conversationId]);

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOADING ---
  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">Phase 2: Infinite Match</h2>
          <p className="text-base-content/60 text-sm">Scanning the market for your best-fit opportunities...</p>
        </div>

        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <p className="text-sm text-base-content/60">Searching LinkedIn, Naukri, and more...</p>
        </div>

        {/* Shimmer cards */}
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-base-300" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-base-300 rounded w-2/3" />
                  <div className="h-3 bg-base-300 rounded w-1/3" />
                </div>
                <div className="w-16 h-8 bg-base-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- ERROR ---
  if (error && matches.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">Phase 2: Infinite Match</h2>
        </div>
        <div className="alert alert-error shadow-lg">
          <span>{error}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onBackToFoundation} className="btn btn-outline flex-1 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Foundation
          </button>
          <button onClick={runSearch} className="btn btn-primary flex-1 gap-2">
            <RefreshCw className="w-4 h-4" /> Retry Search
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS ---
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Infinite Match</h2>
          <p className="text-base-content/60 text-sm">{matches.length} opportunities matched to your profile</p>
        </div>
        <button onClick={runSearch} className="btn btn-ghost btn-sm gap-1">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Match Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wide">
                <th>Role & Company</th>
                <th>Match</th>
                <th className="hidden md:table-cell">The Why</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((job, i) => (
                <tr key={i} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{job.title}</p>
                        <p className="text-xs text-base-content/50">{job.company}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`radial-progress text-xs ${job.matchScore >= 80 ? 'text-success' : job.matchScore >= 60 ? 'text-warning' : 'text-error'}`}
                      style={{ '--value': job.matchScore, '--size': '2.5rem', '--thickness': '3px' } as React.CSSProperties}
                      role="progressbar"
                    >
                      {job.matchScore}
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    <p className="text-xs text-base-content/70 max-w-xs">{job.whyMatch}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {job.link && job.link !== '#' && (
                        <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button onClick={() => onSelectJob(job)} className="btn btn-primary btn-xs gap-1">
                        Select <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile "Why" cards */}
        <div className="md:hidden p-4 space-y-3">
          {matches.map((job, i) => (
            <div key={i} className="bg-base-200/40 rounded-lg p-3">
              <p className="text-xs font-medium text-primary mb-1">{job.title} — Why?</p>
              <p className="text-xs text-base-content/70">{job.whyMatch}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills vs Market Demand */}
      {skillDemand && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-base-content/50 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" /> Your Skills vs Market Demand
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* High Demand */}
            <div className="bg-success/5 border border-success/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-xs font-semibold uppercase text-success">High Demand</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skillDemand.high.map((s, i) => (
                  <span key={i} className="badge badge-success badge-outline badge-sm">{s}</span>
                ))}
                {skillDemand.high.length === 0 && <span className="text-xs text-base-content/40">None identified</span>}
              </div>
            </div>

            {/* Medium Demand */}
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Minus className="w-4 h-4 text-warning" />
                <span className="text-xs font-semibold uppercase text-warning">Moderate</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skillDemand.medium.map((s, i) => (
                  <span key={i} className="badge badge-warning badge-outline badge-sm">{s}</span>
                ))}
                {skillDemand.medium.length === 0 && <span className="text-xs text-base-content/40">None identified</span>}
              </div>
            </div>

            {/* Low Demand */}
            <div className="bg-error/5 border border-error/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-error" />
                <span className="text-xs font-semibold uppercase text-error">Low Demand</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skillDemand.low.map((s, i) => (
                  <span key={i} className="badge badge-error badge-outline badge-sm">{s}</span>
                ))}
                {skillDemand.low.length === 0 && <span className="text-xs text-base-content/40">None identified</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VP Insight */}
      <div className="glass-card p-5 border-l-4 border-primary">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold mb-1">VP Insight</p>
            <p className="text-xs text-base-content/70">
              Select the role that best aligns with your core competencies — not your aspirations. The market rewards fit, not ambition. We&apos;ll build a custom application kit for your selected role.
            </p>
          </div>
        </div>
      </div>

      <button onClick={onBackToFoundation} className="btn btn-outline btn-sm gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Foundation
      </button>
    </div>
  );
};
