import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const AuthLayout = () => {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout-wrapper">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
