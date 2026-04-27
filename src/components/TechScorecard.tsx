import React from 'react';
import { Mail, RotateCcw, Home, Terminal, CheckCircle2, AlertTriangle, FileDown, BookOpen, Library, ArrowRight } from 'lucide-react';
import { exportTechScorecardPDF } from '../utils/pdfExport';

interface ScoreCategory {
  category: string;
  score: number;
  strength: string;
  gap: string;
}

interface TechScorecardProps {
  studentName: string;
  targetCompany: string;
  scores: ScoreCategory[];
  overallScore: number;
  coachNote: string;
  onRestart: () => void;
  onEmailScorecard?: () => Promise<boolean> | void;
  studentEmail?: string;
  onBack?: () => void;
  onNavigateToQBank?: () => void;
  onNavigateToCaseLibrary?: () => void;
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

export const TechScorecard: React.FC<TechScorecardProps> = ({
  studentName,
  targetCompany,
  scores,
  overallScore,
  coachNote,
  onRestart,
  onEmailScorecard,
  studentEmail,
  onBack,
  onNavigateToQBank,
  onNavigateToCaseLibrary,
}) => {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (overallScore / 10) * circumference;

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Terminal className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                neevv Tech Scorecard
              </h1>
            </div>
            <div className="divider my-1"></div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div>
                <span className="text-base-content/60">Student:</span>{' '}
                <span className="font-semibold">{studentName}</span>
              </div>
              <div>
                <span className="text-base-content/60">Target:</span>{' '}
                <span className="font-semibold">{targetCompany}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score - Circular Progress */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-lg mb-4">Overall Score</h2>
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  className="text-base-300"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={getStrokeColor(overallScore)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
                <span className="text-xs text-base-content/60">/10</span>
              </div>
            </div>
            <p className="text-sm text-base-content/70 mt-2">
              {overallScore >= 8
                ? '🌟 Excellent — interview ready!'
                : overallScore >= 6
                ? '👍 Good foundation — keep practicing!'
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

        {/* Low Score Intervention — redirect to resources if < 7.5/10 (75%) */}
        {overallScore < 7.5 && (
          <div className="card bg-warning/10 border-2 border-warning/30">
            <div className="card-body">
              <h3 className="font-bold text-warning flex items-center gap-2 text-lg">
                <Library size={20} /> 📚 Level Up Before Retaking
              </h3>
              <p className="text-sm text-base-content/70 mt-1">
                Your score is below 75%. Review these areas before your next attempt:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {scores.filter(s => s.score < 7).map((weakArea, i) => (
                  <div key={i} className="bg-base-200 rounded-xl p-3">
                    <p className="text-xs text-error font-semibold mb-1">🔴 {weakArea.category} — {weakArea.score}/10</p>
                    <p className="text-xs text-base-content/60">{weakArea.gap}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {onNavigateToQBank && (
                  <button className="btn btn-warning btn-sm gap-1" onClick={onNavigateToQBank}>
                    <Library size={14} /> Tech Question Bank <ArrowRight size={14} />
                  </button>
                )}
                {onNavigateToCaseLibrary && (
                  <button className="btn btn-outline btn-warning btn-sm gap-1" onClick={onNavigateToCaseLibrary}>
                    <BookOpen size={14} /> Case Library & Frameworks
                  </button>
                )}
              </div>
              <p className="text-xs text-base-content/40 mt-3">
                💡 Tip: Review the question bank first — students who prep specific weak areas improve 2-3 points.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pb-8">
          {studentEmail && (
            <button className="btn btn-primary gap-2" onClick={onEmailScorecard}>
              <Mail className="w-5 h-5" />
              Email Scorecard
            </button>
          )}
          <button
            className="btn btn-accent btn-outline gap-2"
            onClick={() => exportTechScorecardPDF({
              studentName,
              targetCompany,
              scores,
              overallScore,
              coachNote,
            })}
          >
            <FileDown className="w-5 h-5" />
            Download PDF
          </button>
          <button className="btn btn-secondary gap-2" onClick={onRestart}>
            <RotateCcw className="w-5 h-5" />
            Practice Again
          </button>
          <button className="btn btn-ghost gap-2" onClick={onBack || (() => window.location.href = '/')}>
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
