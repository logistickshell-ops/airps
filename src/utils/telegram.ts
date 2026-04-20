/**
 * Telegram Web App Utility
 * Документация: https://core.telegram.org/bots/webapps
 */

// Типы для Telegram Web App
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: 'android' | 'ios' | 'tdesktop' | 'unknown';
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }>;
  }, callback?: (buttonId: string) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (qrText: string) => boolean) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback: (text: string) => void) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
}

// Объявляем глобальный объект Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Проверка, запущено ли приложение в Telegram
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

// Получение экземпляра Telegram Web App
export function getTelegramWebApp(): TelegramWebApp | null {
  if (isTelegramWebApp()) {
    return window.Telegram!.WebApp;
  }
  return null;
}

// Инициализация Telegram Web App
export function initTelegramWebApp(): void {
  const tg = getTelegramWebApp();
  if (!tg) return;

  // Готовность приложения
  tg.ready();

  // Расширение на весь экран
  tg.expand();

  // Установка цветов темы (тёмная тема для нашего приложения)
  tg.setHeaderColor('#020617');
  tg.setBackgroundColor('#020617');

  // Включение подтверждения закрытия
  tg.enableClosingConfirmation();
}

// Получение информации о пользователе Telegram
export function getTelegramUser(): TelegramUser | null {
  const tg = getTelegramWebApp();
  if (!tg?.initDataUnsafe?.user) return null;
  return tg.initDataUnsafe.user;
}

// Получение имени пользователя для профиля
export function getTelegramUserName(): string | null {
  const user = getTelegramUser();
  if (!user) return null;
  
  if (user.username) return `@${user.username}`;
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  return user.first_name || null;
}

// Получение аватара пользователя
export function getTelegramUserPhoto(): string | null {
  const user = getTelegramUser();
  return user?.photo_url || null;
}

// Получение ID пользователя
export function getTelegramUserId(): number | null {
  const user = getTelegramUser();
  return user?.id || null;
}

// Вибрация (Haptic Feedback)
export function hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'): void {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
}

export function hapticNotification(type: 'error' | 'success' | 'warning'): void {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred(type);
  }
}

export function hapticSelection(): void {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.selectionChanged();
  }
}

// Показать алерт
export function showTelegramAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.showAlert(message, resolve);
    } else {
      alert(message);
      resolve();
    }
  });
}

// Показать подтверждение
export function showTelegramConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.showConfirm(message, resolve);
    } else {
      resolve(confirm(message));
    }
  });
}

// Показать попап с кнопками
export function showTelegramPopup(
  title: string,
  message: string,
  buttons: Array<{ id: string; text: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive' }> = []
): Promise<string> {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.showPopup(
        { title, message, buttons: buttons.map(b => ({ id: b.id, text: b.text, type: b.type })) },
        resolve
      );
    } else {
      const result = confirm(`${title}\n\n${message}`) ? 'ok' : 'cancel';
      resolve(result);
    }
  });
}

// Главная кнопка Telegram
export function setupMainButton(
  text: string,
  onClick: () => void,
  options: { color?: string; textColor?: string } = {}
): void {
  const tg = getTelegramWebApp();
  if (!tg?.MainButton) return;

  tg.MainButton.setText(text);
  tg.MainButton.onClick(onClick);
  
  if (options.color) tg.MainButton.color = options.color;
  if (options.textColor) tg.MainButton.textColor = options.textColor;
  
  tg.MainButton.show();
}

export function hideMainButton(): void {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.hide();
  }
}

export function showMainButtonProgress(): void {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.showProgress();
  }
}

export function hideMainButtonProgress(): void {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.hideProgress();
  }
}

// Кнопка "Назад" Telegram
export function setupBackButton(onClick: () => void): void {
  const tg = getTelegramWebApp();
  if (!tg?.BackButton) return;

  tg.BackButton.onClick(onClick);
  tg.BackButton.show();
}

export function hideBackButton(): void {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    tg.BackButton.hide();
  }
}

// Закрыть приложение
export function closeTelegramWebApp(): void {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.close();
  }
}

// Отправить данные боту (после этого приложение закроется)
export function sendTelegramData(data: object): void {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.sendData(JSON.stringify(data));
  }
}

// Получить параметры темы Telegram
export function getTelegramThemeParams(): TelegramWebApp['themeParams'] | null {
  const tg = getTelegramWebApp();
  return tg?.themeParams || null;
}

// Проверить, тёмная ли тема
export function isTelegramDarkMode(): boolean {
  const tg = getTelegramWebApp();
  return tg?.colorScheme === 'dark';
}

// Получить платформу
export function getTelegramPlatform(): string {
  const tg = getTelegramWebApp();
  return tg?.platform || 'unknown';
}

// Экспорт утилит по умолчанию
export default {
  isTelegramWebApp,
  getTelegramWebApp,
  initTelegramWebApp,
  getTelegramUser,
  getTelegramUserName,
  getTelegramUserPhoto,
  getTelegramUserId,
  hapticImpact,
  hapticNotification,
  hapticSelection,
  showTelegramAlert,
  showTelegramConfirm,
  showTelegramPopup,
  setupMainButton,
  hideMainButton,
  showMainButtonProgress,
  hideMainButtonProgress,
  setupBackButton,
  hideBackButton,
  closeTelegramWebApp,
  sendTelegramData,
  getTelegramThemeParams,
  isTelegramDarkMode,
  getTelegramPlatform,
};
