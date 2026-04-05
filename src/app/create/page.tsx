'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Onboarding } from '@/components/Onboarding';
import { CreatePost } from '@/components/CreatePost';
import { getUserByTelegramId, getOrCreateUser } from '@/lib/storage';
import { getTelegramUser, isTelegramMiniApp } from '@/lib/telegram';
import type { User, Language } from '@/types';
import type { Locale } from '@/i18n';

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  if (tgLang?.startsWith('es')) return 'es';
  return 'en';
}

export default function CreatePage() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale]   = useState<Locale>('en');
  const router = useRouter();

  useEffect(() => {
    const detected = detectLocale();
    setLocale(detected);

    async function init() {
      if (!isTelegramMiniApp()) {
        // In dev mode, use a mock user
        setUser({ id: 'dev', telegram_id: 'dev', username: 'DevUser', farm_id: '123', language: 'en', created_at: '', updated_at: '' } as any);
        setLoading(false);
        return;
      }

      const tgUser = getTelegramUser();
      if (!tgUser) {
        router.push('/');
        return;
      }

      const dbUser = await getUserByTelegramId(String(tgUser.id));
      if (!dbUser) {
        router.push('/');
        return;
      }

      setUser(dbUser);
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
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#87a96b' }}>
        <p className="font-bold" style={{ color: '#fff8e7' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Onboarding locale={locale} onComplete={handleOnboardingComplete} />;
  }

  return (
    <CreatePost
      locale={locale}
      user={user}
      onCancel={() => router.push('/')}
    />
  );
}
