// ============================================
// TYPES
// ============================================

export type PostType = 'help' | 'cheer';
export type Language = 'en' | 'es' | 'pt' | 'ru' | 'other';
export type Locale = 'en' | 'es';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot?: boolean;
}

export interface User {
  id: string;
  telegram_id: string;
  username: string; // SFL username from API
  farm_id: string;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  type: PostType;
  language: Language;
  note: string; // max 160 chars
  has_interest: boolean; // exclamation badge
  status: 'active' | 'closed';
  expires_at: string; // 24h from creation
  created_at: string;
  updated_at: string;
  // Joined from users table
  username?: string;
  telegram_username?: string;
}

export interface ContactLog {
  id: string;
  post_id: string;
  visitor_id: string; // telegram user id
  created_at: string;
  date: string; // YYYY-MM-DD for daily counting
}

export interface DailyStats {
  date: string;
  contact_count: number;
}
