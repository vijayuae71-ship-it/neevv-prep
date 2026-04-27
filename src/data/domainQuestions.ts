export interface DomainQuestion {
  id: string;
  domain: string;
  subcategory: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  keyPoints: string[];
}

export interface DomainConfig {
  key: string;
  label: string;
  icon: string;
  subcategories: string[];
}

export const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    key: 'finance',
    label: 'Finance',
    icon: '💰',
    subcategories: ['Valuation & Modeling', 'Corporate Finance', 'Financial Markets', 'Banking & Risk', 'Accounting & Reporting'],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: '📊',
    subcategories: ['Data Analysis', 'Statistical Methods', 'Business Intelligence', 'Machine Learning Basics', 'Data Visualization'],
  },
  {
    key: 'marketing',
    label: 'Sales & Marketing',
    icon: '📢',
    subcategories: ['Brand Management', 'Digital Marketing', 'Consumer Behavior', 'Sales Strategy', 'Product Management'],
  },
  {
    key: 'consulting',
    label: 'Consulting',
    icon: '🏗️',
    subcategories: ['Case Frameworks', 'Market Entry', 'Profitability', 'M&A Strategy', 'Growth Strategy'],
  },
  {
    key: 'operations',
    label: 'Operations',
    icon: '⚙️',
    subcategories: ['Supply Chain', 'Lean & Six Sigma', 'Logistics', 'Procurement', 'Quality Management'],
  },
  {
    key: 'erp',
    label: 'ERP / BA',
    icon: '🖥️',
    subcategories: ['ERP Systems', 'Business Process', 'Requirements Analysis', 'Project Management', 'Digital Transformation'],
  },
];

