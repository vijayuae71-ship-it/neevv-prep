import React, { useMemo } from 'react';
import { TrendingUp, Calendar, Trophy, Target, BarChart3, Flame } from 'lucide-react';
import { getJSON } from '../utils/localStorage';

interface SessionRecord {
  id: string;
  date: string;
  type: 'mba' | 'tech';
  overallScore: number;
  categories: { category: string; score: number }[];
  targetSchool?: string;
  targetCompany?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function computeStreak(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;
  const uniqueDays = new Set(sessions.map(s => s.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (uniqueDays.has(key)) {
      streak++;
    } else {
      // Allow today to be missing (streak still counts if yesterday was practiced)
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

export const ProgressDashboard: React.FC = () => {
  const sessions = useMemo(() => getJSON<SessionRecord[]>('neevv_progress', []), []);

  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round((sessions.reduce((s, r) => s + r.overallScore, 0) / totalSessions) * 10) / 10
    : 0;
  const bestScore = totalSessions > 0
    ? Math.max(...sessions.map(s => s.overallScore))
    : 0;
  const streak = computeStreak(sessions);

  // Last 10 sessions for chart
  const last10 = sessions.slice(-10);

  // SVG line chart points
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 40;
  const plotW = chartWidth - padding * 2;
  const plotH = chartHeight - padding * 2;

  const points = last10.map((s, i) => {
    const x = padding + (last10.length > 1 ? (i / (last10.length - 1)) * plotW : plotW / 2);
    const y = padding + plotH - (s.overallScore / 10) * plotH;
    return { x, y, score: s.overallScore, date: s.date };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

  // Score color for chart line
  const avgForColor = last10.length > 0
    ? last10.reduce((s, r) => s + r.overallScore, 0) / last10.length
    : 0;
  const lineColor = avgForColor >= 8 ? '#22c55e' : avgForColor >= 6 ? '#eab308' : '#ef4444';

  // Streak calendar - last 30 days
  const today = new Date();
  const sessionDays = new Set(sessions.map(s => s.date));
  const calendarDays: { date: string; day: number; practiced: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    calendarDays.push({ date: key, day: d.getDate(), practiced: sessionDays.has(key) });
  }

  // Recent 10 sessions (newest first)
  const recent10 = [...sessions].reverse().slice(0, 10);

  // Category breakdown - average scores per category
  const catMap: Record<string, { total: number; count: number }> = {};
  for (const s of sessions) {
    for (const c of s.categories) {
      if (!catMap[c.category]) catMap[c.category] = { total: 0, count: 0 };
      catMap[c.category].total += c.score;
      catMap[c.category].count++;
    }
  }
  const categoryBreakdown = Object.entries(catMap).map(([cat, { total, count }]) => ({
    category: cat,
    avg: Math.round((total / count) * 10) / 10,
  })).sort((a, b) => b.avg - a.avg);

  if (totalSessions === 0) {
    return (
      <div className="min-h-screen bg-base-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <BarChart3 size={48} className="mx-auto text-base-content/30 mb-4" />
            <h2 className="text-2xl font-bold text-base-content mb-2">No Sessions Yet</h2>
            <p className="text-base-content/60">Complete your first mock interview to see your progress here!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content flex items-center justify-center gap-2">
            <BarChart3 size={24} className="text-primary" /> Progress Dashboard
          </h1>
          <p className="text-base-content/60 text-sm mt-1">Track your interview prep journey</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card bg-base-200">
            <div className="card-body p-4 items-center text-center">
              <Target size={20} className="text-primary" />
              <p className="text-2xl font-bold text-base-content">{totalSessions}</p>
              <p className="text-xs text-base-content/60">Total Sessions</p>
            </div>
          </div>
          <div className="card bg-base-200">
            <div className="card-body p-4 items-center text-center">
              <TrendingUp size={20} className="text-info" />
              <p className="text-2xl font-bold text-base-content">{avgScore}</p>
              <p className="text-xs text-base-content/60">Average Score</p>
            </div>
          </div>
          <div className="card bg-base-200">
            <div className="card-body p-4 items-center text-center">
              <Trophy size={20} className="text-warning" />
              <p className="text-2xl font-bold text-base-content">{bestScore}</p>
              <p className="text-xs text-base-content/60">Best Score</p>
            </div>
          </div>
          <div className="card bg-base-200">
            <div className="card-body p-4 items-center text-center">
              <Flame size={20} className="text-error" />
              <p className="text-2xl font-bold text-base-content">{streak}</p>
              <p className="text-xs text-base-content/60">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Score Trend Chart */}
        {last10.length > 1 && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-info" /> Score Trend (Last {last10.length} Sessions)
              </h3>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ maxHeight: 220 }}>
                {/* Grid lines */}
                {[0, 2, 4, 6, 8, 10].map(v => {
                  const y = padding + plotH - (v / 10) * plotH;
                  return (
                    <g key={v}>
                      <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                      <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
                    </g>
                  );
                })}
                {/* X axis labels */}
                {points.map((p, i) => (
                  <text key={i} x={p.x} y={chartHeight - 8} textAnchor="middle" fontSize="9" fill="#9ca3af">
                    {formatDate(p.date)}
                  </text>
                ))}
                {/* Line */}
                <polyline
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={polylineStr}
                />
                {/* Dots */}
                {points.map((p, i) => {
                  const dotColor = p.score >= 8 ? '#22c55e' : p.score >= 6 ? '#eab308' : '#ef4444';
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill={dotColor} stroke="white" strokeWidth="2" />
                      <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill={dotColor}>
                        {p.score}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Streak Calendar */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-success" /> Practice Streak (Last 30 Days)
            </h3>
            <div className="grid grid-cols-10 gap-1.5">
              {calendarDays.map((d, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                    d.practiced
                      ? 'bg-success text-success-content'
                      : 'bg-base-300 text-base-content/40'
                  }`}
                  title={d.date}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sessions Table */}
        <div className="card bg-base-200">
          <div className="card-body p-0">
            <h3 className="font-semibold text-sm flex items-center gap-2 px-4 pt-4 pb-2">
              <Target size={16} className="text-primary" /> Recent Sessions
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Score</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {recent10.map(s => (
                    <tr key={s.id}>
                      <td className="text-sm">{formatDate(s.date)}</td>
                      <td>
                        <span className={`badge badge-sm ${s.type === 'mba' ? 'badge-primary' : 'badge-secondary'}`}>
                          {s.type === 'mba' ? 'MBA' : 'Tech'}
                        </span>
                      </td>
                      <td>
                        <span className={`font-bold ${
                          s.overallScore >= 8 ? 'text-success' : s.overallScore >= 6 ? 'text-warning' : 'text-error'
                        }`}>
                          {s.overallScore}/10
                        </span>
                      </td>
                      <td className="text-sm text-base-content/70">{s.targetSchool || s.targetCompany || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <BarChart3 size={16} className="text-secondary" /> Category Breakdown
              </h3>
              <div className="space-y-3">
                {categoryBreakdown.map(c => (
                  <div key={c.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-base-content">{c.category}</span>
                      <span className={`text-sm font-bold ${
                        c.avg >= 8 ? 'text-success' : c.avg >= 6 ? 'text-warning' : 'text-error'
                      }`}>{c.avg}/10</span>
                    </div>
                    <progress
                      className={`progress w-full ${
                        c.avg >= 8 ? 'progress-success' : c.avg >= 6 ? 'progress-warning' : 'progress-error'
                      }`}
                      value={c.avg}
                      max={10}
                    ></progress>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
