import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy, Flame, Medal, Target, TrendingUp, Users, Star,
  Crown, Zap, Award, BookOpen, Brain, BarChart3, ArrowLeft,
  Lock, ChevronRight, Calendar, Clock, CheckCircle2, Sparkles
} from 'lucide-react';
import { getJSON, setJSON } from '../utils/localStorage';

// ═══════ TYPES ═══════

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'practice' | 'streak' | 'mastery' | 'social';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  sessions: number;
  streak: number;
  avgScore: number;
  isYou: boolean;
  badges: number;
  school?: string;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  enrolled: number;
  completedBy: number;
  endsIn: string;
  daysLeft: number;
  type: 'guesstimate' | 'behavioral' | 'case' | 'speed' | 'domain';
  reward: string;
}

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  icon: string;
}

interface CommunityHubProps {
  onBack: () => void;
  onStartInterview?: () => void;
  onNavigateToQBank?: () => void;
}

// ═══════ SIMULATED DATA GENERATORS ═══════

const INDIAN_NAMES = [
  'Riya S.', 'Arjun M.', 'Sneha K.', 'Vikram P.', 'Ananya R.',
  'Rahul D.', 'Priya T.', 'Karthik N.', 'Meera V.', 'Aditya G.',
  'Divya L.', 'Rohan B.', 'Ishita J.', 'Siddharth C.', 'Kavya H.',
  'Nikhil W.', 'Pooja A.', 'Varun F.', 'Tanvi S.', 'Harsh M.',
  'Shruti P.', 'Aman K.', 'Neha R.', 'Rajat B.', 'Simran D.',
  'Mohit G.', 'Sakshi T.', 'Kunal J.', 'Ankita V.', 'Piyush L.'
];

const SCHOOLS = ['IIM A', 'IIM B', 'IIM C', 'ISB', 'XLRI', 'SP Jain', 'MDI', 'FMS Delhi', 'Great Lakes', 'NMIMS'];
const AVATARS = ['🧑‍💼', '👩‍💼', '🧑‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🧑‍🏫', '👩‍🏫', '🧑‍🔬', '👩‍🔬'];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getWeekSeed(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return now.getFullYear() * 100 + weekNum;
}

function generateLeaderboard(yourName: string, yourScore: number, yourSessions: number, yourStreak: number): LeaderboardEntry[] {
  const rand = seededRandom(getWeekSeed());
  const entries: LeaderboardEntry[] = [];
  const usedNames = new Set<string>();

  // Generate 29 simulated players
  for (let i = 0; i < 29; i++) {
    let name: string;
    do {
      name = INDIAN_NAMES[Math.floor(rand() * INDIAN_NAMES.length)];
    } while (usedNames.has(name));
    usedNames.add(name);

    const sessions = Math.floor(rand() * 15) + 1;
    const streak = Math.floor(rand() * 21);
    const avgScore = Math.round((rand() * 4 + 5.5) * 10) / 10; // 5.5 - 9.5
    const badges = Math.floor(rand() * 8);
    const school = SCHOOLS[Math.floor(rand() * SCHOOLS.length)];
    const avatar = AVATARS[Math.floor(rand() * AVATARS.length)];

    entries.push({ rank: 0, name, avatar, sessions, streak, avgScore, isYou: false, badges, school });
  }

  // Add real user
  entries.push({
    rank: 0,
    name: yourName || 'You',
    avatar: '⭐',
    sessions: yourSessions,
    streak: yourStreak,
    avgScore: yourScore,
    isYou: true,
    badges: 0, // will be computed
    school: localStorage.getItem('neevv_target_school') || undefined,
  });

  // Sort by composite score: 40% avg score + 30% sessions + 30% streak
  entries.sort((a, b) => {
    const scoreA = (a.avgScore / 10) * 40 + (Math.min(a.sessions, 15) / 15) * 30 + (Math.min(a.streak, 21) / 21) * 30;
    const scoreB = (b.avgScore / 10) * 40 + (Math.min(b.sessions, 15) / 15) * 30 + (Math.min(b.streak, 21) / 21) * 30;
    return scoreB - scoreA;
  });

  entries.forEach((e, i) => { e.rank = i + 1; });
  return entries;
}

