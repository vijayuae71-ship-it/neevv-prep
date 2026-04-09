import React, { useState, useRef } from 'react';
import { GraduationCap, Briefcase, User, ArrowRight, Mail, FileText, Upload, X, CheckCircle, Linkedin, Loader2 } from 'lucide-react';
import { parseLinkedInPDF } from '../utils/linkedinParser';

interface SetupScreenProps {
  onStart: (name: string, targetSchool: string, background: string, email: string, resumeText: string) => void;
  onBack?: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onBack }) => {
  const [name, setName] = useState('');
  const [targetSchool, setTargetSchool] = useState('');
  const [background, setBackground] = useState('');
  const [email, setEmail] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeMode, setResumeMode] = useState<'none' | 'upload' | 'paste'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkedinInputRef = useRef<HTMLInputElement>(null);
  const [linkedinLoading, setLinkedinLoading] = useState(false);

  const canStart = name.trim() && targetSchool.trim() && background.trim();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);

    try {
      const text = await file.text();
      if (text.trim().length > 0) {
        setResumeText(text.trim());
        setResumeMode('upload');
      } else {
        setResumeText('');
        setResumeFileName('');
        alert('Could not extract text from this file. Please try a .txt file or paste your resume instead.');
      }
    } catch {
      setResumeText('');
      setResumeFileName('');
      alert('Could not read file. Please paste your resume instead.');
    }
  };

  const handleLinkedInImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLinkedinLoading(true);
    try {
      const profile = await parseLinkedInPDF(file);
      if (profile.name) setName(profile.name);
      if (profile.headline || profile.experience) {
        setBackground(profile.headline + (profile.experience ? '\n\n' + profile.experience.substring(0, 500) : ''));
      }
      if (profile.fullText) {
        setResumeText(profile.fullText);
        setResumeMode('upload');
        setResumeFileName('LinkedIn Profile.pdf');
      }
    } catch {
      alert('Could not parse LinkedIn PDF. Please try uploading manually.');
    } finally {
      setLinkedinLoading(false);
    }
  };

  const clearResume = () => {
    setResumeText('');
    setResumeFileName('');
    setResumeMode('none');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-base-100 flex items-center justify-center p-4 py-10">
      <div className="card bg-base-200 shadow-xl w-full max-w-lg">
        <div className="card-body gap-6">
          {onBack && (
            <button className="btn btn-ghost btn-sm self-start" onClick={onBack}>
              ← Back
            </button>
          )}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <GraduationCap size={32} className="text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-base-content">neevv Prep</h2>
            <p className="text-base-content/60 text-sm">
              Build your <span className="text-primary font-semibold">Neev</span> — your foundation for B-school interviews.
            </p>
          </div>

          <div className="divider my-0"></div>

          <div className="space-y-4">
            {/* LinkedIn Import */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Linkedin size={16} />
                <span>Quick Import from LinkedIn</span>
                <span className="badge badge-xs badge-primary">NEW</span>
              </div>
              <p className="text-xs text-base-content/50">
                Download your LinkedIn profile as PDF (Profile → More → Save to PDF), then upload it here.
              </p>
              <button
                className={`btn btn-sm btn-outline btn-primary gap-2 ${linkedinLoading ? 'loading' : ''}`}
                onClick={() => linkedinInputRef.current?.click()}
                disabled={linkedinLoading}
              >
                {linkedinLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {linkedinLoading ? 'Parsing...' : 'Upload LinkedIn PDF'}
              </button>
              <input
                ref={linkedinInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleLinkedInImport}
              />
            </div>

            <label className="input input-bordered flex items-center gap-2">
              <User className="h-[1em] opacity-50" />
              <input
                type="text"
                className="grow"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <Mail className="h-[1em] opacity-50" />
              <input
                type="email"
                className="grow"
                placeholder="Email (optional — to receive your scorecard)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <p className="text-xs text-base-content/40 -mt-2 ml-1">Scorecard will be sent to your account owner's email.</p>

            <label className="input input-bordered flex items-center gap-2">
              <GraduationCap className="h-[1em] opacity-50" />
              <input
                type="text"
                className="grow"
                placeholder="Target B-school (e.g., ISB, IIM-A/B/C/L/I/K, XLRI, FMS, SIBM, IMT, TAPMI, Wharton)"
                value={targetSchool}
                onChange={(e) => setTargetSchool(e.target.value)}
              />
            </label>

            <div>
              <textarea
                className="textarea textarea-bordered w-full h-28"
                placeholder="Brief professional background (e.g., 3 years in consulting at Deloitte, led a team of 5...)"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              />
            </div>

            {/* Resume Upload Section */}
            <div className="bg-base-300/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-base-content/80">
                <FileText size={16} className="text-secondary" />
                <span>Resume / CV</span>
                <span className="badge badge-sm badge-ghost">Optional</span>
              </div>
              <p className="text-xs text-base-content/50">
                Upload your resume so your neev Coach can personalize questions to your specific experience.
              </p>

              {resumeMode === 'none' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    className="btn btn-sm btn-outline btn-secondary flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} /> Upload .txt
                  </button>
                  <button
                    className="btn btn-sm btn-outline btn-secondary flex-1"
                    onClick={() => setResumeMode('paste')}
                  >
                    <FileText size={14} /> Paste Resume
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.text,.md,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}

              {resumeMode === 'upload' && resumeFileName && (
                <div className="flex items-center gap-2 bg-success/10 rounded-lg px-3 py-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm text-success flex-1 truncate">{resumeFileName}</span>
                  <span className="text-xs text-base-content/50">{resumeText.length} chars</span>
                  <button className="btn btn-ghost btn-xs" onClick={clearResume}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {resumeMode === 'paste' && (
                <div className="space-y-2">
                  <textarea
                    className="textarea textarea-bordered textarea-secondary w-full h-32 text-xs"
                    placeholder="Paste your resume content here... (work experience, education, achievements, skills)"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-base-content/40">
                      {resumeText.length > 0 ? `${resumeText.split(/\s+/).filter(Boolean).length} words` : 'No content yet'}
                    </span>
                    <button className="btn btn-ghost btn-xs text-error" onClick={clearResume}>
                      <X size={12} /> Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className={`btn btn-primary w-full ${!canStart ? 'btn-disabled' : ''}`}
            onClick={() => canStart && onStart(name.trim(), targetSchool.trim(), background.trim(), email.trim(), resumeText.trim())}
          >
            Start Mock Interview <ArrowRight size={18} />
          </button>

          <p className="text-xs text-base-content/40 text-center">
            5 questions · ~15 min · Scored on Foundation, Logic & Communication
          </p>

          <div className="bg-base-300/30 rounded-lg px-3 py-2 mt-1">
            <p className="text-xs text-base-content/40 text-center leading-relaxed">
              🔒 <span className="font-semibold text-base-content/50">Your data is safe.</span> Resume & responses are processed in-session only — never stored on our servers. All API calls are encrypted via HTTPS. We don't share your data with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
