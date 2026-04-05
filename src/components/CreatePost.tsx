'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select } from '@/components/ui';
import { t } from '@/i18n';
import { createPost, userHasActivePost, getOrCreateUser } from '@/lib/storage';
import { getTelegramUser, openTelegramDM } from '@/lib/telegram';
import { lookupFarm, normalizeFarmId } from '@/lib/sfl-api';
import type { PostType, Language, Locale } from '@/types';
import { LANGUAGES, POST_TYPES, NOTE_MAX_LENGTH } from '@/types/constants';

interface CreatePostProps {
  locale: Locale;
  user: { telegram_id: string; username: string; farm_id: string; language: Language };
  onCancel: () => void;
}

export function CreatePost({ locale, user, onCancel }: CreatePostProps) {
  const [type, setType]       = useState<PostType>('help');
  const [language, setLanguage] = useState<Language>(user.language || 'en');
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Check if user has a visible Telegram username
  const tgUser = typeof window !== 'undefined' ? getTelegramUser() : null;
  const hasTgUsername = !!(tgUser?.username);

  async function handleSubmit() {
    if (!hasTgUsername) {
      setError(t('username.required', locale));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check existing post
      const exists = await userHasActivePost(user.telegram_id, type);
      if (exists) {
        setError(t('create.type_exists', locale));
        setLoading(false);
        return;
      }

      // Create post
      const post = await createPost(user.telegram_id, type, language, note.trim());

      if (post) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      } else {
        setError(t('create.error', locale));
      }
    } catch {
      setError(t('create.error', locale));
    }

    setLoading(false);
  }

  if (!hasTgUsername) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#87a96b' }}>
        <Card className="max-w-sm w-full text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#c0392b' }}>
            {t('username.required', locale)}
          </h2>
          <p className="text-sm mb-4" style={{ color: '#5a3a0a' }}>
            {t('username.required_action', locale)}
          </p>
          <Button variant="secondary" onClick={onCancel}>← Back</Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#87a96b' }}>
        <Card className="max-w-sm w-full text-center">
          <div className="text-5xl mb-3 animate-pop">🎉</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#81a551' }}>
            {t('create.success', locale)}
          </h2>
          <p className="text-sm" style={{ color: '#5a3a0a' }}>Redirecting...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#87a96b' }}>
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold" style={{ color: '#fff8e7' }}>📋 {t('create.title', locale)}</h1>
          <Button variant="secondary" onClick={onCancel} className="text-xs py-1">✕</Button>
        </div>

        <Card>
          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#5a3a0a' }}>
                {t('create.type_label', locale)}
              </label>
              <div className="flex gap-2">
                {POST_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setType(pt.value as PostType)}
                    className="flex-1 px-3 py-3 rounded-lg font-bold text-sm transition-all border-4"
                    style={{
                      backgroundColor: type === pt.value ? (pt.value === 'help' ? '#81a551' : '#d97941') : '#fff8e7',
                      color:         type === pt.value ? '#fff' : '#5a3a0a',
                      borderColor:   type === pt.value ? (pt.value === 'help' ? '#6d9242' : '#c06030') : '#c9a227',
                    }}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#5a3a0a' }}>
                🌐 {t('create.language_label', locale)}
              </label>
              <Select
                value={language}
                onChange={(v) => setLanguage(v as Language)}
                options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#5a3a0a' }}>
                📝 {t('create.note_label', locale)}
              </label>
              <Input
                value={note}
                onChange={setNote}
                placeholder={t('create.note_hint', locale)}
                maxLength={NOTE_MAX_LENGTH}
                multiline
                rows={3}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-center rounded-lg p-2" style={{ backgroundColor: '#fdd', color: '#c0392b' }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? '...' : `✅ ${t('create.submit', locale)}`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
