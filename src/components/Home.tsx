'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Badge, InterestBadge, Modal } from '@/components/ui';
import { TabBar } from '@/components/ui';
import { t } from '@/i18n';
import { getActivePosts, getDailyContactCount, getActiveUserCount, logContact, closePost, toggleInterestBadge } from '@/lib/storage';
import { openTelegramDM, isTelegramMiniApp, getTelegramUser } from '@/lib/telegram';
import type { Post, PostType, Language, Locale } from '@/types';
import { LANGUAGES, POST_TYPES } from '@/types/constants';
import Link from 'next/link';

interface HomeProps {
  locale: Locale;
  user: { telegram_id: string; username: string; farm_id: string; language: Language };
  onLogout: () => void;
}

const FILTERS = [
  { id: 'all',        labelKey: 'feed.filter_all' },
  { id: 'help',       labelKey: 'feed.filter_help' },
  { id: 'cheer',      labelKey: 'feed.filter_cheer' },
  { id: 'no_interest', labelKey: 'feed.filter_no_interest' },
];

export function Home({ locale, user, onLogout }: HomeProps) {
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [dailyContacts, setDailyContacts] = useState(0);
  const [activeUsers, setActiveUsers]       = useState(0);
  const [selectedPost, setSelectedPost]     = useState<Post | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [closeLoading, setCloseLoading]     = useState(false);
  const [myPosts, setMyPosts]               = useState<Post[]>([]);

  async function loadPosts() {
    setLoading(true);
    const [allPosts, contacts, users] = await Promise.all([
      getActivePosts(),
      getDailyContactCount(),
      getActiveUserCount(),
    ]);
    setPosts(allPosts);
    setDailyContacts(contacts);
    setActiveUsers(users);
    setLoading(false);
  }

  useEffect(() => { loadPosts(); }, []);

  // Apply client-side filters
  const filtered = posts.filter((p) => {
    if (filter === 'help') return p.type === 'help';
    if (filter === 'cheer') return p.type === 'cheer';
    if (filter === 'no_interest') return !p.has_interest;
    return true;
  });

  async function handleContact(post: Post) {
    setContactLoading(true);

    // Log the contact
    await logContact(post.id, user.telegram_id);

    // Open DM
    openTelegramDM(post.username || '');

    // Refresh
    await loadPosts();
    setSelectedPost(null);
    setContactLoading(false);
  }

  async function handleClose(post: Post) {
    setCloseLoading(true);
    await closePost(post.id, user.telegram_id);
    await loadPosts();
    setSelectedPost(null);
    setCloseLoading(false);
  }

  async function handleResetInterest(post: Post) {
    await toggleInterestBadge(post.id, user.telegram_id, false);
    await loadPosts();
    setSelectedPost((prev) => prev ? { ...prev, has_interest: false } : null);
  }

  const isMyPost = (p: Post) => p.user_id === user.telegram_id;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#87a96b' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 p-3 border-b-4" style={{ backgroundColor: '#5a7a3a', borderColor: '#3d5a14' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#fff8e7' }}>🌻 SFL Cheer Manager</h1>
            <p className="text-xs" style={{ color: '#c8e6a0' }}>
              {t('feed.contact_count', locale, { count: dailyContacts })}
              {' · '}
              {t('feed.active_users', locale, { count: activeUsers })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/create">
              <Button variant="secondary" className="text-xs py-1 px-3">+ Publish</Button>
            </Link>
            <Button variant="secondary" className="text-xs py-1 px-3" onClick={onLogout}>Logout</Button>
          </div>
        </div>

        {/* Filters */}
        <TabBar
          tabs={FILTERS.map((f) => ({ id: f.id, label: t(f.labelKey, locale) }))}
          activeTab={filter}
          onChange={setFilter}
        />
      </div>

      {/* Post list */}
      <div className="p-3 space-y-3">
        {loading && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#fff8e7' }}>Loading...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#fff8e7' }}>
              {filter === 'all' ? t('feed.empty', locale) : t('feed.no_results', locale)}
            </p>
          </div>
        )}

        {filtered.map((post, i) => (
          <div key={post.id} className="relative animate-fade" style={{ animationDelay: `${i * 50}ms` }}>
            <PostCard
              post={post}
              locale={locale}
              onClick={() => setSelectedPost(post)}
            />
            {isMyPost(post) && (
              <button
                onClick={() => setSelectedPost(post)}
                className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: '#e8a020', color: '#fff' }}
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          locale={locale}
          isOwner={isMyPost(selectedPost)}
          onClose={() => setSelectedPost(null)}
          onContact={handleContact}
          onClosePost={handleClose}
          onResetInterest={handleResetInterest}
          contactLoading={contactLoading}
          closeLoading={closeLoading}
        />
      )}
    </div>
  );
}

