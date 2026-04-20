import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Target, BarChart3, User, Zap, Gem } from 'lucide-react'; // <--- ДОБАВИЛ Gem
import Arena from './components/Arena';
import DailyQuests from './components/DailyQuests';
import Statistics from './components/Statistics';
import Profile from './components/Profile';
import { Converter } from './components/Converter'; // <--- ИМПОРТ КОНВЕРТЕРА
import { Tab, MatchRecord } from './types';
import { useGameStore } from './hooks/useGameStore';
import { soundSystem } from './sounds';
import useTelegram from './hooks/useTelegram';

// <--- ДОБАВИЛ ВКЛАДКУ ОБМЕННИКА
const TABS: { id: Tab; label: string; icon: typeof Swords }[] = [
  { id: 'arena', label: 'Арена', icon: Swords },
  { id: 'quests', label: 'Задания', icon: Target },
  { id: 'converter', label: 'Обмен', icon: Gem }, // Новая вкладка
  { id: 'stats', label: 'Стата', icon: BarChart3 },
  { id: 'profile', label: 'Профиль', icon: User },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('arena');
  // <--- ДОБАВИЛ convertCoinsToCrystals, если понадобиится вызывать напрямую, но пока достаточно стейта
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
      <header className="flex-shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <h1 className="text-lg font-black uppercase tracking-tight hidden sm:block text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Cyber KNB
          </h1>
          {/* Индикатор Telegram */}
          {isTelegram && (
            <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/30 animate-pulse">
              TG
            </span>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 overflow-hidden
                ${activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}
              `}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : ''} />
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Player mini info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg px-2.5 py-1.5 border border-slate-700/50 shadow-inner">
            <span className="text-xs font-bold text-yellow-400 drop-shadow-sm">🪙</span>
            <span className="text-xs font-bold text-yellow-400 tabular-nums">{profile.coins.toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-black border border-white/10 shadow-lg shadow-cyan-500/20">
             {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 overflow-y-auto custom-scrollbar"
          >
            <div className="min-h-full p-4 pb-24 sm:pb-4 max-w-2xl mx-auto">
              {activeTab === 'arena' && <Arena onMatchEnd={handleMatchEnd} />}
              {activeTab === 'quests' && <DailyQuests quests={quests} timeLeft={questTimeLeft} onClaim={claimQuest} />}
              
              {/* <--- РЕНДЕРИНГ КОНВЕРТЕРА */}
              {activeTab === 'converter' && <Converter />} 
              
              {activeTab === 'stats' && <Statistics stats={stats} />}
              {activeTab === 'profile' && <Profile profile={profile} stats={stats} onUpdate={updateProfile} onReset={resetAll} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden flex-shrink-0 flex items-stretch bg-slate-900/90 backdrop-blur-md border-t border-slate-800/50 px-1 pb-safe z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex-1 flex flex-col items-center justify-center py-3 gap-1 relative transition-all duration-200
              ${activeTab === tab.id ? 'text-indigo-400 bg-indigo-400/5' : 'text-slate-500 active:bg-slate-800'}
            `}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="mobileActiveTab"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} />
            <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
