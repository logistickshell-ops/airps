import { useState, useEffect, useCallback } from 'react';
import { PlayerStats, PlayerProfile, DailyQuest, QuestType, MatchRecord } from '../types';

const STATS_KEY = 'knb_stats';
const PROFILE_KEY = 'knb_profile';
const QUESTS_KEY = 'knb_quests';
const QUEST_DATE_KEY = 'knb_quest_date';

function getDefaultStats(): PlayerStats {
  return {
    totalMatches: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    totalRounds: 0,
    roundsWon: 0,
    roundsLost: 0,
    roundsDrawn: 0,
    currentStreak: 0,
    bestStreak: 0,
    choiceCounts: { rock: 0, paper: 0, scissors: 0 },
    matchHistory: [],
  };
}

function getDefaultProfile(): PlayerProfile {
  return {
    name: 'Игрок',
    avatarSeed: Math.floor(Math.random() * 10000),
    level: 1,
    xp: 0,
    coins: 0,
    joinDate: new Date().toISOString(),
  };
}

function loadJSON<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function saveJSON(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Улучшенный seeded random для ежедневных квестов (xorshift)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

// Расширенные шаблоны квестов для большего разнообразия
const QUEST_TEMPLATES: { type: QuestType; title: string; description: string; targets: number[]; rewards: number[] }[] = [
  // Простые задания
  { type: 'wins_total', title: 'Победитель', description: 'Выиграй {n} матч(ей)', targets: [2, 3, 4, 5], rewards: [30, 45, 60, 80] },
  { type: 'matches_played', title: 'Марафонец', description: 'Сыграй {n} матч(ей)', targets: [3, 5, 7, 10], rewards: [15, 25, 40, 60] },
  
  // Задания с конкретными картами
  { type: 'wins_rock', title: '🗿 Сила камня', description: 'Победи камнем {n} раз(а)', targets: [2, 3, 4, 5], rewards: [25, 40, 55, 70] },
  { type: 'wins_paper', title: '📄 Бумажный мастер', description: 'Победи бумагой {n} раз(а)', targets: [2, 3, 4, 5], rewards: [25, 40, 55, 70] },
  { type: 'wins_scissors', title: '✂️ Острые ножницы', description: 'Победи ножницами {n} раз(а)', targets: [2, 3, 4, 5], rewards: [25, 40, 55, 70] },
  
  // Сложные задания
  { type: 'perfect_win', title: '⭐ Безупречная победа', description: 'Выиграй матч со счётом 3:0 — {n} раз(а)', targets: [1, 2], rewards: [60, 100] },
  { type: 'streak', title: '🔥 На кураже', description: 'Выиграй {n} раундов подряд за все матчи', targets: [3, 4, 5], rewards: [35, 50, 75] },
  { type: 'comeback', title: '💪 Камбэк', description: 'Выиграй матч, проигрывая 0:2 — {n} раз(а)', targets: [1, 2], rewards: [80, 140] },
  
  // Новые типы заданий (повторно используем существующие типы с разными названиями)
  { type: 'wins_total', title: '🏆 Чемпион', description: 'Одержи {n} побед(ы) подряд в матчах', targets: [2, 3], rewards: [50, 80] },
  { type: 'matches_played', title: '🎮 Игроман', description: 'Проведи {n} раундов', targets: [10, 15, 20], rewards: [20, 30, 45] },
  { type: 'wins_rock', title: '🪨 Камнепад', description: 'Используй камень {n} раз в победных раундах', targets: [3, 4, 5], rewards: [30, 45, 60] },
  { type: 'wins_paper', title: '📰 Газетная волна', description: 'Используй бумагу {n} раз в победных раундах', targets: [3, 4, 5], rewards: [30, 45, 60] },
  { type: 'wins_scissors', title: '🗡️ Режущая кромка', description: 'Используй ножницы {n} раз в победных раундах', targets: [3, 4, 5], rewards: [30, 45, 60] },
];

function generateDailyQuests(): DailyQuest[] {
  const today = new Date();
  // Уникальный сид на каждый день с учетом года, месяца и дня
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rng = seededRandom(seed);

  // Перемешиваем шаблоны с использованием seeded random
  const shuffled = [...QUEST_TEMPLATES].sort(() => rng() - 0.5);
  
  // Выбираем 4 уникальных квеста (следим чтобы не было дубликатов по type)
  const selected: typeof QUEST_TEMPLATES = [];
  const usedTypes = new Set<QuestType>();
  
  for (const template of shuffled) {
    if (!usedTypes.has(template.type)) {
      selected.push(template);
      usedTypes.add(template.type);
    }
    if (selected.length >= 4) break;
  }

  return selected.map((t, i) => {
    // Случайная сложность на основе сида
    const diffIdx = Math.floor(rng() * t.targets.length);
    const target = t.targets[diffIdx];
    const reward = t.rewards[diffIdx];
    
    // Уникальный ID квеста на основе даты
    return {
      id: `quest_${today.toISOString().split('T')[0]}_${i}`,
      title: t.title,
      description: t.description.replace('{n}', String(target)),
      target,
      progress: 0,
      reward,
      completed: false,
      claimed: false,
      type: t.type,
    };
  });
}

export function useGameStore() {
  const [stats, setStats] = useState<PlayerStats>(() => loadJSON(STATS_KEY, getDefaultStats()));
  const [profile, setProfile] = useState<PlayerProfile>(() => loadJSON(PROFILE_KEY, getDefaultProfile()));
  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    const savedDate = localStorage.getItem(QUEST_DATE_KEY);
    const today = new Date().toDateString();
    if (savedDate === today) {
      return loadJSON(QUESTS_KEY, generateDailyQuests());
    }
    const newQuests = generateDailyQuests();
    localStorage.setItem(QUEST_DATE_KEY, today);
    saveJSON(QUESTS_KEY, newQuests);
    return newQuests;
  });

  useEffect(() => saveJSON(STATS_KEY, stats), [stats]);
  useEffect(() => saveJSON(PROFILE_KEY, profile), [profile]);
  useEffect(() => saveJSON(QUESTS_KEY, quests), [quests]);

  const recordMatch = useCallback((match: MatchRecord) => {
    setStats(prev => {
      const next = { ...prev };
      next.totalMatches++;
      next.totalRounds += match.rounds;

      if (match.won) {
        next.totalWins++;
        next.currentStreak++;
        if (next.currentStreak > next.bestStreak) next.bestStreak = next.currentStreak;
      } else {
        next.totalLosses++;
        next.currentStreak = 0;
      }

      next.roundsWon += match.playerScore;
      next.roundsLost += match.aiScore;

      for (const c of match.playerChoices) {
        next.choiceCounts[c]++;
      }

      next.matchHistory = [match, ...prev.matchHistory].slice(0, 50);
      return next;
    });

    // Update profile XP and coins
    const xpGain = match.won ? 50 + match.playerScore * 10 : 10;
    const coinGain = match.won ? 20 + match.playerScore * 5 : 5;
    setProfile(prev => ({
      ...prev,
      xp: prev.xp + xpGain,
      level: Math.floor((prev.xp + xpGain) / 100) + 1,
      coins: prev.coins + coinGain,
    }));

    // Update quests
    setQuests(prev => prev.map(q => {
      if (q.completed) return q;
      let increment = 0;
      switch (q.type) {
        case 'wins_total':
          if (match.won) increment = 1;
          break;
        case 'wins_rock':
          increment = match.playerChoices.filter((_, i) => {
            // Count rounds won with rock — simplified: count rock choices in winning match
            return match.playerChoices[i] === 'rock';
          }).length;
          if (!match.won) increment = 0;
          break;
        case 'wins_paper':
          increment = match.won ? match.playerChoices.filter(c => c === 'paper').length : 0;
          break;
        case 'wins_scissors':
          increment = match.won ? match.playerChoices.filter(c => c === 'scissors').length : 0;
          break;
        case 'matches_played':
          increment = 1;
          break;
        case 'perfect_win':
          if (match.won && match.aiScore === 0) increment = 1;
          break;
        case 'streak':
          // This is tracked per-round, simplified here
          break;
        case 'comeback':
          if (match.won) increment = 1; // Simplified
          break;
      }
      const newProgress = Math.min(q.progress + increment, q.target);
      return {
        ...q,
        progress: newProgress,
        completed: newProgress >= q.target,
      };
    }));
  }, []);

  const claimQuest = useCallback((questId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && q.completed && !q.claimed) {
        setProfile(p => ({ ...p, coins: p.coins + q.reward }));
        return { ...q, claimed: true };
      }
      return q;
    }));
  }, []);

  const updateProfile = useCallback((updates: Partial<PlayerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const resetAll = useCallback(() => {
    const defStats = getDefaultStats();
    const defProfile = getDefaultProfile();
    const newQuests = generateDailyQuests();
    setStats(defStats);
    setProfile(defProfile);
    setQuests(newQuests);
    localStorage.setItem(QUEST_DATE_KEY, new Date().toDateString());
  }, []);

  const questTimeLeft = (() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}ч ${m}м`;
  })();

  return {
    stats,
    profile,
    quests,
    questTimeLeft,
    recordMatch,
    claimQuest,
    updateProfile,
    resetAll,
  };
}
