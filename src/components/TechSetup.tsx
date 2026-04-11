import React, { useState } from 'react';
import { Code2, ChevronRight, Terminal, Database, Cpu } from 'lucide-react';

interface TechSetupProps {
  onStart: (name: string, company: string, level: string, techStack: string[], email: string) => void;
  onBack?: () => void;
}

const experienceLevels = ['Fresher', '1-2 years', '3-5 years', '5+ years'];

const techStackOptions = [
  { label: 'Python', icon: '🐍' },
  { label: 'Java', icon: '☕' },
  { label: 'C++', icon: '⚡' },
  { label: 'JavaScript', icon: '🌐' },
  { label: 'SQL', icon: '🗄️' },
  { label: 'DSA', icon: '🧮' },
];

export const TechSetup: React.FC<TechSetupProps> = ({ onStart, onBack }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [level, setLevel] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [email, setEmail] = useState('');

  const toggleTech = (tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const isValid = name.trim() && company.trim() && level && techStack.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onStart(name.trim(), company.trim(), level, techStack, email.trim());
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-2xl w-full max-w-lg">
        <div className="card-body">
          {onBack && (
            <button className="btn btn-ghost btn-sm self-start" onClick={onBack}>
              ← Back
            </button>
          )}
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Terminal className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                neevv Tech
              </h1>
            </div>
            <p className="text-base-content/70 text-sm">
              Your AI-powered technical interview coach for coding, DSA, SQL &amp; more
            </p>
          </div>

          <div className="divider my-1"></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Your Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Rahul Sharma"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Target Company */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Target Company *</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Google, TCS, Infosys"
                className="input input-bordered w-full"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Experience Level */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Experience Level *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="" disabled>
                  Select your experience level
                </option>
                {experienceLevels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Tech Stack Multi-select */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Primary Tech Stack * (select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {techStackOptions.map((tech) => (
                  <label
                    key={tech.label}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      techStack.includes(tech.label)
                        ? 'border-primary bg-primary/10'
                        : 'border-base-300 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={techStack.includes(tech.label)}
                      onChange={() => toggleTech(tech.label)}
                    />
                    <span className="text-sm">
                      {tech.icon} {tech.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Email (optional — for scorecard)</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Start Button */}
            <button
              type="submit"
              className={`btn btn-primary w-full text-lg gap-2 ${!isValid ? 'btn-disabled' : ''}`}
              disabled={!isValid}
            >
              <Code2 className="w-5 h-5" />
              Start Technical Interview
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          {/* Privacy Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-base-content/50">
              🔒 Your data stays private. We don't store personal information.
              <br />
              Sessions are ephemeral and used only for your practice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
