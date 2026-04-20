import { useEffect, useState, useCallback } from 'react';
import {
  isTelegramWebApp,
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
  closeTelegramWebApp,
  isTelegramDarkMode,
  getTelegramPlatform,
} from '../utils/telegram';

interface TelegramUserData {
  id: number | null;
  name: string | null;
  photo: string | null;
  username: string | null;
}

export function useTelegram() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUserData>({
    id: null,
    name: null,
    photo: null,
    username: null,
  });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [platform, setPlatform] = useState<string>('unknown');

  useEffect(() => {
    const checkTelegram = () => {
      const isTg = isTelegramWebApp();
      setIsTelegram(isTg);

      if (isTg) {
        initTelegramWebApp();
        setIsReady(true);

        const tgUser = getTelegramUser();
        const name = getTelegramUserName();
        const photo = getTelegramUserPhoto();
        const id = getTelegramUserId();

        setUser({
          id,
          name,
          photo,
          username: tgUser?.username || null,
        });

        setIsDarkMode(isTelegramDarkMode());
        setPlatform(getTelegramPlatform());
      }
    };

    checkTelegram();
  }, []);

  const impact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (isTelegram) {
      hapticImpact(style);
    }
  }, [isTelegram]);

  const notification = useCallback((type: 'error' | 'success' | 'warning') => {
    if (isTelegram) {
      hapticNotification(type);
    }
  }, [isTelegram]);

  const selection = useCallback(() => {
    if (isTelegram) {
      hapticSelection();
    }
  }, [isTelegram]);

  const alert = useCallback(async (message: string) => {
    await showTelegramAlert(message);
  }, []);

  const confirm = useCallback(async (message: string): Promise<boolean> => {
    return showTelegramConfirm(message);
  }, []);

  const close = useCallback(() => {
    closeTelegramWebApp();
  }, []);

  return {
    isTelegram,
    isReady,
    user,
    isDarkMode,
    platform,
    // Haptic feedback
    impact,
    notification,
    selection,
    // Dialogs
    alert,
    confirm,
    // Navigation
    close,
  };
}

// Хук для интеграции со звуками игры
export function useTelegramHaptics() {
  const { isTelegram, impact, notification, selection } = useTelegram();

  const playSelect = useCallback(() => {
    selection();
  }, [selection]);

  const playWin = useCallback(() => {
    notification('success');
    impact('medium');
  }, [notification, impact]);

  const playLose = useCallback(() => {
    notification('error');
    impact('heavy');
  }, [notification, impact]);

  const playDraw = useCallback(() => {
    impact('light');
  }, [impact]);

  const playVictory = useCallback(() => {
    notification('success');
    impact('heavy');
  }, [notification, impact]);

  const playDefeat = useCallback(() => {
    notification('error');
    impact('heavy');
  }, [notification, impact]);

  return {
    isTelegram,
    playSelect,
    playWin,
    playLose,
    playDraw,
    playVictory,
    playDefeat,
  };
}

export default useTelegram;
