import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Beaker, 
  BarChart3, 
  Zap, 
  Plus, 
  Settings, 
  HelpCircle,
  Sparkles,
  FileText,
  FolderOpen
} from 'lucide-react';

const FacebookIcon = ({ size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import './Sidebar.css';

const Sidebar = ({ onCreatePost }) => {
  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText size={18} />, label: 'Content', path: '/content' },
    { icon: <BarChart3 size={18} />, label: 'Analytics', path: '/analytics' },
    { icon: <FolderOpen size={18} />, label: 'Media Library', path: '/media' },
  ];

  const platforms = [
    { label: 'All channels', count: 3, path: '/channels/all', color: 'var(--color-total)' },
    { label: 'Facebook', icon: <FacebookIcon size={16} />, path: '/channels/facebook', color: 'var(--color-facebook)' },
    { label: 'Instagram', path: '/channels/instagram', color: 'var(--color-instagram)' },
    { label: 'LinkedIn', path: '/channels/linkedin', color: 'var(--color-linkedin)' },
    { label: 'X / Twitter', path: '/channels/twitter', color: 'var(--color-twitter)', disabled: true },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">Menu</h3>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">Platforms</h3>
        <nav className="sidebar-nav">
          <ul>
            {platforms.map((platform, index) => (
              <li key={index}>
                <NavLink 
                  to={platform.path} 
                  className={({ isActive }) => `nav-item platform-item ${isActive ? 'active' : ''} ${platform.disabled ? 'disabled' : ''}`}
                  onClick={(e) => platform.disabled && e.preventDefault()}
                >
                  <div className="platform-indicator" style={{ backgroundColor: platform.color }}>
                    {platform.icon && <span className="platform-icon-small">{platform.icon}</span>}
                  </div>
                  <span>{platform.label}</span>
                  {platform.count && <span className="platform-count">{platform.count}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button className="add-platform-link">Add platform</button>
      </div>

      <div className="sidebar-footer">
        <button className="create-post-btn" onClick={onCreatePost}>
          <span>Create post</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
