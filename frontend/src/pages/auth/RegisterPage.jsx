import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [clientError, setClientError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    if (error) {
      clearError();
    }

    if (clientError) {
      setClientError('');
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setClientError('Mật khẩu xác nhận không khớp');
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setSuccessMessage('Đăng ký thành công, đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-8 backdrop-blur">
        <h2 className="text-3xl font-bold text-center text-gray-100 mb-8">Đăng ký</h2>

        {(clientError || error) && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {clientError || error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Tên người dùng
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400 placeholder-gray-500"
              placeholder="username"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400 placeholder-gray-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400 placeholder-gray-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-100 rounded-lg focus:outline-none focus:border-red-400 placeholder-gray-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
