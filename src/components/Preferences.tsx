import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Volume2, Mic, Clock, User, GraduationCap, Save, Check } from 'lucide-react';
import { getJSON, setJSON } from '../utils/localStorage';

interface UserPrefs {
  name: string;
  email: string;
  targetSchool: string;
  background: string;
  voiceEnabled: boolean;
  ttsEnabled: boolean;
  interviewDuration: string;
  coachStyle: string;
  autoHints: boolean;
  mathValidation: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  name: '', email: '', targetSchool: '', background: '',
  voiceEnabled: true, ttsEnabled: false,
  interviewDuration: 'standard', coachStyle: 'balanced',
  autoHints: false, mathValidation: true,
};

const STORAGE_KEY = 'neevv_preferences';

export const Preferences: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getJSON<UserPrefs | null>(STORAGE_KEY, null);
    if (stored) {
      setPrefs({ ...DEFAULT_PREFS, ...stored });
    }
  }, []);

  const savePrefs = useCallback(() => {
    setJSON(STORAGE_KEY, prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [prefs]);

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <Settings size={28} className="text-primary" /> Preferences
          </h1>
          <p className="text-base-content/60 mt-1">Customize your neevv Prep experience.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="card bg-base-200">
            <div className="card-body p-5">
              <h3 className="font-semibold text-base-content flex items-center gap-2 mb-4">
                <User size={18} className="text-primary" /> Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-base-content/60 mb-1 block">Full Name</label>
                  <input className="input input-bordered input-sm w-full" value={prefs.name} onChange={e => setPrefs({ ...prefs, name: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs text-base-content/60 mb-1 block">Email</label>
                  <input className="input input-bordered input-sm w-full" type="email" value={prefs.email} onChange={e => setPrefs({ ...prefs, email: e.target.value })} placeholder="For scorecard delivery" />
                </div>
                <div>
                  <label className="text-xs text-base-content/60 mb-1 block">Target B-School</label>
                  <input className="input input-bordered input-sm w-full" value={prefs.targetSchool} onChange={e => setPrefs({ ...prefs, targetSchool: e.target.value })} placeholder="e.g., ISB, IIM-A" />
                </div>
                <div>
                  <label className="text-xs text-base-content/60 mb-1 block">Professional Background</label>
                  <input className="input input-bordered input-sm w-full" value={prefs.background} onChange={e => setPrefs({ ...prefs, background: e.target.value })} placeholder="e.g., 4 yrs in consulting" />
                </div>
              </div>
            </div>
          </div>

          {/* Voice & Audio */}
          <div className="card bg-base-200">
            <div className="card-body p-5">
              <h3 className="font-semibold text-base-content flex items-center gap-2 mb-4">
                <Volume2 size={18} className="text-primary" /> Voice & Audio
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic size={16} className="opacity-60" />
                    <div>
                      <p className="text-sm text-base-content">Voice Input (Speech-to-Text)</p>
                      <p className="text-xs text-base-content/50">Use your microphone to answer questions</p>
                    </div>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={prefs.voiceEnabled} onChange={e => setPrefs({ ...prefs, voiceEnabled: e.target.checked })} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 size={16} className="opacity-60" />
                    <div>
                      <p className="text-sm text-base-content">Coach Voice (Text-to-Speech)</p>
                      <p className="text-xs text-base-content/50">Hear the coach's responses read aloud</p>
                    </div>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={prefs.ttsEnabled} onChange={e => setPrefs({ ...prefs, ttsEnabled: e.target.checked })} />
                </div>
              </div>
            </div>
          </div>

          {/* Interview Settings */}
          <div className="card bg-base-200">
            <div className="card-body p-5">
              <h3 className="font-semibold text-base-content flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-primary" /> Interview Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-base-content/60 mb-1 block">Interview Duration</label>
                  <select className="select select-bordered select-sm w-full" value={prefs.interviewDuration} onChange={e => setPrefs({ ...prefs, interviewDuration: e.target.value })}>
                    <option value="quick">Quick (3 questions)</option>
                    <option value="standard">Standard (5 questions)</option>
                    <option value="extended">Extended (8 questions)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-base-content/60 mb-1 block">Coaching Style</label>
                  <select className="select select-bordered select-sm w-full" value={prefs.coachStyle} onChange={e => setPrefs({ ...prefs, coachStyle: e.target.value })}>
                    <option value="supportive">Supportive — Encouraging, more hints</option>
                    <option value="balanced">Balanced — Mix of support and challenge</option>
                    <option value="tough">Tough — ISB-panel style, probing follow-ups</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content">Auto-show Hints</p>
                    <p className="text-xs text-base-content/50">Automatically show framework hints after 30 seconds</p>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={prefs.autoHints} onChange={e => setPrefs({ ...prefs, autoHints: e.target.checked })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content">Math Validation</p>
                    <p className="text-xs text-base-content/50">Block guesstimate answers with arithmetic errors</p>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={prefs.mathValidation} onChange={e => setPrefs({ ...prefs, mathValidation: e.target.checked })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button className={`btn ${saved ? 'btn-success' : 'btn-primary'} btn-sm gap-1`} onClick={savePrefs}>
            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Preferences</>}
          </button>
        </div>
      </div>
    </div>
  );
};
