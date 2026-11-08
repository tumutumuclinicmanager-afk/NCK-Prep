import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  BrainCircuit, 
  Activity, 
  Target, 
  Flame, 
  Award, 
  Star, 
  X,
  Zap,
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck,
  BarChart2,
  ArrowRight,
  Library,
  HeartPulse,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { NURSING_UNITS } from '@/data/quizQuestions';

import { 
  fetchBadgeConfigs, 
  calculateUserStreak, 
  evaluateUserBadges, 
  BadgeConfig, 
  UserBadgeState, 
  ICON_MAP 
} from '@/lib/badges';
import { useTrialCountdown } from '@/lib/trialManager';
import { NckPreparationRoadmap } from '@/components/NckPreparationRoadmap';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { trial } = useTrialCountdown(auth.currentUser);
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    averageScore: 0,
    streak: 0,
    xp: 0,
    overallMastery: 0
  });
  const [history, setHistory] = useState<any[]>([]);
  const [evaluatedBadges, setEvaluatedBadges] = useState<UserBadgeState[]>([]);



  const fetchUserData = async () => {
    try {
      const configs = await fetchBadgeConfigs();

      if (!auth.currentUser) return;

      let data: any[] = [];
      try {
        const historyRef = collection(db, 'examHistory');
        const q = query(historyRef, where('user', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(q);
        data = querySnapshot.docs.map(doc => doc.data());
      } catch (fsErr) {
        // Graceful fallback on permission errors
      }

      if (data.length === 0) {
        const local = localStorage.getItem('nckprep_local_history');
        if (local) {
          try { data = JSON.parse(local); } catch(e) {}
        }
      }
      
      setHistory(data);
      
      const { streak: realStreak } = calculateUserStreak(data);
      
      const questionsCount = data.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
      const avgScore = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + (curr.score || 0), 0) / data.length) : 0;
      const userXp = questionsCount * 10 + data.length * 50;

      // Compute overall mastery
      let totalAttempted = 0;
      let totalCorrect = 0;
      data.forEach(item => {
        if (item.unitBreakdown) {
          Object.values(item.unitBreakdown).forEach((u: any) => {
            totalAttempted += u.total || 0;
            totalCorrect += u.correct || 0;
          });
        } else {
          const tot = item.totalQuestions || 0;
          const corr = item.correctQuestions ?? Math.round(((item.score || 0) / 100) * tot);
          totalAttempted += tot;
          totalCorrect += corr;
        }
      });
      const overallMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : avgScore;

      const updatedStats = {
        questionsAnswered: questionsCount,
        averageScore: avgScore,
        streak: realStreak,
        xp: userXp,
        overallMastery
      };

      setStats(updatedStats);

      const evaluated = evaluateUserBadges(configs, updatedStats, data);
      setEvaluatedBadges(evaluated);

    } catch (error) {
      // Graceful error handling
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Exam Bank Snapshot categories
  const examBankCategories = [
    {
      id: 'nck-mock-1',
      title: 'NCK Mock 1 - October 2025',
      badge: 'Latest Uploaded Mock',
      categoryParam: 'nck',
      tagline: 'Full 120-Question Comprehensive Mock Exam',
      description: 'Senior clinical educator mock exam with detailed rationales, NCK standards, and immediate performance analytics.',
      modules: ['Medical-Surgical', 'Midwifery', 'Community Health', 'Pharmacology'],
      count: '120 Questions',
      bundleCount: 'Mock Exam 1',
      icon: Award,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderAccent: 'hover:border-blue-400 ring-2 ring-blue-500/20',
      badgeStyle: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
      btnStyle: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
    },
    {
      id: 'nck-paper-2-batch-8',
      title: 'NCK Paper 2 Batch 8',
      badge: 'Uploaded Question Bank',
      categoryParam: 'nck',
      tagline: 'Batch 8 Questions & Answers Rationales',
      description: 'Newly uploaded NCK Paper 2 batch featuring high-yield board review questions and clinical case rationales.',
      modules: ['Paper 2 Questions', 'Answer Key', 'Clinical Rationales'],
      count: '50 Questions',
      bundleCount: 'Batch 8',
      icon: ShieldCheck,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-100',
      borderAccent: 'hover:border-indigo-400 ring-2 ring-indigo-500/20',
      badgeStyle: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold',
      btnStyle: 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600'
    },
    {
      id: 'nck-fqe',
      title: 'NCK Registered Nurse (RN) FQE',
      badge: 'Final Qualifying Examination',
      categoryParam: 'nck',
      tagline: 'Standard NCK Board Licensure Prep',
      description: 'Official Kenya Nursing Council licensure blueprint covering professional practice, nursing ethics, and med-surg.',
      modules: ['Professional Practice', 'Nursing Ethics', 'Jurisprudence', 'Med-Surg'],
      count: '250+ Questions',
      bundleCount: '3 Bundles',
      icon: BrainCircuit,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      borderAccent: 'hover:border-emerald-300',
      badgeStyle: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      btnStyle: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border-emerald-200'
    },
    {
      id: 'nck-community-midwifery',
      title: 'Community Health & Midwifery',
      badge: 'Specialized Nursing Units',
      categoryParam: 'nck',
      tagline: 'Maternal, Newborn & Community Nursing',
      description: 'Comprehensive obstetric nursing, midwifery care protocols, and public health community nursing protocols.',
      modules: ['Obstetric Nursing', 'Maternal Health', 'Community Health', 'Paediatrics'],
      count: '180+ Questions',
      bundleCount: '2 Bundles',
      icon: BookOpen,
      color: 'text-teal-700',
      bgColor: 'bg-teal-100',
      borderAccent: 'hover:border-teal-300',
      badgeStyle: 'bg-teal-100 text-teal-900 border-teal-200',
      btnStyle: 'bg-teal-50 text-teal-800 hover:bg-teal-600 hover:text-white border-teal-200'
    }
  ];

  const unlockedBadgesCount = evaluatedBadges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-3 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner - Compact Bar */}
      <div className="bg-slate-900 text-white rounded-xl px-3.5 py-1.5 shadow-2xs border border-slate-800 flex items-center justify-between gap-2.5">
        <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
          Welcome back to your NCK Licensure Command Center
        </h1>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/generator')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 h-6.5 rounded-lg shadow-2xs flex items-center gap-1"
          >
            <Zap className="w-3 h-3 fill-white" />
            <span className="hidden sm:inline">Quick Quiz</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/performance')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] px-2.5 h-6.5 rounded-lg border border-white/20 flex items-center gap-1"
          >
            <BarChart2 className="w-3 h-3 text-blue-300" />
            <span className="hidden sm:inline">Performance</span>
          </Button>
        </div>
      </div>

      {/* 14-Day Free Trial Banner / Status - Ultra Slim */}
      {!trial.isPaid && (
        trial.isExpired ? (
          <div className="bg-rose-950/80 border border-rose-600/50 rounded-xl px-3.5 py-1.5 text-white shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-bold text-white">14-Day Free Trial Ended</span>
                <span className="text-[10px] text-rose-300 hidden sm:inline truncate">Upgrade to unlock all exam repositories</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] px-2.5 h-6.5 rounded-lg shadow-2xs shrink-0"
            >
              Upgrade Now
            </Button>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-300/80 rounded-xl px-3.5 py-1.5 text-slate-900 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900">14-Day Free Trial Active</span>
              <span className="text-[11px] text-slate-600 hidden sm:inline">
                • <span className="font-mono font-bold text-slate-900">{trial.daysRemaining}d {trial.hoursRemaining}h {trial.minutesRemaining}m</span> remaining
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 h-6 rounded-lg shrink-0 shadow-2xs"
            >
              Upgrade
            </Button>
          </div>
        )
      )}

      {/* Top Summary Metrics Row - Ultra Compact Micro Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { title: 'Questions Attempted', value: stats.questionsAnswered.toString(), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Average Score', value: `${stats.averageScore}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Badges Attained', value: `${unlockedBadgesCount} / ${evaluatedBadges.length}`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Study Streak', value: `${stats.streak} Days`, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2.5 shadow-2xs hover:border-blue-200 transition-colors">
            <div className={`w-7 h-7 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <stat.icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-slate-900 tracking-tight leading-none">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight truncate mt-0.5">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Exam Bank Snapshot - Direct Navigation to Uploaded Exams & HESI, ATI TEAS, NCK FQE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Uploaded & Live Exam Banks
              </span>
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                • Instant Access to Lecturer Uploads & Mocks
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Select Your Exam Category
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Access your newly uploaded NCK Mock 1, Paper 2 Batch 8, HESI, ATI TEAS, NCK FQE, and Examplify question banks instantly.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/exams')}
            className="text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 gap-1.5 shrink-0 self-start sm:self-center"
          >
            <Library className="w-3.5 h-3.5 text-blue-600" />
            <span>Explore All 1,300+ Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* 4 Cards Grid: HESI, ATI TEAS, NCK FQE, Examplify */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {examBankCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/dashboard/exams?category=${cat.categoryParam}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/dashboard/exams?category=${cat.categoryParam}`);
                  }
                }}
                className={`group relative bg-slate-50/60 hover:bg-white rounded-2xl p-5 border border-slate-200 transition-all duration-200 flex flex-col justify-between text-left cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${cat.borderAccent}`}
              >
                <div className="space-y-3.5">
                  {/* Card Header: Icon & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-11 h-11 rounded-xl ${cat.bgColor} ${cat.color} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${cat.badgeStyle}`}>
                      {cat.count}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {cat.badge}
                    </span>
                    <h3 className="text-base md:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {cat.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>

                  {/* Modules Pills */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {cat.modules.map((mod, mIdx) => (
                      <span
                        key={mIdx}
                        className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200/90 text-slate-600 group-hover:border-slate-300 transition-colors"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Action Button */}
                <div className="pt-4 mt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400 text-[11px] font-semibold">{cat.bundleCount}</span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${cat.btnStyle}`}>
                    <span>Launch Exams</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Bookshelf & Google Search Quick Launcher Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 rounded-2xl border border-amber-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-md">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Clinical Bookshelf & Google Search Desk</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Explore authentic Saunders, Davis's Drug Guide, and Brunner nursing textbooks on our interactive wooden bookshelf, with integrated Google Search for instant NCK Licensure rationales.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/dashboard/library')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shrink-0 shadow-sm transition-all"
        >
          Open Bookshelf
        </Button>
      </div>
    </div>
  );
}
