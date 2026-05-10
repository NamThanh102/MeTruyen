import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';
import toast from 'react-hot-toast';

const readEntryRecursive = (entry) => {
  return new Promise((resolve) => {
    if (entry.isFile) {
      entry.file((file) => {
        resolve(file.type.startsWith('image/') ? [file] : []);
      }, () => resolve([]));
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const allEntries = [];
      const readBatch = () => {
        reader.readEntries((entries) => {
          if (entries.length === 0) {
            Promise.all(allEntries.map(readEntryRecursive)).then((results) =>
              resolve(results.flat())
            );
          } else {
            allEntries.push(...entries);
            readBatch();
          }
        }, () => resolve([]));
      };
      readBatch();
    } else {
      resolve([]);
    }
  });
};

const ChapterUpload = () => {
  const navigate = useNavigate();
  const { comicId, chapterId } = useParams();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chapterNumber: '',
    title: '',
    isVIPOnly: false,
  });
  const [pages, setPages] = useState([]);

  useEffect(() => {
    fetchComic();
    if (chapterId) fetchChapter();
  }, [comicId, chapterId]);

  const fetchChapter = async () => {
    try {
      const res = await api.get(`/chapters/${chapterId}`);
      const data = res.data.data.chapter || res.data.data;
      setFormData({
        chapterNumber: data.chapterNumber,
        title: data.title || '',
        isVIPOnly: !!data.isVIPOnly
      });
      const existingPages = (data.pages || []).map(p => ({ _id: p._id, preview: p.url, order: p.order, publicId: p.publicId, existing: true }));
      setPages(existingPages);
      setComic(data.comicId || null);
    } catch (err) {
      toast.error('Không thể tải dữ liệu chương');
      navigate('/admin/comics');
    }
  };

  const fetchComic = async () => {
    try {
      const response = await api.get(`/comics/${comicId}`);
      setComic(response.data.data.comic || response.data.data);
    } catch (error) {
      toast.error('Không thể tải thông tin truyện');
      navigate('/admin/comics');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    onDrop: async (acceptedFiles, fileRejections, event) => {
      const folderImages = [];
      const items = event?.dataTransfer?.items;
      if (items) {
        const promises = [];
        for (const item of items) {
          const entry = item.webkitGetAsEntry?.();
          if (entry?.isDirectory) {
            promises.push(readEntryRecursive(entry));
          }
        }
        const results = await Promise.all(promises);
        folderImages.push(...results.flat());
      }

      const allFiles = [...acceptedFiles, ...folderImages];
      const unique = allFiles.filter(
        (f, i) => allFiles.findIndex((x) => x.name === f.name && x.size === f.size) === i
      );
      unique.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );

      const newPages = unique.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        order: pages.length + index + 1,
      }));

      if (folderImages.length > 0 && acceptedFiles.length === 0) {
        toast.success(`Đã đọc ${folderImages.length} ảnh từ thư mục`);
      }

      setPages(prev => [...prev, ...newPages]);
    },
  });

  const handleRemovePage = (index) => {
    setPages(prev => prev.filter((_, i) => i !== index).map((page, i) => ({ ...page, order: i + 1 })));
  };

  const handleReorder = (index, direction) => {
    const newPages = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    
    [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
    setPages(newPages.map((page, i) => ({ ...page, order: i + 1 })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!chapterId && pages.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 trang');
      return;
    }

    if (!formData.chapterNumber) {
      toast.error('Vui lòng nhập số chapter');
      return;
    }

    setLoading(true);

    try {
      if (chapterId) {
        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('isPublished', 'true');
        fd.append('isVIPOnly', formData.isVIPOnly ? 'true' : 'false');
        const keptPages = pages.filter(p => p.existing).map(p => ({ _id: p._id }));
        fd.append('keptPages', JSON.stringify(keptPages));
        pages.filter(p => !p.existing).forEach(p => fd.append('pages', p.file));

        await api.put(`/chapters/${chapterId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Cập nhật chương thành công');
        navigate(`/admin/comics/${comicId}/chapters`);
      } else {
        const fd = new FormData();
        fd.append('chapterNumber', formData.chapterNumber);
        fd.append('title', formData.title);
        fd.append('isVIPOnly', formData.isVIPOnly ? 'true' : 'false');
        
        pages.forEach((page) => {
          if (page.file) fd.append('pages', page.file);
        });

        await api.post(`/comics/${comicId}/chapters`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.success('Upload chapter thành công!');
        navigate(`/admin/comics/${comicId}/chapters`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">{chapterId ? 'Chỉnh sửa chương' : 'Thêm chương'}</h1>
            <p className="text-gray-400 mt-1">Truyện: {comic?.title}</p>
          </div>
          <button
            onClick={() => navigate('/admin/comics')}
            className="px-4 py-2 text-gray-400 hover:text-gray-200"
          >
            ← Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Thông tin chương</h2>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số chương <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.chapterNumber}
                  onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
                  required
                  min="1"
                  step="0.1"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                  placeholder="1"
                  disabled={!!chapterId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tên chương</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                  placeholder="Tên chương (tùy chọn)"
                />
              </div>
            </div>

              <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVIPOnly}
                  onChange={(e) => setFormData({ ...formData, isVIPOnly: e.target.checked })}
                  className="w-4 h-4 text-red-500 rounded"
                />
                <span className="text-sm font-medium text-gray-300">Chỉ dành cho VIP</span>
              </label>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Kéo thả ảnh trang chương</h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-green-400 bg-green-900/10' : 'border-zinc-700 hover:border-red-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4"></div>
              {isDragActive ? (
                <p className="text-lg text-green-400 font-medium">Thả ảnh hoặc thư mục vào đây...</p>
              ) : (
                <div>
                  <p className="text-lg text-gray-300 font-medium mb-2">
                    Kéo thả ảnh hoặc thư mục vào đây
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Hỗ trợ: PNG, JPG, JPEG, GIF, WebP
                  </p>
                  <p className="text-sm text-cyan-400">
                     Kéo cả thư mục chứa ảnh — ảnh sẽ được đọc và sắp xếp tự động
                  </p>
                </div>
              )}
            </div>

            {pages.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-200">
                    Đã chọn {pages.length} trang
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPages([])}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {pages.map((page, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={page.preview}
                        alt={`Page ${page.order}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReorder(index, 'up')}
                          disabled={index === 0}
                          className="p-2 bg-zinc-700 text-gray-200 rounded-full hover:bg-zinc-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(index, 'down')}
                          disabled={index === pages.length - 1}
                          className="p-2 bg-zinc-700 text-gray-200 rounded-full hover:bg-zinc-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold">
                        {page.order}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || pages.length === 0}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors disabled:bg-zinc-700 disabled:text-gray-500"
            >
              {loading ? 'Đang upload...' : `Upload ${pages.length} trang`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/comics')}
              className="px-6 bg-zinc-700 text-gray-200 py-3 rounded-lg font-semibold hover:bg-zinc-600 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterUpload;
