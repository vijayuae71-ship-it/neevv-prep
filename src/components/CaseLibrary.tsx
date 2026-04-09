import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Layers, Target, TrendingUp, Users, DollarSign, Lightbulb } from 'lucide-react';

interface Framework {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'strategy' | 'operations' | 'marketing' | 'finance';
  description: string;
  whenToUse: string;
  steps: string[];
  example: string;
}

const FRAMEWORKS: Framework[] = [
  {
    id: 'porter', name: 'Porter\'s Five Forces', icon: <Layers size={20} />,
    category: 'strategy',
    description: 'Analyze industry competitiveness and profitability potential.',
    whenToUse: 'Market entry, industry analysis, competitive landscape questions.',
    steps: ['Threat of new entrants — barriers to entry', 'Bargaining power of suppliers', 'Bargaining power of buyers', 'Threat of substitutes', 'Competitive rivalry among existing firms'],
    example: 'Should Reliance enter the quick-commerce market? Analyze using Five Forces to assess competitive intensity.',
  },
  {
    id: 'profitability', name: 'Profitability Framework', icon: <DollarSign size={20} />,
    category: 'finance',
    description: 'Diagnose why a company is losing money or profits are declining.',
    whenToUse: 'Profit decline, cost optimization, revenue growth cases.',
    steps: ['Revenue side: Price × Volume breakdown', 'Cost side: Fixed vs Variable costs', 'Benchmark against industry margins', 'Identify root cause (demand? pricing? cost inflation?)', 'Recommend specific levers to pull'],
    example: 'An airline\'s operating profit dropped 30% YoY despite stable passenger numbers. Diagnose the issue.',
  },
  {
    id: 'market-entry', name: 'Market Entry Framework', icon: <Target size={20} />,
    category: 'strategy',
    description: 'Evaluate whether a company should enter a new market or segment.',
    whenToUse: 'New geography, new product line, diversification decisions.',
    steps: ['Market attractiveness — size, growth, profitability', 'Customer analysis — needs, willingness to pay', 'Competition — who\'s there, barriers', 'Company capabilities — do we have the skills?', 'Entry mode — organic, acquisition, JV, partnership'],
    example: 'Should Tata Motors launch an affordable EV for tier-2 cities? Walk through the market entry framework.',
  },
  {
    id: 'growth', name: 'Growth Strategy (Ansoff)', icon: <TrendingUp size={20} />,
    category: 'strategy',
    description: 'Identify growth opportunities across products and markets.',
    whenToUse: 'Revenue growth, expansion strategy, product diversification.',
    steps: ['Market Penetration — sell more of existing to existing customers', 'Market Development — existing product, new market', 'Product Development — new product, existing market', 'Diversification — new product, new market (highest risk)'],
    example: 'A leading EdTech company in India wants to double revenue in 2 years. Which growth quadrant offers the best opportunity?',
  },
  {
    id: '4p', name: 'Marketing Mix (4Ps)', icon: <Users size={20} />,
    category: 'marketing',
    description: 'Analyze or design a go-to-market strategy.',
    whenToUse: 'Product launch, repositioning, pricing strategy, distribution.',
    steps: ['Product — features, quality, branding, differentiation', 'Price — pricing strategy, discounts, perceived value', 'Place — distribution channels, online/offline mix', 'Promotion — advertising, PR, digital marketing, sales force'],
    example: 'Design the go-to-market strategy for a premium Indian skincare brand targeting Gen Z consumers.',
  },
  {
    id: 'operations', name: 'Operations Improvement', icon: <Lightbulb size={20} />,
    category: 'operations',
    description: 'Optimize processes, reduce waste, improve throughput.',
    whenToUse: 'Efficiency cases, supply chain, manufacturing, service delivery.',
    steps: ['Map the current process end-to-end', 'Identify bottlenecks (Theory of Constraints)', 'Measure: cycle time, throughput, utilization', 'Root cause analysis (5 Whys / Fishbone)', 'Recommend: automation, process redesign, capacity planning'],
    example: 'A food delivery company\'s average delivery time increased from 30 to 45 minutes. Identify and fix the bottleneck.',
  },
];

