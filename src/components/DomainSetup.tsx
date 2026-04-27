import React, { useState, useMemo } from 'react';
import { Briefcase, ChevronRight, Mail, User } from 'lucide-react';
import { DOMAIN_CONFIGS, getDomainQuestionCount } from '../data/domainQuestions';

export interface DomainInterviewConfig {
  name: string;
  email: string;
  domain: string;
  subSpecialization: string;
  experience: string;
  targetRole: string;
}

interface DomainSetupProps {
  onStart: (config: DomainInterviewConfig) => void;
  onBack?: () => void;
}

const experienceLevels = ['Fresher (0-1 years)', '1-3 years', '3-5 years', '5-8 years', '8+ years'];

const targetRoles: Record<string, string[]> = {
  finance: ['Investment Banking Analyst', 'Equity Research Associate', 'Corporate Finance Manager', 'Financial Controller', 'Risk Analyst', 'Treasury Manager'],
  analytics: ['Data Analyst', 'Business Analyst', 'Data Scientist', 'Analytics Manager', 'BI Developer', 'Product Analyst'],
  marketing: ['Brand Manager', 'Digital Marketing Manager', 'Product Manager', 'Sales Manager', 'Growth Manager', 'Category Manager'],
  consulting: ['Management Consultant', 'Strategy Consultant', 'Operations Consultant', 'IT Consultant', 'Associate Partner', 'Engagement Manager'],
  operations: ['Supply Chain Manager', 'Operations Manager', 'Procurement Manager', 'Logistics Head', 'Plant Manager', 'Quality Manager'],
  erp: ['ERP Consultant', 'Business Analyst', 'Project Manager', 'Solution Architect', 'Change Management Lead', 'Process Excellence Lead'],
};

export const DomainSetup: React.FC<DomainSetupProps> = ({ onStart, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [subSpecialization, setSubSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const selectedConfig = useMemo(() => DOMAIN_CONFIGS.find(d => d.key === domain), [domain]);

  const isValid = name.trim() && domain && subSpecialization && experience && targetRole;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onStart({
        name: name.trim(),
        email: email.trim(),
        domain,
        subSpecialization,
        experience,
        targetRole,
      });
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
              <Briefcase className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                neevv Domain
              </h1>
            </div>
            <p className="text-base-content/70 text-sm">
              Practice domain-specific placement interview questions with your neev Coach
            </p>
          </div>

          <div className="divider my-1"></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Your Name *</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <User className="h-[1em] opacity-50" />
                <input
                  type="text"
                  className="grow"
                  placeholder="e.g., Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            </div>

            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Email (optional — for scorecard)</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail className="h-[1em] opacity-50" />
                <input
                  type="email"
                  className="grow"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            {/* Domain Selection */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Domain *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setSubSpecialization('');
                  setTargetRole('');
                }}
              >
                <option value="" disabled>Select your domain</option>
                {DOMAIN_CONFIGS.map((cfg) => (
                  <option key={cfg.key} value={cfg.key}>
                    {cfg.icon} {cfg.label} ({getDomainQuestionCount(cfg.key)} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-specialization */}
            {domain && selectedConfig && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Sub-specialization *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={subSpecialization}
                  onChange={(e) => setSubSpecialization(e.target.value)}
                >
                  <option value="" disabled>Select your focus area</option>
                  {selectedConfig.subcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Experience */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Experience Level *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="" disabled>Select your experience level</option>
                {experienceLevels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Target Role */}
            {domain && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Target Role *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="" disabled>Select target role</option>
                  {(targetRoles[domain] || []).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Start Button */}
            <button
              type="submit"
              className={`btn btn-primary w-full text-lg gap-2 ${!isValid ? 'btn-disabled' : ''}`}
              disabled={!isValid}
            >
              <Briefcase className="w-5 h-5" />
              Start Domain Interview
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-base-content/50">
              🔒 5 domain-specific questions · ~15 min · Scored on Domain Knowledge, Problem Solving, Communication & Application
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
