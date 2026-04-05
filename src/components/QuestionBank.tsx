import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Play, BookOpen, Brain, Target, MessageCircle } from 'lucide-react';

interface Question {
  id: string;
  category: 'behavioral' | 'guesstimate' | 'why' | 'caselet';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  hint: string;
  tags: string[];
}

const QUESTIONS: Question[] = [
  // Behavioral - Leadership
  { id: 'b1', category: 'behavioral', difficulty: 'Medium', title: 'Tell me about a time you led a team through a challenging project.', hint: 'Use STAR: focus on YOUR specific actions as leader, not the team\'s.', tags: ['leadership', 'teamwork'] },
  { id: 'b2', category: 'behavioral', difficulty: 'Hard', title: 'Describe a situation where you had to influence stakeholders without formal authority.', hint: 'Highlight persuasion tactics and cross-functional collaboration.', tags: ['influence', 'stakeholder'] },
  { id: 'b3', category: 'behavioral', difficulty: 'Easy', title: 'Give an example of when you took initiative beyond your role.', hint: 'Show self-starter mentality. Quantify the impact.', tags: ['initiative', 'ownership'] },
  { id: 'b4', category: 'behavioral', difficulty: 'Medium', title: 'Tell me about a time you managed conflicting priorities.', hint: 'Show prioritization framework and decision-making process.', tags: ['prioritization', 'decision-making'] },
  { id: 'b5', category: 'behavioral', difficulty: 'Hard', title: 'Describe your most significant professional failure and what you learned.', hint: 'Be genuine. Focus 70% on the learning and how you applied it later.', tags: ['failure', 'resilience', 'growth'] },
  { id: 'b6', category: 'behavioral', difficulty: 'Medium', title: 'Tell me about a time you had to deliver difficult feedback to a colleague.', hint: 'Show empathy + directness. What was the outcome?', tags: ['communication', 'feedback'] },
  { id: 'b7', category: 'behavioral', difficulty: 'Easy', title: 'Describe a time you worked with a diverse team.', hint: 'Highlight cultural awareness and how diversity improved outcomes.', tags: ['diversity', 'teamwork'] },
  { id: 'b8', category: 'behavioral', difficulty: 'Hard', title: 'Give an example of a data-driven decision you made that was unpopular.', hint: 'Show conviction backed by evidence. How did you bring others along?', tags: ['data-driven', 'conviction'] },
  { id: 'b9', category: 'behavioral', difficulty: 'Hard', title: 'Describe a time you had to influence someone without authority.', hint: 'Focus on relationship-building, logic, and emotional intelligence used.', tags: ['influence', 'persuasion'] },
  { id: 'b10', category: 'behavioral', difficulty: 'Medium', title: 'Tell me about a project where you had to manage ambiguity.', hint: 'Show comfort with uncertainty. What frameworks did you create to navigate it?', tags: ['ambiguity', 'adaptability'] },
  { id: 'b11', category: 'behavioral', difficulty: 'Medium', title: 'Give an example of when you received critical feedback. How did you respond?', hint: 'Show self-awareness and growth mindset. What changed after?', tags: ['feedback', 'growth'] },
  { id: 'b12', category: 'behavioral', difficulty: 'Hard', title: 'Describe a time you had to make a decision with incomplete information.', hint: 'Explain your reasoning process, risk assessment, and outcome.', tags: ['decision-making', 'risk'] },
  { id: 'b13', category: 'behavioral', difficulty: 'Medium', title: 'Tell me about your most innovative contribution at work.', hint: 'Highlight creative thinking and measurable impact. What was novel about your approach?', tags: ['innovation', 'impact'] },
  // Guesstimate
  { id: 'g1', category: 'guesstimate', difficulty: 'Medium', title: 'Estimate the number of coffee cups sold daily in Mumbai.', hint: 'Segment by population, coffee drinkers %, occasions per day, channels.', tags: ['market-sizing', 'bottom-up'] },
  { id: 'g2', category: 'guesstimate', difficulty: 'Hard', title: 'How many electric vehicle charging stations will India need by 2030?', hint: 'Start with projected EV count, usage patterns, charging time, station capacity.', tags: ['market-sizing', 'top-down'] },
  { id: 'g3', category: 'guesstimate', difficulty: 'Easy', title: 'Estimate the revenue of a single Starbucks outlet in a metro city.', hint: 'Think: footfall × avg ticket size × operating hours × seat turnover.', tags: ['revenue', 'unit-economics'] },
  { id: 'g4', category: 'guesstimate', difficulty: 'Medium', title: 'How many smartphones are sold in India each year?', hint: 'Segment by urban/rural, replacement cycles, first-time buyers.', tags: ['market-sizing', 'segmentation'] },
  { id: 'g5', category: 'guesstimate', difficulty: 'Hard', title: 'Estimate the total addressable market for online MBA prep in India.', hint: 'MBA aspirants × % willing to pay × price range. Consider CAT/GMAT/GRE segments.', tags: ['TAM', 'education'] },
  { id: 'g6', category: 'guesstimate', difficulty: 'Medium', title: 'How many flights take off from Delhi airport in a day?', hint: 'Think: runways, avg turnaround time, operating hours, domestic vs international.', tags: ['capacity', 'operations'] },
  { id: 'g7', category: 'guesstimate', difficulty: 'Hard', title: 'Estimate the annual revenue of a popular food delivery app in Mumbai.', hint: 'Segment by orders/day, avg order value, commission %. Consider Zomato/Swiggy benchmarks.', tags: ['revenue', 'food-tech'] },
  { id: 'g8', category: 'guesstimate', difficulty: 'Medium', title: 'How many electric vehicles will be sold in India in 2026?', hint: 'Consider 2-wheelers vs 4-wheelers, govt subsidies, current penetration rate, growth trajectory.', tags: ['market-sizing', 'EV'] },
  { id: 'g9', category: 'guesstimate', difficulty: 'Easy', title: 'Estimate the number of ATMs in Delhi NCR.', hint: 'Think: population, bank branches per capita, ATMs per branch, standalone ATMs.', tags: ['market-sizing', 'banking'] },
  { id: 'g10', category: 'guesstimate', difficulty: 'Medium', title: 'How much does an average Indian household spend on education annually?', hint: 'Segment by urban/rural, school vs college, tuition vs extras. Use household income brackets.', tags: ['consumer-spend', 'education'] },
  { id: 'g11', category: 'guesstimate', difficulty: 'Hard', title: 'Estimate the daily water consumption of Bangalore city.', hint: 'Population × per capita daily usage. Consider residential, commercial, industrial segments.', tags: ['resource-estimation', 'infrastructure'] },
  // Why questions
  { id: 'w1', category: 'why', difficulty: 'Medium', title: 'Why MBA? Why now?', hint: 'Connect past experience → skill gap → MBA bridge → future goal. Be specific.', tags: ['why-mba', 'career-goals'] },
  { id: 'w2', category: 'why', difficulty: 'Hard', title: 'Why this specific B-school over competitors?', hint: 'Name specific programs, professors, clubs, culture. Avoid generic praise.', tags: ['school-fit', 'research'] },
  { id: 'w3', category: 'why', difficulty: 'Easy', title: 'Where do you see yourself 5 years after your MBA?', hint: 'Be realistic and specific. Show how the MBA enables this path.', tags: ['career-goals', 'vision'] },
  { id: 'w4', category: 'why', difficulty: 'Medium', title: 'What will you contribute to the MBA cohort?', hint: 'Unique experiences, perspectives, skills. Be concrete with examples.', tags: ['contribution', 'diversity'] },
  { id: 'w5', category: 'why', difficulty: 'Medium', title: 'What will you contribute to the classroom discussion?', hint: 'Go beyond "diverse background." Give a specific example of a debate or insight you\'d bring.', tags: ['contribution', 'classroom'] },
  { id: 'w6', category: 'why', difficulty: 'Hard', title: 'How does an MBA fit into your 10-year career plan?', hint: 'Show long-term vision. Connect MBA as a bridge, not a destination.', tags: ['career-goals', 'long-term'] },
  { id: 'w7', category: 'why', difficulty: 'Medium', title: 'What would you do if you don\'t get into your target school?', hint: 'Show maturity and a Plan B. Avoid desperation — show growth mindset.', tags: ['resilience', 'plan-b'] },
  // Ethics
  { id: 'e1', category: 'behavioral', difficulty: 'Hard', title: 'Your team\'s top performer is consistently rude to juniors. How do you handle it?', hint: 'Balance performance with team culture. Show leadership and empathy.', tags: ['ethics', 'leadership', 'conflict'] },
  { id: 'e2', category: 'behavioral', difficulty: 'Hard', title: 'You discover your company\'s product has a minor safety issue. What do you do?', hint: 'Show ethical reasoning. Consider stakeholders, escalation path, and transparency.', tags: ['ethics', 'integrity'] },
  { id: 'e3', category: 'behavioral', difficulty: 'Medium', title: 'A client offers you insider information that could help win a deal. How do you respond?', hint: 'Clear ethical boundary. Show awareness of legal/compliance implications.', tags: ['ethics', 'compliance'] },
  // Hot Topics
  { id: 'h1', category: 'caselet', difficulty: 'Medium', title: 'How will AI transform management consulting in the next 5 years?', hint: 'Think: automation of analysis, new service models, talent implications, client expectations.', tags: ['AI', 'consulting', 'hot-topic'] },
  { id: 'h2', category: 'caselet', difficulty: 'Medium', title: 'Should Indian startups focus on profitability or growth?', hint: 'Context matters — consider funding winter, unit economics, sector, and stage.', tags: ['startups', 'strategy', 'hot-topic'] },
  { id: 'h3', category: 'caselet', difficulty: 'Easy', title: 'What is your view on the gig economy and worker rights?', hint: 'Balance innovation with social responsibility. Consider both sides with examples.', tags: ['gig-economy', 'policy', 'hot-topic'] },
  { id: 'h4', category: 'caselet', difficulty: 'Hard', title: 'How should traditional businesses respond to digital disruption?', hint: 'Framework: assess threat level, identify digital opportunities, build vs buy vs partner.', tags: ['digital', 'transformation', 'hot-topic'] },
  // Caselets
  { id: 'c1', category: 'caselet', difficulty: 'Medium', title: 'A D2C brand\'s customer acquisition cost doubled in 6 months. Diagnose and recommend.', hint: 'Framework: Channel mix analysis → unit economics → retention vs acquisition spend.', tags: ['profitability', 'marketing'] },
  { id: 'c2', category: 'caselet', difficulty: 'Hard', title: 'Should a mid-size Indian IT company enter the healthcare vertical?', hint: 'Market entry framework: market attractiveness, capabilities, competition, go-to-market.', tags: ['market-entry', 'strategy'] },
  { id: 'c3', category: 'caselet', difficulty: 'Easy', title: 'A restaurant chain is seeing declining footfall. What would you investigate?', hint: 'Issue tree: External (competition, location, economy) vs Internal (menu, service, pricing).', tags: ['diagnosis', 'issue-tree'] },
  { id: 'c4', category: 'caselet', difficulty: 'Hard', title: 'Design a pricing strategy for a new SaaS product targeting Indian SMBs.', hint: 'Consider: value-based pricing, freemium model, competitor benchmarking, willingness to pay.', tags: ['pricing', 'SaaS'] },
];

