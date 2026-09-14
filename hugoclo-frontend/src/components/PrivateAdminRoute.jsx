// ============================================================
// PrivateAdminRoute — Chỉ cho phép user có role='admin' vào
// Nếu chưa đăng nhập → redirect /auth
// Nếu đã đăng nhập nhưng không phải admin → redirect /
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateAdminRoute = ({ children }) => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateAdminRoute;
