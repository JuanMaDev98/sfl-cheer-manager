export const LANGUAGES: { value: import('./index').Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'other', label: 'Other' },
];

export const POST_TYPES: { value: import('./index').PostType; label: string }[] = [
  { value: 'help', label: 'Help x Help' },
  { value: 'cheer', label: 'Cheer x Cheer' },
];

export const NOTE_MAX_LENGTH = 160;
export const POST_EXPIRY_HOURS = 24;