const CATEGORY_CONFIG = {
  behavioral: { label: 'Behavioral', icon: <MessageCircle size={16} />, color: 'badge-primary' },
  guesstimate: { label: 'Guesstimate', icon: <Brain size={16} />, color: 'badge-secondary' },
  why: { label: 'Why Questions', icon: <Target size={16} />, color: 'badge-accent' },
  caselet: { label: 'Caselet', icon: <BookOpen size={16} />, color: 'badge-info' },
};

interface QuestionBankProps {
  onPractice: (question: string) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ onPractice }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = QUESTIONS.filter((q) => {
    const matchesSearch = search === '' || q.title.toLowerCase().includes(search.toLowerCase()) || q.tags.some(t => t.includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || q.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesCat && matchesDiff;
  });

  const counts = {
    all: QUESTIONS.length,
    behavioral: QUESTIONS.filter(q => q.category === 'behavioral').length,
    guesstimate: QUESTIONS.filter(q => q.category === 'guesstimate').length,
    why: QUESTIONS.filter(q => q.category === 'why').length,
    caselet: QUESTIONS.filter(q => q.category === 'caselet').length,
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <BookOpen size={28} className="text-primary" /> Question Bank
          </h1>
          <p className="text-base-content/60 mt-1">
            {QUESTIONS.length} curated questions across 4 categories. Practice any question with the neev Coach.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <label className="input input-bordered flex items-center gap-2 flex-1">
            <Search className="h-[1em] opacity-50" />
            <input
              type="search"
              className="grow"
              placeholder="Search questions or tags..."
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

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            className={`btn btn-sm ${categoryFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCategoryFilter('all')}
          >
            All ({counts.all})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className={`btn btn-sm gap-1 ${categoryFilter === key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCategoryFilter(key)}
            >
              {cfg.icon} {cfg.label} ({counts[key as keyof typeof counts]})
            </button>
          ))}
        </div>

        {/* Question List */}
        <div className="space-y-3">
          {filtered.map((q) => {
            const cfg = CATEGORY_CONFIG[q.category];
            const isExpanded = expandedId === q.id;
            const diffColor = q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-error';

            return (
              <div key={q.id} className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex gap-2 flex-wrap mb-2">
                        <span className={`badge ${cfg.color} badge-sm gap-1`}>{cfg.icon} {cfg.label}</span>
                        <span className={`badge ${diffColor} badge-sm`}>{q.difficulty}</span>
                      </div>
                      <p className="text-base-content font-medium">{q.title}</p>
                      <div className="flex gap-1 flex-wrap mt-2">
                        {q.tags.map((tag) => (
                          <span key={tag} className="badge badge-ghost badge-xs">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        aria-label="Toggle hint"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <button
                        className="btn btn-primary btn-sm gap-1"
                        onClick={() => onPractice(q.title)}
                      >
                        <Play size={14} /> Practice
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-base-300 rounded-lg">
                      <p className="text-sm text-base-content/70">
                        💡 <strong>Hint:</strong> {q.hint}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
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
