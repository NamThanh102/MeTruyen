import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaReceipt, FaSearch, FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';

const STATUS_BADGE = {
  success:  'bg-green-900/40 text-green-300 border border-green-700',
  pending:  'bg-yellow-900/40 text-yellow-300 border border-yellow-700',
  failed:   'bg-red-900/40 text-red-300 border border-red-700',
  refunded: 'bg-purple-900/40 text-purple-300 border border-purple-700',
};

const STATUS_LABEL = {
  success: 'Thành công',
  pending: 'Đang chờ',
  failed:  'Thất bại',
  refunded:'Hoàn tiền',
};

const METHOD_LABEL = {
  bank_transfer: 'Chuyển khoản',
  momo:          'MoMo',
  zalopay:       'ZaloPay',
  vnpay:         'VNPay',
  credit_card:   'Thẻ tín dụng',
};

const AdminPayments = () => {
  const [payments, setPayments]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatus]       = useState('');
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({ totalPages: 1, totalPayments: 0 });

  // Edit modal state
  const [editTarget, setEditTarget]     = useState(null);
  const [editStatus, setEditStatus]     = useState('');
  const [editLoading, setEditLoading]   = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/admin/payments?${params}`);
      setPayments(res.data.data.payments || []);
      setPagination(res.data.data.pagination || { totalPages: 1, totalPayments: 0 });
    } catch (err) {
      toast.error('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const openEdit = (payment) => {
    setEditTarget(payment);
    setEditStatus(payment.status);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await api.put(`/admin/payments/${editTarget._id}`, { status: editStatus });
      toast.success('Cập nhật trạng thái thành công');
      setEditTarget(null);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Xóa giao dịch ${payment.transactionId}? Hành động này không thể hoàn tác.`)) return;
    try {
      await api.delete(`/admin/payments/${payment._id}`);
      toast.success('Đã xóa giao dịch');
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const totalSuccess = payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/admin" className="text-gray-400 hover:text-gray-200 text-sm mb-2 inline-block">← Quay lại Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <FaReceipt className="text-yellow-400" />Quản lý hóa đơn
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Tổng: <span className="text-gray-200 font-semibold">{pagination.totalPayments}</span> giao dịch
            {payments.length > 0 && (
              <> &nbsp;·&nbsp; Thành công trên trang này: <span className="text-green-400 font-semibold">{totalSuccess.toLocaleString()} VNĐ</span></>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã giao dịch..."
              className="w-full bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-400 placeholder:text-gray-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg font-medium">
            Tìm
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-zinc-800 border border-zinc-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="pending">Đang chờ</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Hoàn tiền</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-zinc-700 border-t-red-500" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Không có giao dịch nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Mã giao dịch</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Người dùng</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Số tiền</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Phương thức</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Thời gian</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{p.transactionId}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-200 font-medium">{p.userId?.username || '—'}</div>
                      <div className="text-gray-500 text-xs">{p.userId?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-200 font-semibold whitespace-nowrap">
                      {p.amount.toLocaleString()} VNĐ
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {METHOD_LABEL[p.paymentMethod] || p.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] || 'bg-zinc-700 text-gray-400'}`}>
                        {STATUS_LABEL[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 bg-blue-900/40 text-blue-300 rounded hover:bg-blue-800/60 transition-colors"
                          title="Sửa trạng thái"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 bg-red-900/40 text-red-300 rounded hover:bg-red-800/60 transition-colors"
                          title="Xóa giao dịch"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-gray-400 text-sm">Trang {page} / {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-700 text-gray-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              <FaChevronLeft className="text-xs" /> Trước
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-700 text-gray-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Sau <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-sm p-6 my-8">
            <h3 className="text-lg font-bold text-gray-100 mb-1">Sửa trạng thái giao dịch</h3>
            <p className="text-gray-500 text-xs mb-4 font-mono">{editTarget.transactionId}</p>

            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:border-red-400"
            >
              <option value="pending">Đang chờ</option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Hoàn tiền</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white font-semibold rounded-lg text-sm"
              >
                {editLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={() => setEditTarget(null)}
                className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-200 font-semibold rounded-lg text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
