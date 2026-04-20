export type Choice = 'rock' | 'paper' | 'scissors';
export type Result = 'win' | 'lose' | 'draw' | null;
export type Tab = 'arena' | 'quests' | 'stats' | 'profile';

export interface MatchRecord {
  id: string;
  date: string;
  playerScore: number;
  aiScore: number;
  won: boolean;
  rounds: number;
  playerChoices: Choice[];
}

export interface PlayerStats {
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalRounds: number;
  roundsWon: number;
  roundsLost: number;
  roundsDrawn: number;
  currentStreak: number;
  bestStreak: number;
  choiceCounts: Record<Choice, number>;
  matchHistory: MatchRecord[];
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  type: QuestType;
}

export type QuestType = 
  | 'wins_total'
  | 'wins_rock'
  | 'wins_paper'
  | 'wins_scissors'
  | 'matches_played'
  | 'perfect_win'
  | 'streak'
  | 'comeback';

export interface PlayerProfile {
  name: string;
  avatarSeed: number;
  level: number;
  xp: number;
  coins: number;
  joinDate: string;
}

export const CHOICES: Choice[] = ['rock', 'paper', 'scissors'];

export const WIN_MAP: Record<Choice, Choice> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

export const COUNTER_MAP: Record<Choice, Choice> = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock',
};

export const CHOICE_LABELS: Record<Choice, string> = {
  rock: 'Камень',
  paper: 'Бумага',
  scissors: 'Ножницы',
};

export const RANKS = [
  { name: 'Новичок', minWins: 0, color: 'text-slate-400' },
  { name: 'Ученик', minWins: 5, color: 'text-green-400' },
  { name: 'Боец', minWins: 15, color: 'text-blue-400' },
  { name: 'Мастер', minWins: 30, color: 'text-purple-400' },
  { name: 'Грандмастер', minWins: 60, color: 'text-yellow-400' },
  { name: 'Легенда', minWins: 100, color: 'text-rose-400' },
];

export function getRank(wins: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (wins >= r.minWins) rank = r;
  }
  return rank;
}

export function getLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export function getXpForLevel(level: number) {
  return level * 100;
}
