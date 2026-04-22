import React, { useState } from 'react';
import { CreditCard, Check, Zap, Crown, Rocket, Star } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'free', name: 'Starter', icon: <Zap size={24} />,
    price: '₹0', period: 'forever',
    description: 'Get started with basic interview practice.',
    features: [
      '2 mock interviews / week',
      '4 free AI tools',
      'Basic scorecard',
      'Question bank access',
      'Daily practice questions',
    ],
    highlighted: false,
    cta: 'Start Free ✨',
  },
  {
    id: 'pro', name: 'Pro', icon: <Crown size={24} />,
    price: '₹999', period: '/month',
    description: 'Serious prep for serious candidates.',
    features: [
      'Unlimited mock interviews',
      'All AI tools unlocked',
      'Detailed neevv Scorecard',
      'Resume-based personalization',
      'Speech analytics + filler tracking',
      'Enhanced answer cards',
      'Email scorecard delivery',
      'Human mentor review (5/month)',
      'Video practice module',
      'Priority AI responses',
    ],
    highlighted: true,
    cta: 'Upgrade to Pro',
    badge: 'Most Popular',
  },
  {
    id: 'premium', name: 'Premium', icon: <Rocket size={24} />,
    price: '₹2,499', period: '/month',
    description: 'Complete preparation with 1-on-1 mentorship.',
    features: [
      'Everything in Pro',
      'Unlimited mentor reviews',
      '2× live 1-on-1 sessions/month',
      'Custom question sets for your school',
      'Application essay review',
      'Priority WhatsApp support',
      'Interview recording & playback',
      'Peer mock interview matching',
      'B-school insider tips',
    ],
    highlighted: false,
    cta: 'Go Premium',
  },
];

const TESTIMONIALS = [
  { name: 'Priya S.', school: 'ISB PGP', quote: 'The AI coach felt like a real interviewer. Scored 8.5 on my neevv Scorecard and got into ISB!' },
  { name: 'Rahul M.', school: 'IIM Bangalore', quote: 'The guesstimate practice with data exhibits was exactly like my actual interview. Game changer.' },
  { name: 'Ananya K.', school: 'IIM Ahmedabad', quote: 'Story Bank helped me organize my STAR stories. I was so much more confident on interview day.' },
];

export const UpgradePlan: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [waitlistEmail, setWaitlistEmail] = useState<Record<string, string>>({});
  const [waitlistSubmitted, setWaitlistSubmitted] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-base-100 pb-16 sm:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-base-content flex items-center justify-center gap-2">
            <CreditCard size={28} className="text-primary" /> Upgrade Your Prep
          </h1>
          <p className="text-base-content/60 mt-2 max-w-lg mx-auto">
            Invest in your MBA journey. Choose the plan that matches your ambition.
          </p>
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-base-content font-semibold' : 'text-base-content/50'}`}>Monthly</span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={billingCycle === 'annual'}
              onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            />
            <span className={`text-sm ${billingCycle === 'annual' ? 'text-base-content font-semibold' : 'text-base-content/50'}`}>
              Annual <span className="badge badge-success badge-xs ml-1">Save ₹2,400/yr on Pro</span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {PLANS.map((plan) => {
            const annualPrice = plan.id === 'pro' ? '₹799' : plan.id === 'premium' ? '₹1,999' : '₹0';
            const displayPrice = billingCycle === 'annual' && plan.id !== 'free' ? annualPrice : plan.price;
            return (
              <div
                key={plan.id}
                className={`card bg-base-200 ${plan.highlighted ? 'border-2 border-primary ring-2 ring-primary/20' : 'border border-base-300'}`}
              >
                <div className="card-body p-5">
                  {plan.badge && (
                    <div className="badge badge-primary badge-sm mb-2">{plan.badge}</div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary">{plan.icon}</span>
                    <h3 className="text-lg font-bold text-base-content">{plan.name}</h3>
                  </div>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-base-content">{displayPrice}</span>
                    {plan.id !== 'free' && <span className="text-sm text-base-content/50">{billingCycle === 'annual' ? `/mo (billed annually — ${plan.id === 'pro' ? '₹9,588/yr' : '₹23,988/yr'})` : plan.period}</span>}
                  </div>
                  <p className="text-sm text-base-content/60 mb-4">{plan.description}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check size={14} className="text-success flex-shrink-0 mt-0.5" />
                        <span className="text-base-content/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.id === 'free' ? (
                    <button
                      className="btn btn-sm w-full btn-primary btn-outline"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Start Free ✨
                    </button>
                  ) : waitlistSubmitted[plan.id] ? (
                    <div className="text-center py-1">
                      <span className="text-sm text-success font-medium">✅ You're on the list!</span>
                      <p className="text-xs text-base-content/60 mt-0.5">We'll notify you at {waitlistEmail[plan.id]} when {plan.name} launches.</p>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <input
                        className="input input-bordered input-sm flex-1"
                        placeholder="your@email.com"
                        type="email"
                        value={waitlistEmail[plan.id] || ''}
                        onChange={e => setWaitlistEmail(prev => ({ ...prev, [plan.id]: e.target.value }))}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const email = waitlistEmail[plan.id];
                          if (email?.includes('@')) {
                            try {
                              const existing = JSON.parse(localStorage.getItem('neevv_waitlist') || '[]');
                              existing.push({ plan: plan.id, email, date: new Date().toISOString() });
                              localStorage.setItem('neevv_waitlist', JSON.stringify(existing));
                            } catch {}
                            setWaitlistSubmitted(prev => ({ ...prev, [plan.id]: true }));
                          }
                        }}
                      >
                        Notify Me
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mb-8">
          <h3 className="text-center text-lg font-semibold text-base-content mb-4">
            <Star size={18} className="inline text-secondary" /> What Our Students Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card bg-base-200">
                <div className="card-body p-4">
                  <p className="text-sm text-base-content/70 italic mb-3">"{t.quote}"</p>
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                        <span className="text-xs">{t.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-base-content">{t.name}</p>
                      <p className="text-xs text-base-content/50">{t.school}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <p className="text-sm text-base-content/50">
            All plans include a 7-day money-back guarantee. Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};
