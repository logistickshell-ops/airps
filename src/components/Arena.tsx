import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Hand, Circle, RotateCcw, Trophy, User, Cpu, Zap, Shield, Swords, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SmartAI } from '../ai';
import { Choice, Result, CHOICES, WIN_MAP, MatchRecord } from '../types';
import { soundSystem } from '../sounds';
import { hapticImpact, hapticNotification } from '../utils/telegram';

const ICONS: Record<Choice, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  rock: Circle,
  paper: Hand,
  scissors: Scissors,
};

const COLORS: Record<Choice, string> = {
  rock: 'from-rose-500 to-rose-700',
  paper: 'from-blue-500 to-blue-700',
  scissors: 'from-amber-500 to-amber-700',
};

const BORDER_COLORS: Record<Choice, string> = {
  rock: 'border-rose-400',
  paper: 'border-blue-400',
  scissors: 'border-amber-400',
};

const GLOW_COLORS: Record<Choice, string> = {
  rock: 'shadow-rose-500/40',
  paper: 'shadow-blue-500/40',
  scissors: 'shadow-amber-500/40',
};

const LABELS: Record<Choice, string> = {
  rock: 'Камень',
  paper: 'Бумага',
  scissors: 'Ножницы',
};

interface ArenaProps {
  onMatchEnd: (match: MatchRecord) => void;
}

