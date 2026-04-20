import { Choice, CHOICES } from './types';

/**
 * Умный ИИ на основе цепей Маркова с расширенными стратегиями
 * - Анализирует ТОЛЬКО ПРЕДЫДУЩИЕ ходы игрока
 * - Никогда не видит текущий ход
 * - Строит статистику переходов (какой ход следует после какого)
 * - Добавляет случайность, чтобы не быть 100% предсказуемым
 * - Учитывает паттерны "после победы/поражения/ничьи"
 */
export class SmartAI {
  // История ходов игрока (заполняется ПОСЛЕ раунда, не до)
  private playerHistory: Choice[] = [];
  
  // История результатов раундов
  private resultHistory: ('win' | 'lose' | 'draw')[] = [];
  
  // Двухходовые переходы (bigrams): "камень" -> "бумага" встречалась 5 раз
  private bigrams: Record<string, Record<Choice, number>> = {};
  
  // Трёхходовые переходы (trigrams): "камень->бумага" -> "ножницы" встречалась 3 раза
  private trigrams: Record<string, Record<Choice, number>> = {};
  
  // Четырёхходовые переходы (quadgrams) - для очень длинных паттернов
  private quadgrams: Record<string, Record<Choice, number>> = {};
  
  // Общая частота каждого хода
  private choiceFreq: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  
  // Ходы после победы/поражения/ничьи
  private afterWin: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  private afterLose: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  private afterDraw: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  
  // Всего ходов проанализировано
  private totalMoves = 0;
  
  // Последний результат для контекстного анализа
  private lastResult: 'win' | 'lose' | 'draw' | null = null;

  /**
   * Обновить статистику ПОСЛЕ завершения раунда
   * Это гарантирует, что ИИ анализирует ПРОШЛЫЕ ходы, а не текущий
   */
  updateHistory(playerChoice: Choice, result?: 'win' | 'lose' | 'draw') {
    // Обновляем частоту выбора
    this.choiceFreq[playerChoice]++;
    this.totalMoves++;

    // Обновляем контекстную статистику (ходы после определённого результата)
    if (this.lastResult !== null) {
      if (this.lastResult === 'win') this.afterWin[playerChoice]++;
      else if (this.lastResult === 'lose') this.afterLose[playerChoice]++;
      else this.afterDraw[playerChoice]++;
    }

    // Обновляем bigrams (переходы от предыдущего хода к текущему)
    if (this.playerHistory.length >= 1) {
      const lastMove = this.playerHistory[this.playerHistory.length - 1];
      if (!this.bigrams[lastMove]) {
        this.bigrams[lastMove] = { rock: 0, paper: 0, scissors: 0 };
      }
      this.bigrams[lastMove][playerChoice]++;
    }

    // Обновляем trigrams (переходы от двух предыдущих ходов к текущему)
    if (this.playerHistory.length >= 2) {
      const prev2 = this.playerHistory[this.playerHistory.length - 2];
      const prev1 = this.playerHistory[this.playerHistory.length - 1];
      const key = `${prev2}_${prev1}`;
      if (!this.trigrams[key]) {
        this.trigrams[key] = { rock: 0, paper: 0, scissors: 0 };
      }
      this.trigrams[key][playerChoice]++;
    }

    // Обновляем quadgrams (4-ходовые паттерны)
    if (this.playerHistory.length >= 3) {
      const prev3 = this.playerHistory[this.playerHistory.length - 3];
      const prev2 = this.playerHistory[this.playerHistory.length - 2];
      const prev1 = this.playerHistory[this.playerHistory.length - 1];
      const key = `${prev3}_${prev2}_${prev1}`;
      if (!this.quadgrams[key]) {
        this.quadgrams[key] = { rock: 0, paper: 0, scissors: 0 };
      }
      this.quadgrams[key][playerChoice]++;
    }

    // Добавляем в историю
    this.playerHistory.push(playerChoice);
    
    // Сохраняем результат для следующего анализа
    if (result) {
      this.resultHistory.push(result);
      this.lastResult = result;
    }
  }