// ============================================
// POST CARD COMPONENT
// ============================================

function PostCard({ post, locale, onClick }: { post: Post; locale: Locale; onClick: () => void }) {
  const langLabel = LANGUAGES.find((l) => l.value === post.language)?.label ?? post.language;

  return (
    <Card onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-bold text-base mb-1" style={{ color: '#3d2914' }}>
            👤 {post.username || '(Unknown)'}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={post.type === 'help' ? 'help' : 'cheer'}>
              {post.type === 'help' ? '🤝 Help x Help' : '🎉 Cheer x Cheer'}
            </Badge>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#e8d5b7', color: '#5a3a0a' }}>
              🌐 {langLabel}
            </span>
          </div>
          {post.note && (
            <p className="mt-2 text-sm" style={{ color: '#5a3a0a' }}>{post.note}</p>
          )}
        </div>
        {/* Interest badge */}
        {post.has_interest && (
          <div className="ml-2">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-sm shadow-md"
              style={{ backgroundColor: '#e8a020' }}
              title="Someone has contacted this user"
            >
              !
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================
// POST DETAIL MODAL
// ============================================

interface PostDetailModalProps {
  post: Post;
  locale: Locale;
  isOwner: boolean;
  onClose: () => void;
  onContact: (post: Post) => void;
  onClosePost: (post: Post) => void;
  onResetInterest: (post: Post) => void;
  contactLoading: boolean;
  closeLoading: boolean;
}

function PostDetailModal({
  post, locale, isOwner, onClose, onContact, onClosePost, onResetInterest, contactLoading, closeLoading
}: PostDetailModalProps) {
  const langLabel = LANGUAGES.find((l) => l.value === post.language)?.label ?? post.language;
  const typeLabel = POST_TYPES.find((p) => p.value === post.type)?.label ?? post.type;

  return (
    <Modal open onClose={onClose} title={t('post.detail.title', locale)}>
      <div className="space-y-3">
        {/* Name */}
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#e8f5c8' }}>
          <p className="text-xs mb-1" style={{ color: '#5a3a0a' }}>👤</p>
          <p className="text-xl font-bold" style={{ color: '#3d6a14' }}>{post.username || '(Unknown)'}</p>
        </div>

        {/* Type */}
        <div className="flex items-center gap-2 justify-center">
          <Badge variant={post.type === 'help' ? 'help' : 'cheer'}>{typeLabel}</Badge>
          <span className="text-sm px-2 py-0.5 rounded" style={{ backgroundColor: '#e8d5b7', color: '#5a3a0a' }}>
            🌐 {langLabel}
          </span>
        </div>

        {/* Note */}
        <div>
          <p className="text-xs font-bold mb-1" style={{ color: '#5a3a0a' }}>{t('post.note', locale)}</p>
          <p className="text-sm p-2 rounded" style={{ backgroundColor: '#fff8e7', color: '#3d2914' }}>
            {post.note || t('post.note_empty', locale)}
          </p>
        </div>

        {/* Interest indicator */}
        {post.has_interest && (
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: '#fff3cd' }}>
            <span className="text-sm" style={{ color: '#856404' }}>⚠️ Someone has already contacted this user</span>
          </div>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="danger"
              onClick={() => onClosePost(post)}
              disabled={closeLoading}
              className="flex-1 text-xs"
            >
              {t('post.close', locale)}
            </Button>
            {post.has_interest && (
              <Button
                variant="secondary"
                onClick={() => onResetInterest(post)}
                className="flex-1 text-xs"
              >
                {t('post.reset_interest', locale)}
              </Button>
            )}
          </div>
        )}

        {/* Contact button */}
        {!isOwner && (
          <Button onClick={() => onContact(post)} disabled={contactLoading} className="w-full">
            {contactLoading ? '...' : `💬 ${t('post.contact', locale)}`}
          </Button>
        )}

        <Button variant="secondary" onClick={onClose} className="w-full mt-1">
          Close
        </Button>
      </div>
    </Modal>
  );
}
