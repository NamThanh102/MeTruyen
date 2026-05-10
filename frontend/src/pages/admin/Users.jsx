import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    role: 'user',
    isVIP: false,
    vipExpireDate: '',
    mPoints: 0
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          search,
          role: roleFilter
        }
      });
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
      isVIP: user.isVIP,
      vipExpireDate: user.vipExpireDate 
        ? new Date(user.vipExpireDate).toISOString().split('T')[0] 
        : '',
      mPoints: user.mPoints || 0
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${selectedUser._id}`, formData);
      toast.success('Cập nhật người dùng thành công');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    try {
      await api.put(`/admin/users/${selectedUser._id}/password`, {
        newPassword
      });
      toast.success('Đổi mật khẩu thành công');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-900/40 text-red-300',
      user: 'bg-blue-900/40 text-blue-300'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[role] || colors.user}`}>
        {role === 'admin' ? 'Admin' : 'User'}
      </span>
    );
  };

  const getVIPBadge = (user) => {
    if (!user.isVIP) {
      return <span className="text-gray-500 text-sm">Không</span>;
    }
    const isExpired = new Date(user.vipExpireDate) < new Date();
    return (
      <div className="flex flex-col">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isExpired ? 'bg-zinc-700 text-gray-400' : 'bg-yellow-900/40 text-yellow-300'}`}>
          {isExpired ? 'Hết hạn' : 'VIP'}
        </span>
        {user.vipExpireDate && (
          <span className="text-xs text-gray-500 mt-1">
            {new Date(user.vipExpireDate).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Quản lý người dùng</h1>
        <p className="text-gray-400 mt-2">Tổng số: {pagination.totalUsers} người dùng</p>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lọc theo vai trò
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
            >
              <option value="">Tất cả</option>
              <option value="admin">Admin</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchUsers}
              className="w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-100 rounded-lg transition-colors"
            >
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-700">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      M-Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      VIP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.avatar || '/assets/default-avatar.png'}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => e.target.src = '/assets/default-avatar.png'}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-100">
                              {user.displayName || user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-yellow-400">
                          $ {user.mPoints || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVIPBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleChangePassword(user)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Đổi MK
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-gray-700">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full my-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Chỉnh sửa người dùng</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vai trò
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    M-Point
                  </label>
                  <input
                    type="number"
                    value={formData.mPoints}
                    onChange={(e) => setFormData({ ...formData, mPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVIP"
                    checked={formData.isVIP}
                    onChange={(e) => setFormData({ ...formData, isVIP: e.target.checked })}
                    className="w-4 h-4 text-red-500 border-zinc-600 rounded"
                  />
                  <label htmlFor="isVIP" className="text-sm font-medium text-gray-300">
                    VIP
                  </label>
                </div>

                {formData.isVIP && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ngày hết hạn VIP
                    </label>
                    <input
                      type="date"
                      value={formData.vipExpireDate}
                      onChange={(e) => setFormData({ ...formData, vipExpireDate: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-zinc-700 text-gray-200 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full my-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Đổi mật khẩu</h2>
            <p className="text-gray-400 mb-4">
              Đổi mật khẩu cho: <strong className="text-gray-200">{selectedUser?.username}</strong>
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Đổi mật khẩu
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2 bg-zinc-700 text-gray-200 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
