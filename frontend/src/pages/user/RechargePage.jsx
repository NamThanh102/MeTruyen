import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaCoins, FaStar, FaUniversity, FaMobileAlt, FaWallet } from 'react-icons/fa';

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: <FaUniversity /> },
  { value: 'momo', label: 'Ví MoMo', icon: <FaMobileAlt /> },
  { value: 'zalopay', label: 'ZaloPay', icon: <FaWallet /> }
];

const VIP_PACKAGES = [
  { id: 'vip_1day', label: '1 ngày', points: 10000, duration: 1 },
  { id: 'vip_7days', label: '7 ngày', points: 50000, duration: 7 },
  { id: 'vip_1month', label: '1 tháng', points: 150000, duration: 30, popular: true },
  { id: 'vip_6months', label: '6 tháng', points: 700000, duration: 180 },
  { id: 'vip_1year', label: '1 năm', points: 1000000, duration: 365 }
];

const RechargePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [activeTab, setActiveTab] = useState('mpoints');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [vipLoading, setVipLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      updateUser(res.data.data.user);
    } catch {
      // keep page usable even if profile refresh fails
    }
  };

  const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const handleRecharge = async (e) => {
    e.preventDefault();

    if (parsedAmount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!transactionId.trim()) {
      toast.error('Vui lòng nhập mã giao dịch');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/users/recharge-mpoints', {
        amount: parsedAmount,
        paymentMethod,
        transactionId: transactionId.trim()
      });
      toast.success(res.data.message);
      setTransactionId('');
      setAmount('');
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Nạp thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeVIP = async (pkg) => {
    if ((user?.mPoints || 0) < pkg.points) {
      toast.error(`Bạn cần ${pkg.points.toLocaleString('vi-VN')} M-Point để mua gói này`);
      return;
    }

    setVipLoading(true);
    try {
      const res = await api.post('/users/upgrade-vip', {
        duration: pkg.duration,
        points: pkg.points
      });
      toast.success(res.data.message);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Nâng cấp VIP thất bại');
    } finally {
      setVipLoading(false);
    }
  };

  const isVIPActive = user?.isVIP && user?.vipExpireDate && new Date(user.vipExpireDate) > new Date();

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-zinc-900 via-purple-900/60 to-zinc-900 border border-zinc-700 rounded-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <FaCoins className="text-yellow-400" />
            Nạp M-Point & VIP
          </h1>
          <p className="text-gray-400 mb-6">Nạp tiền và nâng cấp tài khoản VIP</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-6 py-3">
              <p className="text-xs text-gray-400 mb-1">Số dư hiện tại</p>
              <p className="text-2xl font-bold text-yellow-400">
                {(user?.mPoints || 0).toLocaleString('vi-VN')} M-Point
              </p>
            </div>
            {isVIPActive && (
              <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg px-6 py-3">
                <p className="text-xs text-yellow-300 mb-1">VIP hết hạn</p>
                <p className="text-lg font-bold text-yellow-200">
                  {new Date(user.vipExpireDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('mpoints')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              activeTab === 'mpoints'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 border border-zinc-700 text-gray-300 hover:border-red-400'
            }`}
          >
            <FaCoins className="inline mr-2 mb-0.5" />
            Nạp M-Point
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              activeTab === 'vip'
                ? 'bg-yellow-500 text-white'
                : 'bg-zinc-800 border border-zinc-700 text-gray-300 hover:border-yellow-400'
            }`}
          >
            <FaStar className="inline mr-2 mb-0.5" />
            Nâng cấp VIP
          </button>
        </div>

        {activeTab === 'mpoints' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-4 mb-6 text-sm text-gray-300">
              <p className="font-semibold text-gray-200 mb-2">Hướng dẫn nạp tiền</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nhập số tiền bạn muốn nạp (VNĐ)</li>
                <li>Nhập mã giao dịch và bấm xác nhận</li>
                <li>1 VNĐ = 1 M-Point</li>
              </ul>
            </div>

            <form onSubmit={handleRecharge} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số tiền nạp <span className="text-red-500">*                                                                  </span>
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền (VNĐ)"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                />
                {parsedAmount > 0 && (
                  <p className="mt-2 text-sm text-green-400">
                    Bạn sẽ nhận được <strong>{parsedAmount.toLocaleString('vi-VN')} M-Point</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Phương thức thanh toán</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        paymentMethod === method.value
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-zinc-700 bg-zinc-800 hover:border-red-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-sm font-medium text-gray-200">{method.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mã giao dịch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Nhập mã giao dịch"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || parsedAmount <= 0 || !transactionId.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-lg font-bold text-lg hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : `Xác nhận nạp ${parsedAmount.toLocaleString('vi-VN')} M-Point`}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                <FaStar />
                Đặc quyền VIP
              </h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>Đọc truyện không giới hạn</li>
                <li>Tải chapter về máy</li>
              </ul>
            </div>

            <div className="space-y-3">
              {VIP_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex items-center justify-between hover:border-yellow-500 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-500/10 p-3 rounded-lg">
                      <FaStar className="text-yellow-400 text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{pkg.label}</h3>
                        {pkg.popular && (
                          <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">Phổ biến</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{pkg.points.toLocaleString('vi-VN')} M-Point</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgradeVIP(pkg)}
                    disabled={vipLoading || (user?.mPoints || 0) < pkg.points}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                      (user?.mPoints || 0) >= pkg.points
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600'
                        : 'bg-zinc-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {vipLoading ? 'Đang xử lý...' : (user?.mPoints || 0) >= pkg.points ? 'Mua ngay' : 'Không đủ Point'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargePage;
