import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ComicCard from '../../components/ComicCard';
import api from '../../services/api';

const ComicsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [comics, setComics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-createdAt',
  });

  useEffect(() => {
    fetchCategories();
    fetchComics();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data.categories || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchComics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get(`/comics?${params.toString()}`);
      const data = response.data.data;
      setComics(Array.isArray(data) ? data : []);
    } catch {
      setComics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([paramKey, paramValue]) => {
      if (paramValue) params.set(paramKey, paramValue);
    });
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">Truyện tranh</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => handleFilterChange('category', '')}
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
            !filters.category ? 'bg-red-500 text-white border-red-500' : 'bg-zinc-900/85 text-gray-300 border-zinc-700 hover:border-red-400'
          }`}
        >
          Tất cả
        </button>
        {categories.slice(0, 10).map((category) => (
          <button
            key={category._id}
            onClick={() => handleFilterChange('category', category.slug)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              filters.category === category.slug
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-zinc-900/85 text-gray-300 border-zinc-700 hover:border-red-400'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900/85 border border-zinc-800 rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm truyện..."
            value={filters.search}
            onChange={(event) => handleFilterChange('search', event.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
          />

          <select
            value={filters.status}
            onChange={(event) => handleFilterChange('status', event.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ongoing">Đang cập nhật</option>
            <option value="completed">Hoàn thành</option>
            <option value="hiatus">Tạm dừng</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            value={filters.category}
            onChange={(event) => handleFilterChange('category', event.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
          >
            <option value="">Tất cả thể loại</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug}>{category.name}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(event) => handleFilterChange('sort', event.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
          >
            <option value="-createdAt">Mới nhất</option>
            <option value="-updatedAt">Cập nhật mới</option>
            <option value="-statistics.totalViews">Xem nhiều nhất</option>
            <option value="-statistics.totalBookmarks">Yêu thích nhất</option>
            <option value="title">Tên A-Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-700 border-r-red-500" />
          <p className="text-gray-400 mt-4">Đang tải...</p>
        </div>
      ) : comics.length === 0 ? (
        <div className="bg-zinc-900/85 border border-zinc-800 rounded-lg p-12 text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <p className="text-gray-400 text-lg">Không tìm thấy truyện nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {comics.map((comic) => <ComicCard key={comic._id} comic={comic} />)}
        </div>
      )}
    </div>
  );
};

export default ComicsPage;
