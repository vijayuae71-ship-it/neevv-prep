import { ScoreEntry, SpeechAnalyticsSummary } from '../types';

interface MBAScorecardData {
  studentName: string;
  targetSchool: string;
  scores: ScoreEntry[];
  overallScore: number;
  coachNote: string;
  speechSummary?: SpeechAnalyticsSummary;
}

interface TechScorecardData {
  studentName: string;
  targetCompany: string;
  scores: ScoreEntry[];
  overallScore: number;
  coachNote: string;
}

function generateScorecardHTML(data: MBAScorecardData | TechScorecardData, type: 'mba' | 'tech'): string {
  const isMBA = type === 'mba';
  const target = isMBA ? (data as MBAScorecardData).targetSchool : (data as TechScorecardData).targetCompany;
  const speechSummary = isMBA ? (data as MBAScorecardData).speechSummary : undefined;

  const scoreRows = data.scores.map(s => {
    const color = s.score >= 8 ? '#22c55e' : s.score >= 6 ? '#eab308' : '#ef4444';
    return `
      <tr>
        <td style="padding: 12px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${s.category}</td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <span style="color: ${color}; font-weight: 700; font-size: 1.25rem;">${s.score}</span><span style="color: #9ca3af;">/10</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="margin-bottom: 4px;">✅ ${s.strength}</div>
          <div style="color: #dc2626;">⚠️ ${s.gap}</div>
        </td>
      </tr>`;
  }).join('');

  const overallColor = data.overallScore >= 8 ? '#22c55e' : data.overallScore >= 6 ? '#eab308' : '#ef4444';

  let speechSection = '';
  if (speechSummary && speechSummary.totalWordCount > 0) {
    speechSection = `
      <div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-radius: 8px;">
        <h3 style="margin: 0 0 12px; color: #0369a1; font-size: 0.95rem;">🎙️ Communication Analytics</h3>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div><strong>${speechSummary.totalWordCount}</strong> words</div>
          ${speechSummary.avgWpm > 0 ? `<div><strong>${speechSummary.avgWpm}</strong> wpm</div>` : ''}
          <div><strong>${speechSummary.totalFillerCount}</strong> fillers (${speechSummary.fillerRate}%)</div>
          ${speechSummary.bschoolTermsUsed.length > 0 ? `<div><strong>${speechSummary.bschoolTermsUsed.length}</strong> B-school terms</div>` : ''}
        </div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <title>${isMBA ? 'neevv Scorecard' : 'neevv Tech Scorecard'} - ${data.studentName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1f2937; max-width: 800px; margin: 0 auto; }
    @media print { body { padding: 20px; } .no-print { display: none !important; } }
    h1 { font-size: 1.5rem; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; padding: 10px 12px; background: #f3f4f6; font-size: 0.85rem; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    td { font-size: 0.9rem; color: #374151; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; padding: 6px 16px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border-radius: 8px; font-weight: 700; font-size: 1.1rem; margin-bottom: 12px;">
      ${isMBA ? '🎓 neevv Scorecard' : '🖥️ neevv Tech Scorecard'}
    </div>
    <h1>${data.studentName}</h1>
    <p style="color: #6b7280; font-size: 0.9rem;">Target: ${target} · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <div style="margin-top: 16px;">
      <span style="font-size: 3rem; font-weight: 800; color: ${overallColor};">${data.overallScore}</span>
      <span style="font-size: 1.2rem; color: #9ca3af;">/10</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th style="text-align: center; width: 80px;">Score</th>
        <th>Observation</th>
      </tr>
    </thead>
    <tbody>
      ${scoreRows}
    </tbody>
  </table>

  ${speechSection}

  <div style="margin-top: 24px; padding: 16px; background: #faf5ff; border-radius: 8px; border-left: 4px solid #a855f7;">
    <h3 style="margin: 0 0 8px; color: #7c3aed; font-size: 0.95rem;">💬 Coach's Note</h3>
    <p style="line-height: 1.6; font-size: 0.9rem; color: #4b5563;">${data.coachNote}</p>
  </div>

  <div style="margin-top: 32px; text-align: center; color: #9ca3af; font-size: 0.75rem;">
    Powered by neevv Prep · Your interview preparation foundation
  </div>

  <div class="no-print" style="margin-top: 24px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">
      📥 Save as PDF
    </button>
  </div>
</body>
</html>`;
}

export function exportMBAScorecardPDF(data: MBAScorecardData): void {
  const html = generateScorecardHTML(data, 'mba');
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function exportTechScorecardPDF(data: TechScorecardData): void {
  const html = generateScorecardHTML(data, 'tech');
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
