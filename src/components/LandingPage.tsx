import React, { useState, useEffect } from 'react';
import {
  GraduationCap, ArrowRight, Mic, Brain, BarChart3, Lightbulb,
  CheckCircle, ChevronDown, ChevronUp, Sparkles, Shield, Clock,
  Star, MessageSquare, Target, Users, Calculator, FileText, Zap
} from 'lucide-react';

interface LandingPageProps {
  onStartInterview: () => void;
  onGoToTools: () => void;
  onStartTechInterview?: () => void;
  onStartLifecycle?: () => void;
}

// Animated counter
const Counter: React.FC<{ end: number; suffix: string; duration?: number }> = ({ end, suffix, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count}{suffix}</>;
};

// FAQ Accordion
const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-base-300 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-base-200/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm text-base-content">{q}</span>
        {open ? <ChevronUp size={18} className="text-primary shrink-0 ml-2" /> : <ChevronDown size={18} className="text-base-content/40 shrink-0 ml-2" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-base-content/70 leading-relaxed animate-fadeIn">
          {a}
        </div>
      )}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStartInterview, onGoToTools, onStartTechInterview, onStartLifecycle }) => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 animate-fadeIn">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary">neev-Powered B-School Interview Coach</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-base-content leading-tight mb-6 animate-slideUp">
            Build Your{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Neev
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl text-base-content/80">
              Your Foundation for B-School Success
            </span>
          </h1>

          <p className="text-base sm:text-lg text-base-content/60 max-w-2xl mx-auto mb-8 leading-relaxed animate-slideUp">
            Practice mock interviews with your neev Coach — powered by 25+ years of MBA admissions expertise.
            Get scored on Foundation, Logic & Communication — with real-time speech analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 animate-slideUp">
            <button className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" onClick={onStartInterview}>
              MBA Mock Interview <ArrowRight size={20} />
            </button>
            {onStartTechInterview && (
              <button className="btn btn-secondary btn-lg gap-2 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 transition-shadow" onClick={onStartTechInterview}>
                🖥️ Tech Interview <ArrowRight size={20} />
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 animate-slideUp">
            {onStartLifecycle && (
              <button className="btn btn-accent btn-lg gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow" onClick={onStartLifecycle}>
                🚀 Career Lifecycle <ArrowRight size={20} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 mb-8 animate-slideUp">
            <button className="btn btn-outline btn-md gap-2" onClick={onGoToTools}>
              Explore Free Tools
            </button>
          </div>

          <p className="text-xs text-base-content/40 animate-fadeIn">
            No sign-up required · 5 questions · ~15 minutes · Instant scorecard
          </p>
        </div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="bg-base-200/50 border-y border-base-300">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: 25, suffix: '+', label: 'Years Coaching Experience' },
            { value: 1000, suffix: '+', label: 'Sessions Coached by Our Team' },
            { value: 50, suffix: '+', label: 'B-Schools Covered' },
            { value: 92, suffix: '%', label: 'Student Satisfaction' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-extrabold text-primary">
                <Counter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-base-content/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ B-SCHOOLS COVERED ═══════ */}
      <section className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-xs text-base-content/40 uppercase tracking-widest mb-4">Trusted by students targeting</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'IIM Lucknow', 'IIM Indore', 'IIM Kozhikode', 'ISB Hyderabad', 'XLRI', 'FMS Delhi', 'SP Jain',
            'INSEAD', 'LBS', 'Wharton', 'Harvard', 'Stanford GSB', 'Kellogg', 'Columbia', 'IESE',
          ].map((school) => (
            <span key={school} className="badge badge-lg badge-outline text-xs font-medium px-3 py-2 hover:badge-primary hover:text-primary-content transition-colors cursor-default">
              🎓 {school}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-base-content mb-3">How It Works</h2>
          <p className="text-base-content/50">Four steps from resume to offer</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              icon: <FileText size={28} />,
              title: 'Resume Audit',
              desc: 'Upload your resume for a Neev Score (0-100). Get VP-level feedback on metrics, structure, and keywords.',
              color: 'text-primary',
              bg: 'bg-primary/10',
            },
            {
              step: '02',
              icon: <Target size={28} />,
              title: 'Job Discovery',
              desc: 'AI-powered job matching from LinkedIn & Naukri. See your skills vs market demand with match scores.',
              color: 'text-warning',
              bg: 'bg-warning/10',
            },
            {
              step: '03',
              icon: <MessageSquare size={28} />,
              title: 'Application Kit',
              desc: 'VP-crafted cover letter, LinkedIn connect note, and ATS keyword hack — tailored to each job.',
              color: 'text-secondary',
              bg: 'bg-secondary/10',
            },
            {
              step: '04',
              icon: <BarChart3 size={28} />,
              title: 'Mock Interview',
              desc: '5-question AI interview with STAR enforcement, math validation, and a comprehensive scorecard.',
              color: 'text-accent',
              bg: 'bg-accent/10',
            },
          ].map((item) => (
            <div key={item.step} className="card bg-base-200 hover:shadow-lg transition-shadow">
              <div className="card-body items-center text-center">
                <span className="text-xs font-mono text-base-content/30 mb-2">STEP {item.step}</span>
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-3`}>
                  <span className={item.color}>{item.icon}</span>
                </div>
                <h3 className="font-bold text-base-content">{item.title}</h3>
                <p className="text-sm text-base-content/60 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="bg-base-200/30 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-base-content mb-3">What Makes neevv Prep Different</h2>
            <p className="text-base-content/50">Built by combining the best of 5 leading interview prep platforms</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Brain size={22} />, title: 'neev Coach', desc: 'neev (नींव) = foundation — coaching built on 25+ years of expertise. Your personal interview coach that adapts to your background and resume — no generic questions.', color: 'text-primary', inspired: '' },
              { icon: <Sparkles size={22} />, title: 'Enhanced Answers', desc: 'After each response, see a polished version of YOUR answer — not a generic model answer.', color: 'text-secondary', inspired: 'Inspired by Revarta' },
              { icon: <Mic size={22} />, title: 'Speech Analytics', desc: 'Real-time filler word tracking (um/uh/like), WPM pacing, and word count per message.', color: 'text-info', inspired: 'Inspired by Yoodli' },
              { icon: <Target size={22} />, title: 'Data Exhibits & MECE', desc: 'Guesstimate questions come with market context and scenario data. MECE structure scored.', color: 'text-warning', inspired: 'Inspired by Soreno' },
              { icon: <Lightbulb size={22} />, title: 'Hint System', desc: '"Need a nudge?" — get framework hints without the full answer. Build your thinking muscle.', color: 'text-accent', inspired: 'Inspired by Final Round AI' },
              { icon: <CheckCircle size={22} />, title: 'Key Terms Tracker', desc: 'Detects B-school vocabulary (ROI, stakeholder, cross-functional) and tracks it in your scorecard.', color: 'text-success', inspired: 'Inspired by Google Warmup' },
              { icon: <Calculator size={22} />, title: 'Math Validator', desc: 'Catches arithmetic errors in guesstimates before the AI evaluates — no more "2×2=5" slip-ups.', color: 'text-error', inspired: '' },
              { icon: <Users size={22} />, title: 'Mentor Review', desc: 'Flag an answer for human mentor review — get personal tips from a coach with 25+ years experience.', color: 'text-primary', inspired: '' },
              { icon: <Zap size={22} />, title: 'Resume-Aware', desc: 'Upload your resume and every question is tailored to YOUR specific roles, projects, and career story.', color: 'text-warning', inspired: '' },
            ].map((feat, i) => (
              <div key={i} className="card bg-base-100 border border-base-300 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="card-body p-5">
                  <div className="flex items-start gap-3">
                    <div className={`${feat.color} mt-0.5`}>{feat.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-base-content">{feat.title}</h4>
                      <p className="text-xs text-base-content/60 mt-1 leading-relaxed">{feat.desc}</p>
                      {feat.inspired && (
                        <span className="badge badge-xs badge-ghost mt-2">{feat.inspired}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ INTERVIEW STRUCTURE ═══════ */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-base-content mb-3">Your Interview Blueprint</h2>
          <p className="text-base-content/50">5 questions, 15 minutes, one powerful scorecard</p>
        </div>

        <div className="space-y-3">
          {[
            { num: '1-2', label: 'Behavioral Round', detail: 'Leadership + failure questions · STAR method enforced · Weak Actions get flagged for refinement', icon: '🗣️', color: 'border-l-primary' },
            { num: '3', label: 'Guesstimate', detail: 'Data exhibit + market scenario · Step-by-step math required · Framework (top-down/bottom-up) evaluated', icon: '🧮', color: 'border-l-secondary' },
            { num: '4-5', label: '"Why" Drill', detail: '"Why this B-school?" and "Why now?" — tests conviction, research depth, and career clarity', icon: '🎯', color: 'border-l-accent' },
          ].map((q, i) => (
            <div key={i} className={`flex items-start gap-4 bg-base-200 rounded-xl p-5 border-l-4 ${q.color}`}>
              <span className="text-3xl">{q.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm badge-primary badge-outline font-mono">Q{q.num}</span>
                  <h4 className="font-bold text-base-content">{q.label}</h4>
                </div>
                <p className="text-sm text-base-content/60 mt-1">{q.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="bg-base-200/30 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-base-content mb-3">What Students Say</h2>
            <p className="text-base-content/50">Real feedback from real interview prep sessions</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                quote: 'The STAR enforcement changed everything. I used to ramble in behavioral questions — neevv Prep taught me to be structured and concise.',
                name: 'Priya K.',
                detail: 'Admitted to IIM Ahmedabad',
                stars: 5,
              },
              {
                quote: 'The guesstimate data exhibits are genius. Having real market context made my estimation frameworks so much sharper for the actual interview.',
                name: 'Rahul M.',
                detail: 'Admitted to ISB Hyderabad',
                stars: 5,
              },
              {
                quote: 'Getting my filler word count and seeing the enhanced version of my answers side-by-side was a game-changer. Highly recommend!',
                name: 'Sarah L.',
                detail: 'Admitted to INSEAD',
                stars: 5,
              },
            ].map((t, i) => (
              <div key={i} className="card bg-base-100 border border-base-300">
                <div className="card-body p-5">
                  <div className="flex gap-0.5 mb-2">
                    {Array(t.stars).fill(0).map((_, j) => (
                      <Star key={j} size={14} className="text-warning fill-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-base-content/70 leading-relaxed italic">"{t.quote}"</p>
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <p className="text-sm font-semibold text-base-content">{t.name}</p>
                    <p className="text-xs text-primary">{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>*Names changed for privacy. Results reflect individual preparation and vary by candidate.*</p>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-base-content mb-3">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          <FAQItem q="Is neevv Prep free?" a="Yes! The core mock interview experience with all 5 questions and the scorecard is completely free. No sign-up, no credit card." />
          <FAQItem q="What B-schools does this prepare me for?" a="neevv Prep covers Indian B-schools (IIM A/B/C, ISB, XLRI, FMS, SP Jain) and international programs (INSEAD, LBS, Wharton, Harvard, Stanford, Kellogg, Columbia, IESE). The AI adapts its coaching style and question difficulty based on your target school." />
          <FAQItem q="How does the neev Coach work?" a="neevv Prep uses a custom coaching workflow built on 25+ years of MBA admissions expertise. It enforces STAR method for behavioral questions, requires step-by-step math for guesstimates, and provides an enhanced version of every answer you give." />
          <FAQItem q="Can I upload my resume?" a="Absolutely! Upload a .txt file or paste your resume content. Your neev Coach will then reference your specific roles, projects, and achievements — making every question deeply personal to your experience." />
          <FAQItem q="What is the neevv Scorecard?" a="After 5 questions, you receive a scorecard with scores for Foundation (industry knowledge, self-awareness), Logic (analytical rigor, MECE thinking), and Communication (clarity, structure, vocabulary). It also includes speech analytics, filler word counts, and B-school terms used." />
          <FAQItem q="Can I get feedback from a human mentor?" a="Yes! During the interview, you can flag any answer for mentor review. A coach with 25+ years of MBA admissions experience can review your answer and send personal tips." />
          <FAQItem q="Is my data private?" a="Your interview data stays in your session. Video recordings are processed locally and never uploaded. Resume content is only used for the current session's AI personalization." />
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="card bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 border border-primary/20">
          <div className="card-body items-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <GraduationCap size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-base-content mb-2">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-base-content/60 max-w-md mb-6">
              Join thousands of students who built their foundation with neevv Prep. Start your free mock interview now.
            </p>
            <button className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25" onClick={onStartInterview}>
              Start Free Mock Interview <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-base-200 border-t border-base-300">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap size={14} className="text-primary-content" />
              </div>
              <span className="font-bold text-sm text-base-content">neevv Prep</span>
            </div>
            <p className="text-xs text-base-content/40">
              © 2026 neevv Prep · Build your foundation, ace your interview
            </p>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost btn-xs" onClick={onGoToTools}>Free Tools</button>
              <button className="btn btn-ghost btn-xs" onClick={onStartInterview}>Mock Interview</button>
              <span className="text-xs text-base-content/30 cursor-default">About (Coming Soon)</span>
              <span className="text-xs text-base-content/30 cursor-default">Blog (Coming Soon)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
