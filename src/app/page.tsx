'use client';

import { useState, useEffect } from 'react';
import { Onboarding } from '@/components/Onboarding';
import { Home } from '@/components/Home';
import { CreatePost } from '@/components/CreatePost';
import { getUserByTelegramId, getOrCreateUser } from '@/lib/storage';
import { getTelegramUser, isTelegramMiniApp } from '@/lib/telegram';
import type { User, Language } from '@/types';
import { supportedLocales, type Locale } from '@/i18n';
import Link from 'next/link';

// Detect locale from Telegram or browser
function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  if (tgLang?.startsWith('es')) return 'es';
  if (tgLang) return 'en';
  const browserLang = navigator.language;
  if (browserLang.startsWith('es')) return 'es';
  return 'en';
}

export default function MainPage() {
  const [user, setUser]           = useState<User | null>(null);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState<'loading' | 'onboarding' | 'home' | 'create'>('loading');
  const [locale, setLocale]       = useState<Locale>('en');

  useEffect(() => {
    const detected = detectLocale();
    setLocale(detected);

    async function init() {
      // Check if inside Telegram
      if (!isTelegramMiniApp()) {
        // Dev mode: show demo page
        setView('home');
        setLoading(false);
        return;
      }

      const tgUser = getTelegramUser();
      if (!tgUser) {
        setView('onboarding');
        setLoading(false);
        return;
      }

      // Try to find existing user in DB
      let dbUser = await getUserByTelegramId(String(tgUser.id));

      if (!dbUser) {
        // New user - go to onboarding
        setView('onboarding');
      } else {
        setUser(dbUser);
        setView('home');
      }

      setLoading(false);
    }

    init();
  }, []);

  async function handleOnboardingComplete(data: { farmId: string; username: string; language: Language }) {
    const tgUser = getTelegramUser();
    if (!tgUser) return;

    const dbUser = await getOrCreateUser(
      String(tgUser.id),
      data.farmId,
      data.username,
      data.language
    );

    if (dbUser) {
      setUser(dbUser);
      setView('home');
    }
  }

  function handleLogout() {
    setUser(null);
    setView('onboarding');
  }

  if (loading || view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#87a96b' }}>
        <div className="text-center animate-pulse">
          <p className="text-4xl mb-3">🌻</p>
          <p className="font-bold" style={{ color: '#fff8e7' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (view === 'onboarding' || !user) {
    return <Onboarding locale={locale} onComplete={handleOnboardingComplete} />;
  }

  if (view === 'create') {
    return (
      <CreatePost
        locale={locale}
        user={user}
        onCancel={() => setView('home')}
      />
    );
  }

  return <Home locale={locale} user={user} onLogout={handleLogout} />;
}
