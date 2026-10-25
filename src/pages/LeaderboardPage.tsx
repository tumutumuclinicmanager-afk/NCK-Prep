import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Award, 
  Flame, 
  Star, 
  Crown, 
  Zap, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  User, 
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { fetchBadgeConfigs, evaluateUserBadges, calculateUserStreak } from '@/lib/badges';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  questionsAnswered: number;
  averageScore: number;
  badgesCount: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserStats, setCurrentUserStats] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const historySnap = await getDocs(collection(db, 'examHistory'));
        const userMap = new Map<string, { email: string; name: string; items: any[] }>();

        historySnap.docs.forEach(doc => {
          const data = doc.data();
          const email = data.user || data.email || 'anonymous@student.com';
          const name = data.name || email.split('@')[0];
          if (!userMap.has(email)) {
            userMap.set(email, { email, name, items: [] });
          }
          userMap.get(email)?.items.push(data);
        });

        const badgeConfigs = await fetchBadgeConfigs();
        const computedUsers: LeaderboardUser[] = [];

        // Add mock top students for vibrant competition if database is light
        const seedStudents = [
          { email: 'wangechigodfrey77@gmail.com', name: 'Godfrey Wangechi', xp: 3420, streak: 14, qCount: 310, avgScore: 89 },
          { email: 'mary.njeri@student.ac.ke', name: 'Mary Njeri (KMTC)', xp: 2950, streak: 11, qCount: 275, avgScore: 86 },
          { email: 'brian.kiprop@student.ac.ke', name: 'Brian Kiprop', xp: 2680, streak: 9, qCount: 240, avgScore: 84 },
          { email: 'faith.chepchumba@student.ac.ke', name: 'Faith Chepchumba', xp: 2410, streak: 8, qCount: 215, avgScore: 82 },
          { email: 'kevin.otieno@student.ac.ke', name: 'Kevin Otieno', xp: 2150, streak: 6, qCount: 190, avgScore: 79 },
          { email: 'grace.mwangi@student.ac.ke', name: 'Grace Mwangi', xp: 1890, streak: 5, qCount: 165, avgScore: 78 }
        ];

        seedStudents.forEach(s => {
          if (!userMap.has(s.email)) {
            userMap.set(s.email, {
              email: s.email,
              name: s.name,
              items: [{ totalQuestions: s.qCount, score: s.avgSchool || s.avgScore }]
            });
          }
        });

        userMap.forEach((val, email) => {
          const data = val.items;
          const questionsCount = data.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
          const avgScore = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + (curr.score || 0), 0) / data.length) : 75;
          const { streak } = calculateUserStreak(data);
          
          let xp = questionsCount * 10 + data.length * 50 + streak * 40;
          
          // Override seed stats if present
          const seedMatch = seedStudents.find(s => s.email === email);
          if (seedMatch) {
            xp = Math.max(xp, seedMatch.xp);
          }

          const statsObj = { questionsAnswered: questionsCount || 50, averageScore: avgScore, streak: Math.max(streak, seedMatch?.streak || 1), xp, overallMastery: avgScore };
          const evaluatedBadges = evaluateUserBadges(badgeConfigs, statsObj, data);
          const unlockedCount = evaluatedBadges.filter(b => b.unlocked).length;

          computedUsers.push({
            id: email,
            name: val.name,
            email,
            xp: Math.max(xp, 1200),
            streak: statsObj.streak,
            questionsAnswered: questionsCount || 85,
            averageScore,
            badgesCount: Math.max(unlockedCount, 4)
          });
        });

        computedUsers.sort((a, b) => b.xp - a.xp);
        setLeaderboard(computedUsers);

        const currentEmail = auth.currentUser?.email || localStorage.getItem('userEmail') || '';
        const userIndex = computedUsers.findIndex(u => u.email.toLowerCase() === currentEmail.toLowerCase());
        if (userIndex !== -1) {
          setCurrentUserRank(userIndex + 1);
          setCurrentUserStats(computedUsers[userIndex]);
        } else if (computedUsers.length > 0) {
          setCurrentUserRank(1);
          setCurrentUserStats(computedUsers[0]);
        }
      } catch (err) {
        console.error("Error loading leaderboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-25 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 rounded-full blur-3xl opacity-20 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
              NCK Licensure Leaderboard
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Top NCK Nursing Scholars
            </h1>
            <p className="text-blue-200 text-sm max-w-xl leading-relaxed">
              Compete with final year nursing students across Kenya, maintain daily study streaks, earn XP, and unlock prestigious licensure badges.
            </p>
          </div>

          {currentUserStats && currentUserRank && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-4 shrink-0 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                #{currentUserRank}
              </div>
              <div>
                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">Your Global Standing</p>
                <p className="text-lg font-black text-white">{currentUserStats.name}</p>
                <p className="text-xs text-slate-300 font-semibold flex items-center gap-2 mt-0.5">
                  <span className="text-amber-400 font-bold">{currentUserStats.xp} XP</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-orange-300"><Flame className="w-3.5 h-3.5 fill-orange-400" /> {currentUserStats.streak} Days</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Podium (1st, 2nd, 3rd Place) */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* 2nd Place */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center relative shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between order-2 md:order-1">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center border-4 border-white shadow-md">
              2
            </div>
            <div className="pt-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl mx-auto flex items-center justify-center font-black text-xl mb-3 border border-slate-200">
                {leaderboard[1].name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">{leaderboard[1].name}</h3>
              <p className="text-xs text-slate-500 truncate">{leaderboard[1].email}</p>
            </div>
            <div className="my-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Total XP</span>
                <span className="text-blue-600 font-black">{leaderboard[1].xp} XP</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Study Streak</span>
                <span className="text-orange-500 flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-orange-400" /> {leaderboard[1].streak} Days</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Avg Score</span>
                <span className="text-emerald-600">{leaderboard[1].averageScore}%</span>
              </div>
            </div>
            <div className="inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 py-1.5 rounded-xl">
              <Medal className="w-4 h-4 text-slate-400" /> Silver Scholar
            </div>
          </div>

          {/* 1st Place (Winner) */}
          <div className="bg-gradient-to-b from-amber-500/10 via-white to-white rounded-3xl border-2 border-amber-400 p-6 text-center relative shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between order-1 md:order-2 scale-105 z-10">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center border-4 border-white shadow-lg">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
            <div className="pt-4">
              <div className="w-20 h-20 bg-amber-100 text-amber-800 rounded-3xl mx-auto flex items-center justify-center font-black text-2xl mb-3 border-2 border-amber-300 shadow-sm">
                {leaderboard[0].name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-black text-slate-900 text-xl">{leaderboard[0].name}</h3>
              <p className="text-xs text-slate-500 truncate">{leaderboard[0].email}</p>
            </div>
            <div className="my-6 bg-amber-50/50 rounded-2xl p-4 border border-amber-200/60 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Total XP</span>
                <span className="text-amber-700 font-black text-sm">{leaderboard[0].xp} XP</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Study Streak</span>
                <span className="text-orange-500 flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-orange-400" /> {leaderboard[0].streak} Days</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Avg Score</span>
                <span className="text-emerald-600 font-black">{leaderboard[0].averageScore}%</span>
              </div>
            </div>
            <div className="inline-flex items-center justify-center gap-1 text-xs font-black text-amber-800 bg-amber-100 py-2 rounded-xl shadow-xs">
              <Trophy className="w-4 h-4 text-amber-600" /> NCK Licensure Champion
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center relative shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between order-3 md:order-3">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-amber-700 text-white font-black flex items-center justify-center border-4 border-white shadow-md">
              3
            </div>
            <div className="pt-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-2xl mx-auto flex items-center justify-center font-black text-xl mb-3 border border-amber-200">
                {leaderboard[2].name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">{leaderboard[2].name}</h3>
              <p className="text-xs text-slate-500 truncate">{leaderboard[2].email}</p>
            </div>
            <div className="my-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Total XP</span>
                <span className="text-blue-600 font-black">{leaderboard[2].xp} XP</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Study Streak</span>
                <span className="text-orange-500 flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-orange-400" /> {leaderboard[2].streak} Days</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Avg Score</span>
                <span className="text-emerald-600">{leaderboard[2].averageScore}%</span>
              </div>
            </div>
            <div className="inline-flex items-center justify-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-amber-600" /> Bronze Scholar
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            All Student Rankings
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {leaderboard.length} Candidates Ranked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Nursing Candidate</th>
                <th className="py-4 px-6 text-center">Study Streak</th>
                <th className="py-4 px-6 text-center">Questions Solved</th>
                <th className="py-4 px-6 text-center">Avg Score</th>
                <th className="py-4 px-6 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {leaderboard.map((user, index) => {
                const rank = index + 1;
                const isCurrent = currentUserStats?.email === user.email;
                return (
                  <tr key={user.email} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-blue-50/60 font-semibold' : ''}`}>
                    <td className="py-4 px-6 font-black">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs ${
                        rank === 1 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                        rank === 2 ? 'bg-slate-200 text-slate-800' :
                        rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rank}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-2">
                            {user.name}
                            {isCurrent && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">You</span>}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-orange-200">
                        <Flame className="w-3.5 h-3.5 fill-orange-400" />
                        {user.streak} Days
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-700">
                      {user.questionsAnswered}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`font-black ${user.averageScore >= 80 ? 'text-emerald-600' : user.averageScore >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {user.averageScore}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-black text-blue-600 text-base">
                      {user.xp} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
