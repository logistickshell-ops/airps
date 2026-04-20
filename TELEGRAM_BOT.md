# 🎮 Cyber KNB — Telegram Web App

## Инструкция по созданию Telegram бота

### 1. Создание бота через @BotFather

1. Откройте Telegram и найдите **@BotFather**
2. Отправьте команду `/newbot`
3. Введите имя бота: `Cyber KNB Arena`
4. Введите username бота: `YourCyberKNBBot` (должен заканчиваться на `bot`)
5. Сохраните полученный **API Token**

### 2. Настройка Web App

В @BotFather выполните команду:
```
/newapp
```

Или:
```
/setmenubutton
```

Выберите вашего бота и укажите URL вашего Web App:
```
https://your-domain.com
```

### 3. Пример кода для бота (Node.js)

Создайте файл `bot.js`:

```javascript
const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен от BotFather
const token = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// URL вашего Web App
const WEB_APP_URL = 'https://your-domain.com';

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, `
🎮 *Добро пожаловать в Cyber KNB Arena!*

Сразись с умным ИИ в игре "Камень, Ножницы, Бумага"!

🤖 ИИ учится на твоих ходах
🏆 Соревнуйся за рейтинг
📅 Выполняй ежедневные задания
🏅 Получай достижения

Нажми кнопку ниже, чтобы начать игру!
  `, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        {
          text: '🎮 Играть',
          web_app: { url: WEB_APP_URL }
        }
      ]],
      resize_keyboard: true
    }
  });
});

// Обработка данных из Web App
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);
  
  // Обработка результатов матча
  if (data.type === 'match_result') {
    const { winner, playerScore, aiScore, rounds } = data;
    
    bot.sendMessage(chatId, `
🏆 *Матч завершён!*

${winner === 'player' ? '🎉 Ты победил!' : winner === 'ai' ? '😢 ИИ победил' : '🤝 Ничья'}

Счёт: ${playerScore} : ${aiScore}
Раундов: ${rounds}
    `, { parse_mode: 'Markdown' });
  }
});

// Команда /stats
bot.onText(/\/stats/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '📊 Статистика доступна в игре!', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '📊 Открыть статистику',
          web_app: { url: WEB_APP_URL + '#stats' }
        }
      ]]
    }
  });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, `
📖 *Как играть:*

1️⃣ Выбери карту: Камень 🪨, Бумага 📄 или Ножницы ✂️
2️⃣ ИИ выберет свою карту одновременно
3️⃣ Победитель определяется по правилам КНБ
4️⃣ Первый до 3 побед выигрывает матч

🧠 *Совет:* ИИ учится на твоих ходах! 
Меняй стратегию, чтобы победить!
  `, { parse_mode: 'Markdown' });
});

console.log('🤖 Bot is running...');
```

### 4. Запуск бота

```bash
npm install node-telegram-bot-api
node bot.js
```

### 5. Деплой Web App

#### Vercel (рекомендуется):
```bash
npm install -g vercel
vercel --prod
```

#### Netlify:
```bash
npm run build
# Загрузите папку dist/ на Netlify
```

#### GitHub Pages:
1. Загрузите содержимое `dist/` в репозиторий
2. Включите GitHub Pages в настройках

### 6. Структура URL для разделов

Web App поддерживает якоря для прямого перехода:

| Раздел | URL |
|--------|-----|
| Арена | `https://your-domain.com#arena` |
| Задания | `https://your-domain.com#quests` |
| Статистика | `https://your-domain.com#stats` |
| Профиль | `https://your-domain.com#profile` |

### 7. Отправка данных боту из игры

В коде игры уже реализована функция `sendTelegramData()`:

```typescript
import { sendTelegramData } from './utils/telegram';

// При завершении матча
sendTelegramData({
  type: 'match_result',
  winner: 'player', // или 'ai', 'draw'
  playerScore: 3,
  aiScore: 1,
  rounds: 7,
  timestamp: Date.now()
});
```

### 8. Telegram Mini App API функции

Игра использует следующие функции Telegram Web App API:

| Функция | Описание |
|---------|----------|
| `initTelegramWebApp()` | Инициализация |
| `getTelegramUser()` | Данные пользователя |
| `hapticImpact()` | Вибрация |
| `hapticNotification()` | Вибрация с типом |
| `showTelegramAlert()` | Показать алерт |
| `closeTelegramWebApp()` | Закрыть приложение |

### 9. Тестирование

Для локального тестирования с Telegram:

1. Установите `ngrok` или используйте VS Code Live Share
2. Запустите: `ngrok http 5173`
3. Используйте полученный URL в BotFather

### 10. Готово! 🎉

Ваш Telegram Mini App с игрой Cyber KNB готов!

---

## Полезные ссылки

- [Telegram Web Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)
