'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ArticleCard({ article, currentUserId, currentUserRole, onDeleted }) {
  const [count, setCount] = useState(article.counter || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(article.title);
  const [editContent, setEditContent] = useState(article.content);
  const [saving, setSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const isOwner = currentUserId === article.author_id;
  const isAdmin = currentUserRole === 'admin';
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  useEffect(() => {
    const checkLike = async () => {
      if (!currentUserId) return;
      const { data } = await supabase.from('likes').select('id')
        .eq('user_id', currentUserId).eq('article_id', article.id).single();
      if (data) setHasLiked(true);
    };
    checkLike();
  }, [currentUserId, article.id]);

  const fetchComments = async () => {
    const { data, error } = await supabase.from('comments')
      .select('*, profiles(full_name)')
      .eq('article_id', article.id).order('created_at', { ascending: true });
    if (!error) setComments(data);
  };

  const handleToggleComments = async () => {
    if (!showComments) await fetchComments();
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const { error } = await supabase.from('comments')
      .insert([{ article_id: article.id, user_id: currentUserId, content: newComment, parent_id: null }]);
    if (!error) { setNewComment(''); await fetchComments(); }
    else alert('Comment failed: ' + error.message);
  };

  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;
    const { error } = await supabase.from('comments')
      .insert([{ article_id: article.id, user_id: currentUserId, content: replyText, parent_id: parentId }]);
    if (!error) { setReplyText(''); setReplyingTo(null); await fetchComments(); }
    else alert('Reply failed: ' + error.message);
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) await fetchComments();
  };

  const handleLike = async () => {
    if (!currentUserId) { alert("Please login to like articles."); return; }
    if (hasLiked) {
      const { error } = await supabase.from('likes').delete()
        .eq('user_id', currentUserId).eq('article_id', article.id);
      if (error) return;
      await supabase.rpc('decrement_counter', { row_id: article.id });
      setCount(count - 1); setHasLiked(false);
    } else {
      const { error } = await supabase.from('likes')
        .insert([{ user_id: currentUserId, article_id: article.id }]);
      if (error) return;
      await supabase.rpc('increment_counter', { row_id: article.id });
      setCount(count + 1); setHasLiked(true);
    }
  };

  const handleShare = async () => {
    const authorName = article.profiles?.full_name || 'the author';
    if (navigator.share) {
      navigator.share({ title: article.title, text: `Check out this article by ${authorName}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', article.id);
    if (error) { alert('Delete failed: ' + error.message); }
    else if (onDeleted) onDeleted(article.id);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const { error } = await supabase.from('articles')
      .update({ title: editTitle, content: editContent }).eq('id', article.id);
    setSaving(false);
    if (!error) {
      setIsEditing(false);
      article.title = editTitle;
      article.content = editContent;
    } else {
      alert('Edit failed: ' + error.message);
    }
  };

  const topComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3">

      {isEditing ? (
        <div className="flex flex-col gap-3">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
            className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-black outline-none focus:border-gray-400 transition"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            placeholder="Content..."
            className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-black outline-none focus:border-gray-400 transition resize-y font-sans"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-400 border border-gray-100 rounded-md px-3 py-1.5 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-black text-white text-sm font-medium px-5 py-1.5 rounded-md hover:bg-gray-900 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ARTICLE HEADER */}
          <div>
            <h3 className="text-sm font-medium text-black mb-1">{article.title}</h3>
            <p className="text-xs text-black">
              By{' '}
              <Link href={`/user/${article.author_id}`} className="text-blue text-lg hover:underline">
                {article.profiles?.full_name || 'Unknown Author'}
              </Link>
            </p>
          </div>

          {/* CONTENT */}
          <p className="text-sm text-black leading-relaxed">{article.content}</p>

          {/* ATTACHMENT */}
          {article.file_url && (
            <div className="border border-gray-100 rounded-md p-3 bg-black-50">
              {article.file_type?.startsWith('image/') ? (
                <img src={article.file_url} alt="attachment" className="max-w-full rounded-md block" />
              ) : (
                <a href={article.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-black transition">
                  📄 {article.file_name}
                </a>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
            <button
              onClick={handleLike}
              className={`text-xs px-3 py-1.5 rounded-md border transition ${
                hasLiked
                  ? 'bg-gray-100 border-gray-200 text-black'
                  : 'border-gray-100 text-gray-400 hover:bg-gray-50'
              }`}
            >
              {hasLiked ? '♥' : '♡'} {count}
            </button>
            <button
              onClick={handleToggleComments}
              className={`text-xs px-3 py-1.5 rounded-md border transition ${
                showComments
                  ? 'bg-gray-100 border-gray-200 text-black'
                  : 'border-gray-100 text-gray-400 hover:bg-gray-50'
              }`}
            >
              💬 {showComments ? 'Hide' : 'Comments'}{comments.length > 0 ? ` ${comments.length}` : ''}
            </button>
            <button
              onClick={handleShare}
              className="text-xs px-3 py-1.5 rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 transition"
            >
              Share
            </button>
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs px-3 py-1.5 rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 transition ml-auto"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1.5 rounded-md border border-gray-100 text-red-400 hover:bg-red-50 transition"
              >
                Delete
              </button>
            )}
          </div>

          {/* COMMENTS */}
          {showComments && (
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">

              {/* Comment input */}
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-black outline-none focus:border-gray-400 transition"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-900 transition"
                >
                  Post
                </button>
              </div>

              {topComments.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-3">No comments yet.</p>
              ) : (
                topComments.map(comment => (
                  <div key={comment.id}>
                    <div className="bg-gray-50 rounded-md p-3 flex flex-col gap-1">
                      <p className="text-xs font-medium text-black">
                        {comment.profiles?.full_name || 'User'}
                      </p>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                      <div className="flex gap-3 mt-1">
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs text-gray-400 hover:text-black transition"
                        >
                          Reply
                        </button>
                        {(currentUserId === comment.user_id || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reply input */}
                    {replyingTo === comment.id && (
                      <div className="flex gap-2 mt-2 ml-4">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Reply..."
                          className="flex-1 px-3 py-1.5 rounded-md border border-gray-200 bg-white text-xs text-black outline-none focus:border-gray-400 transition"
                        />
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          className="bg-black text-white text-xs px-3 py-1.5 rounded-md hover:bg-gray-900 transition"
                        >
                          Send
                        </button>
                      </div>
                    )}

                    {/* Replies */}
                    {getReplies(comment.id).map(reply => (
                      <div key={reply.id} className="ml-4 mt-2 bg-gray-50 border-l-2 border-gray-100 rounded-r-md p-3 flex flex-col gap-1">
                        <p className="text-xs font-medium text-black">{reply.profiles?.full_name || 'User'}</p>
                        <p className="text-sm text-gray-600">{reply.content}</p>
                        {(currentUserId === reply.user_id || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(reply.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition w-fit"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}