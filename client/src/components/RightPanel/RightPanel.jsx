import React from 'react';
import { Camera as Instagram, Link as Linkedin, Share2 as Twitter, Play, ArrowUpRight, Sparkles, Upload } from 'lucide-react';
import './RightPanel.css';

const RightPanel = () => {
  const filters = [
    { name: 'Instagram', icon: <Instagram size={14} />, color: '#6366f1', active: true },
    { name: 'LinkedIn', icon: <Linkedin size={14} />, color: '#0ea5e9', active: false },
    { name: 'X / Twitter', icon: <Twitter size={14} />, color: '#0f172a', active: false },
    { name: 'TikTok', icon: <Play size={14} />, color: '#ec4899', active: false },
  ];

  return (
    <aside className="right-panel">
      <div className="section">
        <h3 className="section-title">Platform Filters</h3>
        <p className="section-subtitle">Select channels to display</p>
        <div className="filter-grid">
          {filters.map((filter, idx) => (
            <button 
              key={idx} 
              className={`filter-btn ${filter.active ? 'active' : ''}`}
              style={{ '--filter-color': filter.color }}
            >
              <span className="dot" />
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Unscheduled Drafts</h3>
          <span className="badge">04</span>
        </div>
        
        <div className="draft-list">
          <div className="draft-card">
            <span className="platform-tag mini">INSTAGRAM</span>
            <p className="draft-title">5 Mistakes every AI developer makes in their first year...</p>
            <div className="draft-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '80%' }} />
              </div>
              <span className="progress-text">Ready for review</span>
            </div>
          </div>

          <div className="draft-card">
            <span className="platform-tag mini blue">LINKEDIN</span>
            <p className="draft-title">Why "Prompt Engineering" is the most valuable skill in 2024</p>
            <div className="draft-users">
              <div className="user-stack">
                 <img src="https://i.pravatar.cc/150?u=1" alt="" />
                 <img src="https://i.pravatar.cc/150?u=2" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ai-insights-card">
        <div className="ai-header">
          <h3 className="ai-title">AI INSIGHTS</h3>
          <Sparkles size={16} className="sparkle-icon" />
        </div>
        <p className="ai-text">
          Your "Weekend Tech" posts get <span className="highlight">24% higher engagement</span>. Consider scheduling the "Prompt Tips" draft for Sunday morning.
        </p>
        <button className="ai-action">
          Apply Strategy <ArrowUpRight size={14} />
        </button>
      </div>

      <button className="bulk-upload-btn">
        <Upload size={18} />
        <span>Bulk Upload Posts</span>
      </button>
    </aside>
  );
};

export default RightPanel;
