import React, { useState, useCallback } from 'react';
import { StickyNav } from './StickyNav';
import { PrivacyShield } from './PrivacyShield';
import { ResumeAudit } from './ResumeAudit';
import { JobMatchComponent } from './JobMatch';
import { ApplicationKitComponent } from './ApplicationKit';
import type { LifecycleStage, NeevScore, JobMatch } from '../types';

interface LifecycleOrchestratorProps {
  userName: string;
  userEmail: string;
  onGoToInterview: () => void;
  onGoHome: () => void;
}

export const LifecycleOrchestrator: React.FC<LifecycleOrchestratorProps> = ({
  userName,
  userEmail,
  onGoToInterview,
  onGoHome,
}) => {
  const [showPrivacy, setShowPrivacy] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [stage, setStage] = useState<LifecycleStage>('foundation');
  const [resumeText, setResumeText] = useState('');
  const [neevScore, setNeevScore] = useState<NeevScore | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [profileData, setProfileData] = useState({
    name: userName,
    email: userEmail,
    college: '',
    major: '',
    skills: [] as string[],
    targetJob: '',
    location: 'India',
  });
  const [stageHistory, setStageHistory] = useState<LifecycleStage[]>([]);

  const navigateToStage = useCallback((newStage: LifecycleStage) => {
    setStageHistory(prev => [...prev, stage]);
    setStage(newStage);
  }, [stage]);

  const handleBack = useCallback(() => {
    if (stageHistory.length > 0) {
      const prev = stageHistory[stageHistory.length - 1];
      setStageHistory(h => h.slice(0, -1));
      setStage(prev);
    } else if (showPrivacy) {
      onGoHome();
    } else {
      setShowPrivacy(true);
    }
  }, [stageHistory, showPrivacy, onGoHome]);

  const handleDownloadSummary = useCallback(() => {
    let summary = `neevv Career Lifecycle Summary\n${'═'.repeat(40)}\n\n`;
    summary += `Name: ${profileData.name}\n`;
    summary += `Email: ${profileData.email}\n`;
    if (profileData.college) summary += `College: ${profileData.college}\n`;
    if (profileData.targetJob) summary += `Target: ${profileData.targetJob}\n\n`;

    if (neevScore) {
      summary += `📄 Neev Score: ${neevScore.total}/100\n`;
      summary += `  Metrics: ${neevScore.metrics}/40\n`;
      summary += `  Structure: ${neevScore.structure}/30\n`;
      summary += `  Keywords: ${neevScore.keywords}/30\n\n`;
      if (neevScore.criticalGaps.length > 0) {
        summary += `Critical Gaps:\n`;
        neevScore.criticalGaps.forEach((g, i) => { summary += `  ${i + 1}. ${g}\n`; });
        summary += '\n';
      }
    }

    if (skills.length > 0) {
      summary += `Top Skills: ${skills.join(', ')}\n\n`;
    }

    if (selectedJob) {
      summary += `Selected Job: ${selectedJob.title} at ${selectedJob.company}\n`;
      summary += `Match Score: ${selectedJob.matchScore}%\n\n`;
    }

    summary += `\n${'═'.repeat(40)}\nPowered by neevv Prep`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neevv-lifecycle-${profileData.name.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [profileData, neevScore, skills, selectedJob]);

  const handleResumeComplete = useCallback((score: NeevScore, resume: string, extractedSkills: string[], profile: typeof profileData) => {
    setNeevScore(score);
    setResumeText(resume);
    setSkills(extractedSkills);
    setProfileData(profile);

    if (score.total >= 80) {
      navigateToStage('matching');
    }
    // If score < 80, stays on foundation — user must fix resume
  }, [navigateToStage]);

  const handleJobSelect = useCallback((job: JobMatch) => {
    setSelectedJob(job);
    navigateToStage('application');
  }, [navigateToStage]);

  const handleApplicationComplete = useCallback(() => {
    navigateToStage('interview');
    // After a short delay, redirect to the actual interview
    setTimeout(() => onGoToInterview(), 500);
  }, [navigateToStage, onGoToInterview]);

  // Privacy Shield
  if (showPrivacy) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <PrivacyShield
          onAccept={() => { setShowPrivacy(false); setManualMode(false); }}
          onBuildManually={() => { setShowPrivacy(false); setManualMode(true); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <StickyNav
        currentStage={stage}
        onBack={handleBack}
        onHome={onGoHome}
        onDownloadSummary={handleDownloadSummary}
        studentName={profileData.name}
      />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {stage === 'foundation' && (
          <ResumeAudit
            onComplete={handleResumeComplete}
            initialName={userName}
            initialEmail={userEmail}
          />
        )}

        {stage === 'matching' && neevScore && neevScore.total >= 80 && (
          <JobMatchComponent
            skills={skills}
            resumeText={resumeText}
            profileData={profileData}
            onSelectJob={handleJobSelect}
            onBackToFoundation={() => {
              setStageHistory(prev => [...prev, stage]);
              setStage('foundation');
            }}
          />
        )}

        {stage === 'application' && selectedJob && (
          <ApplicationKitComponent
            job={selectedJob}
            resumeText={resumeText}
            onComplete={handleApplicationComplete}
            onBack={() => {
              setStageHistory(prev => [...prev, stage]);
              setStage('matching');
            }}
          />
        )}

        {stage === 'interview' && (
          <div className="text-center py-16 animate-fadeIn">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Ready for Your Mock Interview!</h2>
            <p className="text-base-content/60 mb-6">
              Your foundation is solid. Let's put it to the test.
            </p>
            <button
              className="btn btn-primary btn-lg gap-2 pulse-glow"
              onClick={onGoToInterview}
            >
              Start Mock Interview →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
