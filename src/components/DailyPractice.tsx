import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Clock, Play, CheckCircle, Trophy, Sparkles } from 'lucide-react';
import { getJSON, setJSON } from '../utils/localStorage';

const DAILY_QUESTIONS = [
  { type: 'Behavioral', q: 'Describe a time you turned a team conflict into a productive outcome.', tip: 'Focus on your mediation skills and the specific resolution.' },
  { type: 'Guesstimate', q: 'Estimate the annual revenue of Zomato\'s food delivery in Mumbai.', tip: 'Segment: orders/day × avg order value × 365. Consider market share.' },
  { type: 'Why MBA', q: 'How will an MBA help you transition from your current role to your dream role?', tip: 'Be specific about the skill gap the MBA fills.' },
  { type: 'Behavioral', q: 'Tell me about a time you had to make a decision with incomplete data.', tip: 'Show your framework for handling ambiguity + risk assessment.' },
  { type: 'Guesstimate', q: 'How many haircuts happen in Delhi every day?', tip: 'Population × frequency × salon density approach.' },
  { type: 'Caselet', q: 'An e-commerce company\'s return rate jumped from 5% to 15%. Diagnose.', tip: 'Issue tree: Product quality, sizing, expectation mismatch, policy abuse.' },
  { type: 'Behavioral', q: 'Give an example of how you used data to persuade a skeptical audience.', tip: 'Describe the data, your storytelling approach, and the outcome.' },
  { type: 'Why MBA', q: 'What unique perspective will you bring to classroom discussions?', tip: 'Connect your industry/background to specific MBA topics.' },
  { type: 'Guesstimate', q: 'Estimate the number of Uber rides in Bangalore on a weekday.', tip: 'Think: commuters + leisure + airport. Peak vs off-peak.' },
  { type: 'Behavioral', q: 'Describe a project where you had to learn something entirely new quickly.', tip: 'Show learning agility and how you applied the new skill.' },
  { type: 'Caselet', q: 'A fintech startup is losing customers after onboarding. What\'s your approach?', tip: 'Funnel analysis: activation → engagement → retention. Find the drop-off.' },
  { type: 'Guesstimate', q: 'How many weddings happen in India each year?', tip: 'Population × marriage rate × age demographics.' },
  { type: 'Behavioral', q: 'Tell me about a time you championed an idea that was initially rejected.', tip: 'Show persistence, how you gathered evidence, and pivoted your pitch.' },
  { type: 'Why MBA', q: 'Why not just learn on the job instead of getting an MBA?', tip: 'Address network, structured learning, career pivot, credibility.' },
  { type: 'Guesstimate', q: 'Estimate the market size for pet food in India.', tip: 'Pet-owning households × spend per pet × growth trends.' },
  { type: 'Behavioral', q: 'Describe a time you mentored someone and the impact it had.', tip: 'Show leadership beyond formal authority. Quantify their growth.' },
  { type: 'Caselet', q: 'Should Decathlon launch a subscription model for sports equipment rental?', tip: 'Framework: Customer need, unit economics, competition, operational feasibility.' },
  { type: 'Guesstimate', q: 'How many liters of milk does India consume daily?', tip: 'Population × per capita consumption. India is the world\'s largest milk producer.' },
  { type: 'Behavioral', q: 'Tell me about a cross-functional project you led. What was the hardest part?', tip: 'Emphasize alignment, communication, and managing different priorities.' },
  { type: 'Why MBA', q: 'If you don\'t get into your target school, what\'s your Plan B?', tip: 'Show maturity. Mention alternate schools or career paths that still align with goals.' },
  { type: 'Guesstimate', q: 'Estimate the number of ATMs in India.', tip: 'Bank branches × ATMs per branch + standalone ATMs. Urban vs rural.' },
  { type: 'Caselet', q: 'A luxury hotel chain wants to enter the budget segment. Advise.', tip: 'Brand dilution risk, separate branding, target segment, pricing, operations.' },
  { type: 'Behavioral', q: 'Describe a time you had to adapt your communication style for a different audience.', tip: 'Show versatility: technical vs non-technical, C-suite vs junior team.' },
  { type: 'Guesstimate', q: 'How many restaurants are there in Bangalore?', tip: 'Approach by localities × density, or population × restaurants per capita.' },
  { type: 'Why MBA', q: 'What\'s the one thing about your candidacy that isn\'t on your resume?', tip: 'Personal values, passions, unique life experiences. Make it memorable.' },
  { type: 'Behavioral', q: 'Tell me about a time you said no to your manager. Why and how?', tip: 'Show professional courage with respect. Explain the reasoning and outcome.' },
  { type: 'Caselet', q: 'An EdTech company\'s free-to-paid conversion dropped 40%. Diagnose.', tip: 'Analyze: free tier value, paywall timing, pricing, competitive alternatives.' },
  { type: 'Guesstimate', q: 'Estimate the daily water consumption of Mumbai city.', tip: 'Population × per capita liters/day. Include residential + commercial + industrial.' },
  { type: 'Behavioral', q: 'Give an example of when you turned a customer complaint into an opportunity.', tip: 'Show empathy, speed of response, and how it improved the product/process.' },
  { type: 'Why MBA', q: 'How do you plan to balance academics, networking, and personal life during your MBA?', tip: 'Show self-awareness and planning skills. Be honest about trade-offs.' },
];

