import React, { useState } from 'react';
import { GraduationCap, Target, ArrowRight, Sparkles, BookOpen, Brain } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (targetSchool: string) => void;
  onSkip: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const [targetSchool, setTargetSchool] = useState('');

  const steps = [
    {
      icon: <GraduationCap size={48} className="text-primary" />,
      title: 'Welcome to neevv Prep',
      desc: 'Your AI-powered interview coach for MBA admissions, tech placements, and career growth. Practice with personalized questions and get instant feedback.',
      content: null,
    },
    {
      icon: <Target size={48} className="text-primary" />,
      title: 'What\'s your target?',
      desc: 'Tell us your dream B-school so we can personalize your experience.',
      content: (
        <div className="w-full max-w-xs mx-auto mt-4">
          <input
            className="input input-bordered w-full"
            placeholder="e.g., ISB, IIM Ahmedabad, IIM Bangalore"
            value={targetSchool}
            onChange={e => setTargetSchool(e.target.value)}
          />
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {['ISB', 'IIM-A', 'IIM-B', 'IIM-C', 'XLRI', 'SP Jain'].map(s => (
              <button key={s} className="badge badge-outline badge-sm cursor-pointer hover:badge-primary" onClick={() => setTargetSchool(s)}>{s}</button>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: <Sparkles size={48} className="text-primary" />,
      title: 'You\'re all set!',
      desc: 'Start with a 15-minute mock interview — 5 questions, instant scorecard. Or explore our free tools.',
      content: (
        <div className="flex flex-col gap-2 mt-4 w-full max-w-xs mx-auto">
          <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
            <Brain size={20} className="text-primary flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-base-content">MBA Mock Interview</p>
              <p className="text-xs text-base-content/50">2 behavioral + 1 guesstimate + 2 "Why" questions</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
            <BookOpen size={20} className="text-secondary flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-base-content">Free Tools</p>
              <p className="text-xs text-base-content/50">Why MBA Builder, STAR Story Builder, and more</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : i < step ? 'bg-primary/50' : 'bg-base-300'}`} />
          ))}
        </div>

        {/* Step content */}
        <div className="mb-8">
          <div className="mb-4">{current.icon}</div>
          <h2 className="text-2xl font-bold text-base-content mb-2">{current.title}</h2>
          <p className="text-base-content/60 text-sm">{current.desc}</p>
          {current.content}
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2">
          {step < steps.length - 1 ? (
            <>
              <button className="btn btn-primary w-full gap-2" onClick={() => setStep(step + 1)}>
                Continue <ArrowRight size={16} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={onSkip}>
                Skip for now
              </button>
            </>
          ) : (
            <button className="btn btn-primary w-full gap-2" onClick={() => onComplete(targetSchool)}>
              Let's Go! <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
