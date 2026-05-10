import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import CommentSection from '../../components/CommentSection';

const ComicDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;
  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chapters');
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!slug || slug === 'undefined') return;

    const fetchData = async () => {
      try {
        const [comicRes, chaptersRes] = await Promise.all([
          api.get(`/comics/slug/${slug}`),
          api.get(`/comics/slug/${slug}/chapters`)
        ]);

        const comicData = comicRes.data.data;
        setComic(comicData);
        setChapters(chaptersRes.data.data || []);
        await api.post(`/comics/${comicData._id}/view`);

        try {
          const commentRes = await api.get(`/comics/${comicData._id}/comments?limit=1`);
          setCommentCount(commentRes?.data?.data?.pagination?.totalComments || 0);
        } catch { /* ignore */ }

        if (isAuthenticated) {
          try {
            const libraryRes = await api.get('/users/library');
            const bookmarks = libraryRes?.data?.data?.bookmarks || [];
            const exists = bookmarks.some((bookmark) => {
              const bookmarkedComicId = bookmark?.comicId?._id || bookmark?.comicId;
              return String(bookmarkedComicId) === String(comicData._id);
            });
            setIsBookmarked(exists);
          } catch {
            setIsBookmarked(false);
          }
        }
      } catch {
        navigate('/comics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, navigate, isAuthenticated]);

  const handleToggleBookmark = async () => {
    if (!comic || !isAuthenticated || bookmarkLoading) {
      return;
    }

    setBookmarkLoading(true);
    try {
      await api.post(`/users/library/bookmark/${comic._id}`);
      const nextBookmarked = !isBookmarked;
      setIsBookmarked(nextBookmarked);
      setComic((prev) => ({
        ...prev,
        statistics: {
          ...(prev?.statistics || {}),
          totalBookmarks: Math.max(
            0,
            (prev?.statistics?.totalBookmarks || 0) + (nextBookmarked ? 1 : -1)
          )
        }
      }));
    } catch {
      // Keep silent to avoid breaking reading flow.
    } finally {
      setBookmarkLoading(false);
    }
  };

  const getCoverUrl = (coverImage) => {
    if (!coverImage) return '/assets/default-cover.png';
    if (typeof coverImage === 'string') {
      const trimmed = coverImage.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          return parsed?.url || parsed?.secure_url || '/assets/default-cover.png';
        } catch {
          return '/assets/default-cover.png';
        }
      }
      return trimmed;
    }
    return coverImage?.url || coverImage?.secure_url || '/assets/default-cover.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-700 border-r-red-500" />
      </div>
    );
  }

  if (!comic) return null;

  return (
    <div className="min-h-screen pt-4">
      {comic.bannerImage && (
        <div className="h-64 md:h-96 relative">
          <img src={comic.bannerImage?.url || comic.bannerImage} alt={comic.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-lg p-6 mb-6" style={{ marginTop: comic.bannerImage ? '-80px' : '0', position: 'relative', zIndex: 10 }}>
          <div className="flex flex-col md:flex-row gap-6">
            <img src={getCoverUrl(comic.coverImage)} alt={comic.title} className="w-48 h-64 object-cover rounded-lg shadow-lg" />

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-100 mb-2">{comic.title}</h1>
              <p className="text-gray-400 mb-4">Tác giả: {comic.author || 'Đang cập nhật'}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {comic.categories?.map((category) => (
                  <span
                    key={category._id || category}
                    className="px-3 py-1 rounded-full text-sm bg-zinc-800 text-gray-200 border border-zinc-700"
                  >
                    {category.name}
                  </span>
                ))}
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    comic.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : comic.status === 'ongoing'
                        ? 'bg-blue-100 text-blue-700'
                        : comic.status === 'hiatus'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                  }`}
                >
                  {{'ongoing':'Đang cập nhật','completed':'Hoàn thành','hiatus':'Tạm dừng','cancelled':'Đã hủy'}[comic.status] || comic.status}
                </span>
              </div>

              <div className="flex items-center gap-6 mb-4 text-gray-400">
                <span>{comic.statistics?.totalViews || 0} lượt xem</span>
                <span>{comic.statistics?.totalBookmarks || 0} yêu thích</span>
                <span>{chapters.length} chương</span>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">{comic.description}</p>

              <div className="flex items-center gap-3">
                {chapters.length > 0 && (
                  <Link to={`/read/${chapters[0]._id}`} className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500">
                    Đọc ngay
                  </Link>
                )}

                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    disabled={bookmarkLoading}
                    className={`px-6 py-3 font-semibold rounded-lg border transition-colors ${
                      isBookmarked
                        ? 'bg-red-500/10 text-red-400 border-red-500/60 hover:bg-red-500/20'
                        : 'bg-zinc-800 text-gray-100 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {bookmarkLoading
                      ? 'Đang lưu...'
                      : isBookmarked
                        ? 'Đã lưu tủ truyện'
                        : 'Yêu thích / Lưu tủ truyện'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-6 border-b border-zinc-700 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('chapters')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'chapters'
                  ? 'border-b-2 border-red-500 text-red-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Danh sách chương ({chapters.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'comments'
                  ? 'border-b-2 border-red-500 text-red-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Bình luận ({commentCount})
            </button>
          </div>

          {activeTab === 'chapters' ? (
            chapters.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Chưa có chương nào</p>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter._id}
                    to={`/read/${chapter._id}`}
                    className="flex items-center justify-between p-4 hover:bg-zinc-800 rounded-lg transition-colors group border border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-200 group-hover:text-cyan-400 font-medium">
                        Chapter {chapter.chapterNumber}
                        {chapter.title && `: ${chapter.title}`}
                      </span>
                      {chapter.isVIPOnly && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded border border-amber-500/30">
                          VIP
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">{new Date(chapter.createdAt).toLocaleDateString('vi-VN')}</span>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <CommentSection comicId={comic._id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComicDetailPage;
