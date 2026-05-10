import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrashAlt, FaLayerGroup } from 'react-icons/fa';

const Comics = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/comics?limit=100');
      const data = res.data.data.comics || res.data.data;
      setComics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách truyện');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa truyện này?')) return;
    try {
      await api.delete(`/comics/${id}`);
      toast.success('Đã xóa truyện');
      fetchComics();
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  const filteredComics = comics.filter((comic) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;

    return [comic.title, comic.author, comic.slug]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword));
  });

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="max-w-[1240px] mx-auto">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Quản lý truyện tranh</h1>
            <p className="mt-1 text-sm text-gray-400">Tổng số: {comics.length} truyện</p>
          </div>

          <button
            onClick={() => navigate('/admin/comics/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <FaPlus />
            Thêm truyện mới
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900/90">
          <div className="grid gap-3 border-b border-white/10 p-3 md:grid-cols-[1fr_260px] md:items-center">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm truyện..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-red-400"
            />

            <select className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-red-400">
              <option>Tất cả thể loại</option>
            </select>
          </div>

          {loading ? (
            <p className="p-4 text-sm text-gray-400">Đang tải...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-zinc-900/80 text-gray-300 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Truyện</th>
                    <th className="px-4 py-3.5 font-semibold">Tác giả</th>
                    <th className="px-4 py-3.5 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3.5 font-semibold">Lượt xem</th>
                    <th className="px-4 py-3.5 font-semibold">Chương</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComics.map((comic) => (
                    <tr key={comic._id} className="border-t border-white/10 transition-colors hover:bg-white/5">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={comic.coverImage?.url || '/assets/a1.jpg'}
                            alt={comic.title}
                            className="h-12 w-10 rounded object-cover border border-white/10 bg-white/5"
                          />
                          <div>
                            <div className="font-semibold text-gray-100">{comic.title}</div>
                            <div className="text-xs text-gray-500">{comic.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-300">{comic.author}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                          {comic.status === 'ongoing' ? 'Đang cập nhật' : comic.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-200">{comic.statistics?.totalViews || 0}</td>
                      <td className="px-4 py-3.5 text-gray-200">{comic.statistics?.totalChapters || 0}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            to={`/admin/comics/${comic._id}/chapters`}
                            className="inline-flex items-center gap-2 rounded bg-purple-700 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-purple-600"
                          >
                            <FaLayerGroup />
                            Chapters
                          </Link>
                          <Link
                            to={`/admin/comics/${comic._id}/chapters/new`}
                            className="inline-flex items-center gap-2 rounded bg-green-700 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                          >
                            <FaPlus />
                            Chapter
                          </Link>
                          <Link
                            to={`/admin/comics/${comic._id}/edit`}
                            className="inline-flex items-center gap-2 rounded bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                          >
                            <FaEdit />
                            Sửa
                          </Link>
                          <button
                            onClick={() => handleDelete(comic._id)}
                            className="inline-flex items-center gap-2 rounded bg-red-800 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                          >
                            <FaTrashAlt />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredComics.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-sm text-gray-400">
                        Không có truyện nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comics;
