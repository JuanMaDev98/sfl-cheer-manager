// ============================================
// STORAGE SERVICE - Supabase operations
// ============================================
import { supabase } from './supabase';
import type { Post, User, ContactLog, PostType, Language } from '@/types';
import { POST_EXPIRY_HOURS } from '@/types/constants';

// ============================================
// USER OPERATIONS
// ============================================

export async function getOrCreateUser(telegramId: string, farmId: string, username: string, language: Language): Promise<User | null> {
  // Try to find existing user
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (existing) {
    // Update if farm data changed
    const { data } = await supabase
      .from('users')
      .update({ farm_id: farmId, username, language, updated_at: new Date().toISOString() })
      .eq('telegram_id', telegramId)
      .select()
      .single();
    return data;
  }

  // Create new user
  const { data } = await supabase
    .from('users')
    .insert({ telegram_id: telegramId, farm_id: farmId, username, language })
    .select()
    .single();

  return data;
}

export async function getUserByTelegramId(telegramId: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();
  return data;
}

export async function updateUserRefreshUsername(telegramId: string, newUsername: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .update({ username: newUsername, updated_at: new Date().toISOString() })
    .eq('telegram_id', telegramId)
    .select()
    .single();
  return data;
}

// ============================================
// POST OPERATIONS
// ============================================

export async function getActivePosts(filters?: {
  type?: PostType;
  language?: Language;
  excludeHasInterest?: boolean;
}): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('*, users(username)')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString());

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.language) {
    query = query.eq('language', filters.language);
  }

  if (filters?.excludeHasInterest) {
    query = query.eq('has_interest', false);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  // Randomize order
  return (data as any[]).sort(() => Math.random() - 0.5);
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createPost(userId: string, type: PostType, language: Language, note: string): Promise<Post | null> {
  const expiresAt = new Date(Date.now() + POST_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('posts')
    .insert({ user_id: userId, type, language, note, expires_at: expiresAt })
    .select()
    .single();

  return data;
}

export async function closePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', userId);

  return !error;
}

export async function toggleInterestBadge(postId: string, userId: string, hasInterest: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .update({ has_interest: hasInterest, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', userId);

  return !error;
}

export async function userHasActivePost(userId: string, type: PostType): Promise<boolean> {
  const { data } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return !!data;
}

// ============================================
// CONTACT / METRICS
// ============================================

export async function logContact(postId: string, visitorId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await supabase.from('contact_logs').insert({
    post_id: postId,
    visitor_id: visitorId,
    date: today,
  });

  // Also mark post as having interest
  await supabase
    .from('posts')
    .update({ has_interest: true })
    .eq('id', postId);
}

export async function getDailyContactCount(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const { count } = await supabase
    .from('contact_logs')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);

  return count ?? 0;
}

export async function getActiveUserCount(): Promise<number> {
  const { data } = await supabase
    .from('posts')
    .select('user_id')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString());

  if (!data) return 0;
  const unique = new Set(data.map((p: any) => p.user_id));
  return unique.size;
}
