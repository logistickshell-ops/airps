import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export const Converter = () => {
  const { profile, convertCoinsToCrystals } = useGameStore();
  const [inputValue, setInputValue] = useState<string>('');
  
  // Деструктуризация для удобства
  const coins = profile.coins;
  const crystals = profile.crystals || 0; // Защита от undefined

  const RATE = 1000;
  
  // Логика расчета
  const inputNum = parseInt(inputValue) || 0;
  const possibleCrystals = Math.floor(inputNum / RATE);
  
  // Проверка валидности: сумма > 0, кратна 1000, не больше чем есть монет
  const isValid = inputNum >= RATE && inputNum % RATE === 0 && inputNum <= coins;

  const handleConvert = () => {
    if (isValid) {
      convertCoinsToCrystals(inputNum);
      setInputValue(''); // Очистка поля после успеха
    }
  };

  const setMax = () => {
    // Сколько максимум можно конвертировать (кратно 1000)
    const maxConvertible = Math.floor(coins / RATE) * RATE;
    setInputValue(maxConvertible.toString());
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6 w-full max-w-md mx-auto animate-fade-in">
      
      {/* Заголовок */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Обменник</h2>
        <p className="text-slate-400 text-sm">Преврати монеты в кристаллы</p>
      </div>

      {/* Карточки балансов */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-slate-400 text-xs uppercase font-semibold mb-1">Монеты</span>
          <span className="text-yellow-400 font-black text-xl flex items-center gap-1">
            🪙 {coins.toLocaleString()}
          </span>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-slate-400 text-xs uppercase font-semibold mb-1">Кристаллы</span>
          <span className="text-cyan-400 font-black text-xl flex items-center gap-1">
            💎 {crystals.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Инфо о курсе */}
      <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800 shadow-inner">
        <p className="text-slate-300 text-sm font-medium text-center">
          Курс: <span className="text-yellow-400 font-bold">1000</span> 🪙 = <span className="text-cyan-400 font-bold">1</span> 💎
        </p>
      </div>

      {/* Поле ввода */}
      <div className="w-full space-y-2">
        <label className="text-slate-400 text-xs ml-1 uppercase font-bold tracking-wider">Сумма обмена</label>
        <div className="relative group">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Минимум 1000"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-lg"
          />
          <button 
            onClick={setMax}
            disabled={coins < RATE}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-cyan-500 hover:text-cyan-300 disabled:text-slate-700 px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors uppercase"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Статус операции */}
      <div className="h-6 flex items-center justify-center w-full">
        {inputNum > 0 && (
          <span className={`text-sm font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>
            {isValid 
              ? `Получите: +${possibleCrystals} 💎` 
              : inputNum < RATE 
                ? `Минимум ${RATE} монет` 
                : 'Недостаточно средств или неверная сумма'}
          </span>
        )}
      </div>

      {/* Кнопка действия */}
      <button
        onClick={handleConvert}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 transform active:scale-[0.98] ${
          isValid 
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/50 hover:shadow-cyan-500/30' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
      >
        КОНВЕРТИРОВАТЬ
      </button>

    </div>
  );
};
