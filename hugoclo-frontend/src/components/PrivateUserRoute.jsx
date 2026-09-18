// ============================================================
// PrivateUserRoute — Không cho phép admin truy cập trang user
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateUserRoute = ({ children }) => {
  const { user } = useAuth();

  // Nếu đã đăng nhập và là admin thì không cho xem trang user, đẩy về admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PrivateUserRoute;
