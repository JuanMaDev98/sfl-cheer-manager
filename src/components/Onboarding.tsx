'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { t, supportedLocales } from '@/i18n';
import { lookupFarm, normalizeFarmId } from '@/lib/sfl-api';
import type { Language, Locale } from '@/types';

interface OnboardingProps {
  locale: Locale;
  onComplete: (data: { farmId: string; username: string; language: Language }) => void;
}

export function Onboarding({ locale, onComplete }: OnboardingProps) {
  const [farmId, setFarmId] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [detectedLocale, setDetectedLocale] = useState<Language>('en');
  const router = useRouter();

  async function handleLookup() {
    if (!farmId.trim()) return;
    setLoading(true);
    setError('');

    const normalized = normalizeFarmId(farmId);
    const result = await lookupFarm(normalized);

    setLoading(false);

    if (result.success && result.username) {
      setUsername(result.username);
      setFarmId(normalized);
      setStep('confirm');
    } else {
      // For MVP: allow manual entry if API fails
      setError(t('onboarding.username_not_found', locale));
      setStep('confirm');
    }
  }

  async function handleConfirm() {
    if (!username.trim()) return;
    setLoading(true);
    onComplete({ farmId: normalizeFarmId(farmId), username: username.trim(), language: detectedLocale });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#87a96b' }}>
      {/* Title */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#fff8e7' }}>🌻 SFL Cheer Manager</h1>
        <p className="text-sm" style={{ color: '#e8d5b7' }}>{t('onboarding.subtitle', locale)}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div
          className="rounded-xl border-4 p-6 shadow-xl"
          style={{ backgroundColor: '#faf3e0', borderColor: '#8b6914' }}
        >
          {step === 'input' && (
            <>
              <h2 className="text-lg font-bold mb-4 text-center" style={{ color: '#5a3a0a' }}>
                🔑 {t('onboarding.title', locale)}
              </h2>

              <div className="mb-4">
                <Input
                  value={farmId}
                  onChange={setFarmId}
                  placeholder={t('onboarding.farm_id_placeholder', locale)}
                  className="text-center text-base"
                />
                <p className="text-xs mt-1 text-center" style={{ color: '#a08020' }}>
                  {t('onboarding.farm_id_hint', locale)}
                </p>
              </div>

              {error && (
                <p className="mb-3 text-sm text-center rounded-lg p-2" style={{ backgroundColor: '#fdd', color: '#c0392b' }}>
                  {error}
                </p>
              )}

              <Button onClick={handleLookup} disabled={loading || !farmId.trim()} className="w-full">
                {loading ? t('onboarding.username_loading', locale) : '🔍 Look Up Farm'}
              </Button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <h2 className="text-lg font-bold mb-4 text-center" style={{ color: '#5a3a0a' }}>
                {t('onboarding.confirm_username', locale)}
              </h2>

              {/* Username display */}
              <div className="mb-4 p-3 rounded-lg text-center" style={{ backgroundColor: '#e8f5c8', border: '2px solid #81a551' }}>
                <p className="text-sm mb-1" style={{ color: '#5a3a0a' }}>👤</p>
                <p className="text-xl font-bold" style={{ color: '#3d6a14' }}>{username || '(No username found)'}</p>
                <p className="text-xs mt-1" style={{ color: '#81a551' }}>Farm ID: {farmId}</p>
              </div>

              {error && (
                <p className="mb-3 text-sm text-center rounded-lg p-2" style={{ backgroundColor: '#fdd', color: '#c0392b' }}>
                  {error}
                </p>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: '#5a3a0a' }}>
                  🌐 Language / Idioma
                </label>
                <select
                  value={detectedLocale}
                  onChange={(e) => setDetectedLocale(e.target.value as Language)}
                  className="w-full rounded-lg border-2 px-3 py-2 text-sm"
                  style={{ backgroundColor: '#fff8e7', borderColor: '#c9a227', color: '#3d2914' }}
                >
                  {supportedLocales.map((l) => (
                    <option key={l} value={l}>{l === 'en' ? 'English' : l === 'es' ? 'Español' : l}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { setStep('input'); setError(''); }} variant="secondary" className="flex-1">
                  ← {t('onboarding.refresh', locale)}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={loading || !username.trim()}
                  className="flex-1"
                >
                  {t('onboarding.continue', locale)} →
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
