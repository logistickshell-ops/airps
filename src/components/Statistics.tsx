import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, BarChart3, Clock, Award, Flame, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react';
import { PlayerStats, CHOICES, CHOICE_LABELS, getRank } from '../types';
import { useState } from 'react';

const CHOICE_COLORS: Record<string, string> = {
  rock: 'bg-rose-500',
  paper: 'bg-blue-500',
  scissors: 'bg-amber-500',
};

const CHOICE_BARS: Record<string, string> = {
  rock: 'bg-rose-500',
  paper: 'bg-blue-500',
  scissors: 'bg-amber-500',
};



interface StatisticsProps {
  stats: PlayerStats;
}

export default function Statistics({ stats }: StatisticsProps) {
  const [showHistory, setShowHistory] = useState(false);
  const rank = getRank(stats.totalWins);
  const winRate = stats.totalMatches > 0 ? Math.round((stats.totalWins / stats.totalMatches) * 100) : 0;
  const totalChoices = CHOICES.reduce((sum, c) => sum + stats.choiceCounts[c], 0);

  const statsCards = [
    { label: 'Матчей', value: stats.totalMatches, icon: Gamepad2, color: 'text-blue-400' },
    { label: 'Побед', value: stats.totalWins, icon: Trophy, color: 'text-emerald-400' },
    { label: 'Винрейт', value: `${winRate}%`, icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Лучшая серия', value: stats.bestStreak, icon: Flame, color: 'text-orange-400' },
  ];

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-4 py-4 sm:py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2 mb-1">
          <BarChart3 size={22} className="text-indigo-400" />
          Статистика
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${rank.color}`}>{rank.name}</span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-500">{stats.totalWins} побед</span>
        </div>
      </div>

      {/* Rank Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6 bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center gap-4"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
          stats.totalWins >= 100 ? 'from-rose-500 to-pink-600' :
          stats.totalWins >= 60 ? 'from-yellow-500 to-amber-600' :
          stats.totalWins >= 30 ? 'from-purple-500 to-violet-600' :
          stats.totalWins >= 15 ? 'from-blue-500 to-indigo-600' :
          stats.totalWins >= 5 ? 'from-emerald-500 to-green-600' :
          'from-slate-500 to-slate-600'
        }`}>
          <Award size={28} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Текущий ранг</div>
          <div className={`text-xl font-black ${rank.color}`}>{rank.name}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Винрейт</div>
          <div className="text-2xl font-black text-white">{winRate}%</div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statsCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className={card.color} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
            </div>
            <div className="text-2xl font-black tabular-nums">{card.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Match Results */}
      <div className="mb-6 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Результаты матчей</h3>
        {stats.totalMatches > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-16 flex-shrink-0">Победы</span>
              <div className="flex-1 h-5 bg-slate-700/50 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-lg flex items-center justify-end pr-2"
                  animate={{ width: `${(stats.totalWins / stats.totalMatches) * 100}%` }}
                  transition={{ duration: 0.6 }}
                >
                  {stats.totalWins > 0 && <span className="text-[10px] font-bold">{stats.totalWins}</span>}
                </motion.div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-16 flex-shrink-0">Поражения</span>
              <div className="flex-1 h-5 bg-slate-700/50 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full bg-rose-500 rounded-lg flex items-center justify-end pr-2"
                  animate={{ width: `${(stats.totalLosses / stats.totalMatches) * 100}%` }}
                  transition={{ duration: 0.6 }}
                >
                  {stats.totalLosses > 0 && <span className="text-[10px] font-bold">{stats.totalLosses}</span>}
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-slate-500">Сыграй хотя бы один матч</div>
        )}
      </div>

      {/* Choice Distribution */}
      <div className="mb-6 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Target size={14} /> Выбор карт
        </h3>
        {totalChoices > 0 ? (
          <div className="space-y-3">
            {CHOICES.map(choice => {
              const count = stats.choiceCounts[choice];
              const pct = totalChoices > 0 ? Math.round((count / totalChoices) * 100) : 0;
              return (
                <div key={choice} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${CHOICE_COLORS[choice]} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-[10px] font-black">{CHOICE_LABELS[choice][0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-300">{CHOICE_LABELS[choice]}</span>
                      <span className="text-xs font-bold text-slate-400">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${CHOICE_BARS[choice]}`}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-slate-500">Нет данных</div>
        )}
      </div>

      {/* Round Stats */}
      <div className="mb-6 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock size={14} /> Раунды
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-700/30 rounded-xl p-2">
            <div className="text-lg font-black text-emerald-400">{stats.roundsWon}</div>
            <div className="text-[10px] text-slate-500 uppercase">Выиграно</div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-2">
            <div className="text-lg font-black text-rose-400">{stats.roundsLost}</div>
            <div className="text-[10px] text-slate-500 uppercase">Проиграно</div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-2">
            <div className="text-lg font-black text-slate-300">{stats.roundsDrawn}</div>
            <div className="text-[10px] text-slate-500 uppercase">Ничьи</div>
          </div>
        </div>
      </div>

      {/* Match History */}
      <div className="mb-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
        >
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">История матчей</h3>
          {showHistory ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {showHistory && stats.matchHistory.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mt-2">
              {stats.matchHistory.slice(0, 10).map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3 bg-slate-800/30 rounded-xl p-3 border border-slate-700/30"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    match.won ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                  }`}>
                    {match.won ? (
                      <Trophy size={16} className="text-emerald-400" />
                    ) : (
                      <span className="text-rose-400 text-xs font-black">✕</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold">
                      <span className="text-blue-400">{match.playerScore}</span>
                      <span className="text-slate-600 mx-1">:</span>
                      <span className="text-rose-400">{match.aiScore}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{match.rounds} раундов</div>
                  </div>
                  <div className="text-[10px] text-slate-500 tabular-nums">
                    {new Date(match.date).toLocaleDateString('ru-RU')}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {showHistory && stats.matchHistory.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-500">История пуста</div>
        )}
      </div>
    </div>
  );
}
