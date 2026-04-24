import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import RightPanel from '../components/RightPanel/RightPanel';
import CreatePostModal from '../components/Modals/CreatePostModal';
import RefineModal from '../components/Modals/RefineModal';

const ProtectedLayout = () => {
  // Mock authentication state - in a real app, this would come from a Context or Redux
  const [isAuthenticated] = useState(true); 
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const openPreview = () => {
    setIsModalOpen(false);
    setIsPreviewOpen(true);
  };
  
  const handleGenerate = () => {
    openPreview();
  };
   
  const closePreview = () => setIsPreviewOpen(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const location = useLocation();
  const isDashboard = ['/dashboard', '/', '/channels/facebook'].includes(location.pathname);

  return (
    <div className="app-container">
      <Sidebar onCreatePost={openModal} />
      <main className="main-content">
        {!isDashboard && <Header />}
        <div className="content-layout">
          <Outlet />
          {!isDashboard && <RightPanel />}
        </div>
      </main>
      
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onGenerate={handleGenerate} 
      />
      <RefineModal 
        isOpen={isPreviewOpen} 
        onClose={closePreview} 
      />
    </div>
  );
};

export default ProtectedLayout;