function generateWeeklyChallenges(): WeeklyChallenge[] {
  const rand = seededRandom(getWeekSeed());
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const allChallenges: Omit<WeeklyChallenge, 'enrolled' | 'completedBy' | 'endsIn' | 'daysLeft'>[] = [
    { id: 'c1', title: 'Crack the Guesstimate', description: 'Complete a guesstimate with step-by-step math. Score 7+ on Logic.', icon: '🧮', type: 'guesstimate', reward: '🏅 Guesstimate Guru badge' },
    { id: 'c2', title: 'STAR Method Master', description: 'Answer 3 behavioral questions using perfect STAR framework.', icon: '⭐', type: 'behavioral', reward: '🏅 STAR Pro badge' },
    { id: 'c3', title: 'Case Cracker', description: 'Complete a case study with structured framework + clear recommendation.', icon: '📊', type: 'case', reward: '🏅 Case Ace badge' },
    { id: 'c4', title: 'Speed Round', description: 'Complete a full 5-question mock in under 15 minutes.', icon: '⚡', type: 'speed', reward: '🏅 Speed Demon badge' },
    { id: 'c5', title: 'Domain Deep Dive', description: 'Score 8+ in any domain-specific mock interview (Finance, Analytics, etc.)', icon: '🎯', type: 'domain', reward: '🏅 Domain Expert badge' },
    { id: 'c6', title: 'Perfect 10', description: 'Get a 10/10 in any single scorecard category.', icon: '💯', type: 'behavioral', reward: '🏅 Perfection badge' },
    { id: 'c7', title: 'B-School Vocab Blitz', description: 'Use 10+ B-school terms (ROI, stakeholder, etc.) in a single interview.', icon: '📚', type: 'behavioral', reward: '🏅 Vocab Champion badge' },
    { id: 'c8', title: 'Finance Fundamentals', description: 'Answer 5 Finance domain questions correctly. DCF, WACC, and more.', icon: '💰', type: 'domain', reward: '🏅 Finance Guru badge' },
  ];

  // Pick 2 challenges per week (deterministic based on week)
  const idx1 = Math.floor(rand() * allChallenges.length);
  let idx2 = Math.floor(rand() * allChallenges.length);
  if (idx2 === idx1) idx2 = (idx2 + 1) % allChallenges.length;

  return [allChallenges[idx1], allChallenges[idx2]].map(c => ({
    ...c,
    enrolled: Math.floor(rand() * 120) + 30,
    completedBy: Math.floor(rand() * 40) + 5,
    endsIn: daysLeft === 0 ? 'Ends today!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`,
    daysLeft,
  }));
}

function generateActivityFeed(): ActivityItem[] {
  const rand = seededRandom(getWeekSeed() + new Date().getDate());
  const activities: ActivityItem[] = [];
  const templates = [
    { text: (n: string) => `${n} just completed an ISB mock interview 🎓`, icon: '🎤' },
    { text: (n: string) => `${n} earned the "STAR Pro" badge ⭐`, icon: '🏅' },
    { text: (n: string) => `${n}'s streak hit ${Math.floor(rand() * 15) + 5} days 🔥`, icon: '🔥' },
    { text: (n: string) => `${n} scored 9.2 on a Finance domain mock 💰`, icon: '📊' },
    { text: (n: string) => `${n} cracked this week's guesstimate challenge 🧮`, icon: '🎯' },
    { text: (_: string) => `${Math.floor(rand() * 8) + 3} students completed mocks today`, icon: '📈' },
    { text: (n: string) => `${n} joined the "Domain Deep Dive" challenge`, icon: '🚀' },
    { text: (n: string) => `${n} unlocked "First Mock" badge 🎉`, icon: '🏆' },
    { text: (n: string) => `${n} scored a Perfect 10 in Communication!`, icon: '💯' },
    { text: (n: string) => `${n} completed 5 sessions this week`, icon: '⚡' },
  ];

  const times = ['2 min ago', '8 min ago', '23 min ago', '1 hr ago', '2 hrs ago', '3 hrs ago', '5 hrs ago', '8 hrs ago', 'Yesterday', 'Yesterday'];

  for (let i = 0; i < 10; i++) {
    const name = INDIAN_NAMES[Math.floor(rand() * INDIAN_NAMES.length)];
    const tmpl = templates[i % templates.length];
    activities.push({
      id: `act-${i}`,
      text: tmpl.text(name),
      time: times[i],
      icon: tmpl.icon,
    });
  }

  return activities;
}

