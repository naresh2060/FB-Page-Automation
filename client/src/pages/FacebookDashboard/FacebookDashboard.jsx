import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Plus,
  Image,
  Video,
  Clock,
  MessageCircle,
  Eye,
  ThumbsUp,
  Share2,
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';
import './FacebookDashboard.css';
import ConnectFacebookModal from '../../components/Modals/ConnectFacebookModal';

const FacebookIcon = ({ size = 32, fill = "none", color = "currentColor" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={fill} 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const StatCard = ({ label, value, trend, trendValue, isPositive }) => (
  <div className="fb-stat-card">
    <div className="fb-stat-label">{label}</div>
    <div className="fb-stat-value">{value}</div>
    <div className={`fb-stat-trend ${isPositive ? 'positive' : 'negative'}`}>
      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span>{trendValue} this week</span>
    </div>
  </div>
);

const FacebookDashboard = () => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const stats = [
    { label: 'Page followers', value: '18.4K', trendValue: '+312', isPositive: true },
    { label: 'Post reach', value: '42.1K', trendValue: '+9%', isPositive: true },
    { label: 'Engagement rate', value: '5.2%', trendValue: '+0.8% vs avg', isPositive: true },
    { label: 'Link clicks', value: '1,830', trendValue: '-4%', isPositive: false },
  ];

  const recentPosts = [
    {
      type: 'Live',
      time: 'Today · 7:00 PM',
      reach: '2.1K',
      likes: '148',
      status: 'Live',
      icon: <Video size={18} />,
      color: '#1877F2'
    },
    {
      type: 'Sched.',
      time: 'Fri · 9:00 AM',
      reach: '-',
      likes: '-',
      status: 'Scheduled',
      icon: <Clock size={18} />,
      color: '#1877F2'
    },
    {
      type: 'Draft',
      time: 'Draft · not scheduled',
      reach: '-',
      likes: '-',
      status: 'Needs review',
      icon: <MessageCircle size={18} />,
      color: '#e4e6eb'
    }
  ];

  const audienceData = [
    { range: '25-34 yrs', percentage: 38 },
    { range: '35-44 yrs', percentage: 27 },
    { range: '18-24 yrs', percentage: 21 },
    { range: '45+ yrs', percentage: 14 },
  ];

  return (
    <div className="fb-dashboard">
      {/* Header section */}
      <header className="fb-header">
        <div className="fb-header-main">
          <div className="fb-brand-avatar">
            <FacebookIcon fill="#1877F2" color="#1877F2" size={32} />
          </div>
          <div className="fb-brand-details">
            <div className="fb-brand-name">YourBrand — Facebook</div>
            <div className="fb-brand-stats">
              18,400 followers · 2,405 page likes · Last synced 2 min ago
            </div>
          </div>
          <button 
            className="fb-connect-btn"
            onClick={() => setIsConnectModalOpen(true)}
          >
            Connect
          </button>
        </div>
        
        <nav className="fb-tabs">
          <button className="fb-tab active">Overview</button>
          <button className="fb-tab">Posts</button>
          <button className="fb-tab">Inbox</button>
          <button className="fb-tab">Audience</button>
          <button className="fb-tab">Ads</button>
        </nav>
      </header>

      {/* Content grid */}
      <div className="fb-grid">
        {/* Left column + Middle column area */}
        <div className="fb-main-col">
          {/* Stats Row */}
          <div className="fb-stats-row">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          <div className="fb-secondary-grid">
            {/* Post performance chart */}
            <div className="fb-card fb-performance-card">
              <div className="fb-card-header">
                <h3>Post performance — last 7 days</h3>
                <button className="fb-export-btn">Export</button>
              </div>
              <div className="fb-chart-container">
                <div className="fb-bar-chart">
                  {[40, 60, 35, 75, 55, 65, 50].map((h, i) => (
                    <div key={i} className="fb-bar-wrapper">
                      <div className="fb-bar" style={{ height: `${h}%` }}></div>
                      <span className="fb-bar-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent posts */}
            <div className="fb-card fb-recent-posts-card">
              <div className="fb-card-header">
                <h3>Recent posts</h3>
                <button className="fb-view-all">View all</button>
              </div>
              <div className="fb-posts-list">
                {recentPosts.map((post, idx) => (
                  <div key={idx} className="fb-post-item">
                    <div className="fb-post-icon" style={{ backgroundColor: post.color + '20', color: post.color }}>
                      {post.icon}
                    </div>
                    <div className="fb-post-info">
                      <div className="fb-post-top">
                        <span className="fb-post-title">5 Mi...</span>
                        <span className={`fb-post-badge ${post.status.toLowerCase()}`}>{post.status}</span>
                      </div>
                      <div className="fb-post-time">{post.time}</div>
                      <div className="fb-post-stats">
                        <div className="fb-p-stat"><Eye size={12} /> {post.reach} reach</div>
                        <div className="fb-p-stat"><ThumbsUp size={12} /> {post.likes} likes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="fb-sidebar-col">
          {/* Quick composer */}
          <div className="fb-card fb-composer-card">
            <div className="fb-card-header">
              <h3>Quick composer</h3>
            </div>
            <div className="fb-composer-box">
              <p>What's on your mind? Write a post for Facebook...</p>
              <div className="fb-composer-footer">
                <button className="fb-media-btn">+ Media</button>
                <button className="fb-schedule-btn">Schedule</button>
              </div>
            </div>
          </div>

          {/* Best time to post */}
          <div className="fb-card fb-best-time-card">
            <div className="fb-card-header">
              <h3>Best time to post</h3>
            </div>
            <div className="fb-peak-window">
              <span className="peak-label">Peak engagement window</span>
              <span className="peak-time">Tue & Thu · 7–9 PM</span>
            </div>
            <p className="fb-card-footer-text">Based on your last 90 days of data</p>
          </div>

          {/* Audience breakdown */}
          <div className="fb-card fb-audience-card">
            <div className="fb-card-header">
              <h3>Audience breakdown</h3>
            </div>
            <div className="fb-audience-list">
              {audienceData.map((item, idx) => (
                <div key={idx} className="fb-audience-item">
                  <div className="fb-audience-labels">
                    <span>{item.range}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="fb-progress-bar">
                    <div className="fb-progress-fill" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="fb-card fb-ai-card">
            <div className="fb-card-header">
              <h3>AI insight</h3>
            </div>
            <div className="fb-ai-content">
              <div className="fb-ai-header">
                <Sparkles size={14} className="ai-spark" />
                <span>Luminous AI</span>
              </div>
              <p>Posts with images get <strong>3.2× more reach</strong> on your page.</p>
              <p className="fb-ai-sub">Your next draft has no media attached.</p>
            </div>
          </div>

          {/* Recent activity */}
          <div className="fb-card fb-activity-card">
            <div className="fb-card-header">
              <h3>Recent activity</h3>
            </div>
            <div className="fb-activity-list">
              <div className="fb-activity-item">
                <div className="fb-activity-avatar"></div>
                <div className="fb-activity-info">
                  <p>New comment on "5 Mistakes every..."</p>
                  <span>2m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConnectFacebookModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
      />
    </div>
  );
};

export default FacebookDashboard;