const STORAGE_KEY = 'neevv_daily_practice';

interface DailyPracticeData {
  streak: number;
  lastDate: string;
  completedToday: boolean;
}

interface DailyPracticeProps {
  onPractice: (question: string) => void;
}

export const DailyPractice: React.FC<DailyPracticeProps> = ({ onPractice }) => {
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const todayQ = DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length];
  const yesterdayQ = DAILY_QUESTIONS[(dayOfYear - 1 + DAILY_QUESTIONS.length) % DAILY_QUESTIONS.length];
  const tomorrowQ = DAILY_QUESTIONS[(dayOfYear + 1) % DAILY_QUESTIONS.length];

  useEffect(() => {
    const data = getJSON<DailyPracticeData>(STORAGE_KEY, { streak: 0, lastDate: '', completedToday: false });
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (data.lastDate === today) {
      setStreak(data.streak);
      setCompletedToday(data.completedToday);
    } else if (data.lastDate === yesterday) {
      setStreak(data.streak);
      setCompletedToday(false);
    } else {
      setStreak(0);
      setCompletedToday(false);
    }
  }, []);

  const markComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    const newStreak = streak + 1;
    setStreak(newStreak);
    setCompletedToday(true);
    setJSON(STORAGE_KEY, { streak: newStreak, lastDate: today, completedToday: true });
  };

  const typeColor = todayQ.type === 'Behavioral' ? 'badge-primary' : todayQ.type === 'Guesstimate' ? 'badge-secondary' : todayQ.type === 'Caselet' ? 'badge-info' : 'badge-accent';

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <Calendar size={28} className="text-primary" /> Daily Practice
          </h1>
          <p className="text-base-content/60 mt-1">One question every day. Build your streak. Build your confidence.</p>
        </div>

        {/* Streak Card */}
        <div className="card bg-gradient-to-r from-primary/20 to-secondary/20 mb-6">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Flame size={32} className="text-secondary" />
                  <div>
                    <div className="text-3xl font-bold text-base-content">{streak}</div>
                    <div className="text-xs text-base-content/60">Day Streak</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <Trophy size={20} className="mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold text-base-content">{Math.floor(streak / 7)}</div>
                  <div className="text-xs text-base-content/60">Weeks</div>
                </div>
                <div>
                  <Sparkles size={20} className="mx-auto text-secondary mb-1" />
                  <div className="text-lg font-bold text-base-content">{streak * 10}</div>
                  <div className="text-xs text-base-content/60">XP Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Challenge */}
        <div className="card bg-base-200 border-2 border-primary/30 mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary">Today's Challenge</span>
                <span className={`badge ${typeColor} badge-sm`}>{todayQ.type}</span>
              </div>
              {completedToday && (
                <span className="badge badge-success gap-1"><CheckCircle size={12} /> Done</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-base-content mb-3">{todayQ.q}</h2>

            <div className="flex gap-2 flex-wrap">
              <button
                className="btn btn-primary btn-sm gap-1"
                onClick={() => onPractice(todayQ.q)}
              >
                <Play size={14} /> Practice with neev Coach
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? 'Hide Tip' : '💡 Show Tip'}
              </button>
              {!completedToday && (
                <button
                  className="btn btn-success btn-sm gap-1"
                  onClick={markComplete}
                >
                  <CheckCircle size={14} /> Mark Complete
                </button>
              )}
            </div>

            {showAnswer && (
              <div className="mt-3 p-3 bg-base-300 rounded-lg">
                <p className="text-sm text-base-content/70">💡 <strong>Approach Tip:</strong> {todayQ.tip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base-content/70 flex items-center gap-2">
            <Clock size={16} /> Coming Up
          </h3>
          <div className="card bg-base-200 opacity-70">
            <div className="card-body p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-ghost badge-sm">Tomorrow</span>
                <span className="badge badge-ghost badge-xs">{tomorrowQ.type}</span>
              </div>
              <p className="text-sm text-base-content/70">{tomorrowQ.q}</p>
            </div>
          </div>
          <div className="card bg-base-200 opacity-50">
            <div className="card-body p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-ghost badge-sm">Yesterday</span>
                <span className="badge badge-ghost badge-xs">{yesterdayQ.type}</span>
              </div>
              <p className="text-sm text-base-content/70">{yesterdayQ.q}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
