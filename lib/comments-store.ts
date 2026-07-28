import { supabase } from './supabase';

export interface Comment {
  id: string;
  prankSlug: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

const COMMENTS_KEY = 'prankstar_comments';

function getCommentsDB(): Comment[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(COMMENTS_KEY);
  if (!stored) return [];
  try { return JSON.parse(stored) as Comment[]; } catch { return []; }
}

function saveCommentsDB(comments: Comment[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getCommentsForPrank(slug: string): Comment[] {
  const local = getCommentsDB().filter(c => c.prankSlug === slug).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Asynchronous background fetch from Supabase if connected
  if (typeof window !== 'undefined') {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('prank_slug', slug)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const remoteComments: Comment[] = data.map(c => ({
            id: c.id,
            prankSlug: c.prank_slug,
            userId: c.user_id,
            userName: c.user_name,
            userAvatar: c.user_avatar,
            text: c.text,
            timestamp: c.created_at,
            likes: c.likes || 0,
          }));

          const allComments = getCommentsDB();
          remoteComments.forEach(rc => {
            if (!allComments.find(lc => lc.id === rc.id)) {
              allComments.unshift(rc);
            }
          });
          saveCommentsDB(allComments);
        }
      } catch {
        // Offline fallback
      }
    })();
  }

  return local;
}

export function addComment(slug: string, userId: string, userName: string, userAvatar: string, text: string): Comment {
  const comments = getCommentsDB();
  const newComment: Comment = {
    id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    prankSlug: slug,
    userId,
    userName,
    userAvatar,
    text,
    timestamp: new Date().toISOString(),
    likes: 0,
  };
  comments.unshift(newComment);
  saveCommentsDB(comments);

  // Sync to Supabase table `comments`
  if (typeof window !== 'undefined') {
    (async () => {
      try {
        await supabase.from('comments').insert({
          id: newComment.id,
          prank_slug: slug,
          user_id: userId,
          user_name: userName,
          user_avatar: userAvatar,
          text: text,
          likes: 0,
          created_at: newComment.timestamp,
        });
      } catch {
        // Offline fallback
      }
    })();
  }

  return newComment;
}

export function likeComment(commentId: string): void {
  const comments = getCommentsDB();
  const idx = comments.findIndex(c => c.id === commentId);
  if (idx >= 0) {
    comments[idx].likes += 1;
    saveCommentsDB(comments);

    // Sync like to Supabase
    if (typeof window !== 'undefined') {
      (async () => {
        try {
          await supabase.from('comments')
            .update({ likes: comments[idx].likes })
            .eq('id', commentId);
        } catch {
          // Offline fallback
        }
      })();
    }
  }
}

export function getCommentCount(slug: string): number {
  return getCommentsDB().filter(c => c.prankSlug === slug).length;
}