export default function Arena({ onMatchEnd }: ArenaProps) {
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<Result>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [roundNum, setRoundNum] = useState(1);
  const [playerChoices, setPlayerChoices] = useState<Choice[]>([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const aiRef = useRef(new SmartAI());
  const confettiTriggered = useRef(false);

  const determineWinner = (p: Choice, a: Choice): Result => {
    if (p === a) return 'draw';
    return WIN_MAP[p] === a ? 'win' : 'lose';
  };

  const playRound = (choice: Choice) => {
    if (isAnimating || gameOver) return;

    // Звук выбора карты
    soundSystem.playSelect();
    hapticImpact('medium'); // Telegram haptic при выборе
    
    setIsAnimating(true);
    setPlayerChoice(choice);
    // ВАЖНО: сбрасываем карту ИИ в "?" перед каждым раундом
    setAiChoice(null);
    setRoundResult(null);
    setShowCountdown(true);
    setCountdownNum(3);

    // === КЛЮЧЕВОЙ МОМЕНТ: ИИ ПРЕДСКАЗЫВАЕТ ПЕРЕД ТЕМ, КАК УЗНАТЬ ХОД ===
    // ИИ только видит ПРОШЛЫЕ ходы игрока из playerChoices
    const aiPick = aiRef.current.predictNextMove();

    // Countdown animation
    let count = 3;
    const interval = setInterval(() => {
      count--;
      soundSystem.playCountdown();
      hapticImpact('light'); // Telegram haptic для countdown
      setCountdownNum(count);
      if (count <= 0) {
        clearInterval(interval);
        setShowCountdown(false);
        
        // Звук боя при раскрытии карт
        soundSystem.playBattle();
        hapticImpact('heavy'); // Telegram haptic для боя
        
        setAiChoice(aiPick);
        const result = determineWinner(choice, aiPick);
        setRoundResult(result);
        
        // Звуки результата раунда
        if (result === 'win') {
          soundSystem.playWin();
          hapticNotification('success');
        } else if (result === 'lose') {
          soundSystem.playLose();
          hapticNotification('error');
        } else {
          soundSystem.playDraw();
          hapticImpact('medium');
        }
        
        // === ТОЛЬКО ПОСЛЕ РАУНДА - обновляем историю ИИ ===
        // Передаём результат для контекстного анализа (после победы/поражения игрок играет по-разному)
        if (result) {
          aiRef.current.updateHistory(choice, result);
        } else {
          aiRef.current.updateHistory(choice);
        }
        setPlayerChoices(prev => [...prev, choice]);

        if (result === 'win') setPlayerScore(s => s + 1);
        if (result === 'lose') setAiScore(s => s + 1);

        setRoundNum(n => n + 1);

        setTimeout(() => setIsAnimating(false), 300);
      }
    }, 400);
  };

  useEffect(() => {
    if ((playerScore === 3 || aiScore === 3) && !gameOver) {
      setGameOver(true);
      if (playerScore === 3 && !confettiTriggered.current) {
        confettiTriggered.current = true;
        soundSystem.playVictory();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else if (aiScore === 3) {
        soundSystem.playDefeat();
      }

      const match: MatchRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        playerScore,
        aiScore,
        won: playerScore >= 3,
        rounds: roundNum - 1,
        playerChoices,
      };
      setTimeout(() => onMatchEnd(match), 500);
    }
  }, [playerScore, aiScore, gameOver, roundNum, playerChoices, onMatchEnd]);

  const resetGame = () => {
    soundSystem.playClick();
    setPlayerScore(0);
    setAiScore(0);
    setPlayerChoice(null);
    setAiChoice(null);
    setRoundResult(null);
    setGameOver(false);
    setRoundNum(1);
    setPlayerChoices([]);
    confettiTriggered.current = false;
    aiRef.current.reset();
  };

  const toggleSound = () => {
    const enabled = soundSystem.toggle();
    setSoundEnabled(enabled);
    if (enabled) {
      soundSystem.playClick();
    }
  };

  const resultText = roundResult === 'win' ? 'Победа!' : roundResult === 'lose' ? 'Поражение!' : 'Ничья!';
  const resultColor = roundResult === 'win' ? 'text-emerald-400' : roundResult === 'lose' ? 'text-rose-400' : 'text-slate-300';

  return (
    <div className="flex flex-col h-full">
      {/* Header with sound toggle */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex-1" />
        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 size={18} className="text-slate-400" />
          ) : (
            <VolumeX size={18} className="text-slate-500" />
          )}
        </button>
      </div>

      {/* Scoreboard */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 py-2 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <User size={20} className="text-blue-400" />
          </div>
          <div className="text-center">
            <div className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider">Ты</div>
            <div className="text-3xl sm:text-4xl font-black text-blue-400 tabular-nums">{playerScore}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Раунд {roundNum}</div>
          <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400">
            До 3 побед
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-[10px] sm:text-xs font-bold text-rose-400 uppercase tracking-wider">ИИ</div>
            <div className="text-3xl sm:text-4xl font-black text-rose-400 tabular-nums">{aiScore}</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <Cpu size={20} className="text-rose-400" />
          </div>
        </div>
      </div>

      {/* Score progress bars */}
      <div className="flex gap-1 px-4 sm:px-8 mb-4">
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
            animate={{ width: `${(playerScore / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
            animate={{ width: `${(aiScore / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 flex items-center justify-center px-2">
        <div className="flex items-center gap-3 sm:gap-6 md:gap-10">
          {/* Player's revealed card */}
          <AnimatePresence mode="wait">
            {playerChoice ? (
              <motion.div
                key={`p-${playerChoice}-${roundNum}`}
                initial={{ x: -60, opacity: 0, scale: 0.6, rotate: -15 }}
                animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${COLORS[playerChoice]} border-2 ${BORDER_COLORS[playerChoice]} flex flex-col items-center justify-center shadow-xl ${GLOW_COLORS[playerChoice]} relative`}
              >
                {React.createElement(ICONS[playerChoice], { size: 36, strokeWidth: 2.5 })}
                <span className="text-[8px] sm:text-[10px] font-bold uppercase mt-1 opacity-80">{LABELS[playerChoice]}</span>
              </motion.div>
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-800/30">
                <Shield size={28} className="text-slate-700" />
              </div>
            )}
          </AnimatePresence>

          {/* VS / Countdown / Result */}
          <div className="flex flex-col items-center min-w-[80px] sm:min-w-[120px]">
            <AnimatePresence mode="wait">
              {showCountdown ? (
                <motion.div
                  key={`count-${countdownNum}`}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-white"
                >
                  {countdownNum > 0 ? countdownNum : <Swords size={48} className="text-yellow-400" />}
                </motion.div>
              ) : roundResult && !isAnimating ? (
                <motion.div
                  key={`result-${roundNum}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`text-lg sm:text-xl md:text-2xl font-black uppercase ${resultColor}`}
                >
                  {resultText}
                </motion.div>
              ) : (
                <div className="text-2xl sm:text-3xl md:text-4xl font-black italic text-slate-700">VS</div>
              )}
            </AnimatePresence>
          </div>

          {/* AI's card - всегда "?" в начале раунда, раскрывается после countdown */}
          <AnimatePresence mode="wait">
            {aiChoice ? (
              <motion.div
                key={`a-${aiChoice}-${roundNum}`}
                initial={{ x: 60, opacity: 0, scale: 0.6, rotate: 15 }}
                animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${COLORS[aiChoice]} border-2 ${BORDER_COLORS[aiChoice]} flex flex-col items-center justify-center shadow-xl ${GLOW_COLORS[aiChoice]} relative`}
              >
                {React.createElement(ICONS[aiChoice], { size: 36, strokeWidth: 2.5 })}
                <span className="text-[8px] sm:text-[10px] font-bold uppercase mt-1 opacity-80">{LABELS[aiChoice]}</span>
              </motion.div>
            ) : (
              <motion.div
                key="ai-unknown"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl border-2 border-dashed border-rose-700/50 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900"
              >
                <span className="text-3xl sm:text-4xl md:text-5xl text-rose-500/70 font-black">?</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Cards */}
      <div className="pb-4 sm:pb-8 pt-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Выбери карту</span>
        </div>
        <div className="flex justify-center gap-3 sm:gap-5">
          {CHOICES.map((choice) => (
            <motion.button
              key={choice}
              whileHover={!isAnimating && !gameOver ? { scale: 1.08, y: -8 } : {}}
              whileTap={!isAnimating && !gameOver ? { scale: 0.92 } : {}}
              onClick={() => playRound(choice)}
              disabled={isAnimating || gameOver}
              className={`
                relative w-[72px] h-[96px] sm:w-24 sm:h-32 md:w-28 md:h-40 rounded-2xl md:rounded-3xl 
                flex flex-col items-center justify-center gap-1 sm:gap-2
                bg-gradient-to-br ${COLORS[choice]}
                border-2 ${BORDER_COLORS[choice]}
                shadow-lg ${GLOW_COLORS[choice]}
                transition-all duration-200
                ${isAnimating || gameOver ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
              `}
            >
              <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                {React.createElement(ICONS[choice], { size: 28, strokeWidth: 2.5 })}
              </div>
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider">{LABELS[choice]}</span>
              <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white/30 rounded-full" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-white/30 rounded-full" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 sm:p-8 rounded-[32px] border border-slate-700 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="mb-4 flex justify-center">
                {playerScore >= 3 ? (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="p-5 bg-yellow-500/15 rounded-full border border-yellow-500/30"
                  >
                    <Trophy size={56} className="text-yellow-400" />
                  </motion.div>
                ) : (
                  <div className="p-5 bg-rose-500/15 rounded-full border border-rose-500/30">
                    <Cpu size={56} className="text-rose-400" />
                  </div>
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-2 uppercase tracking-tight">
                {playerScore >= 3 ? 'Победа!' : 'Поражение!'}
              </h2>
              <p className="text-slate-400 mb-2 text-sm">
                {playerScore >= 3 ? 'Ты перехитрил нейросеть!' : 'ИИ разгадал твою стратегию.'}
              </p>
              <div className="text-5xl font-black mb-6 tabular-nums">
                <span className="text-blue-400">{playerScore}</span>
                <span className="text-slate-600 mx-2">:</span>
                <span className="text-rose-400">{aiScore}</span>
              </div>
              <button
                onClick={resetGame}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors rounded-2xl font-bold text-sm flex items-center justify-center gap-2 group"
              >
                <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
                Играть снова
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