interface CaseStudy {
  title: string;
  category: string;
  difficulty: string;
  summary: string;
  exhibit: string;
  questions: string[];
  keyInsight: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    title: 'Flipkart vs Amazon India: Who Wins Tier-2?',
    category: 'strategy',
    difficulty: 'Hard',
    summary: 'Analyze competitive strategies for capturing semi-urban India. Consider logistics, assortment, and local partnerships.',
    exhibit: 'Flipkart: 60% orders from Tier-2/3 cities, 15K+ kirana delivery partners. Amazon India: ₹35,000 Cr GMV, 28 fulfillment centers. Tier-2 e-commerce growing at 35% CAGR vs 20% in metros.',
    questions: ['What are the key competitive advantages each player has in Tier-2?', 'Should Flipkart invest more in local language UI or logistics speed?', 'Estimate the incremental revenue from expanding to 50 new Tier-3 cities.'],
    keyInsight: 'Last-mile delivery cost and local trust (kirana partnerships) are bigger moats than assortment width in Tier-2/3 India.',
  },
  {
    title: 'Jio\'s Pricing Revolution: Sustainable?',
    category: 'finance',
    difficulty: 'Medium',
    summary: 'Evaluate Jio\'s freemium-to-paid model. Is the current pricing sustainable? What are the long-term margin implications?',
    exhibit: 'Jio: 450M+ subscribers, ARPU ₹182/month. Airtel ARPU: ₹211/month. Industry CAPEX: ₹60,000 Cr/yr for 5G rollout. Jio Platforms valued at $100B+.',
    questions: ['Is Jio\'s current ARPU sufficient to fund 5G CAPEX?', 'What pricing strategy should Jio adopt to increase ARPU without losing subscribers?', 'How does the cross-selling of JioMart/JioCinema affect the telecom business model?'],
    keyInsight: 'Jio\'s moat is the ecosystem play (telecom + commerce + entertainment) — ARPU growth will come from bundling, not just tariff hikes.',
  },
  {
    title: 'Swiggy\'s Dark Kitchen Bet',
    category: 'operations',
    difficulty: 'Medium',
    summary: 'Should Swiggy expand its dark kitchen (cloud kitchen) network? Analyze unit economics, demand density, and scalability.',
    exhibit: 'Cloud kitchen setup cost: ₹15-25L. Monthly revenue per kitchen: ₹8-12L. Break-even: 12-18 months. Swiggy operates 1,000+ cloud kitchens across 15 cities. Food delivery market: ₹70,000 Cr.',
    questions: ['What demand density (orders/km²) justifies a new dark kitchen?', 'Should Swiggy own the kitchens or franchise them?', 'Estimate the impact on delivery time of adding 200 more kitchens in top-5 cities.'],
    keyInsight: 'Unit economics improve dramatically with demand density — focus on 500+ orders/day locations before expanding to new geographies.',
  },
  {
    title: 'Myntra\'s Private Label Strategy',
    category: 'marketing',
    difficulty: 'Easy',
    summary: 'Myntra earns higher margins on private labels. How should they balance private labels vs marketplace brands without alienating partners?',
    exhibit: 'Myntra private labels: 25% of revenue, 45% gross margin. Marketplace brands: 75% revenue, 15% take rate. Private label brands: Roadster, HRX, Mast & Harbour. 30M+ monthly active users.',
    questions: ['What is the optimal private label mix to maximize profit without losing brand partners?', 'How should Myntra position its private labels — value or premium?', 'Estimate the revenue impact if marketplace brands reduce catalog by 20% due to competition concerns.'],
    keyInsight: 'The sweet spot is 30-35% private label share — beyond that, brand partner attrition accelerates and reduces platform attractiveness.',
  },
  {
    title: 'PharmEasy Merger with Thyrocare',
    category: 'strategy',
    difficulty: 'Hard',
    summary: 'Evaluate the vertical integration play. What synergies exist? What are the integration risks?',
    exhibit: 'PharmEasy: ₹5,000 Cr GMV, 4.5M monthly orders. Thyrocare: 3,000+ collection centers, ₹600 Cr revenue, 35% EBITDA margin. Acquisition price: ₹6,300 Cr. Diagnostic market growing at 15% CAGR.',
    questions: ['What revenue synergies can PharmEasy extract from cross-selling diagnostics?', 'Is the ₹6,300 Cr valuation justified? Run a quick DCF sanity check.', 'What are the top 3 integration risks and how would you mitigate them?'],
    keyInsight: 'Vertical integration in healthcare works when you own the customer relationship — PharmEasy\'s app traffic is the real asset for driving diagnostic orders.',
  },
  {
    title: 'Ola Electric: Manufacturing In-house',
    category: 'operations',
    difficulty: 'Hard',
    summary: 'Ola built a megafactory. Analyze the make vs buy decision for EV manufacturing in India.',
    exhibit: 'Ola Futurefactory: 500 acres, capacity 10M units/yr (planned). Current output: ~50K scooters/month. Battery cost: 40% of vehicle cost. PLI subsidy: ₹18,000 Cr for auto sector. Cell imports from China: 80%.',
    questions: ['Is in-house manufacturing the right strategy at this scale? Compare with outsourcing.', 'Should Ola invest in cell manufacturing or focus on pack assembly?', 'Estimate the break-even volume needed to justify the factory CAPEX.'],
    keyInsight: 'Make vs buy in EVs hinges on battery cells — owning assembly is table stakes, but cell manufacturing is where the real cost advantage lies.',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  strategy: 'badge-primary',
  operations: 'badge-info',
  marketing: 'badge-secondary',
  finance: 'badge-warning',
};

