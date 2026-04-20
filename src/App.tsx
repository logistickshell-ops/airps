import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Target, BarChart3, User, Zap } from 'lucide-react';
import Arena from './components/Arena';
import DailyQuests from './components/DailyQuests';
import Statistics from './components/Statistics';
import Profile from './components/Profile';
import { Tab, MatchRecord } from './types';
import { useGameStore } from './hooks/useGameStore';
import { soundSystem } from './sounds';
import useTelegram from './hooks/useTelegram';

const TABS: { id: Tab; label: string; icon: typeof Swords }[] = [
  { id: 'arena', label: 'Арена', icon: Swords },
  { id: 'quests', label: 'Задания', icon: Target },
  { id: 'stats', label: 'Статистика', icon: BarChart3 },
  { id: 'profile', label: 'Профиль', icon: User },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('arena');
  const { stats, profile, quests, questTimeLeft, recordMatch, claimQuest, updateProfile, resetAll } = useGameStore();
  const { isTelegram, user, isReady, selection } = useTelegram();

  // Инициализация имени из Telegram
  useEffect(() => {
    if (isReady && user.name) {
      updateProfile({ name: user.name });
    }
  }, [isReady, user.name, updateProfile]);

  const handleMatchEnd = useCallback((match: MatchRecord) => {
    recordMatch(match);
  }, [recordMatch]);

  const handleTabChange = useCallback((tab: Tab) => {
    soundSystem.playClick();
    selection(); // Haptic feedback для Telegram
    setActiveTab(tab);
  }, [selection]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white font-sans overflow-hidden">
      {/* Top Header */}
      <header className="flex-shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <h1 className="text-lg font-black uppercase tracking-tight hidden sm:block">Cyber KNB</h1>
          {/* Индикатор Telegram */}
          {isTelegram && (
            <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/30">
              TG
            </span>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                ${activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-slate-700 rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon size={16} />
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Player mini info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg px-2.5 py-1.5 border border-slate-700/50">
            <span className="text-xs font-bold text-yellow-400">🪙</span>
            <span className="text-xs font-bold text-yellow-400 tabular-nums">{profile.coins}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto"
          >
            {activeTab === 'arena' && <Arena onMatchEnd={handleMatchEnd} />}
            {activeTab === 'quests' && <DailyQuests quests={quests} timeLeft={questTimeLeft} onClaim={claimQuest} />}
            {activeTab === 'stats' && <Statistics stats={stats} />}
            {activeTab === 'profile' && <Profile profile={profile} stats={stats} onUpdate={updateProfile} onReset={resetAll} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden flex-shrink-0 flex items-stretch bg-slate-900/80 backdrop-blur-sm border-t border-slate-800/50 px-1 pb-safe">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors
              ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}
            `}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="mobileActiveTab"
                className="absolute top-0 left-2 right-2 h-0.5 bg-indigo-400 rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
