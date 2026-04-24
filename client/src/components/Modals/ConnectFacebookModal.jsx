import React, { useState } from 'react';
import { X, Info, Eye, EyeOff, ShieldCheck, HelpCircle } from 'lucide-react';
import './ConnectFacebookModal.css';

const ConnectFacebookModal = ({ isOpen, onClose }) => {
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState('');
  const [pageId, setPageId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="connect-fb-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-icon-wrapper">
            <div className="fb-blue-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </div>
          </div>
          <div className="modal-title-group">
            <h2>Connect Facebook Page</h2>
            <p>Enter your page credentials to enable automated posting and analytics.</p>
          </div>
        </div>

        <div className="modal-body">
          <div className="input-group">
            <div className="label-row">
              <label>Page Access Token</label>
              <a href="#" className="help-link">
                <HelpCircle size={14} /> How to find these?
              </a>
            </div>
            <div className="input-wrapper">
              <input
                type={showToken ? 'text' : 'password'}
                placeholder="••••••••••••••••••••••••"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button 
                className="toggle-visibility" 
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Page ID</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="e.g. 1029384756"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
              />
            </div>
          </div>

          <div className="info-box">
            <Info size={18} className="info-icon" />
            <p>
              By connecting your page, you authorize SaaS Manager to read insights, 
              manage posts, and view engagement metrics. You can revoke access 
              at any time from your Facebook App Settings.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-connect">Connect Account</button>
        </div>

        <div className="modal-bottom-bar">
          <div className="secure-tag">
            <div className="secure-dot"></div>
            <span>SECURE CONNECTION</span>
          </div>
          <div className="footer-logos">
            <span className="logo-f">f</span>
            <span className="logo-lock">🔒</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectFacebookModal;
