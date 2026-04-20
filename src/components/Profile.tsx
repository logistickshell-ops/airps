import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Check, X, Trophy, Star, Shield, Zap, Award, Gamepad2, Clock, Coins, RotateCcw } from 'lucide-react';
import { PlayerProfile, PlayerStats, getRank, getLevel } from '../types';

interface ProfileProps {
  profile: PlayerProfile;
  stats: PlayerStats;
  onUpdate: (updates: Partial<PlayerProfile>) => void;
  onReset: () => void;
}

const ACHIEVEMENTS = [
  { id: 'first_win', title: 'Первая кровь', desc: 'Выиграй первый матч', icon: Trophy, check: (s: PlayerStats) => s.totalWins >= 1 },
  { id: 'five_wins', title: 'Начало пути', desc: 'Выиграй 5 матчей', icon: Star, check: (s: PlayerStats) => s.totalWins >= 5 },
  { id: 'ten_wins', title: 'Опытный боец', desc: 'Выиграй 10 матчей', icon: Shield, check: (s: PlayerStats) => s.totalWins >= 10 },
  { id: 'streak_3', title: 'На волне', desc: 'Серия из 3 побед', icon: Zap, check: (s: PlayerStats) => s.bestStreak >= 3 },
  { id: 'streak_5', title: 'Неудержимый', desc: 'Серия из 5 побед', icon: Zap, check: (s: PlayerStats) => s.bestStreak >= 5 },
  { id: 'twenty_matches', title: 'Марафонец', desc: 'Сыграй 20 матчей', icon: Gamepad2, check: (s: PlayerStats) => s.totalMatches >= 20 },
  { id: 'fifty_matches', title: 'Ветеран', desc: 'Сыграй 50 матчей', icon: Award, check: (s: PlayerStats) => s.totalMatches >= 50 },
  { id: 'balanced', title: 'Универсал', desc: 'Используй все карты поровну', icon: Star, check: (s: PlayerStats) => {
    const counts = [s.choiceCounts.rock, s.choiceCounts.paper, s.choiceCounts.scissors];
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    return min >= 5 && (max - min) <= 3;
  }},
];

export default function Profile({ profile, stats, onUpdate, onReset }: ProfileProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const rank = getRank(stats.totalWins);
  const level = getLevel(profile.xp);

  const xpInLevel = profile.xp % 100;
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(stats));

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdate({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const handleCancelName = () => {
    setNameInput(profile.name);
    setEditingName(false);
  };

  const avatarColors = [
    'from-blue-500 to-indigo-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-green-600',
    'from-amber-500 to-orange-600',
    'from-purple-500 to-violet-600',
    'from-cyan-500 to-teal-600',
  ];
  const avatarColor = avatarColors[profile.avatarSeed % avatarColors.length];

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-4 py-4 sm:py-6 overflow-y-auto">
      {/* Profile Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2 mb-4">
          <User size={22} className="text-cyan-400" />
          Профиль
        </h2>

        {/* Avatar + Info */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-3xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <span className="text-2xl sm:text-3xl font-black text-white">{profile.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm font-bold text-white outline-none focus:border-indigo-500 w-full"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  />
                  <button onClick={handleSaveName} className="p-1.5 bg-emerald-500 rounded-lg flex-shrink-0">
                    <Check size={14} className="text-white" />
                  </button>
                  <button onClick={handleCancelName} className="p-1.5 bg-slate-600 rounded-lg flex-shrink-0">
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-lg sm:text-xl font-black truncate">{profile.name}</span>
                  <button onClick={() => setEditingName(true)} className="p-1 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0">
                    <Edit2 size={12} className="text-slate-400" />
                  </button>
                </div>
              )}
              <div className={`text-sm font-bold ${rank.color}`}>{rank.name}</div>
            </div>
          </div>

          {/* Level bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-400">Уровень {level}</span>
              <span className="text-[10px] text-slate-500">{xpInLevel}/100 XP</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                animate={{ width: `${(xpInLevel / 100) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-2 bg-slate-700/30 rounded-xl px-3 py-2">
            <Coins size={16} className="text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{profile.coins} монет</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-700/50">
          <div className="text-xl font-black text-blue-400">{stats.totalMatches}</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Матчей</div>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-700/50">
          <div className="text-xl font-black text-emerald-400">{stats.totalWins}</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Побед</div>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-700/50">
          <div className="text-xl font-black text-orange-400">{stats.bestStreak}</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Серия</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Award size={14} />
          Достижения
          <span className="text-slate-600 ml-auto">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((ach, idx) => {
            const unlocked = ach.check(stats);
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className={`
                  rounded-xl p-3 border transition-all
                  ${unlocked
                    ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20'
                    : 'bg-slate-800/30 border-slate-700/30 opacity-50'}
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    unlocked ? 'bg-yellow-500/20' : 'bg-slate-700/50'
                  }`}>
                    <ach.icon size={14} className={unlocked ? 'text-yellow-400' : 'text-slate-500'} />
                  </div>
                  <span className={`text-xs font-bold truncate ${unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                    {ach.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">{ach.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Account Info */}
      <div className="mb-6 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock size={14} /> Информация
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Дата регистрации</span>
            <span className="text-slate-300 font-bold">{new Date(profile.joinDate).toLocaleDateString('ru-RU')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Уровень</span>
            <span className="text-indigo-400 font-bold">{level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ранг</span>
            <span className={`font-bold ${rank.color}`}>{rank.name}</span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mb-8">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 bg-slate-800/50 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/30 rounded-2xl text-sm font-bold text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Сбросить прогресс
          </button>
        ) : (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
            <p className="text-sm text-rose-300 font-bold mb-3">Весь прогресс будет потерян. Уверен?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { onReset(); setShowResetConfirm(false); }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Да, сбросить
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
