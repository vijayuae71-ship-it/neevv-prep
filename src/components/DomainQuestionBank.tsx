import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Play, BookOpen, Filter } from 'lucide-react';
import { DOMAIN_QUESTIONS, DOMAIN_CONFIGS, getDomainQuestionCount } from '../data/domainQuestions';

interface DomainQuestionBankProps {
  onBack?: () => void;
  onStartDomainInterview?: (domain: string) => void;
}

const difficultyColors: Record<string, string> = {
  Easy: 'badge-success',
  Medium: 'badge-warning',
  Hard: 'badge-error',
};

export const DomainQuestionBank: React.FC<DomainQuestionBankProps> = ({ onBack, onStartDomainInterview }) => {
  const [activeDomain, setActiveDomain] = useState('finance');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const domainQuestions = useMemo(() => {
    return DOMAIN_QUESTIONS.filter(q => {
      const matchesDomain = q.domain === activeDomain;
      const matchesSearch = !search ||
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.subcategory.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      return matchesDomain && matchesSearch && matchesDifficulty;
    });
  }, [activeDomain, search, difficultyFilter]);

  const subcategories = useMemo(() => {
    const subs: string[] = [];
    domainQuestions.forEach(q => {
      if (!subs.includes(q.subcategory)) subs.push(q.subcategory);
    });
    return subs;
  }, [domainQuestions]);

  const activeConfig = DOMAIN_CONFIGS.find(d => d.key === activeDomain);

  return (
    <div className="min-h-screen bg-base-100 pb-16 sm:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {onBack && (
              <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
            )}
            <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
              <BookOpen size={28} className="text-primary" /> Domain Question Bank
            </h1>
          </div>
          <p className="text-base-content/60">
            {DOMAIN_QUESTIONS.length} real recruiter questions across 6 placement domains. Expand any question to see key points.
          </p>
        </div>

        {/* Domain Tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {DOMAIN_CONFIGS.map((cfg) => {
            const count = getDomainQuestionCount(cfg.key);
            return (
              <button
                key={cfg.key}
                className={`btn btn-sm gap-1 ${activeDomain === cfg.key ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                onClick={() => { setActiveDomain(cfg.key); setSearch(''); setDifficultyFilter('all'); setExpandedId(null); }}
              >
                <span>{cfg.icon}</span>
                <span className="hidden sm:inline">{cfg.label}</span>
                <span className="badge badge-sm badge-ghost">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Active Domain Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-base-content">
              {activeConfig?.icon} {activeConfig?.label}
            </h2>
            <p className="text-xs text-base-content/50">
              {domainQuestions.length} question{domainQuestions.length !== 1 ? 's' : ''} showing
            </p>
          </div>
          {onStartDomainInterview && (
            <button
              className="btn btn-primary btn-sm gap-1"
              onClick={() => onStartDomainInterview(activeDomain)}
            >
              <Play size={14} /> Mock Interview
            </button>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <label className="input input-bordered flex items-center gap-2 flex-1">
            <Search className="h-[1em] opacity-50" />
            <input
              type="search"
              className="grow"
              placeholder="Search questions or subcategories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            className="select select-bordered"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Questions by Subcategory */}
        <div className="space-y-6">
          {subcategories.map((sub) => {
            const subQuestions = domainQuestions.filter(q => q.subcategory === sub);
            return (
              <div key={sub}>
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {sub}
                  <span className="badge badge-ghost badge-xs">{subQuestions.length}</span>
                </h3>
                <div className="space-y-2">
                  {subQuestions.map((q) => {
                    const isExpanded = expandedId === q.id;
                    return (
                      <div key={q.id} className="card bg-base-200 hover:shadow-sm transition-shadow">
                        <div className="card-body p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex gap-2 flex-wrap mb-1.5">
                                <span className={`badge ${difficultyColors[q.difficulty]} badge-sm badge-outline`}>
                                  {q.difficulty}
                                </span>
                              </div>
                              <p className="text-base-content font-medium text-sm">{q.question}</p>
                            </div>
                            <button
                              className="btn btn-ghost btn-sm btn-square shrink-0"
                              onClick={() => setExpandedId(isExpanded ? null : q.id)}
                              aria-label="Toggle hints"
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="mt-3 p-3 bg-base-300 rounded-lg animate-fadeIn">
                              <p className="text-xs font-semibold text-base-content/70 mb-2">💡 Key Points to Cover:</p>
                              <ul className="space-y-1">
                                {q.keyPoints.map((point, i) => (
                                  <li key={i} className="text-xs text-base-content/60 flex items-start gap-1.5">
                                    <span className="text-primary mt-0.5">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {domainQuestions.length === 0 && (
            <div className="text-center py-12 text-base-content/50">
              <Filter size={40} className="mx-auto mb-3 opacity-40" />
              <p>No questions match your filters. Try adjusting your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
