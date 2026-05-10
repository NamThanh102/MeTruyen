import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalComics: 0,
    totalUsers: 0,
    vipUsers: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Không thể tải thống kê');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Bảng điều khiển</h1>
        <p className="text-gray-400 mt-2">Quản lý hệ thống MeTruyen</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Tổng truyện</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{stats.totalComics}</p>
            </div>
          </div>
          <Link to="/admin/comics" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-4 inline-block">
            Quản lý →
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Người dùng</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{stats.totalUsers}</p>
            </div>
          </div>
          <Link to="/admin/users" className="text-green-400 hover:text-green-300 text-sm font-medium mt-4 inline-block">
            Quản lý →
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Thành viên VIP</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{stats.vipUsers}</p>
            </div>
          </div>
          <Link to="/admin/users?role=vip" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium mt-4 inline-block">
            Xem danh sách →
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Lượt xem</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{stats.totalViews}</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">Tổng lượt xem</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Quản lý nội dung</h2>
          <div className="space-y-3">
            <Link
              to="/admin/comics"
              className="flex items-center justify-between p-4 bg-blue-900/20 hover:bg-blue-800/40 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-200 group-hover:text-blue-300">Quản lý truyện tranh</span>
              </div>
              <span className="text-gray-500 group-hover:text-blue-400">→</span>
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center justify-between p-4 bg-green-900/20 hover:bg-green-800/40 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-200 group-hover:text-green-300">Quản lý thể loại</span>
              </div>
              <span className="text-gray-500 group-hover:text-green-400">→</span>
            </Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Hệ thống</h2>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between w-full p-4 bg-green-900/20 hover:bg-green-800/40 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-200 group-hover:text-green-300">Quản lý người dùng</span>
              </div>
              <span className="text-gray-500 group-hover:text-green-400">→</span>
            </Link>

            <Link
              to="/admin/payments"
              className="flex items-center justify-between w-full p-4 bg-yellow-900/20 hover:bg-yellow-800/40 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-200 group-hover:text-yellow-300">Quản lý hóa đơn</span>
              </div>
              <span className="text-gray-500 group-hover:text-yellow-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
