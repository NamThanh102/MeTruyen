import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ComicCard from '../../components/ComicCard';
import api from '../../services/api';
import { FaHeart } from 'react-icons/fa';

const LibraryPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const response = await api.get('/users/library');
      const data = response.data.data;
      setBookmarks(data.bookmarks || []);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (comicId) => {
    try {
      await api.post(`/users/library/bookmark/${comicId}`);
      setBookmarks((prev) => prev.filter((b) => b.comicId?._id !== comicId));
    } catch {
      // Keep page stable for week-8 scope
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen" style={{ color: 'var(--text-primary)' }}>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">Truyện đã đánh dấu</h1>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--border)', borderRightColor: '#ef4444' }}></div>
        </div>
      ) : (
        <div>
          {bookmarks.length === 0 ? (
            <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <span className="text-6xl mb-4 block">📚</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '1rem' }}>
                Chưa có truyện nào được đánh dấu
              </p>
              <Link to="/comics" className="font-medium transition-colors" style={{ color: '#ef4444' }}>
                Bắt đầu thêm truyện →
              </Link>
            </div>
          ) : (
            <>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Bạn có <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{bookmarks.length}</span> truyện đã bookmark
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark._id} className="group relative">
                    <ComicCard comic={bookmark.comicId} />
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.comicId?._id)}
                      className="absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: 'white'
                      }}
                      title="Xóa bookmark"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
