import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const CommentSection = ({ comicId, chapterId }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalComments: 0 });

  useEffect(() => {
    if (!comicId && !chapterId) return;
    fetchComments();
  }, [comicId, chapterId, pagination.currentPage]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.currentPage, limit: 20 };
      if (chapterId) params.chapterId = chapterId;
      const res = await api.get(`/comics/${comicId}/comments`, { params });
      setComments(res.data.data.comments);
      setPagination(res.data.data.pagination);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmitting(true);
    try {
      const body = { content: content.trim() };
      if (chapterId) body.chapterId = chapterId;
      const res = await api.post(`/comics/${comicId}/comments`, body);
      setComments((prev) => [res.data.data.comment, ...prev]);
      setPagination((prev) => ({ ...prev, totalComments: prev.totalComments + 1 }));
      setContent('');
      toast.success('Bình luận thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bình luận thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await api.delete(`/comics/${comicId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPagination((prev) => ({ ...prev, totalComments: prev.totalComments - 1 }));
      toast.success('Đã xóa bình luận');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-100 mb-4">
        Bình luận {chapterId ? 'chương này' : ''} {pagination.totalComments > 0 && `(${pagination.totalComments})`}
      </h3>

      {token ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập bình luận..."
            rows="3"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-gray-100 focus:outline-none focus:border-red-400 resize-none"
            maxLength="1000"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">{content.length}/1000</span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60 text-sm font-semibold"
            >
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-500 text-sm mb-6">
          <a href="/login" className="text-red-400 hover:text-red-300">Đăng nhập</a> để bình luận
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-red-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Chưa có bình luận nào</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
              <img
                src={comment.userId?.avatar || 'https://via.placeholder.com/40'}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-200">
                    {comment.userId?.displayName || comment.userId?.username || 'Ẩn danh'}
                  </span>
                  {comment.chapterId && !chapterId && (
                    <span className="text-xs text-cyan-500">
                      Chương {comment.chapterId.chapterNumber}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                {(user?._id === comment.userId?._id || user?.role === 'admin') && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment._id)}
                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                disabled={pagination.currentPage === 1}
                onClick={() => setPagination((p) => ({ ...p, currentPage: p.currentPage - 1 }))}
                className="px-3 py-1 text-sm rounded bg-zinc-800 text-gray-300 hover:bg-zinc-700 disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-sm text-gray-500">
                {pagination.currentPage}/{pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, currentPage: p.currentPage + 1 }))}
                className="px-3 py-1 text-sm rounded bg-zinc-800 text-gray-300 hover:bg-zinc-700 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
