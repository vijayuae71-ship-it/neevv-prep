import React, { useState, useEffect } from 'react';
import { Mail, RotateCcw, Home, Briefcase, CheckCircle2, AlertTriangle, FileDown } from 'lucide-react';
import type { DomainInterviewConfig } from './DomainSetup';
import { DOMAIN_CONFIGS } from '../data/domainQuestions';

interface ScoreCategory {
  category: string;
  score: number;
  strength: string;
  gap: string;
}

interface DomainScorecardProps {
  config: DomainInterviewConfig;
  scores: ScoreCategory[];
  overallScore: number;
  coachNote: string;
  onBack?: () => void;
  onRetry?: () => void;
  onEmailScorecard?: () => Promise<boolean> | void;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-success';
  if (score >= 6) return 'text-warning';
  return 'text-error';
};

const getProgressColor = (score: number): string => {
  if (score >= 8) return 'progress-success';
  if (score >= 6) return 'progress-warning';
  return 'progress-error';
};

const getStrokeColor = (score: number): string => {
  if (score >= 8) return '#36d399';
  if (score >= 6) return '#fbbd23';
  return '#f87272';
};

// Count-up animation hook
const useCountUp = (target: number, duration: number = 1500): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

export const DomainScorecard: React.FC<DomainScorecardProps> = ({
  config,
  scores,
  overallScore,
  coachNote,
  onBack,
  onRetry,
  onEmailScorecard,
}) => {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (overallScore / 10) * circumference;
  const animatedScore = useCountUp(overallScore);

  const domainConfig = DOMAIN_CONFIGS.find(d => d.key === config.domain);
  const domainLabel = domainConfig ? `${domainConfig.icon} ${domainConfig.label}` : config.domain;

  const handleDownloadPDF = () => {
    // Simple text-based download
    let text = `🎓 neevv Domain Scorecard\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Student: ${config.name}\n`;
    text += `Domain: ${domainLabel}\n`;
    text += `Target Role: ${config.targetRole}\n`;
    text += `Experience: ${config.experience}\n`;
    text += `Overall Score: ${overallScore}/10\n\n`;
    text += `📊 Category Scores\n────────────────────\n`;
    for (const s of scores) {
      text += `\n${s.category}: ${s.score}/10\n`;
      text += `  ✅ Strength: ${s.strength}\n`;
      text += `  ⚠️ Gap: ${s.gap}\n`;
    }
    text += `\n💬 Coach's Note\n────────────────────\n${coachNote}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\nPowered by neevv Prep`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neevv-domain-scorecard-${config.name.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                neevv Domain Scorecard
              </h1>
            </div>
            <div className="divider my-1"></div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div>
                <span className="text-base-content/60">Student:</span>{' '}
                <span className="font-semibold">{config.name}</span>
              </div>
              <div>
                <span className="text-base-content/60">Domain:</span>{' '}
                <span className="font-semibold">{domainLabel}</span>
              </div>
              <div>
                <span className="text-base-content/60">Target:</span>{' '}
                <span className="font-semibold">{config.targetRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score - Circular Progress */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-lg mb-4">Domain Readiness Score</h2>
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-base-300" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={getStrokeColor(overallScore)}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {animatedScore}
                </span>
                <span className="text-xs text-base-content/60">/10</span>
              </div>
            </div>
            <p className="text-sm text-base-content/70 mt-2">
              {overallScore >= 8
                ? '🌟 Excellent — placement ready!'
                : overallScore >= 6
                ? '👍 Good foundation — keep sharpening!'
                : '💪 Needs work — focus on weak areas'}
            </p>
          </div>
        </div>

        {/* Score Categories */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Detailed Scores</h2>
            <div className="space-y-5">
              {scores.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">{cat.category}</span>
                    <span className={`font-bold text-lg ${getScoreColor(cat.score)}`}>
                      {cat.score}/10
                    </span>
                  </div>
                  <progress
                    className={`progress ${getProgressColor(cat.score)} w-full`}
                    value={cat.score}
                    max={10}
                  ></progress>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 text-sm">
                    <div className="flex items-start gap-1 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-base-content/80">{cat.strength}</span>
                    </div>
                    <div className="flex items-start gap-1 flex-1">
                      <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      <span className="text-base-content/80">{cat.gap}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coach's Note */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">🤖 Coach's Final Note</h2>
            <p className="text-base-content/80 whitespace-pre-wrap leading-relaxed">{coachNote}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pb-8">
          {config.email && onEmailScorecard && (
            <button className="btn btn-primary gap-2" onClick={onEmailScorecard}>
              <Mail className="w-5 h-5" />
              Email Scorecard
            </button>
          )}
          <button className="btn btn-accent btn-outline gap-2" onClick={handleDownloadPDF}>
            <FileDown className="w-5 h-5" />
            Download Report
          </button>
          {onRetry && (
            <button className="btn btn-secondary gap-2" onClick={onRetry}>
              <RotateCcw className="w-5 h-5" />
              Practice Again
            </button>
          )}
          <button className="btn btn-ghost gap-2" onClick={onBack || (() => window.location.href = '/')}>
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