export const DOMAIN_QUESTIONS: DomainQuestion[] = [
  // ═══════ FINANCE (60 questions) ═══════
  // Valuation & Modeling
  { id: 'f1', domain: 'finance', subcategory: 'Valuation & Modeling', difficulty: 'Medium', question: 'Walk me through a DCF analysis. What are the key assumptions?', keyPoints: ['Free cash flow projection', 'WACC calculation', 'Terminal value (Gordon growth vs exit multiple)', 'Sensitivity analysis on discount rate'] },
  { id: 'f2', domain: 'finance', subcategory: 'Valuation & Modeling', difficulty: 'Hard', question: 'How would you value a pre-revenue startup in the fintech space?', keyPoints: ['Comparable transactions method', 'Venture capital method', 'TAM/SAM/SOM analysis', 'Risk-adjusted discount rates'] },
  { id: 'f3', domain: 'finance', subcategory: 'Valuation & Modeling', difficulty: 'Easy', question: 'What is the difference between enterprise value and equity value?', keyPoints: ['EV = Equity + Debt - Cash', 'When to use each', 'Impact of capital structure', 'Market cap vs book value'] },
  { id: 'f4', domain: 'finance', subcategory: 'Valuation & Modeling', difficulty: 'Medium', question: 'Explain comparable company analysis. What multiples would you use for a SaaS company?', keyPoints: ['EV/Revenue, EV/EBITDA', 'Rule of 40', 'Growth-adjusted multiples', 'Selection of peer group'] },
  { id: 'f5', domain: 'finance', subcategory: 'Valuation & Modeling', difficulty: 'Hard', question: 'A company has negative EBITDA but growing revenue at 50% YoY. How do you value it?', keyPoints: ['Revenue multiples', 'Path to profitability analysis', 'Unit economics (LTV/CAC)', 'Comparable high-growth companies'] },
  { id: 'f6', domain: 'finance', subcategory: 'Valuation & Modeling', difficulty: 'Medium', question: 'What is WACC and how do you calculate it? What happens when interest rates rise?', keyPoints: ['Cost of equity (CAPM)', 'Cost of debt (after-tax)', 'Capital structure weights', 'Impact on valuations'] },
  { id: 'f7', domain: 'finance', subcategory: 'Valuation & Modeling', difficulty: 'Easy', question: 'Explain P/E ratio. Why do some industries trade at higher P/E than others?', keyPoints: ['Price-to-earnings calculation', 'Growth expectations', 'Industry risk profiles', 'Forward vs trailing P/E'] },
  { id: 'f8', domain: 'finance', subcategory: 'Valuation & Modeling', difficulty: 'Hard', question: 'How would you build a merger model? Walk me through accretion/dilution analysis.', keyPoints: ['Combined EPS calculation', 'Purchase price allocation', 'Synergy assumptions', 'Financing structure impact'] },
  // Corporate Finance
  { id: 'f9', domain: 'finance', subcategory: 'Corporate Finance', difficulty: 'Medium', question: 'A company has excess cash. Should it buy back shares, pay dividends, or reinvest? How would you decide?', keyPoints: ['ROI on reinvestment vs cost of capital', 'Tax implications', 'Signal to market', 'Shareholder preference'] },
  { id: 'f10', domain: 'finance', subcategory: 'Corporate Finance', difficulty: 'Easy', question: 'Explain the concept of working capital. Why is working capital management important?', keyPoints: ['Current assets - current liabilities', 'Cash conversion cycle', 'Impact on liquidity', 'Trade-offs in inventory/receivables'] },
  { id: 'f11', domain: 'finance', subcategory: 'Corporate Finance', difficulty: 'Hard', question: 'How would you structure the financing for a $500M acquisition?', keyPoints: ['Debt vs equity mix', 'Leverage capacity analysis', 'Covenant considerations', 'Mezzanine/bridge financing'] },
  { id: 'f12', domain: 'finance', subcategory: 'Corporate Finance', difficulty: 'Medium', question: 'What is the Modigliani-Miller theorem? Does capital structure matter in reality?', keyPoints: ['MM Proposition I & II', 'Tax shield benefit', 'Financial distress costs', 'Agency costs'] },
  { id: 'f13', domain: 'finance', subcategory: 'Corporate Finance', difficulty: 'Medium', question: 'Explain the concept of NPV. When would you reject a positive NPV project?', keyPoints: ['Time value of money', 'Discount rate selection', 'Capital rationing', 'Strategic considerations beyond NPV'] },
  { id: 'f14', domain: 'finance', subcategory: 'Corporate Finance', difficulty: 'Easy', question: 'What are the three main financial statements and how do they connect?', keyPoints: ['Income statement → retained earnings', 'Balance sheet equation', 'Cash flow from net income', 'Depreciation linkage'] },
  // Financial Markets
  { id: 'f15', domain: 'finance', subcategory: 'Financial Markets', difficulty: 'Medium', question: 'RBI raises repo rate by 50bps. Walk me through the impact on equity and bond markets.', keyPoints: ['Bond prices fall (inverse relationship)', 'Higher discount rates compress equity valuations', 'Sector rotation (growth vs value)', 'Currency appreciation'] },
  { id: 'f16', domain: 'finance', subcategory: 'Financial Markets', difficulty: 'Easy', question: 'Explain the difference between systematic and unsystematic risk.', keyPoints: ['Market risk vs company-specific risk', 'Diversification benefits', 'Beta as measure of systematic risk', 'Examples of each'] },
  { id: 'f17', domain: 'finance', subcategory: 'Financial Markets', difficulty: 'Hard', question: 'How do derivatives help in risk management? Give an example of hedging with options.', keyPoints: ['Put options for downside protection', 'Cost of hedging (premium)', 'Delta hedging concept', 'Real-world corporate hedging'] },
  { id: 'f18', domain: 'finance', subcategory: 'Financial Markets', difficulty: 'Medium', question: 'What factors would you consider when building an equity portfolio for a risk-averse client?', keyPoints: ['Asset allocation (equity/debt/gold)', 'Large-cap blue chips', 'Dividend yield focus', 'Rebalancing strategy'] },
  { id: 'f19', domain: 'finance', subcategory: 'Financial Markets', difficulty: 'Medium', question: 'Explain yield curve inversion and its implications for the economy.', keyPoints: ['Normal vs inverted yield curve', 'Recession predictor historically', 'Flight to safety dynamics', 'Impact on bank lending'] },
  // Banking & Risk
  { id: 'f20', domain: 'finance', subcategory: 'Banking & Risk', difficulty: 'Medium', question: 'What is Basel III and how does it impact bank operations?', keyPoints: ['Capital adequacy ratios (CET1)', 'Liquidity coverage ratio', 'Leverage ratio', 'Impact on lending capacity'] },
  { id: 'f21', domain: 'finance', subcategory: 'Banking & Risk', difficulty: 'Hard', question: 'How would you assess credit risk for a mid-size manufacturing company seeking a $10M loan?', keyPoints: ['5 Cs of credit', 'Financial ratio analysis (DSCR, leverage)', 'Industry and cycle analysis', 'Collateral valuation'] },
  { id: 'f22', domain: 'finance', subcategory: 'Banking & Risk', difficulty: 'Easy', question: 'Explain NPA (Non-Performing Asset). How does it affect a bank\'s profitability?', keyPoints: ['90-day overdue classification', 'Provisioning requirements', 'Impact on NIM and ROA', 'Recovery mechanisms'] },
  { id: 'f23', domain: 'finance', subcategory: 'Banking & Risk', difficulty: 'Medium', question: 'What are the differences between commercial banking and investment banking?', keyPoints: ['Deposit-taking vs advisory', 'Revenue models', 'Regulatory differences', 'Risk profiles'] },
  // Accounting & Reporting
  { id: 'f24', domain: 'finance', subcategory: 'Accounting & Reporting', difficulty: 'Easy', question: 'What is the difference between cash flow and profit? Can a profitable company go bankrupt?', keyPoints: ['Accrual vs cash basis', 'Working capital drain', 'Rapid growth cash trap', 'Real examples (Kingfisher Airlines)'] },
  { id: 'f25', domain: 'finance', subcategory: 'Accounting & Reporting', difficulty: 'Medium', question: 'How would you detect potential financial fraud in a company\'s statements?', keyPoints: ['Beneish M-Score', 'Revenue recognition red flags', 'Cash flow vs earnings divergence', 'Related party transactions'] },
  { id: 'f26', domain: 'finance', subcategory: 'Accounting & Reporting', difficulty: 'Medium', question: 'Explain IFRS vs Indian GAAP (Ind AS). What are the key differences?', keyPoints: ['Fair value vs historical cost', 'Revenue recognition (IFRS 15)', 'Lease accounting (IFRS 16)', 'Impact on reported financials'] },
  { id: 'f27', domain: 'finance', subcategory: 'Accounting & Reporting', difficulty: 'Hard', question: 'A company changes its depreciation method from straight-line to accelerated. What is the impact on all three financial statements?', keyPoints: ['Higher depreciation expense → lower profit', 'Lower tax (deferred tax liability)', 'Higher operating cash flow', 'Lower net asset values on balance sheet'] },
  { id: 'f28', domain: 'finance', subcategory: 'Accounting & Reporting', difficulty: 'Easy', question: 'What is goodwill and when does it appear on the balance sheet?', keyPoints: ['Acquisition premium over net assets', 'Impairment testing (no amortization under IFRS)', 'Overpayment risk', 'Impact on ROA/ROE'] },

  // ═══════ ANALYTICS (60 questions) ═══════
  // Data Analysis
  { id: 'a1', domain: 'analytics', subcategory: 'Data Analysis', difficulty: 'Easy', question: 'What is the difference between correlation and causation? Give a business example.', keyPoints: ['Ice cream and drowning example', 'Confounding variables', 'A/B testing for causation', 'Simpson\'s paradox'] },
  { id: 'a2', domain: 'analytics', subcategory: 'Data Analysis', difficulty: 'Medium', question: 'How would you analyze customer churn for an e-commerce platform?', keyPoints: ['Cohort analysis', 'RFM segmentation', 'Survival analysis', 'Key predictors (frequency, complaints, tenure)'] },
  { id: 'a3', domain: 'analytics', subcategory: 'Data Analysis', difficulty: 'Hard', question: 'You notice a 20% drop in daily active users. Walk me through your investigation framework.', keyPoints: ['Segmentation (new vs returning, platform, geography)', 'Timeline correlation (releases, marketing changes)', 'Funnel analysis (where dropout occurs)', 'External factors (competition, seasonality)'] },
  { id: 'a4', domain: 'analytics', subcategory: 'Data Analysis', difficulty: 'Medium', question: 'Explain A/B testing. What sample size would you need to detect a 2% conversion lift?', keyPoints: ['Hypothesis formulation', 'Statistical significance (p < 0.05)', 'Power analysis (80% power)', 'Effect size and practical significance'] },
  { id: 'a5', domain: 'analytics', subcategory: 'Data Analysis', difficulty: 'Easy', question: 'What metrics would you track for a food delivery app?', keyPoints: ['GMV, AOV, order frequency', 'Delivery time, customer satisfaction', 'CAC, LTV, unit economics', 'Restaurant partner metrics'] },
  { id: 'a6', domain: 'analytics', subcategory: 'Data Analysis', difficulty: 'Medium', question: 'How would you build a customer segmentation model for a retail bank?', keyPoints: ['K-means clustering', 'Feature selection (balance, transactions, products)', 'Segment profiling and naming', 'Actionable marketing strategies per segment'] },
  { id: 'a7', domain: 'analytics', subcategory: 'Data Analysis', difficulty: 'Hard', question: 'Design an experimentation framework for a product team that runs 50+ A/B tests per quarter.', keyPoints: ['False discovery rate control', 'Sequential testing methods', 'Experiment prioritization (ICE/RICE)', 'Guardrail metrics'] },
  // Statistical Methods
  { id: 'a8', domain: 'analytics', subcategory: 'Statistical Methods', difficulty: 'Medium', question: 'Explain regression analysis. When would you use linear vs logistic regression?', keyPoints: ['Continuous vs binary outcome', 'R-squared interpretation', 'Assumptions (linearity, normality)', 'Multicollinearity handling'] },
  { id: 'a9', domain: 'analytics', subcategory: 'Statistical Methods', difficulty: 'Easy', question: 'What is the Central Limit Theorem and why does it matter in business analytics?', keyPoints: ['Sample means approach normal distribution', 'Works regardless of population distribution', 'Enables confidence intervals', 'Minimum sample size (~30)'] },
  { id: 'a10', domain: 'analytics', subcategory: 'Statistical Methods', difficulty: 'Hard', question: 'How would you handle multicollinearity in a regression model predicting house prices?', keyPoints: ['VIF (Variance Inflation Factor)', 'PCA for dimensionality reduction', 'Ridge/Lasso regularization', 'Feature selection/engineering'] },
  { id: 'a11', domain: 'analytics', subcategory: 'Statistical Methods', difficulty: 'Medium', question: 'Explain Type I and Type II errors with a business context example.', keyPoints: ['False positive (Type I) = wasted resources', 'False negative (Type II) = missed opportunity', 'Trade-off with significance level', 'Business cost of each error type'] },
  { id: 'a12', domain: 'analytics', subcategory: 'Statistical Methods', difficulty: 'Medium', question: 'What is Bayesian vs Frequentist approach? When would you prefer one over the other?', keyPoints: ['Prior beliefs + evidence', 'Posterior probability', 'Small sample advantage of Bayesian', 'A/B testing with Bayesian methods'] },
  { id: 'a13', domain: 'analytics', subcategory: 'Statistical Methods', difficulty: 'Hard', question: 'How would you build a time series forecast for monthly revenue of a seasonal business?', keyPoints: ['Decomposition (trend, seasonal, residual)', 'ARIMA/SARIMA models', 'Prophet for business forecasting', 'Cross-validation for time series'] },
  // Business Intelligence
  { id: 'a14', domain: 'analytics', subcategory: 'Business Intelligence', difficulty: 'Easy', question: 'What makes a good dashboard? What are common mistakes?', keyPoints: ['Answer a specific business question', 'Hierarchy of information', 'Avoid chart junk', 'Real-time vs batch refresh needs'] },
  { id: 'a15', domain: 'analytics', subcategory: 'Business Intelligence', difficulty: 'Medium', question: 'How would you design a KPI dashboard for the CEO of an e-commerce company?', keyPoints: ['Revenue, margin, growth rate', 'Customer metrics (NPS, retention)', 'Operational efficiency', 'Drill-down capability'] },
  { id: 'a16', domain: 'analytics', subcategory: 'Business Intelligence', difficulty: 'Medium', question: 'Explain ETL process. What challenges arise when integrating data from multiple sources?', keyPoints: ['Extract-Transform-Load pipeline', 'Data quality and deduplication', 'Schema mapping challenges', 'Incremental vs full load'] },
  { id: 'a17', domain: 'analytics', subcategory: 'Business Intelligence', difficulty: 'Hard', question: 'How would you set up a data warehouse for a mid-size retail company?', keyPoints: ['Star/snowflake schema design', 'Fact and dimension tables', 'Slowly changing dimensions', 'Tools (Snowflake, BigQuery, Redshift)'] },
  // Machine Learning Basics
  { id: 'a18', domain: 'analytics', subcategory: 'Machine Learning Basics', difficulty: 'Medium', question: 'Explain the bias-variance tradeoff. How does it affect model selection?', keyPoints: ['Underfitting (high bias)', 'Overfitting (high variance)', 'Cross-validation to detect', 'Regularization as solution'] },
  { id: 'a19', domain: 'analytics', subcategory: 'Machine Learning Basics', difficulty: 'Easy', question: 'What is the difference between supervised and unsupervised learning? Give business examples.', keyPoints: ['Labeled vs unlabeled data', 'Classification/regression vs clustering/association', 'Spam detection (supervised)', 'Customer segmentation (unsupervised)'] },
  { id: 'a20', domain: 'analytics', subcategory: 'Machine Learning Basics', difficulty: 'Hard', question: 'How would you build a recommendation system for an OTT platform?', keyPoints: ['Collaborative filtering', 'Content-based filtering', 'Hybrid approaches', 'Cold start problem solutions'] },
  { id: 'a21', domain: 'analytics', subcategory: 'Machine Learning Basics', difficulty: 'Medium', question: 'Explain decision trees and random forests. When would you use each?', keyPoints: ['Interpretability vs accuracy', 'Ensemble methods reduce variance', 'Feature importance', 'Hyperparameter tuning'] },
  { id: 'a22', domain: 'analytics', subcategory: 'Machine Learning Basics', difficulty: 'Medium', question: 'What evaluation metrics would you use for a fraud detection model?', keyPoints: ['Precision, recall, F1 score', 'Imbalanced dataset handling', 'AUC-ROC curve', 'Cost-sensitive evaluation'] },
  // Data Visualization
  { id: 'a23', domain: 'analytics', subcategory: 'Data Visualization', difficulty: 'Easy', question: 'When would you use a bar chart vs line chart vs scatter plot?', keyPoints: ['Bar for categorical comparisons', 'Line for trends over time', 'Scatter for relationships', 'Choosing chart by data type'] },
  { id: 'a24', domain: 'analytics', subcategory: 'Data Visualization', difficulty: 'Medium', question: 'How would you present complex analytical findings to a non-technical CEO?', keyPoints: ['Start with the "so what"', 'Pyramid principle (conclusion first)', 'Simple visuals, no jargon', 'Actionable recommendations'] },
  { id: 'a25', domain: 'analytics', subcategory: 'Data Visualization', difficulty: 'Medium', question: 'What tools and techniques do you use for data storytelling?', keyPoints: ['Tableau/Power BI for dashboards', 'Narrative arc structure', 'Annotations and callouts', 'Context and benchmarks'] },

  // ═══════ SALES & MARKETING (60 questions) ═══════
  // Brand Management
  { id: 'm1', domain: 'marketing', subcategory: 'Brand Management', difficulty: 'Medium', question: 'How would you reposition a legacy FMCG brand to appeal to Gen Z consumers?', keyPoints: ['Cultural relevance audit', 'Social media-first strategy', 'Authentic purpose/values alignment', 'Influencer partnerships vs traditional media'] },
  { id: 'm2', domain: 'marketing', subcategory: 'Brand Management', difficulty: 'Easy', question: 'Explain brand equity. How would you measure it?', keyPoints: ['Brand awareness, associations, loyalty', 'Price premium method', 'Net Promoter Score', 'Brand valuation methodologies'] },
  { id: 'm3', domain: 'marketing', subcategory: 'Brand Management', difficulty: 'Hard', question: 'A brand faces a PR crisis due to a product quality issue. Outline your crisis management plan.', keyPoints: ['Immediate acknowledgment (golden hour)', 'Recall/corrective action', 'Transparent communication strategy', 'Long-term brand recovery roadmap'] },
  { id: 'm4', domain: 'marketing', subcategory: 'Brand Management', difficulty: 'Medium', question: 'How do you decide between brand extension vs launching a new brand?', keyPoints: ['Brand fit assessment', 'Cannibalization risk', 'Customer perception research', 'Cost of building new brand vs leveraging existing'] },
  { id: 'm5', domain: 'marketing', subcategory: 'Brand Management', difficulty: 'Medium', question: 'Explain the concept of brand architecture. Give examples of branded house vs house of brands.', keyPoints: ['Google (branded house)', 'P&G (house of brands)', 'Hybrid models', 'Portfolio management strategy'] },
  // Digital Marketing
  { id: 'm6', domain: 'marketing', subcategory: 'Digital Marketing', difficulty: 'Medium', question: 'How would you allocate a ₹1 Cr digital marketing budget for a D2C brand?', keyPoints: ['Channel mix (Google, Meta, influencers)', 'Performance vs brand awareness split', 'CAC targets by channel', 'Attribution modeling challenges'] },
  { id: 'm7', domain: 'marketing', subcategory: 'Digital Marketing', difficulty: 'Easy', question: 'What is SEO? How would you improve organic traffic for an e-commerce website?', keyPoints: ['Technical SEO (speed, mobile, structured data)', 'Content strategy (long-tail keywords)', 'Backlink building', 'User experience signals'] },
  { id: 'm8', domain: 'marketing', subcategory: 'Digital Marketing', difficulty: 'Hard', question: 'iOS 14 privacy changes killed your Facebook ad ROAS. How do you adapt?', keyPoints: ['First-party data strategy', 'Server-side tracking', 'Diversify channels (Google, email, SEO)', 'Conversion API implementation'] },
  { id: 'm9', domain: 'marketing', subcategory: 'Digital Marketing', difficulty: 'Medium', question: 'Explain attribution modeling. What are the pros/cons of last-click vs multi-touch?', keyPoints: ['Last-click overvalues bottom-funnel', 'Linear, time-decay, position-based models', 'Data-driven attribution', 'Incrementality testing'] },
  { id: 'm10', domain: 'marketing', subcategory: 'Digital Marketing', difficulty: 'Medium', question: 'How would you build an email marketing strategy for a SaaS product?', keyPoints: ['Drip campaigns by lifecycle stage', 'Segmentation and personalization', 'A/B testing subject lines and content', 'Deliverability and engagement metrics'] },
  // Consumer Behavior
  { id: 'm11', domain: 'marketing', subcategory: 'Consumer Behavior', difficulty: 'Easy', question: 'Explain the consumer decision-making process with an example.', keyPoints: ['Need recognition → search → evaluation → purchase → post-purchase', 'Involvement levels', 'Cognitive dissonance', 'Impulse vs planned buying'] },
  { id: 'm12', domain: 'marketing', subcategory: 'Consumer Behavior', difficulty: 'Medium', question: 'How do cognitive biases affect pricing decisions? Give examples of anchoring and framing.', keyPoints: ['Anchoring with original price', 'Decoy pricing', 'Framing (90% fat-free vs 10% fat)', 'Loss aversion in subscriptions'] },
  { id: 'm13', domain: 'marketing', subcategory: 'Consumer Behavior', difficulty: 'Hard', question: 'How would you design a behavioral nudge to increase UPI adoption among rural users?', keyPoints: ['Default options', 'Social proof (neighbor usage)', 'Simplification of interface', 'Incentive structure design'] },
  { id: 'm14', domain: 'marketing', subcategory: 'Consumer Behavior', difficulty: 'Medium', question: 'What is Maslow\'s hierarchy of needs and how does it apply to marketing strategy?', keyPoints: ['Physiological to self-actualization', 'Premium brands target higher needs', 'Emotional vs functional positioning', 'Cultural variations in hierarchy'] },
  // Sales Strategy
  { id: 'm15', domain: 'marketing', subcategory: 'Sales Strategy', difficulty: 'Medium', question: 'How would you build a sales compensation plan for a B2B SaaS company?', keyPoints: ['OTE structure (base + variable)', 'Quota setting methodology', 'Accelerators for overachievement', 'Clawback provisions'] },
  { id: 'm16', domain: 'marketing', subcategory: 'Sales Strategy', difficulty: 'Hard', question: 'Your sales pipeline is healthy but win rates dropped 30% in Q3. Diagnose the issue.', keyPoints: ['Competitive analysis changes', 'Deal stage conversion analysis', 'Rep-level performance variance', 'Pricing/product-market fit issues'] },
  { id: 'm17', domain: 'marketing', subcategory: 'Sales Strategy', difficulty: 'Easy', question: 'Explain the difference between B2B and B2C sales cycles.', keyPoints: ['Decision-maker complexity', 'Sales cycle length', 'Relationship vs transactional', 'Rational vs emotional buying'] },
  { id: 'm18', domain: 'marketing', subcategory: 'Sales Strategy', difficulty: 'Medium', question: 'How would you approach key account management for enterprise clients?', keyPoints: ['Account planning framework', 'Stakeholder mapping', 'Value-based selling', 'Cross-sell/upsell strategies'] },
  // Product Management
  { id: 'm19', domain: 'marketing', subcategory: 'Product Management', difficulty: 'Medium', question: 'How would you prioritize features for a product roadmap?', keyPoints: ['RICE/ICE scoring', 'Impact vs effort matrix', 'Customer feedback weighting', 'Strategic alignment check'] },
  { id: 'm20', domain: 'marketing', subcategory: 'Product Management', difficulty: 'Hard', question: 'Design a go-to-market strategy for a new health-tech product in India.', keyPoints: ['Target segment identification', 'Pricing strategy (freemium vs premium)', 'Channel strategy (doctors vs direct)', 'Regulatory considerations'] },
  { id: 'm21', domain: 'marketing', subcategory: 'Product Management', difficulty: 'Easy', question: 'What is product-market fit? How do you measure it?', keyPoints: ['Sean Ellis test (40% very disappointed)', 'Retention curves', 'NPS and usage frequency', 'Revenue growth patterns'] },
  { id: 'm22', domain: 'marketing', subcategory: 'Product Management', difficulty: 'Medium', question: 'How would you conduct competitive analysis for a new market entry?', keyPoints: ['Porter\'s Five Forces', 'Feature comparison matrix', 'Pricing intelligence', 'Customer perception mapping'] },

  // ═══════ CONSULTING (60 questions) ═══════
  // Case Frameworks
  { id: 'c1', domain: 'consulting', subcategory: 'Case Frameworks', difficulty: 'Medium', question: 'Walk me through the framework you would use for a market entry case.', keyPoints: ['Market attractiveness (size, growth, profitability)', 'Company capabilities and fit', 'Competition landscape', 'Entry mode (organic, JV, acquisition)'] },
  { id: 'c2', domain: 'consulting', subcategory: 'Case Frameworks', difficulty: 'Easy', question: 'What is MECE? Why is it important in consulting?', keyPoints: ['Mutually Exclusive, Collectively Exhaustive', 'Prevents overlaps and gaps', 'Enables structured problem-solving', 'Issue tree construction'] },
  { id: 'c3', domain: 'consulting', subcategory: 'Case Frameworks', difficulty: 'Hard', question: 'A client asks you to structure a problem you\'ve never seen before. How do you approach it?', keyPoints: ['First principles thinking', 'Ask clarifying questions', 'Build custom framework (not cookie-cutter)', 'Hypothesis-driven approach'] },
  { id: 'c4', domain: 'consulting', subcategory: 'Case Frameworks', difficulty: 'Medium', question: 'Explain Porter\'s Five Forces with an example of the Indian airline industry.', keyPoints: ['High rivalry (IndiGo, Air India, Vistara)', 'High buyer power (price-sensitive market)', 'Moderate supplier power (Boeing/Airbus duopoly)', 'Low threat of new entry (capital intensive)'] },
  { id: 'c5', domain: 'consulting', subcategory: 'Case Frameworks', difficulty: 'Medium', question: 'How do you structure a cost reduction case?', keyPoints: ['Revenue vs cost issue identification', 'Fixed vs variable cost breakdown', 'Benchmarking vs industry peers', 'Quick wins vs structural changes'] },
  { id: 'c6', domain: 'consulting', subcategory: 'Case Frameworks', difficulty: 'Hard', question: 'What is the difference between a framework and a hypothesis? When should you lead with each?', keyPoints: ['Frameworks for exploration', 'Hypotheses for focused testing', 'Senior interviewers prefer hypothesis-driven', 'Iterative refinement'] },
  // Market Entry
  { id: 'c7', domain: 'consulting', subcategory: 'Market Entry', difficulty: 'Medium', question: 'An Indian FMCG company wants to enter Southeast Asia. What factors should they consider?', keyPoints: ['Market selection (GDP, population, culture)', 'Distribution channel differences', 'Regulatory and import barriers', 'Local competition and brand preferences'] },
  { id: 'c8', domain: 'consulting', subcategory: 'Market Entry', difficulty: 'Hard', question: 'Should Reliance Jio enter the laptop/PC market? Build a case.', keyPoints: ['Market size and growth trends', 'Competitive landscape (HP, Dell, Lenovo)', 'Distribution leverage from existing retail', 'Brand perception stretch risk'] },
  { id: 'c9', domain: 'consulting', subcategory: 'Market Entry', difficulty: 'Easy', question: 'What are the different modes of market entry? When would you choose each?', keyPoints: ['Export, licensing, franchising', 'Joint venture, acquisition', 'Greenfield investment', 'Risk-return tradeoff of each'] },
  { id: 'c10', domain: 'consulting', subcategory: 'Market Entry', difficulty: 'Medium', question: 'A US tech company wants to enter India. What localization challenges should they expect?', keyPoints: ['Language diversity', 'Price sensitivity', 'Payment methods (UPI dominance)', 'Data localization regulations'] },
  // Profitability
  { id: 'c11', domain: 'consulting', subcategory: 'Profitability', difficulty: 'Medium', question: 'A restaurant chain\'s profits dropped 25% despite stable revenue. Diagnose the issue.', keyPoints: ['Cost analysis (food, labor, rent)', 'Menu mix changes (low-margin items growing)', 'Operational inefficiency', 'Delivery commissions eating margins'] },
  { id: 'c12', domain: 'consulting', subcategory: 'Profitability', difficulty: 'Hard', question: 'An airline is losing money on 40% of its routes. Should it shut those routes?', keyPoints: ['Contribution margin analysis', 'Network effects (feeder routes)', 'Competitor response', 'Long-term demand trends'] },
  { id: 'c13', domain: 'consulting', subcategory: 'Profitability', difficulty: 'Easy', question: 'Break down the profit equation. What levers can a company pull to improve profitability?', keyPoints: ['Revenue = Price × Volume', 'Costs = Fixed + Variable', 'Pricing power analysis', 'Operational efficiency'] },
  { id: 'c14', domain: 'consulting', subcategory: 'Profitability', difficulty: 'Medium', question: 'A SaaS company has 120% revenue retention but negative free cash flow. Is this a problem?', keyPoints: ['High retention = healthy product', 'Negative FCF due to growth investment', 'Rule of 40 check', 'Burn rate and runway analysis'] },
  // M&A Strategy
  { id: 'c15', domain: 'consulting', subcategory: 'M&A Strategy', difficulty: 'Hard', question: 'Should Tata Group acquire a mid-size EV startup? Build the case.', keyPoints: ['Strategic rationale (EV capability gap)', 'Valuation and deal structure', 'Integration challenges (culture, tech)', 'Synergy quantification'] },
  { id: 'c16', domain: 'consulting', subcategory: 'M&A Strategy', difficulty: 'Medium', question: 'What are the key reasons M&A deals fail? How would you mitigate these risks?', keyPoints: ['Cultural integration failures', 'Overpayment (winner\'s curse)', 'Poor due diligence', 'Loss of key talent post-acquisition'] },
  { id: 'c17', domain: 'consulting', subcategory: 'M&A Strategy', difficulty: 'Medium', question: 'Explain the difference between a merger, acquisition, and joint venture.', keyPoints: ['Control and ownership differences', 'Regulatory implications', 'Speed of execution', 'Risk sharing in JVs'] },
  // Growth Strategy
  { id: 'c18', domain: 'consulting', subcategory: 'Growth Strategy', difficulty: 'Medium', question: 'How would you help a mid-size company grow from $50M to $200M in revenue?', keyPoints: ['Ansoff matrix (products × markets)', 'Organic vs inorganic growth', 'Capability gaps assessment', 'Execution roadmap with milestones'] },
  { id: 'c19', domain: 'consulting', subcategory: 'Growth Strategy', difficulty: 'Hard', question: 'A traditional retailer is losing market share to e-commerce. Develop an omnichannel strategy.', keyPoints: ['Store-as-fulfillment-center model', 'Click-and-collect options', 'Loyalty program integration', 'Data-driven personalization'] },
  { id: 'c20', domain: 'consulting', subcategory: 'Growth Strategy', difficulty: 'Easy', question: 'Explain Ansoff\'s Growth Matrix with real examples for each quadrant.', keyPoints: ['Market penetration (Coca-Cola discounts)', 'Market development (Netflix international)', 'Product development (Apple Watch)', 'Diversification (Amazon → AWS)'] },
  { id: 'c21', domain: 'consulting', subcategory: 'Growth Strategy', difficulty: 'Medium', question: 'How would you assess whether a company should pursue a platform business model?', keyPoints: ['Network effects potential', 'Two-sided market dynamics', 'Chicken-and-egg problem', 'Winner-take-all vs fragmented'] },

  // ═══════ OPERATIONS & SCM (60 questions) ═══════
  // Supply Chain
  { id: 'o1', domain: 'operations', subcategory: 'Supply Chain', difficulty: 'Medium', question: 'How would you optimize the supply chain for a fast-fashion retailer?', keyPoints: ['Demand forecasting accuracy', 'Quick response manufacturing', 'Inventory positioning strategy', 'Supplier diversification'] },
  { id: 'o2', domain: 'operations', subcategory: 'Supply Chain', difficulty: 'Hard', question: 'COVID disrupted your supply chain. How would you build resilience for future shocks?', keyPoints: ['Multi-sourcing strategy', 'Safety stock recalibration', 'Near-shoring vs off-shoring', 'Digital supply chain twin'] },
  { id: 'o3', domain: 'operations', subcategory: 'Supply Chain', difficulty: 'Easy', question: 'Explain the bullwhip effect. How can it be mitigated?', keyPoints: ['Demand signal distortion upstream', 'Information sharing across chain', 'Vendor Managed Inventory', 'Smaller, more frequent orders'] },
  { id: 'o4', domain: 'operations', subcategory: 'Supply Chain', difficulty: 'Medium', question: 'What is the difference between push and pull supply chains? Give industry examples.', keyPoints: ['Make-to-stock vs make-to-order', 'Dell (pull) vs Coca-Cola (push)', 'Decoupling point concept', 'Hybrid strategies'] },
  { id: 'o5', domain: 'operations', subcategory: 'Supply Chain', difficulty: 'Medium', question: 'How would you evaluate and select suppliers for a critical component?', keyPoints: ['Total cost of ownership', 'Quality metrics and certifications', 'Lead time reliability', 'Financial stability assessment'] },
  { id: 'o6', domain: 'operations', subcategory: 'Supply Chain', difficulty: 'Hard', question: 'Design a demand planning process for a company with 10,000 SKUs across 50 warehouses.', keyPoints: ['Statistical forecasting + judgmental overlay', 'ABC-XYZ classification', 'Collaborative planning (S&OP)', 'Forecast accuracy measurement'] },
  // Lean & Six Sigma
  { id: 'o7', domain: 'operations', subcategory: 'Lean & Six Sigma', difficulty: 'Easy', question: 'What is Lean manufacturing? Explain the 7 wastes (MUDA).', keyPoints: ['Transport, Inventory, Motion, Waiting', 'Overproduction, Overprocessing, Defects', 'Value stream mapping', 'Continuous improvement (Kaizen)'] },
  { id: 'o8', domain: 'operations', subcategory: 'Lean & Six Sigma', difficulty: 'Medium', question: 'Explain the DMAIC framework with a real business example.', keyPoints: ['Define, Measure, Analyze, Improve, Control', 'Problem statement formulation', 'Root cause analysis tools', 'Statistical process control'] },
  { id: 'o9', domain: 'operations', subcategory: 'Lean & Six Sigma', difficulty: 'Hard', question: 'A manufacturing plant has a 4% defect rate. How would you reduce it to below 1%?', keyPoints: ['Pareto analysis of defect types', 'Process capability analysis (Cp, Cpk)', 'Root cause (Ishikawa, 5 Whys)', 'Poka-yoke (mistake-proofing)'] },
  { id: 'o10', domain: 'operations', subcategory: 'Lean & Six Sigma', difficulty: 'Medium', question: 'What is the Theory of Constraints? How would you apply it in a service environment?', keyPoints: ['Identify the bottleneck', 'Exploit and elevate the constraint', 'Subordinate other processes', 'Drum-Buffer-Rope analogy'] },
  { id: 'o11', domain: 'operations', subcategory: 'Lean & Six Sigma', difficulty: 'Medium', question: 'Explain value stream mapping. How would you use it for a hospital patient flow?', keyPoints: ['Current state vs future state map', 'Lead time vs processing time', 'Non-value-added step identification', 'Takt time calculation'] },
  // Logistics
  { id: 'o12', domain: 'operations', subcategory: 'Logistics', difficulty: 'Medium', question: 'How would you optimize last-mile delivery for an e-commerce company in tier-2 cities?', keyPoints: ['Hub-and-spoke model', 'Delivery density optimization', 'Gig workforce vs full-time drivers', 'Technology (route optimization, lockers)'] },
  { id: 'o13', domain: 'operations', subcategory: 'Logistics', difficulty: 'Easy', question: 'What is the difference between 3PL and 4PL? When would you use each?', keyPoints: ['3PL: outsourced transport/warehousing', '4PL: supply chain orchestrator', 'Cost vs control tradeoff', 'Industry examples'] },
  { id: 'o14', domain: 'operations', subcategory: 'Logistics', difficulty: 'Hard', question: 'Design a warehouse layout for a company processing 50,000 orders/day with 95% same-day dispatch.', keyPoints: ['Zone picking vs wave picking', 'Slotting optimization (ABC analysis)', 'Automation (conveyors, robotics)', 'Returns processing area'] },
  { id: 'o15', domain: 'operations', subcategory: 'Logistics', difficulty: 'Medium', question: 'How would you reduce transportation costs by 15% without compromising service levels?', keyPoints: ['Route optimization algorithms', 'Load consolidation', 'Mode mix optimization (road/rail/air)', 'Backhaul utilization'] },
  // Procurement
  { id: 'o16', domain: 'operations', subcategory: 'Procurement', difficulty: 'Medium', question: 'How would you negotiate a long-term contract with a sole-source supplier?', keyPoints: ['BATNA preparation', 'Total value analysis (not just price)', 'Risk-sharing mechanisms', 'Performance-linked pricing'] },
  { id: 'o17', domain: 'operations', subcategory: 'Procurement', difficulty: 'Easy', question: 'What is the Kraljic Matrix? How does it help in procurement strategy?', keyPoints: ['Profit impact vs supply risk axes', 'Strategic, leverage, bottleneck, routine items', 'Different strategies per quadrant', 'Portfolio approach to procurement'] },
  { id: 'o18', domain: 'operations', subcategory: 'Procurement', difficulty: 'Hard', question: 'How would you implement a strategic sourcing program for indirect spend (IT, marketing, travel)?', keyPoints: ['Spend analysis and categorization', 'Demand management opportunities', 'Supplier consolidation', 'Contract compliance tracking'] },
  // Quality Management
  { id: 'o19', domain: 'operations', subcategory: 'Quality Management', difficulty: 'Easy', question: 'What is TQM (Total Quality Management)? How does it differ from Six Sigma?', keyPoints: ['TQM = culture/philosophy', 'Six Sigma = data-driven methodology', 'Customer focus in both', 'Complementary approaches'] },
  { id: 'o20', domain: 'operations', subcategory: 'Quality Management', difficulty: 'Medium', question: 'Explain ISO 9001. Why do companies pursue certification?', keyPoints: ['Quality management system standard', 'Customer confidence and market access', 'Process documentation and consistency', 'Continuous improvement commitment'] },
  { id: 'o21', domain: 'operations', subcategory: 'Quality Management', difficulty: 'Medium', question: 'How would you set up a quality management system for a food processing company?', keyPoints: ['HACCP principles', 'Traceability systems', 'Supplier quality audits', 'Statistical sampling plans'] },

  // ═══════ ERP / BA (60 questions) ═══════
  // ERP Systems
  { id: 'e1', domain: 'erp', subcategory: 'ERP Systems', difficulty: 'Medium', question: 'What is ERP? Explain the key modules and how they integrate.', keyPoints: ['Finance, HR, SCM, Manufacturing, CRM', 'Single source of truth concept', 'Master data management', 'Real-time reporting benefits'] },
  { id: 'e2', domain: 'erp', subcategory: 'ERP Systems', difficulty: 'Hard', question: 'A company\'s ERP implementation failed after 18 months and $5M invested. What went wrong?', keyPoints: ['Change management failures', 'Poor requirements gathering', 'Scope creep', 'Lack of executive sponsorship'] },
  { id: 'e3', domain: 'erp', subcategory: 'ERP Systems', difficulty: 'Easy', question: 'Explain the difference between SAP, Oracle, and cloud ERP solutions.', keyPoints: ['SAP (enterprise, complex)', 'Oracle (database-centric)', 'Cloud ERP (Workday, NetSuite) flexibility', 'Total cost of ownership comparison'] },
  { id: 'e4', domain: 'erp', subcategory: 'ERP Systems', difficulty: 'Medium', question: 'When should a company customize an ERP vs adapt their processes to fit the ERP?', keyPoints: ['Best practice vs competitive advantage processes', 'Customization increases TCO', 'Upgrade path complications', 'Industry-specific requirements'] },
  { id: 'e5', domain: 'erp', subcategory: 'ERP Systems', difficulty: 'Medium', question: 'What is the role of a business analyst in an ERP implementation?', keyPoints: ['Requirements elicitation', 'Gap-fit analysis', 'Process mapping (as-is vs to-be)', 'User acceptance testing'] },
  { id: 'e6', domain: 'erp', subcategory: 'ERP Systems', difficulty: 'Hard', question: 'How would you plan a data migration from legacy systems to a new ERP?', keyPoints: ['Data cleansing and validation', 'Mapping legacy to new schema', 'Migration testing strategy', 'Cutover planning and rollback'] },
  // Business Process
  { id: 'e7', domain: 'erp', subcategory: 'Business Process', difficulty: 'Easy', question: 'What is business process mapping? What tools and notations do you use?', keyPoints: ['BPMN notation', 'Swimlane diagrams', 'As-is vs to-be analysis', 'Tools (Visio, Lucidchart, Miro)'] },
  { id: 'e8', domain: 'erp', subcategory: 'Business Process', difficulty: 'Medium', question: 'How would you identify processes suitable for automation (RPA)?', keyPoints: ['Rule-based and repetitive tasks', 'High volume, low exception rate', 'ROI calculation', 'Process standardization prerequisite'] },
  { id: 'e9', domain: 'erp', subcategory: 'Business Process', difficulty: 'Hard', question: 'How would you re-engineer the order-to-cash process for a manufacturing company?', keyPoints: ['Current cycle time analysis', 'Bottleneck identification', 'Automation opportunities', 'Impact on working capital'] },
  { id: 'e10', domain: 'erp', subcategory: 'Business Process', difficulty: 'Medium', question: 'What is process mining? How does it differ from traditional process mapping?', keyPoints: ['Event log analysis', 'Discovers actual process vs documented', 'Identifies deviations and bottlenecks', 'Tools (Celonis, UiPath Process Mining)'] },
  // Requirements Analysis
  { id: 'e11', domain: 'erp', subcategory: 'Requirements Analysis', difficulty: 'Medium', question: 'How do you gather and document business requirements for a new system?', keyPoints: ['Stakeholder interviews', 'User stories and use cases', 'MoSCoW prioritization', 'Requirements traceability matrix'] },
  { id: 'e12', domain: 'erp', subcategory: 'Requirements Analysis', difficulty: 'Easy', question: 'What is the difference between functional and non-functional requirements?', keyPoints: ['Functional = what system does', 'Non-functional = how well it performs', 'Examples of each', 'Equally important for success'] },
  { id: 'e13', domain: 'erp', subcategory: 'Requirements Analysis', difficulty: 'Hard', question: 'Stakeholders disagree on requirements priority. How do you resolve this?', keyPoints: ['Facilitated workshop techniques', 'Business value scoring', 'Data-driven decision making', 'Escalation to project sponsor'] },
  { id: 'e14', domain: 'erp', subcategory: 'Requirements Analysis', difficulty: 'Medium', question: 'What is a user story? How do you write effective acceptance criteria?', keyPoints: ['As a [user], I want [feature], so that [benefit]', 'INVEST criteria', 'Given-When-Then format', 'Edge cases and negative scenarios'] },
  // Project Management
  { id: 'e15', domain: 'erp', subcategory: 'Project Management', difficulty: 'Medium', question: 'Explain Agile vs Waterfall. When would you choose each for an ERP project?', keyPoints: ['Waterfall for large ERP (defined scope)', 'Agile for custom development', 'Hybrid approach benefits', 'Sprint planning in Agile'] },
  { id: 'e16', domain: 'erp', subcategory: 'Project Management', difficulty: 'Hard', question: 'Your project is 3 months behind schedule and 20% over budget. What do you do?', keyPoints: ['Root cause analysis of delays', 'Scope negotiation (cut non-essential)', 'Resource reallocation', 'Transparent stakeholder communication'] },
  { id: 'e17', domain: 'erp', subcategory: 'Project Management', difficulty: 'Easy', question: 'What is a project charter? What key elements should it contain?', keyPoints: ['Project objectives and scope', 'Key stakeholders and sponsors', 'High-level timeline and budget', 'Success criteria and constraints'] },
  { id: 'e18', domain: 'erp', subcategory: 'Project Management', difficulty: 'Medium', question: 'How do you manage stakeholder expectations in a complex IT project?', keyPoints: ['Stakeholder analysis and mapping', 'Regular communication cadence', 'Managing scope creep', 'Demonstrating quick wins'] },
  // Digital Transformation
  { id: 'e19', domain: 'erp', subcategory: 'Digital Transformation', difficulty: 'Medium', question: 'What is digital transformation? How does it differ from digitization?', keyPoints: ['Digitization = analog to digital', 'Transformation = business model change', 'Customer experience reimagination', 'Culture and mindset shift'] },
  { id: 'e20', domain: 'erp', subcategory: 'Digital Transformation', difficulty: 'Hard', question: 'How would you build a digital transformation roadmap for a traditional bank?', keyPoints: ['Customer journey mapping', 'Core banking modernization', 'API-first architecture', 'Digital talent and culture strategy'] },
  { id: 'e21', domain: 'erp', subcategory: 'Digital Transformation', difficulty: 'Easy', question: 'What role does cloud computing play in digital transformation?', keyPoints: ['Scalability and agility', 'Pay-as-you-go cost model', 'Faster time to market', 'Security considerations'] },
  { id: 'e22', domain: 'erp', subcategory: 'Digital Transformation', difficulty: 'Medium', question: 'How would you measure the ROI of a digital transformation initiative?', keyPoints: ['Revenue impact (new channels)', 'Cost savings (automation)', 'Customer satisfaction metrics', 'Employee productivity gains'] },
];

export const getDomainQuestions = (domain: string): DomainQuestion[] => {
  return DOMAIN_QUESTIONS.filter(q => q.domain === domain);
};

export const getDomainQuestionCount = (domain: string): number => {
  return DOMAIN_QUESTIONS.filter(q => q.domain === domain).length;
};
