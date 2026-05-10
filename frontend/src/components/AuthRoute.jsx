import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AuthRoute = ({ requireAdmin }) => {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-400">
        {requireAdmin ? 'Đang kiểm tra quyền truy cập...' : 'Đang kiểm tra trạng thái đăng nhập...'}
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
