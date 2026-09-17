import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import RightPanel from '../components/RightPanel/RightPanel';
import CreatePostModal from '../components/Modals/CreatePostModal';
import RefineModal from '../components/Modals/RefineModal';
import usePostStore from '../store/usePostStore';
import useAuthStore from '../store/useAuthStore';

const ProtectedLayout = () => {
  const { isLoggedIn, checkAuth, isLoading } = useAuthStore();
  const { openCreate } = usePostStore();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  React.useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
  }, [checkAuth]);

  const isDashboard = ['/dashboard', '/', '/channels/facebook', '/content', '/channels/instagram'].includes(location.pathname);

  if (!authChecked || isLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar onCreatePost={openCreate} />
      <main className="main-content">
        {!isDashboard && <Header />}
        <div className="content-layout">
          <Outlet />
          {!isDashboard && <RightPanel />}
        </div>
      </main>
      
      <CreatePostModal />
      <RefineModal />
    </div>
  );
};

export default ProtectedLayout;