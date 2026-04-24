import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const AuthLayout = () => {
  // Mock authentication state
  const isAuthenticated = false; // Usually we check if user is already logged in

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout-wrapper">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
