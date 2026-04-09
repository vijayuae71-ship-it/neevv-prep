import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';

interface PrivacyShieldProps {
  onAccept: () => void;
  onBuildManually: () => void;
}

export const PrivacyShield: React.FC<PrivacyShieldProps> = ({ onAccept, onBuildManually }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="animate-fadeIn">
      <div className="glass-card p-6 max-w-lg mx-auto">
        {/* Shield icon with glow */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
            <Shield size={32} className="text-primary" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-center text-base-content mb-2">
          🛡️ neevv Privacy Shield
        </h3>

        <p className="text-sm text-center text-base-content/70 mb-4 leading-relaxed">
          Your data is <span className="text-primary font-semibold">encrypted</span> and used{' '}
          <span className="text-primary font-semibold">solely for this session's analysis</span>.
          We do not store resumes.
        </p>

        {/* Trust indicators */}
        <div className="space-y-2 mb-4">
          {[
            { icon: <Lock size={14} />, text: 'End-to-end HTTPS encryption' },
            { icon: <EyeOff size={14} />, text: 'Resume processed in-session only — never stored' },
            { icon: <CheckCircle size={14} />, text: 'No third-party data sharing' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-base-content/60">
              <span className="text-success">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {expanded && (
          <div className="bg-base-300/30 rounded-lg p-3 mb-4 text-xs text-base-content/50 leading-relaxed animate-fadeIn">
            <p className="font-semibold text-base-content/70 mb-1">How we handle your data:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Resume text is sent to our AI coach via encrypted API calls</li>
              <li>No data is saved to any database after your session ends</li>
              <li>API keys are stored server-side — never exposed in your browser</li>
              <li>You can use "Build Profile Manually" to avoid uploading any document</li>
            </ul>
          </div>
        )}

        <button
          className="btn btn-ghost btn-xs mb-4 w-full"
          onClick={() => setExpanded(!expanded)}
        >
          <Eye size={12} />
          {expanded ? 'Hide details' : 'How do we handle your data?'}
        </button>

        <div className="flex flex-col gap-2">
          <button
            className="btn btn-primary w-full gap-2 pulse-glow"
            onClick={onAccept}
          >
            Continue with Resume Upload <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-outline btn-sm w-full gap-2"
            onClick={onBuildManually}
          >
            Build Profile Manually (No Upload)
          </button>
        </div>
      </div>
    </div>
  );
};
