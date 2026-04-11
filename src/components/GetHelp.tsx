import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, BookOpen, ExternalLink } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  { category: 'Getting Started', q: 'How does the mock interview work?', a: 'You set up your profile (name, target school, background, optional resume), and the neev Coach takes you through a 5-question mock interview: 2 behavioral questions using the STAR method, 1 guesstimate with a data exhibit, and 2 "Why" questions. At the end, you get a detailed neevv Scorecard.' },
  { category: 'Getting Started', q: 'Is my data stored securely?', a: 'Your interview data stays in your browser\'s local storage. We don\'t store conversation data on our servers or share it with third parties. Resume text is used only during the session to personalize questions.' },
  { category: 'Getting Started', q: 'What browsers are supported?', a: 'neevv Prep works in any modern browser (Chrome, Safari, Firefox, Edge). Voice input requires a browser that supports the Web Speech API — Chrome works best for this.' },
  { category: 'Interview', q: 'Why does the coach ask me to redo my answer?', a: 'If your behavioral answer has a weak "Action" component in the STAR method, the coach will pause and ask you to strengthen it. This mirrors real interview feedback and helps you practice giving more specific, impactful responses.' },
  { category: 'Interview', q: 'What is the math validation in guesstimates?', a: 'When you\'re in guesstimate mode, our math validator checks your arithmetic (e.g., 5 × 3 = 15). If it detects errors like "5 × 3 = 20", it blocks the answer and asks you to correct the math before the coach reviews it. This builds accuracy habits.' },
  { category: 'Interview', q: 'Can I upload my resume?', a: 'Yes! On the setup screen, you can paste your resume text or upload a text file. The neev Coach uses this to personalize questions — asking about specific projects, roles, and career transitions from your actual experience.' },
  { category: 'Interview', q: 'What is the "Need a nudge?" button?', a: 'Inspired by Final Round AI, the lightbulb button gives you a framework hint without revealing the full answer. It\'s like having a coach whisper a starting approach when you\'re stuck — just 2-3 bullet points to get you going.' },
  { category: 'Scorecard', q: 'How is the neevv Scorecard calculated?', a: 'The scorecard evaluates three categories: Foundation (content knowledge, STAR structure), Logic (analytical thinking, MECE framework, math accuracy), and Communication (clarity, conciseness, B-school vocabulary). Each is scored 1-10 with a specific strength and one critical gap.' },
  { category: 'Scorecard', q: 'Can I get my scorecard emailed?', a: 'Yes! If you enter your email during setup, the scorecard can be emailed when the interview completes. Click the "Email Scorecard" button on the results page to send it via your email client.' },
  { category: 'Scorecard', q: 'What are "Speech Analytics"?', a: 'Inspired by Yoodli, our speech analytics track filler words (um, uh, like, you know), words per minute (WPM), and total word count. This helps you identify verbal habits that can hurt your interview performance. It works best with voice input.' },
  { category: 'Free Tools', q: 'What free tools are available?', a: 'We offer 4 neev-powered mini-tools: Why MBA Builder (craft your Why MBA essay), STAR Story Builder (structure behavioral stories), Guesstimate Practice (standalone estimation drills), and B-School Fit Analyzer (evaluate school fit for your profile).' },
  { category: 'Free Tools', q: 'Are the free tools limited?', a: 'Free tools have the same neev Coach quality as the full interview. On the Starter plan, you get 2 mock interviews per week and unlimited access to all 4 free tools.' },
  { category: 'Account', q: 'How do I upgrade my plan?', a: 'Go to "Upgrade Plan" in the sidebar menu. We offer Starter (free), Pro (₹999/mo), and Premium (₹2,499/mo) plans. Annual billing saves 20%. All paid plans include a 7-day money-back guarantee.' },
  { category: 'Account', q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime from the Upgrade Plan page. Your access continues until the end of your billing period. No questions asked.' },
];

const CATEGORIES = Array.from(new Set(FAQS.map(f => f.category)));

