import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChapterList = () => {
  const { comicId } = useParams();
  const navigate = useNavigate();
  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPublished, setEditPublished] = useState(true);

  useEffect(() => {
    fetchComic();
    fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comicId]);

  const fetchComic = async () => {
    try {
      const res = await api.get(`/comics/${comicId}`);
      const data = res.data.data.comic || res.data.data;
      setComic(data);
    } catch (err) {
      toast.error('Không thể tải truyện');
      navigate('/admin/comics');
    }
  };

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/comics/${comicId}/chapters`);
      const data = res.data.data || [];
      setChapters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách chương');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chapterId) => {
    if (!confirm('Xác nhận xóa chương này?')) return;
    try {
      await api.delete(`/chapters/${chapterId}`);
      toast.success('Đã xóa chương');
      fetchChapters();
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  const openEdit = (ch) => {
    setEditing(ch._id);
    setEditTitle(ch.title || '');
    setEditPublished(!!ch.isPublished);
  };

  const submitEdit = async () => {
    try {
      await api.put(`/chapters/${editing}`, { title: editTitle, isPublished: editPublished });
      toast.success('Cập nhật chương thành công');
      setEditing(null);
      fetchChapters();
    } catch (err) {
      toast.error('Cập nhật thất bại');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Quản lý chương</h1>
            <p className="text-gray-400">Truyện: {comic?.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/admin/comics/${comicId}/chapters/new`} className="px-4 py-2 bg-blue-600 rounded text-white">Thêm chương mới</Link>
            <Link to="/admin/comics" className="px-4 py-2 bg-zinc-700 rounded text-gray-200">← Quay lại</Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          {loading ? <p className="text-gray-400">Đang tải...</p> : (
            <div className="space-y-3">
              {chapters.map(ch => (
                <div key={ch._id} className="flex items-center justify-between p-3 bg-zinc-800 rounded">
                  <div>
                    <div className="font-medium text-gray-100">Chương {ch.chapterNumber} {ch.title ? `- ${ch.title}` : ''}</div>
                    <div className="text-sm text-gray-400">{ch.publishDate ? new Date(ch.publishDate).toLocaleString() : 'Chưa xuất bản'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/admin/comics/${comicId}/chapters/${ch._id}/edit`)} className="px-3 py-1 bg-yellow-600 rounded text-white">Sửa</button>
                    <button onClick={() => handleDelete(ch._id)} className="px-3 py-1 bg-red-600 rounded text-white">Xóa</button>
                  </div>
                </div>
              ))}
              {chapters.length === 0 && <p className="text-gray-400">Chưa có chương nào.</p>}
            </div>
          )}
        </div>

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Chỉnh sửa chương</h3>
              <label className="block text-sm text-gray-300 mb-1">Tiêu đề</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded mb-3" />
              <label className="flex items-center gap-2 mb-4"><input type="checkbox" checked={editPublished} onChange={(e) => setEditPublished(e.target.checked)} /> Đã xuất bản</label>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 bg-zinc-700 rounded text-gray-200">Hủy</button>
                <button onClick={submitEdit} className="px-4 py-2 bg-blue-600 rounded text-white">Lưu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterList;
