import React, { useState, useEffect } from 'react';
import { Trophy, AlertTriangle, Star, RotateCcw, Mail, Check, Loader2, BarChart3, Sparkles, BookOpen } from 'lucide-react';
import { ScoreEntry, SpeechAnalyticsSummary } from '../types';

interface ScorecardProps {
  studentName: string;
  targetSchool: string;
  scores: ScoreEntry[];
  overallScore: number;
  coachNote: string;
  studentEmail?: string;
  onRestart: () => void;
  onEmailScorecard?: () => Promise<boolean>;
  speechSummary: SpeechAnalyticsSummary;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-success';
  if (score >= 6) return 'text-warning';
  return 'text-error';
};

const getScoreEmoji = (score: number): string => {
  if (score >= 8) return '🟢';
  if (score >= 6) return '🟡';
  return '🔴';
};

export const Scorecard: React.FC<ScorecardProps> = ({
  studentName, targetSchool, scores, overallScore, coachNote, studentEmail, onRestart, onEmailScorecard, speechSummary,
}) => {
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [autoSent, setAutoSent] = useState(false);

  useEffect(() => {
    if (studentEmail && onEmailScorecard && !autoSent) {
      setAutoSent(true);
      setEmailStatus('sending');
      onEmailScorecard()
        .then((ok) => setEmailStatus(ok ? 'sent' : 'error'))
        .catch(() => setEmailStatus('error'));
    }
  }, [studentEmail, onEmailScorecard, autoSent]);

  const handleManualEmail = async () => {
    if (!onEmailScorecard || emailStatus === 'sending') return;
    setEmailStatus('sending');
    try {
      const ok = await onEmailScorecard();
      setEmailStatus(ok ? 'sent' : 'error');
    } catch { setEmailStatus('error'); }
  };

  const fillerRateColor = speechSummary.fillerRate <= 1 ? 'text-success' : speechSummary.fillerRate <= 3 ? 'text-info' : speechSummary.fillerRate <= 5 ? 'text-warning' : 'text-error';
  const pacingColor = speechSummary.avgWpm === 0 ? 'text-base-content/40' : (speechSummary.avgWpm >= 120 && speechSummary.avgWpm <= 160) ? 'text-success' : (speechSummary.avgWpm >= 100 && speechSummary.avgWpm <= 180) ? 'text-info' : 'text-warning';

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="card bg-base-200">
          <div className="card-body items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy size={32} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">neevv Scorecard</h2>
              <p className="text-base-content/60 text-sm mt-1">{studentName} · Target: {targetSchool}</p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}<span className="text-lg text-base-content/40">/10</span>
            </div>
          </div>
        </div>

        {/* Score Table */}
        <div className="card bg-base-200">
          <div className="card-body p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-center w-20">Score</th>
                  <th>Observation</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, i) => (
                  <tr key={i}>
                    <td className="font-medium text-base-content">{getScoreEmoji(entry.score)} {entry.category}</td>
                    <td className="text-center">
                      <span className={`font-bold text-lg ${getScoreColor(entry.score)}`}>{entry.score}</span>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-start gap-1.5">
                          <Star size={14} className="text-success mt-0.5 shrink-0" />
                          <span className="text-sm text-base-content/80">{entry.strength}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle size={14} className="text-error mt-0.5 shrink-0" />
                          <span className="text-sm text-base-content/80">{entry.gap}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Speech Analytics Summary (Yoodli-inspired) */}
        {speechSummary.totalWordCount > 0 && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold text-info text-sm flex items-center gap-2">
                <BarChart3 size={16} /> Communication Analytics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <div className="bg-base-300 rounded-lg p-3 text-center">
                  <p className="text-xs text-base-content/50">Words Spoken</p>
                  <p className="text-xl font-bold text-base-content">{speechSummary.totalWordCount}</p>
                </div>
                <div className="bg-base-300 rounded-lg p-3 text-center">
                  <p className="text-xs text-base-content/50">Pacing</p>
                  <p className={`text-xl font-bold ${pacingColor}`}>{speechSummary.avgWpm > 0 ? speechSummary.avgWpm : '—'}</p>
                  <p className="text-xs text-base-content/40">wpm</p>
                </div>
                <div className="bg-base-300 rounded-lg p-3 text-center">
                  <p className="text-xs text-base-content/50">Filler Words</p>
                  <p className={`text-xl font-bold ${fillerRateColor}`}>{speechSummary.totalFillerCount}</p>
                  <p className="text-xs text-base-content/40">{speechSummary.fillerRate}% rate</p>
                </div>
                <div className="bg-base-300 rounded-lg p-3 text-center">
                  <p className="text-xs text-base-content/50">B-School Terms</p>
                  <p className="text-xl font-bold text-primary">{speechSummary.bschoolTermsUsed.length}</p>
                </div>
              </div>

              {/* Top fillers */}
              {speechSummary.topFillers.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-base-content/50 mb-1">Most Used Fillers:</p>
                  <div className="flex flex-wrap gap-1">
                    {speechSummary.topFillers.map((f) => (
                      <span key={f.word} className="badge badge-sm badge-warning">"{f.word}" ×{f.count}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* B-school terms used */}
              {speechSummary.bschoolTermsUsed.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-base-content/50 mb-1 flex items-center gap-1">
                    <BookOpen size={12} /> B-School Vocabulary Used:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {speechSummary.bschoolTermsUsed.map((t) => (
                      <span key={t} className="badge badge-sm badge-primary badge-outline">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coach Note */}
        <div className="card bg-primary/10 border border-primary/20">
          <div className="card-body">
            <h3 className="font-semibold text-primary text-sm flex items-center gap-2">
              <Sparkles size={16} /> Coach's Note
            </h3>
            <p className="text-sm text-base-content/80 leading-relaxed">{coachNote}</p>
          </div>
        </div>

        {/* Email status */}
        {studentEmail && emailStatus === 'sent' && (
          <div className="alert alert-success text-sm">
            <Check size={16} />
            <span>Scorecard emailed to <strong>{studentEmail}</strong> — check your inbox!</span>
          </div>
        )}
        {studentEmail && emailStatus === 'sending' && (
          <div className="alert alert-info text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Sending scorecard to {studentEmail}...</span>
          </div>
        )}
        {emailStatus === 'error' && (
          <div className="alert alert-warning text-sm">
            <AlertTriangle size={16} />
            <span>Couldn't email the scorecard. You can try again below.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button className="btn btn-primary" onClick={onRestart}>
            <RotateCcw size={16} /> New Interview
          </button>
          {studentEmail && emailStatus !== 'sent' && (
            <button
              className={`btn btn-outline btn-secondary ${emailStatus === 'sending' ? 'btn-disabled' : ''}`}
              onClick={handleManualEmail}
            >
              <Mail size={16} /> {emailStatus === 'sending' ? 'Sending...' : 'Send Scorecard to My Email'}
            </button>
          )}
        </div>
        <p className="text-xs text-base-content/40 text-center mt-1">Scorecard will be sent to your account email</p>
      </div>
    </div>
  );
};
