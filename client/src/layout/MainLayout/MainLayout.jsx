import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="main-layout">
      {/* A simple header for public pages */}
      <nav style={{ padding: '20px 40px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e1b4b' }}>SocialFlow AI</Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/login" style={{ color: '#4338ca', fontWeight: '600' }}>Login</Link>
          <Link to="/signup" style={{ background: '#4338ca', color: 'white', padding: '8px 16px', borderRadius: '8px' }}>Get Started</Link>
        </div>
      </nav>
      
      <main>
        <Outlet />
      </main>
      
      <footer style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
        <p>© 2024 SocialFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
