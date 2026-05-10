import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ComicCard from '../components/ComicCard';
import api from '../services/api';

const SLIDER_IMAGES = [
  { src: '/assets/a2.jpg', label: 'Thế giới manga đang chờ bạn' },
  { src: '/assets/a3.jpg', label: 'Hàng ngàn bộ truyện đặc sắc' },
  { src: '/assets/a4.jpg', label: 'Khám phá mỗi ngày' },
  { src: '/assets/a6.jpg', label: 'Đọc mọi lúc mọi nơi' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 4000);
  };

  useEffect(() => {
    fetchComics();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setSlideIndex(idx);
    startTimer();
  };

  const fetchComics = async () => {
    try {
      const [featuredRes, latestRes, popularRes] = await Promise.all([
        api.get('/comics?sort=-statistics.totalViews&limit=6'),
        api.get('/comics?sort=-createdAt&limit=12'),
        api.get('/comics?sort=-statistics.totalBookmarks&limit=6'),
      ]);

      const categoriesRes = await api.get('/categories');

      setFeatured(Array.isArray(featuredRes.data.data) ? featuredRes.data.data : []);
      setLatest(Array.isArray(latestRes.data.data) ? latestRes.data.data : []);
      setPopular(Array.isArray(popularRes.data.data) ? popularRes.data.data : []);
      setCategories(categoriesRes.data?.data?.categories || []);
    } catch (error) {
      console.error('Failed to fetch comics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <div className="relative h-[420px] md:h-[520px] overflow-hidden border-b border-zinc-800/70">
        {SLIDER_IMAGES.map((img, i) => (
          <div
            key={img.src}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === slideIndex ? 1 : 0, zIndex: i === slideIndex ? 1 : 0 }}
          >
            <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(120deg, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.45) 50%, rgba(10,10,10,0.80) 100%)',
              }}
            />
          </div>
        ))}

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div style={{ animation: 'fadeInDown 0.8s ease-out' }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              Khám phá thế giới truyện tranh
            </h1>
            <p className="text-lg md:text-2xl mb-2 text-gray-300">
              {SLIDER_IMAGES[slideIndex].label}
            </p>
            <p className="text-base md:text-xl mb-8 text-gray-400">
              Hàng ngàn bộ truyện đang chờ bạn khám phá
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/comics"
                className="px-8 py-4 font-semibold rounded-lg transition-transform hover:scale-105 bg-red-500 hover:bg-red-600 text-white"
              >
                Khám phá ngay →
              </Link>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {SLIDER_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === slideIndex ? 'bg-red-500 w-8' : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10 min-h-screen">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--border)', borderRightColor: '#ef4444' }} />
          </div>
        ) : (
          <>
            {categories.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-100 mb-4 border-l-4 border-red-500 pl-3">Thể loại</h2>
                <div className="flex flex-wrap gap-3">
                  {categories.slice(0, 12).map((category) => (
                    <Link
                      key={category._id}
                      to={`/comics?category=${category.slug}`}
                      className="px-4 py-2 rounded-full bg-zinc-900/85 border border-zinc-700 text-sm text-gray-200 hover:border-red-400 hover:text-red-300 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {featured.length > 0 && (
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold border-l-4 border-red-500 pl-3">
                      <Link to="/comics?sort=-statistics.totalViews" className="text-gray-100 hover:text-red-400 transition-colors">
                        Đề xuất cho bạn
                      </Link>
                    </h2>
                    <p className="text-gray-400 mt-2">
                      Những bộ truyện được đọc nhiều nhất
                    </p>
                  </div>
                  <Link to="/comics?sort=-statistics.totalViews" className="text-base text-cyan-400 hover:text-cyan-300 hover:underline whitespace-nowrap shrink-0 ml-4">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {featured.slice(0, 5).map((comic) => <ComicCard key={comic._id} comic={comic} />)}
                </div>
              </section>
            )}

            {latest.length > 0 && (
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold border-l-4 border-red-500 pl-3">
                      <Link to="/comics?sort=-lastChapterUpdate" className="text-gray-100 hover:text-red-400 transition-colors">
                        Truyện mới cập nhật
                      </Link>
                    </h2>
                    <p className="text-gray-400 mt-2">
                      Các chương mới nhất được thêm vào
                    </p>
                  </div>
                  <Link to="/comics?sort=-lastChapterUpdate" className="text-base text-cyan-400 hover:text-cyan-300 hover:underline whitespace-nowrap shrink-0 ml-4">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {latest.slice(0, 6).map((comic) => <ComicCard key={comic._id} comic={comic} />)}
                </div>
              </section>
            )}

            {popular.length > 0 && (
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold border-l-4 border-red-500 pl-3">
                      <Link to="/comics?sort=-statistics.totalBookmarks" className="text-gray-100 hover:text-red-400 transition-colors">
                        Truyện được yêu thích nhất
                      </Link>
                    </h2>
                    <p className="text-gray-400 mt-2">
                      Truyện được lưu tủ nhiều nhất
                    </p>
                  </div>
                  <Link to="/comics?sort=-statistics.totalBookmarks" className="text-base text-cyan-400 hover:text-cyan-300 hover:underline whitespace-nowrap shrink-0 ml-4">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {popular.slice(0, 6).map((comic) => <ComicCard key={comic._id} comic={comic} />)}
                </div>
              </section>
            )}

            {featured.length === 0 && latest.length === 0 && popular.length === 0 && (
              <div className="text-center py-20">
                <span className="text-6xl mb-4 block">📚</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                  Chưa có truyện nào. Hãy thêm truyện đầu tiên!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
