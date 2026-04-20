import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Gift, Sparkles, Target, Swords, Shield, Zap, TrendingUp, RotateCcw } from 'lucide-react';
import { DailyQuest } from '../types';
import { soundSystem } from '../sounds';

const QUEST_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  wins_total: Swords,
  wins_rock: Shield,
  wins_paper: Zap,
  wins_scissors: Target,
  matches_played: TrendingUp,
  perfect_win: Sparkles,
  streak: TrendingUp,
  comeback: RotateCcw,
};

interface DailyQuestsProps {
  quests: DailyQuest[];
  timeLeft: string;
  onClaim: (id: string) => void;
}

export default function DailyQuests({ quests, timeLeft, onClaim }: DailyQuestsProps) {
  const completedCount = quests.filter(q => q.completed).length;
  const claimedCount = quests.filter(q => q.claimed).length;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Target size={22} className="text-yellow-400" />
            Ежедневные задания
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Clock size={12} />
            {timeLeft}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Выполнено: <span className="text-slate-300 font-bold">{completedCount}/{quests.length}</span></span>
          <span>•</span>
          <span>Получено: <span className="text-yellow-400 font-bold">{claimedCount}/{completedCount}</span></span>
        </div>
      </div>

      {/* Progress overview */}
      <div className="mb-6 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Общий прогресс</span>
          <span className="text-xs font-bold text-slate-300">{Math.round((completedCount / quests.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full"
            animate={{ width: `${(completedCount / quests.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Quest Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {quests.map((quest, idx) => {
          const Icon = QUEST_ICONS[quest.type] || Target;
          const progress = Math.min(quest.progress / quest.target, 1);
          const isComplete = quest.completed;
          const isClaimed = quest.claimed;

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`
                relative rounded-2xl border p-4 transition-all
                ${isClaimed
                  ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
                  : isComplete
                    ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
                    : 'bg-slate-800/50 border-slate-700/50'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isClaimed ? 'bg-slate-700/50' : isComplete ? 'bg-yellow-500/20' : 'bg-slate-700/50'}
                `}>
                  {isClaimed ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : (
                    <Icon size={18} className={isComplete ? 'text-yellow-400' : 'text-slate-400'} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="text-sm font-bold truncate">{quest.title}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Gift size={12} className="text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-400">+{quest.reward}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{quest.description}</p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isComplete ? 'bg-yellow-400' : 'bg-indigo-500'}`}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums flex-shrink-0">
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                </div>

                {/* Claim button */}
                {isComplete && !isClaimed && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      soundSystem.playReward();
                      onClaim(quest.id);
                    }}
                    className="flex-shrink-0 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xs font-black rounded-xl transition-colors"
                  >
                    Взять
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bonus info */}
      {completedCount === quests.length && claimedCount === quests.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center py-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl border border-yellow-500/20"
        >
          <Sparkles size={24} className="text-yellow-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-yellow-400">Все задания выполнены!</p>
          <p className="text-xs text-slate-400">Новые задания появятся через {timeLeft}</p>
        </motion.div>
      )}
    </div>
  );
}