// ═══════ BADGES SYSTEM ═══════

function computeBadges(): Badge[] {
  const sessions = getJSON<any[]>('neevv_progress', []);
  const completedSessions = sessions.filter((s: any) => !s.partial);
  const totalSessions = completedSessions.length;
  const bestScore = totalSessions > 0 ? Math.max(...completedSessions.map((s: any) => s.overallScore || 0)) : 0;
  const streak = computeLocalStreak(sessions);
  const mbaSessions = completedSessions.filter((s: any) => s.type === 'mba').length;
  const techSessions = completedSessions.filter((s: any) => s.type === 'tech').length;

  const badges: Badge[] = [
    {
      id: 'first-mock',
      name: 'First Mock',
      icon: '🎤',
      description: 'Complete your first mock interview',
      condition: '1 session completed',
      unlocked: totalSessions >= 1,
      category: 'practice',
    },
    {
      id: 'triple-threat',
      name: 'Triple Threat',
      icon: '🎯',
      description: 'Complete 3 mock interviews',
      condition: '3 sessions',
      unlocked: totalSessions >= 3,
      category: 'practice',
    },
    {
      id: 'marathon-runner',
      name: 'Marathon Runner',
      icon: '🏃',
      description: 'Complete 10 mock interviews',
      condition: '10 sessions',
      unlocked: totalSessions >= 10,
      category: 'practice',
    },
    {
      id: '3-day-streak',
      name: 'On Fire',
      icon: '🔥',
      description: 'Maintain a 3-day practice streak',
      condition: '3-day streak',
      unlocked: streak >= 3,
      category: 'streak',
    },
    {
      id: '7-day-streak',
      name: 'Week Warrior',
      icon: '⚡',
      description: 'Maintain a 7-day practice streak',
      condition: '7-day streak',
      unlocked: streak >= 7,
      category: 'streak',
    },
    {
      id: '21-day-streak',
      name: 'Habit Builder',
      icon: '💎',
      description: '21 days straight — it\'s a habit now',
      condition: '21-day streak',
      unlocked: streak >= 21,
      category: 'streak',
    },
    {
      id: 'score-8',
      name: 'High Scorer',
      icon: '🌟',
      description: 'Score 8/10 or higher overall',
      condition: 'Score ≥ 8',
      unlocked: bestScore >= 8,
      category: 'mastery',
    },
    {
      id: 'perfect-10',
      name: 'Perfect 10',
      icon: '💯',
      description: 'Score a perfect 10/10 overall',
      condition: 'Score = 10',
      unlocked: bestScore >= 10,
      category: 'mastery',
    },
    {
      id: 'mba-specialist',
      name: 'MBA Specialist',
      icon: '🎓',
      description: 'Complete 5 MBA interviews',
      condition: '5 MBA sessions',
      unlocked: mbaSessions >= 5,
      category: 'mastery',
    },
    {
      id: 'tech-specialist',
      name: 'Tech Specialist',
      icon: '💻',
      description: 'Complete 5 Tech interviews',
      condition: '5 Tech sessions',
      unlocked: techSessions >= 5,
      category: 'mastery',
    },
    {
      id: 'dual-threat',
      name: 'Dual Threat',
      icon: '🦾',
      description: 'Complete both MBA and Tech interviews',
      condition: 'MBA + Tech done',
      unlocked: mbaSessions >= 1 && techSessions >= 1,
      category: 'mastery',
    },
    {
      id: 'early-bird',
      name: 'Early Bird',
      icon: '🐦',
      description: 'One of the first to join neevv Prep',
      condition: 'Early adopter',
      unlocked: true, // Everyone gets this for now
      category: 'social',
    },
  ];

  return badges;
}

function computeLocalStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  const uniqueDays = new Set(sessions.map((s: any) => s.date));
  let streak = 0;
  const today = new Date();
  let checkingToday = true;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (uniqueDays.has(key)) {
      streak++;
      checkingToday = false;
    } else {
      if (checkingToday) continue;
      break;
    }
  }
  return streak;
}