  /**
   * Предсказать следующий ход игрока на основе истории
   * ИИ анализирует только ПРОШЛЫЕ ходы
   * ВНИМАНИЕ: вызывается ДО обновления истории!
   */
  predictNextMove(): Choice {
    // Если слишком мало данных - выбираем случайно с небольшим смещением
    if (this.totalMoves < 3) {
      // Легкое смещение: новички часто начинают с камня
      const weights = [0.45, 0.30, 0.25]; // rock, paper, scissors
      const r = Math.random();
      if (r < weights[0]) return 'rock';
      if (r < weights[0] + weights[1]) return 'paper';
      return 'scissors';
    }

    let predictedPlayerMove: Choice | null = null;
    let confidence = 0;

    // === Стратегия 1: Quadgrams (4-ходовые паттерны) - самый высокий приоритет ===
    if (this.playerHistory.length >= 3) {
      const prev3 = this.playerHistory[this.playerHistory.length - 3];
      const prev2 = this.playerHistory[this.playerHistory.length - 2];
      const prev1 = this.playerHistory[this.playerHistory.length - 1];
      const key = `${prev3}_${prev2}_${prev1}`;
      
      const quad = this.quadgrams[key];
      if (quad) {
        const total = quad.rock + quad.paper + quad.scissors;
        if (total >= 2) {
          const best = this.getMostLikely(quad);
          const bestCount = quad[best];
          const c = bestCount / total;
          
          // Очень высокий приоритет для длинных паттернов
          if (c > 0.45 && c > confidence) {
            confidence = c * 1.1; // Бонус за длину паттерна
            predictedPlayerMove = best;
          }
        }
      }
    }

    // === Стратегия 2: Trigrams (3-ходовые паттерны) ===
    if (this.playerHistory.length >= 2 && confidence < 0.5) {
      const prev2 = this.playerHistory[this.playerHistory.length - 2];
      const prev1 = this.playerHistory[this.playerHistory.length - 1];
      const key = `${prev2}_${prev1}`;
      
      const tri = this.trigrams[key];
      if (tri) {
        const total = tri.rock + tri.paper + tri.scissors;
        if (total >= 2) {
          const best = this.getMostLikely(tri);
          const bestCount = tri[best];
          const c = bestCount / total;
          
          if (c > 0.4 && c > confidence) {
            confidence = c;
            predictedPlayerMove = best;
          }
        }
      }
    }

    // === Стратегия 3: Bigrams (2-ходовые паттерны) ===
    if (this.playerHistory.length >= 1 && confidence < 0.4) {
      const lastMove = this.playerHistory[this.playerHistory.length - 1];
      const bi = this.bigrams[lastMove];
      
      if (bi) {
        const total = bi.rock + bi.paper + bi.scissors;
        if (total >= 2) {
          const best = this.getMostLikely(bi);
          const bestCount = bi[best];
          const c = (bestCount / total) * 0.9;
          
          if (c > confidence) {
            confidence = c;
            predictedPlayerMove = best;
          }
        }
      }
    }

    // === Стратегия 4: Контекстная (после победы/поражения/ничьи) ===
    if (this.lastResult !== null && confidence < 0.45) {
      let contextStats: Record<Choice, number>;
      
      if (this.lastResult === 'win') contextStats = this.afterWin;
      else if (this.lastResult === 'lose') contextStats = this.afterLose;
      else contextStats = this.afterDraw;
      
      const total = contextStats.rock + contextStats.paper + contextStats.scissors;
      if (total >= 3) {
        const best = this.getMostLikely(contextStats);
        const bestCount = contextStats[best];
        const c = (bestCount / total) * 0.85;
        
        if (c > confidence) {
          confidence = c;
          predictedPlayerMove = best;
        }
      }
    }

    // === Стратегия 5: Общая частота (fallback) ===
    if (!predictedPlayerMove || confidence < 0.3) {
      const total = this.totalMoves;
      const freqs = {
        rock: this.choiceFreq.rock / total,
        paper: this.choiceFreq.paper / total,
        scissors: this.choiceFreq.scissors / total,
      };
      predictedPlayerMove = this.getMostLikely(freqs);
    }

    // === Добавляем случайность и тактическую вариативность ===
    const randomValue = Math.random();
    
    // Если уверенность очень высокая - почти всегда противим
    if (confidence > 0.6 && randomValue < 0.88) {
      return this.getCounterMove(predictedPlayerMove!);
    }
    
    // Если уверенность высокая - часто противим
    if (confidence > 0.5 && randomValue < 0.78) {
      return this.getCounterMove(predictedPlayerMove!);
    }
    
    // Если уверенность средняя - иногда противим, иногда нет
    if (confidence > 0.4 && randomValue < 0.62) {
      return this.getCounterMove(predictedPlayerMove!);
    }
    
    // Если уверенность низкая - больше случайности
    if (randomValue < 0.45) {
      return this.getCounterMove(predictedPlayerMove!);
    }
    
    // Иногда делаем "защитный" ход (тот же, что предсказали у игрока)
    // Это полезно, если игрок пытается нас перехитрить
    if (randomValue < 0.7) {
      return predictedPlayerMove!;
    }

    // Полностью случайный ход
    return CHOICES[Math.floor(Math.random() * 3)];
  }

  /**
   * Получить ход, который побеждает заданный ход
   */
  private getCounterMove(playerMove: Choice): Choice {
    if (playerMove === 'rock') return 'paper';      // Бумага бьет камень
    if (playerMove === 'paper') return 'scissors';  // Ножницы бьют бумагу
    return 'rock';                                   // Камень бьет ножницы
  }

  /**
   * Найти наиболее часто встречающийся ход
   */
  private getMostLikely(dist: Record<Choice, number>): Choice {
    let best: Choice = 'rock';
    let maxVal = -1;
    for (const c of CHOICES) {
      if (dist[c] > maxVal) {
        maxVal = dist[c];
        best = c;
      }
    }
    return best;
  }

  /**
   * Сбросить статистику для новой игры
   */
  reset() {
    this.playerHistory = [];
    this.resultHistory = [];
    this.bigrams = {};
    this.trigrams = {};
    this.quadgrams = {};
    this.choiceFreq = { rock: 0, paper: 0, scissors: 0 };
    this.afterWin = { rock: 0, paper: 0, scissors: 0 };
    this.afterLose = { rock: 0, paper: 0, scissors: 0 };
    this.afterDraw = { rock: 0, paper: 0, scissors: 0 };
    this.totalMoves = 0;
    this.lastResult = null;
  }

  /**
   * Получить статистику (для отладки/статистики)
   */
  getStats() {
    return {
      totalMoves: this.totalMoves,
      choiceFreq: this.choiceFreq,
      bigramsCount: Object.keys(this.bigrams).length,
      trigramsCount: Object.keys(this.trigrams).length,
      quadgramsCount: Object.keys(this.quadgrams).length,
      lastResult: this.lastResult,
    };
  }
}
