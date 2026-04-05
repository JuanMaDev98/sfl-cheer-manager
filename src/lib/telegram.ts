// Telegram Mini App integration
import type { TelegramUser } from '@/types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    chat_instance?: string;
    chat_type?: string;
  };
  ready: () => void;
  close: () => void;
  openTelegramLink: (url: string) => void;
  openChannel: (url: string) => void;
  expand: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    disable: () => void;
    enable: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style?: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
}

/**
 * Initialize Telegram WebApp
 */
export function initTelegram(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;

  const tg = window.Telegram?.WebApp;
  if (!tg) {
    console.warn('Not running inside Telegram Mini App');
    return null;
  }

  tg.ready();
  return tg;
}

/**
 * Get the current Telegram user
 */
export function getTelegramUser(): TelegramUser | null {
  const tg = window.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user ?? null;
}

/**
 * Get the bot username from the URL (set by Telegram when opening Mini App)
 */
export function getBotUsername(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('startattach') || '';
}

/**
 * Open a Telegram DM to a user by their username
 */
export function openTelegramDM(username: string): void {
  const tg = window.Telegram?.WebApp;
  const url = `https://t.me/${username}`;

  if (tg) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
}

/**
 * Check if we are inside a Telegram Mini App
 */
export function isTelegramMiniApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}