export const CaseLibrary: React.FC = () => {
  const [tab, setTab] = useState<'frameworks' | 'cases'>('frameworks');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string>('all');

  const filteredFrameworks = catFilter === 'all' ? FRAMEWORKS : FRAMEWORKS.filter(f => f.category === catFilter);
  const filteredCases = catFilter === 'all' ? CASE_STUDIES : CASE_STUDIES.filter(c => c.category === catFilter);

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <BookOpen size={28} className="text-primary" /> Case Library
          </h1>
          <p className="text-base-content/60 mt-1">Master frameworks and practice with real-world Indian business cases.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-4">
          <button className={`btn btn-sm ${tab === 'frameworks' ? 'btn-outline btn-primary' : 'btn-ghost'}`} onClick={() => setTab('frameworks')}>
            📐 Frameworks ({FRAMEWORKS.length})
          </button>
          <button className={`btn btn-sm ${tab === 'cases' ? 'btn-outline btn-primary' : 'btn-ghost'}`} onClick={() => setTab('cases')}>
            📋 Case Studies ({CASE_STUDIES.length})
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['all', 'strategy', 'operations', 'marketing', 'finance'].map((cat) => (
            <button
              key={cat}
              className={`btn btn-xs ${catFilter === cat ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCatFilter(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Frameworks */}
        {tab === 'frameworks' && (
          <div className="space-y-3">
            {filteredFrameworks.map((fw) => {
              const isExpanded = expandedId === fw.id;
              return (
                <div key={fw.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : fw.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{fw.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base-content">{fw.name}</h3>
                            <span className={`badge ${CATEGORY_COLORS[fw.category]} badge-xs`}>{fw.category}</span>
                          </div>
                          <p className="text-sm text-base-content/60">{fw.description}</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-base-300 rounded-lg">
                          <p className="text-xs font-semibold text-primary mb-1">📌 When to Use</p>
                          <p className="text-sm text-base-content/70">{fw.whenToUse}</p>
                        </div>
                        <div className="p-3 bg-base-300 rounded-lg">
                          <p className="text-xs font-semibold text-primary mb-2">📋 Steps</p>
                          <ol className="space-y-1">
                            {fw.steps.map((step, i) => (
                              <li key={i} className="text-sm text-base-content/70 flex gap-2">
                                <span className="badge badge-ghost badge-xs mt-0.5">{i + 1}</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <p className="text-xs font-semibold text-primary mb-1">💡 Example Prompt</p>
                          <p className="text-sm text-base-content/70 italic">{fw.example}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Case Studies */}
        {tab === 'cases' && (
          <div className="space-y-3">
            {filteredCases.map((cs, idx) => {
              const diffColor = cs.difficulty === 'Easy' ? 'badge-success' : cs.difficulty === 'Medium' ? 'badge-warning' : 'badge-error';
              const isExpanded = expandedId === `case-${idx}`;
              return (
                <div key={idx} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : `case-${idx}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`badge ${CATEGORY_COLORS[cs.category]} badge-sm`}>{cs.category}</span>
                            <span className={`badge ${diffColor} badge-sm`}>{cs.difficulty}</span>
                          </div>
                          <h3 className="font-semibold text-base-content">{cs.title}</h3>
                          <p className="text-sm text-base-content/60 mt-1">{cs.summary}</p>
                        </div>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-base-300 rounded-lg">
                          <p className="text-xs font-semibold text-secondary mb-1">📊 Exhibit Data</p>
                          <p className="text-sm text-base-content/70">{cs.exhibit}</p>
                        </div>
                        <div className="p-3 bg-base-300 rounded-lg">
                          <p className="text-xs font-semibold text-primary mb-2">❓ Discussion Questions</p>
                          <ol className="space-y-1">
                            {cs.questions.map((question, i) => (
                              <li key={i} className="text-sm text-base-content/70 flex gap-2">
                                <span className="badge badge-ghost badge-xs mt-0.5">{i + 1}</span>
                                {question}
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <p className="text-xs font-semibold text-primary mb-1">💡 Key Insight</p>
                          <p className="text-sm text-base-content/70 italic">{cs.keyInsight}</p>
                        </div>
                        <p className="text-xs text-base-content/40 italic">💬 Need hints? Ask the neev Coach in your mock interview for guided problem-solving.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
