import React from 'react';
import { ArrowLeft, Home, Download, ChevronRight } from 'lucide-react';
import type { LifecycleStage } from '../types';

interface StickyNavProps {
  currentStage: LifecycleStage;
  onBack: () => void;
  onHome: () => void;
  onDownloadSummary: () => void;
  studentName?: string;
}

const stages: { key: LifecycleStage; label: string; icon: string }[] = [
  { key: 'foundation', label: 'Foundation', icon: '📄' },
  { key: 'matching', label: 'Discovery', icon: '🔍' },
  { key: 'application', label: 'Preparation', icon: '✍️' },
  { key: 'interview', label: 'Interview', icon: '🎯' },
];

export const StickyNav: React.FC<StickyNavProps> = ({
  currentStage,
  onBack,
  onHome,
  onDownloadSummary,
  studentName,
}) => {
  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className="sticky-nav px-4 py-3">
      <div className="max-w-5xl mx-auto">
        {/* Top row: actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onBack} title="Back">
              <ArrowLeft size={16} />
            </button>
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onHome} title="Main Menu">
              <Home size={16} />
            </button>
            {studentName && (
              <span className="text-sm text-base-content/60 ml-2">
                {studentName}'s Career Journey
              </span>
            )}
          </div>
          <button className="btn btn-ghost btn-sm gap-1" onClick={onDownloadSummary}>
            <Download size={14} />
            <span className="hidden sm:inline text-xs">Summary</span>
          </button>
        </div>

        {/* Stage breadcrumb */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {stages.map((stage, i) => {
            const isActive = stage.key === currentStage;
            const isPast = i < currentIndex;

            return (
              <React.Fragment key={stage.key}>
                {i > 0 && (
                  <ChevronRight
                    size={12}
                    className={`shrink-0 ${isPast ? 'text-primary' : 'text-base-content/20'}`}
                  />
                )}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-primary-content'
                      : isPast
                      ? 'bg-primary/20 text-primary'
                      : 'bg-base-200 text-base-content/40'
                  }`}
                >
                  <span>{stage.icon}</span>
                  <span>{stage.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-base-200 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
            style={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
