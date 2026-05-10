import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import CommentSection from '../../components/CommentSection';

const ReaderPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;

  const [chapter, setChapter] = useState(null);
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chapterId || chapterId === 'undefined') return;
    fetchChapter();
  }, [chapterId]);

  const fetchChapter = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/chapters/${chapterId}`);
      const chapterData = response.data.data.chapter;
      setChapter(chapterData);

      const comicId = chapterData.comicId?._id || chapterData.comicId;
      if (comicId) {
        fetchComic(comicId);
      }

      try {
        await api.post(`/users/library/history/${chapterId}`, {});
        console.log('Lưu lịch sử thành công');
      } catch (err) {
        console.error('Lưu lịch sử thất bại:', err.response?.data || err.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể tải chương';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComic = async (comicId) => {
    try {
      const response = await api.get(`/comics/${comicId}`);
      const comicData = response.data.data;
      setComic(comicData);
    } catch {
      // Không ảnh hưởng đến trải nghiệm đọc, chỉ mất dropdown chọn chương
    }
  };
  const comicData = comic?.comic || null;
  const chapterList = comic?.chapters || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-700 border-r-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Không thể truy cập</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-zinc-700 text-gray-200 rounded-lg font-semibold hover:bg-zinc-600 transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-zinc-900/95 border-b border-zinc-800 sticky top-0 z-50 shadow-lg backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <div className="flex items-center justify-start">
              <Link
                to={chapter.comicId?.slug ? `/comics/${chapter.comicId.slug}` : '/comics'}
                className="text-gray-300 hover:text-cyan-400"
              >
                ← Về trang truyện
              </Link>
            </div>

            <div className="text-center">
              <h1 className="text-gray-100 font-semibold text-xl truncate">
                {chapter.comicId?.title || comicData?.title || 'Đọc truyện'}
              </h1>
              <p className="text-gray-400 text-sm mt-1 truncate">
                Chapter {chapter.chapterNumber}
                {chapter.title && `: ${chapter.title}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link
              to={chapter.previousChapter ? `/read/${chapter.previousChapter._id || chapter.previousChapter}` : '#'}
              aria-disabled={!chapter.previousChapter}
              tabIndex={chapter.previousChapter ? 0 : -1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                chapter.previousChapter
                  ? 'bg-zinc-700 text-gray-100 hover:bg-zinc-600'
                  : 'bg-zinc-800 text-zinc-500 pointer-events-none'
              }`}
            >
              ← Chương trước
            </Link>

            <select
              value={chapterId}
              onChange={(e) => navigate(`/read/${e.target.value}`)}
              className="px-4 py-2 bg-zinc-800 text-gray-100 border border-zinc-700 rounded-lg min-w-44"
            >
              {chapterList.map((item) => (
                <option key={item._id} value={item._id}>
                  Chapter {item.chapterNumber}{item.title ? `: ${item.title}` : ''}
                </option>
              ))}
            </select>

            <Link
              to={chapter.nextChapter ? `/read/${chapter.nextChapter._id || chapter.nextChapter}` : '#'}
              aria-disabled={!chapter.nextChapter}
              tabIndex={chapter.nextChapter ? 0 : -1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                chapter.nextChapter
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                  : 'bg-zinc-800 text-zinc-500 pointer-events-none'
              }`}
            >
              Chương sau →
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="max-w-4xl mx-auto">
          {chapter.pages?.map((page, index) => (
            <img
              key={page._id || `${page.order || index}`}
              src={page.url}
              alt={`Page ${page.order}`}
              className="w-full h-auto block"
              loading="lazy"
            />
          ))}
        </div>

        <div className="bg-zinc-900/90 border-t border-zinc-800 py-8">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 px-4">
            <Link
              to={chapter.previousChapter ? `/read/${chapter.previousChapter._id || chapter.previousChapter}` : '#'}
              aria-disabled={!chapter.previousChapter}
              tabIndex={chapter.previousChapter ? 0 : -1}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                chapter.previousChapter
                  ? 'bg-zinc-700 text-gray-100 hover:bg-zinc-600'
                  : 'bg-zinc-800 text-zinc-500 pointer-events-none'
              }`}
            >
              ← Chương trước
            </Link>
            <Link
              to={chapter.nextChapter ? `/read/${chapter.nextChapter._id || chapter.nextChapter}` : '#'}
              aria-disabled={!chapter.nextChapter}
              tabIndex={chapter.nextChapter ? 0 : -1}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                chapter.nextChapter
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                  : 'bg-zinc-800 text-zinc-500 pointer-events-none'
              }`}
            >
              Chương sau →
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <CommentSection
            comicId={chapter.comicId?._id || chapter.comicId}
            chapterId={chapterId}
          />
        </div>
      </div>
    </div>
  );
};

export default ReaderPage;
