import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      const data = res.data.data.categories || res.data.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách thể loại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success('Cập nhật thể loại thành công');
      } else {
        await api.post('/categories', form);
        toast.success('Thêm thể loại thành công');
      }
      setForm({ name: '', slug: '', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, slug: c.slug, description: c.description || '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa thể loại này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Đã xóa thể loại');
      fetchCategories();
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-100 mb-4">Quản lý thể loại</h1>

        <form onSubmit={handleSubmit} className="mb-6 bg-zinc-900 border border-zinc-800 p-4 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Tên thể loại" className="p-2 bg-zinc-800 border border-zinc-700 rounded text-gray-100" required />
            <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="Slug (ví dụ: action)" className="p-2 bg-zinc-800 border border-zinc-700 rounded text-gray-100" />
          </div>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Mô tả" className="mt-3 p-2 w-full bg-zinc-800 border border-zinc-700 rounded text-gray-100" />
          <div className="mt-3 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 rounded text-white">{editingId ? 'Cập nhật' : 'Thêm'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', slug: '', description: '' });}} className="px-4 py-2 bg-zinc-700 rounded text-gray-200">Hủy</button>}
          </div>
        </form>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Danh sách thể loại</h2>
          {loading ? <p className="text-gray-400">Đang tải...</p> : (
            <div className="space-y-3">
              {categories.map(c => (
                <div key={c._id} className="flex items-center justify-between p-3 bg-zinc-800 rounded">
                  <div>
                    <div className="font-medium text-gray-100">{c.name} <span className="text-sm text-gray-400">/{c.slug}</span></div>
                    <div className="text-sm text-gray-400">{c.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(c)} className="px-3 py-1 bg-yellow-600 rounded text-white">Sửa</button>
                    <button onClick={() => handleDelete(c._id)} className="px-3 py-1 bg-red-600 rounded text-white">Xóa</button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-gray-400">Chưa có thể loại nào.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