export const GetHelp: React.FC = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState('all');
  const [contactSent, setContactSent] = useState(false);
  const [contactMsg, setContactMsg] = useState('');

  const filtered = catFilter === 'all' ? FAQS : FAQS.filter(f => f.category === catFilter);

  const handleContact = () => {
    if (!contactMsg.trim()) return;
    const subject = encodeURIComponent('💬 neevv Prep — Help Request');
    const body = encodeURIComponent(`Help request:\n\n${contactMsg}\n\n---\nSent from neevv Prep Help Center`);
    window.open(`mailto:support@neevv.com?subject=${subject}&body=${body}`, '_blank');
    setContactSent(true);
    setContactMsg('');
    setTimeout(() => setContactSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <HelpCircle size={28} className="text-primary" /> Get Help
          </h1>
          <p className="text-base-content/60 mt-1">Find answers or reach out to our team.</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors" onClick={() => setCatFilter('Getting Started')}>
            <div className="card-body p-4 items-center text-center">
              <BookOpen size={24} className="text-primary mb-1" />
              <p className="text-sm font-semibold text-base-content">Getting Started</p>
              <p className="text-xs text-base-content/50">Setup & basics</p>
            </div>
          </div>
          <div className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors" onClick={() => setCatFilter('Interview')}>
            <div className="card-body p-4 items-center text-center">
              <MessageCircle size={24} className="text-primary mb-1" />
              <p className="text-sm font-semibold text-base-content">Interview Help</p>
              <p className="text-xs text-base-content/50">During your mock</p>
            </div>
          </div>
          <div className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors" onClick={() => setCatFilter('Scorecard')}>
            <div className="card-body p-4 items-center text-center">
              <Mail size={24} className="text-primary mb-1" />
              <p className="text-sm font-semibold text-base-content">Scorecard & Tools</p>
              <p className="text-xs text-base-content/50">Results & features</p>
            </div>
          </div>
        </div>

        {/* FAQ Category Filter */}
        <div className="sticky top-14 z-30 bg-base-100 py-2 border-b border-base-300">
          <div className="flex gap-2 flex-wrap">
            <button className={`btn btn-xs ${catFilter === 'all' ? 'border border-primary text-primary bg-primary/10' : 'btn-ghost'}`} onClick={() => setCatFilter('all')}>All</button>
            {CATEGORIES.map(cat => (
              <button key={cat} className={`btn btn-xs ${catFilter === cat ? 'border border-primary text-primary bg-primary/10' : 'btn-ghost'}`} onClick={() => setCatFilter(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-2 mb-10">
          {filtered.map((faq, idx) => {
            const globalIdx = FAQS.indexOf(faq);
            const isExpanded = expandedIdx === globalIdx;
            return (
              <div key={globalIdx} className="card bg-base-200">
                <div
                  className="card-body p-4 cursor-pointer"
                  onClick={() => setExpandedIdx(isExpanded ? null : globalIdx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-ghost badge-xs">{faq.category}</span>
                      <p className="text-sm font-medium text-base-content">{faq.q}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {isExpanded && (
                    <p className="text-sm text-base-content/70 mt-3 pl-2 border-l-2 border-primary/30">
                      {faq.a}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="card bg-base-200 border border-primary/20">
          <div className="card-body p-5">
            <h3 className="font-semibold text-base-content flex items-center gap-2">
              <Mail size={18} className="text-primary" /> Still Need Help?
            </h3>
            <p className="text-sm text-base-content/60 mb-3">Send us a message and we'll get back to you within 24 hours.</p>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Describe your issue or question..."
              rows={3}
              value={contactMsg}
              onChange={e => setContactMsg(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              {contactSent ? (
                <span className="btn btn-success btn-sm">✓ Email Client Opened!</span>
              ) : (
                <button className="btn btn-primary btn-sm gap-1" onClick={handleContact} disabled={!contactMsg.trim()}>
                  <Mail size={14} /> Send Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
