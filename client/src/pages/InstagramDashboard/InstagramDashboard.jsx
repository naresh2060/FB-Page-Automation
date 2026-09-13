import React, { useState } from 'react';
import {
  TrendingUp,
  FileText,
  Sparkles,
  Play,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import './InstagramDashboard.css';

const InstagramIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const StatCard = ({ label, value, trendValue, isPositive, trendText }) => (
  <div className="ig-stat-card">
    <div className="ig-stat-label">{label}</div>
    <div className="ig-stat-value">{value}</div>
    <div className={`ig-stat-trend ${isPositive ? 'positive' : 'negative'}`}>
      <TrendingUp size={14} />
      <span>{trendValue} {trendText}</span>
    </div>
  </div>
);

const InstagramDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const stats = [
    { label: 'Page followers', value: '12.4K', trendValue: '+840', isPositive: true, trendText: 'this week' },
    { label: 'Post & Reel reach', value: '86.5K', trendValue: '+18.4%', isPositive: true, trendText: 'vs last week' },
    { label: 'Engagement rate', value: '4.8%', trendValue: '+1.2%', isPositive: true, trendText: 'vs industry avg' },
    { label: 'Link clicks & visits', value: '3,420', trendValue: '+12%', isPositive: true, trendText: 'this week' },
  ];

  const recentPosts = [
    { id: 1, type: 'document', title: 'I am thinking that, if AI video transforms Instagram workflows...', date: 'Sep 12 · 09:53 PM', desc: 'I am thinking that, if all creator workflows will be streamlined, hooks and authentic narratives become king...', status: 'POSTED' },
    { id: 2, type: 'document', title: 'Everyday we have a lot of content ideas, but consistency is...', date: 'Sep 10 · 10:52 PM', desc: 'Everyday we have a lot of thoughts. We think of value propositions, yet publishing daily reels requires batching...', status: 'POSTED' },
    { id: 3, type: 'video', title: 'The real silent struggle of scaling personal brand reels', date: 'Jul 29 · 05:32 PM', desc: 'The real silent struggle of students and startup founders juggling marketing with engineering sprints...', status: 'POSTED' },
    { id: 4, type: 'video', title: 'The best AI for YOU isn\'t what most experts claim', date: 'Jul 29 · 03:16 PM', desc: 'The best AI for YOU isn\'t what most experts claim. It\'s the stack you can execute without fatigue...', status: 'POSTED' },
    { id: 5, type: 'ig', title: 'The shocking truth about organic Instagram reach in 2024', date: 'Jul 22 · 08:27 PM', desc: 'The shocking truth about the modern Instagram algorithm favorability towards carousels and save-rates...', status: 'POSTED' },
  ];

  const audienceData = [
    { range: '25–34 yrs', percentage: 38 },
    { range: '35–44 yrs', percentage: 27 },
    { range: '18–24 yrs', percentage: 21 },
    { range: '45+ yrs', percentage: 14 },
  ];

  const getPostIcon = (type) => {
    switch (type) {
      case 'video': return <div className="ig-post-icon dark"><Play size={20} fill="currentColor" /></div>;
      case 'ig': return <div className="ig-post-icon gradient"><InstagramIcon size={20} /></div>;
      case 'document': default: return <div className="ig-post-icon"><FileText size={20} /></div>;
    }
  };

  return (
    <div className="ig-dashboard">
      {/* ── Header ── */}
      <header className="ig-header">
        <div className="ig-header-main">

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Avatar */}
            <div className="ig-brand-avatar">SF</div>

            {/* Brand name + meta */}
            <div>
              <div className="ig-brand-name">
                @socialflow.ai — Instagram
                <span className="ig-connected-pill">Connected</span>
              </div>
              <div className="ig-brand-stats">
                12.4K followers · Creator account · Token active (Long-lived)
              </div>
            </div>
          </div>

          <div className="ig-header-actions">
            <button className="ig-btn-outline">Reconnect</button>
            <button className="ig-btn-outline danger">Disconnect</button>
            <button className="ig-btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create Reel / Post
            </button>
          </div>
        </div>

        <nav className="ig-tabs">
          {['Overview', 'Posts & Reels', 'Stories', 'Audience', 'Insights'].map(tab => (
            <button
              key={tab}
              className={`ig-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Dashboard Content ── */}
      {activeTab === 'Overview' && (
        <div className="ig-grid">
          <div className="ig-main-col">

            {/* Stats row */}
            <div className="ig-stats-row">
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
              ))}
            </div>

            {/* Post performance chart */}
            <div className="ig-card ig-performance-card">
              <div className="ig-card-header" style={{ marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1.05rem' }}>Post & Reel performance — last 7 days</h3>
                <button className="ig-export-btn">Export</button>
              </div>
              <div style={{ color: '#8a8d91', fontSize: '0.85rem' }}>Total daily impressions across video reels & carousels</div>

              <div className="ig-chart-container">
                <div className="ig-bar-chart">
                  {[45, 65, 40, 80, 55, 75, 50].map((h, i) => (
                    <div key={i} className="ig-bar-wrapper">
                      <div className="ig-bar" style={{ height: `${h}%` }} />
                      <span className="ig-bar-label">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent posts & Reels */}
            <div className="ig-card">
              <div className="ig-card-header">
                <h3 style={{ fontSize: '1.05rem' }}>Recent posts & Reels</h3>
                <button className="ig-view-all">View all</button>
              </div>
              <div className="ig-posts-list">
                {recentPosts.map((post) => (
                  <div key={post.id} className="ig-post-item">
                    {getPostIcon(post.type)}
                    <div className="ig-post-info">
                      <div className="ig-post-top">
                        <span className="ig-post-title">{post.title}</span>
                        <span className="ig-post-badge">{post.status}</span>
                      </div>
                      <div className="ig-post-time">{post.date}</div>
                      <div className="ig-post-desc">{post.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Banner */}
            <div className="ig-ai-banner">
              <div className="ig-ai-banner-left">
                <div className="ig-ai-banner-icon">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <div className="ig-ai-banner-title">
                    Trending Audio & Hook Detected
                    <span className="ig-ai-badge">Reel Opportunity</span>
                  </div>
                  <div className="ig-ai-banner-desc">
                    "How I 10x my reach" audio is pacing <strong>+45% this week</strong> for tech & creator niches.
                  </div>
                </div>
              </div>
              <button className="ig-ai-btn">Generate Reel Script</button>
            </div>

          </div>

          {/* ── Right sidebar ── */}
          <div className="ig-sidebar-col">

            {/* Connected page card */}
            <div className="ig-card">
              <div className="ig-card-header">
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#1c1e21' }}>Connected Page</h3>
                <span className="ig-online-dot" />
              </div>
              <div className="ig-connected-info">
                <div className="ig-connected-avatar">SF</div>
                <div>
                  <div className="ig-connected-name">
                    socialflow.ai <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877f2" color="#fff" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 5.09 19.5 5.5 19.91 9.91 23 13 19.91 16.09 19.5 20.5 15.09 20.91 12 24 8.91 20.91 4.5 20.5 4.09 16.09 1 13 4.09 9.91 4.5 5.5 8.91 5.09 12 2"></polygon><polyline points="9 13 11 15 15 9"></polyline></svg>
                  </div>
                  <div className="ig-connected-meta">Creator account · 12.4K followers</div>
                  <a href="#" className="ig-page-link">View page ↗</a>
                </div>
              </div>
            </div>

            {/* Quick composer */}
            <div className="ig-card">
              <div className="ig-card-header"><h3 style={{ fontSize: '0.95rem' }}>Quick composer</h3></div>
              <div className="ig-composer-box">
                <p>What's on your creative mind? Draft a Reel or carousel for Instagram...</p>
                <div className="ig-composer-footer">
                  <button className="ig-media-btn">+ Media</button>
                  <button className="ig-schedule-btn">Schedule</button>
                </div>
              </div>
            </div>

            {/* Best time to post */}
            <div className="ig-card">
              <div className="ig-card-header"><h3 style={{ fontSize: '0.95rem' }}>Best time to post</h3></div>
              <div className="ig-peak-window">
                <span className="ig-peak-label">Peak engagement window</span>
                <span className="ig-peak-time">Tue & Thu · 7–9 PM</span>
              </div>
              <p className="ig-card-footer-text">Based on your last 90 days of follower activity</p>
            </div>

            {/* Audience breakdown */}
            <div className="ig-card">
              <div className="ig-card-header"><h3 style={{ fontSize: '0.95rem' }}>Audience breakdown</h3></div>
              <div className="ig-audience-list">
                {audienceData.map((item, idx) => (
                  <div key={idx} className="ig-audience-item">
                    <div className="ig-audience-labels">
                      <span>{item.range}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="ig-progress-bar">
                      <div className="ig-progress-fill" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="ig-card ig-ai-card">
              <div className="ig-card-header"><h3 style={{ fontSize: '0.95rem' }}>AI insight</h3></div>
              <div className="ig-ai-content">
                <div className="ig-ai-header">
                  <Sparkles size={16} fill="currentColor" />
                  <span>Luminous AI</span>
                </div>
                <p>Posts with carousel slides get <strong>3.2x more reach</strong> and 2.4x more saves on your page.</p>
                <p className="ig-ai-sub">Your next draft has no media attached.</p>
              </div>
            </div>

            {/* Recent activity */}
            <div className="ig-card">
              <div className="ig-card-header"><h3 style={{ fontSize: '0.95rem' }}>Recent activity</h3></div>
              <div className="ig-activity-list">
                <div className="ig-activity-item">
                  <div className="ig-activity-avatar" />
                  <div className="ig-activity-info">
                    <p>New comment on "5 Mistakes every creator makes..."</p>
                    <span>2m ago</span>
                  </div>
                </div>
                <div className="ig-activity-item">
                  <div className="ig-activity-avatar" />
                  <div className="ig-activity-info">
                    <p>Direct Message from @growth_founder</p>
                    <span>14m ago</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramDashboard;
