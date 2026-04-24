import React from 'react';
import { Search, Bell, Moon, ChevronDown } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search scheduled posts or drafts..." />
      </div>
      
      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
        <button className="icon-btn">
          <Moon size={20} />
        </button>
        
        <button className="upgrade-btn">
          Upgrade
        </button>
        
        <div className="user-profile">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="User" 
            className="avatar" 
          />
          <ChevronDown size={14} className="chevron" />
        </div>
      </div>
    </header>
  );
};

export default Header;