// ═══════ COMPONENT ═══════

export const CommunityHub: React.FC<CommunityHubProps> = ({ onBack, onStartInterview, onNavigateToQBank }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges' | 'challenges' | 'feed'>('leaderboard');
  const [visibility, setVisibility] = useState<'anonymous' | 'named'>(() => {
    return (localStorage.getItem('neevv_community_visibility') as 'anonymous' | 'named') || 'anonymous';
  });
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(() => {
    const saved = getJSON<string[]>('neevv_joined_challenges', []);
    return new Set(saved);
  });

  // Compute real user stats
  const sessions = useMemo(() => getJSON<any[]>('neevv_progress', []), []);
  const completedSessions = useMemo(() => sessions.filter((s: any) => !s.partial), [sessions]);
  const yourStats = useMemo(() => {
    const total = completedSessions.length;
    const avg = total > 0 ? Math.round((completedSessions.reduce((s: number, r: any) => s + (r.overallScore || 0), 0) / total) * 10) / 10 : 0;
    const streak = computeLocalStreak(sessions);
    return { sessions: total, avgScore: avg, streak };
  }, [completedSessions, sessions]);

  const userName = useMemo(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('neevv_auth') || '{}');
      return auth.name || 'You';
    } catch { return 'You'; }
  }, []);

  const leaderboard = useMemo(
    () => generateLeaderboard(userName, yourStats.avgScore, yourStats.sessions, yourStats.streak),
    [userName, yourStats]
  );

  const yourRank = useMemo(() => leaderboard.find(e => e.isYou)?.rank || 0, [leaderboard]);

  const challenges = useMemo(() => generateWeeklyChallenges(), []);
  const activityFeed = useMemo(() => generateActivityFeed(), []);
  const badges = useMemo(() => computeBadges(), []);
  const unlockedBadges = useMemo(() => badges.filter(b => b.unlocked), [badges]);
  const lockedBadges = useMemo(() => badges.filter(b => !b.unlocked), [badges]);

  // Update user's badge count in leaderboard
  useEffect(() => {
    const entry = leaderboard.find(e => e.isYou);
    if (entry) entry.badges = unlockedBadges.length;
  }, [leaderboard, unlockedBadges]);

  const toggleVisibility = () => {
    const next = visibility === 'anonymous' ? 'named' : 'anonymous';
    setVisibility(next);
    localStorage.setItem('neevv_community_visibility', next);
  };

  const joinChallenge = (id: string) => {
    const updated = new Set(joinedChallenges);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setJoinedChallenges(updated);
    setJSON('neevv_joined_challenges', Array.from(updated));
  };

  const tabs = [
    { id: 'leaderboard' as const, label: '🏆 Leaderboard', icon: <Trophy size={16} /> },
    { id: 'badges' as const, label: '🏅 Badges', icon: <Award size={16} /> },
    { id: 'challenges' as const, label: '🎯 Challenges', icon: <Target size={16} /> },
    { id: 'feed' as const, label: '📢 Feed', icon: <Zap size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-base-100 pb-20 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button className="btn btn-ghost btn-sm btn-square" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
              <Users size={24} className="text-primary" />
              Community
            </h1>
            <p className="text-sm text-base-content/60 mt-0.5">Compete, earn badges, and level up together</p>
          </div>
          {/* Visibility toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/50">
              {visibility === 'named' ? '👤 Public' : '🕶️ Anonymous'}
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={visibility === 'named'}
              onChange={toggleVisibility}
              title="Toggle public visibility on leaderboard"
            />
          </div>
        </div>

        {/* Your Quick Stats Banner */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Your Rank', value: yourRank > 0 ? `#${yourRank}` : '—', icon: <Crown size={18} className="text-warning" />, color: 'bg-warning/10' },
            { label: 'Sessions', value: yourStats.sessions, icon: <Target size={18} className="text-primary" />, color: 'bg-primary/10' },
            { label: 'Streak', value: `${yourStats.streak}🔥`, icon: <Flame size={18} className="text-error" />, color: 'bg-error/10' },
            { label: 'Badges', value: `${unlockedBadges.length}/${badges.length}`, icon: <Award size={18} className="text-secondary" />, color: 'bg-secondary/10' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-3 text-center`}>
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className="text-lg font-bold text-base-content">{stat.value}</div>
              <div className="text-[10px] text-base-content/50 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'btn-outline btn-primary'
                  : 'btn-ghost text-base-content/60'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════ LEADERBOARD TAB ═══════ */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-3 mb-6">
              {[1, 0, 2].map(podiumIdx => {
                const entry = leaderboard[podiumIdx];
                if (!entry) return null;
                const heights = ['h-28', 'h-36', 'h-24'];
                const medals = ['🥈', '🥇', '🥉'];
                const bgColors = ['bg-base-200', 'bg-warning/10 border border-warning/30', 'bg-base-200'];
                return (
                  <div key={podiumIdx} className="flex flex-col items-center">
                    <span className="text-2xl mb-1">{entry.avatar}</span>
                    <span className={`text-xs font-semibold ${entry.isYou ? 'text-primary' : 'text-base-content'}`}>
                      {entry.isYou ? (visibility === 'named' ? entry.name : 'You ⭐') : entry.name}
                    </span>
                    <span className="text-[10px] text-base-content/50">{entry.avgScore}/10</span>
                    <div className={`${bgColors[podiumIdx]} ${heights[podiumIdx]} w-20 rounded-t-xl flex flex-col items-center justify-end pb-2 mt-1`}>
                      <span className="text-2xl">{medals[podiumIdx]}</span>
                      <span className="text-xs font-bold text-base-content">#{entry.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* This Week label */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-base-content/70 flex items-center gap-1">
                <Calendar size={14} /> This Week's Rankings
              </span>
              <span className="text-xs text-base-content/40">Updated weekly</span>
            </div>

            {/* Full Leaderboard */}
            <div className="bg-base-200/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold text-base-content/50 uppercase tracking-wider border-b border-base-300">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Sessions</div>
                <div className="col-span-1 text-center">🔥</div>
                <div className="col-span-2 text-center">🏅</div>
              </div>
              {leaderboard.slice(0, 20).map((entry) => (
                <div
                  key={entry.rank}
                  className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center transition-colors ${
                    entry.isYou
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-base-200 border-l-4 border-transparent'
                  }`}
                >
                  <div className="col-span-1 text-sm font-bold text-base-content/70">
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="text-lg">{entry.avatar}</span>
                    <div>
                      <div className={`text-sm font-medium ${entry.isYou ? 'text-primary font-bold' : 'text-base-content'}`}>
                        {entry.isYou ? (visibility === 'named' ? `${entry.name} ⭐` : 'You ⭐') : entry.name}
                      </div>
                      {entry.school && <div className="text-[10px] text-base-content/40">{entry.school}</div>}
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-bold ${entry.avgScore >= 8 ? 'text-success' : entry.avgScore >= 6 ? 'text-warning' : 'text-base-content'}`}>
                      {entry.avgScore}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-sm text-base-content/70">{entry.sessions}</div>
                  <div className="col-span-1 text-center text-sm">{entry.streak}</div>
                  <div className="col-span-2 text-center text-sm text-base-content/70">{entry.badges}</div>
                </div>
              ))}
            </div>

            {yourRank > 20 && (
              <div className="text-center py-3">
                <span className="text-sm text-base-content/50">... you're at </span>
                <span className="text-sm font-bold text-primary">#{yourRank}</span>
                <span className="text-sm text-base-content/50"> — keep practicing to climb! 💪</span>
              </div>
            )}
          </div>
        )}

        {/* ═══════ BADGES TAB ═══════ */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Unlocked */}
            <div>
              <h3 className="text-sm font-semibold text-base-content/70 mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                Unlocked ({unlockedBadges.length})
              </h3>
              {unlockedBadges.length === 0 ? (
                <div className="bg-base-200/50 rounded-xl p-6 text-center">
                  <Sparkles size={32} className="mx-auto mb-2 text-base-content/30" />
                  <p className="text-sm text-base-content/50">Complete your first mock interview to earn badges!</p>
                  {onStartInterview && (
                    <button className="btn btn-primary btn-sm mt-3" onClick={onStartInterview}>
                      Start Interview →
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {unlockedBadges.map(badge => (
                    <div key={badge.id} className="bg-base-200/50 border border-success/20 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                      <span className="text-3xl block mb-2">{badge.icon}</span>
                      <h4 className="text-sm font-bold text-base-content">{badge.name}</h4>
                      <p className="text-[10px] text-base-content/50 mt-1">{badge.description}</p>
                      <span className="badge badge-success badge-xs mt-2">✓ Earned</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Locked */}
            <div>
              <h3 className="text-sm font-semibold text-base-content/70 mb-3 flex items-center gap-2">
                <Lock size={16} className="text-base-content/30" />
                Locked ({lockedBadges.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {lockedBadges.map(badge => (
                  <div key={badge.id} className="bg-base-200/30 rounded-xl p-4 text-center opacity-60">
                    <span className="text-3xl block mb-2 grayscale">{badge.icon}</span>
                    <h4 className="text-sm font-medium text-base-content/70">{badge.name}</h4>
                    <p className="text-[10px] text-base-content/40 mt-1">{badge.condition}</p>
                    <span className="badge badge-ghost badge-xs mt-2">🔒 Locked</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ CHALLENGES TAB ═══════ */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-base-content/70">This Week's Challenges</h3>
              <span className="text-xs text-base-content/40 flex items-center gap-1">
                <Clock size={12} /> Resets every Monday
              </span>
            </div>

            {challenges.map(challenge => {
              const isJoined = joinedChallenges.has(challenge.id);
              return (
                <div key={challenge.id} className={`rounded-xl p-5 border transition-all ${
                  isJoined ? 'bg-primary/5 border-primary/20' : 'bg-base-200/50 border-base-300 hover:border-primary/30'
                }`}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{challenge.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-base-content">{challenge.title}</h4>
                      <p className="text-sm text-base-content/60 mt-1">{challenge.description}</p>

                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-base-content/50 flex items-center gap-1">
                          <Users size={12} /> {challenge.enrolled + (isJoined ? 1 : 0)} enrolled
                        </span>
                        <span className="text-xs text-base-content/50 flex items-center gap-1">
                          <CheckCircle2 size={12} /> {challenge.completedBy} completed
                        </span>
                        <span className={`text-xs font-medium ${challenge.daysLeft <= 1 ? 'text-error' : 'text-base-content/50'}`}>
                          ⏰ {challenge.endsIn}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-success font-medium">🎁 Reward: {challenge.reward}</span>
                        <button
                          className={`btn btn-sm ${isJoined ? 'btn-outline btn-primary' : 'btn-primary'}`}
                          onClick={() => joinChallenge(challenge.id)}
                        >
                          {isJoined ? '✓ Joined' : 'Join Challenge'}
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="w-full bg-base-300 rounded-full h-1.5">
                          <div
                            className="bg-primary rounded-full h-1.5 transition-all"
                            style={{ width: `${Math.round((challenge.completedBy / challenge.enrolled) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-base-content/40 mt-0.5 block">
                          {Math.round((challenge.completedBy / challenge.enrolled) * 100)}% completion rate
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA */}
            <div className="bg-base-200/30 rounded-xl p-4 text-center border border-dashed border-base-300">
              <p className="text-sm text-base-content/50">Complete a challenge by practicing the relevant skill</p>
              <div className="flex gap-2 justify-center mt-3">
                {onStartInterview && (
                  <button className="btn btn-primary btn-sm" onClick={onStartInterview}>
                    Start Mock Interview
                  </button>
                )}
                {onNavigateToQBank && (
                  <button className="btn btn-outline btn-sm" onClick={onNavigateToQBank}>
                    Browse Questions
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ ACTIVITY FEED TAB ═══════ */}
        {activeTab === 'feed' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-base-content/70">Live Activity</h3>
              <span className="badge badge-success badge-sm gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live
              </span>
            </div>

            {activityFeed.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-3 px-4 bg-base-200/30 rounded-xl hover:bg-base-200/50 transition-colors">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-base-content truncate">{item.text}</p>
                </div>
                <span className="text-xs text-base-content/40 flex-shrink-0">{item.time}</span>
              </div>
            ))}

            <div className="text-center py-4">
              <p className="text-xs text-base-content/40">Activity updates every time students practice</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
