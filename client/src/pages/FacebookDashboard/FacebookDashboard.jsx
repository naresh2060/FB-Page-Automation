import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown,
  FileText, ExternalLink, Calendar, Sparkles, Eye
} from 'lucide-react';
import './FacebookDashboard.css';
import ConnectFacebookModal from '../../components/Modals/ConnectFacebookModal';
import usePlatformStore     from '../../store/usePlatformStore';
import usePostStore         from '../../store/usePostStore';

const FacebookIcon = ({ size = 32, fill = "none", color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const StatCard = ({ label, value, trendValue, isPositive }) => (
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
  const [activeTab, setActiveTab] = useState('Overview');

  // ── Pull from store ──────────────────────────────────────────
  const status    = usePlatformStore((s) => s.status);
  const pageInfo  = usePlatformStore((s) => s.pageInfo);
  const tokenInfo = usePlatformStore((s) => s.tokenInfo);
  const disconnect = usePlatformStore((s) => s.disconnect);

  const isConnected = status === "connected" && pageInfo !== null;

  // ── Post store for Posts tab ─────────────────────────────────
  const { posts, isFetchingPosts, fetchPosts, fetchPostInsights,  } = usePostStore();
  const publishedPosts = posts.filter(p => p.status === 'posted');

  useEffect(() => {
    if (activeTab === 'Posts' && isConnected) {
      const loadPostsAndInsights = async () => {
        await fetchPosts({ page: 1, limit: 50 });
        
        // After fetching posts, fetch insights for each published post that has a facebookPostId
        const currentPosts = usePostStore.getState().posts;
        const postedOnFb = currentPosts.filter(p => p.status === 'posted' && p.facebookPostId);
        
        // Fetch insights in parallel (with some concurrency control if needed, but for now simple Promise.all)
        // Note: For a real app with many posts, you'd want a batch API or a more optimized approach.
        Promise.all(postedOnFb.map(post => fetchPostInsights(post.facebookPostId)));
      };
      
      loadPostsAndInsights();
    }
  }, [activeTab, isConnected, fetchPosts, fetchPostInsights]);

  // ── Stats — live data when connected, placeholders otherwise ─
  const stats = [
    {
      label:      'Page followers',
      value:      isConnected ? pageInfo.fanCount.toLocaleString() : '—',
      trendValue: '+312',
      isPositive: true,
    },
    {
      label:      'Post reach',
      value:      '42.1K',
      trendValue: '+9%',
      isPositive: true,
    },
    {
      label:      'Engagement rate',
      value:      '5.2%',
      trendValue: '+0.8% vs avg',
      isPositive: true,
    },
    {
      label:      'Link clicks',
      value:      '1,830',
      trendValue: '-4%',
      isPositive: false,
    },
  ];

  // Use the 5 most recent published posts for the overview card
  const recentPublished = publishedPosts.slice(0, 5);

  const audienceData = [
    { range: '25-34 yrs', percentage: 38 },
    { range: '35-44 yrs', percentage: 27 },
    { range: '18-24 yrs', percentage: 21 },
    { range: '45+ yrs',   percentage: 14 },
  ];

  return (
    <div className="fb-dashboard">

      {/* ── Header ── */}
      <header className="fb-header">
        <div className="fb-header-main">

          {/* Avatar */}
          <div className="fb-brand-avatar">
            {isConnected && pageInfo?.picture ? (
              <img
                // src={pageInfo.picture}
                alt={pageInfo.name}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <FacebookIcon fill="#1877F2" color="#1877F2" size={32} />
            )}
          </div>

          {/* Brand name + meta */}
          <div className="fb-brand-details">
            <div className="fb-brand-name">
              {isConnected && pageInfo?.name
                ? `${pageInfo.name} — Facebook`
                : 'Your Page — Facebook'}
            </div>
            <div className="fb-brand-stats">
              {isConnected && pageInfo
                ? `${pageInfo.fanCount?.toLocaleString() ?? 0} followers · ${pageInfo.category ?? 'Facebook Page'} · ${tokenInfo?.isLongLived ? 'Long-lived token' : 'Token expires ' + new Date(tokenInfo?.expiresAt).toLocaleDateString()}`
                : 'Connect your Facebook page to see live data'}
            </div>
          </div>

          {/* Not connected — prompt */}
          {!isConnected && (
            <div className="fb-not-connected-banner">
              <span>No page connected</span>
              <button
                className="fb-connect-btn"
                onClick={() => setIsConnectModalOpen(true)}
              >
                Connect Facebook
              </button>
            </div>
          )}

          {/* Connected — reconnect + disconnect */}
          {isConnected && (
            <div className="fb-connected-actions">
              {pageInfo.verified && (
                <span className="fb-verified-pill">✓ Verified</span>
              )}
              <button
                className="fb-reconnect-btn"
                onClick={() => setIsConnectModalOpen(true)}
              >
                Reconnect
              </button>
              <button
                className="fb-disconnect-btn"
                onClick={disconnect}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        <nav className="fb-tabs">
          {['Overview', 'Posts', 'Inbox', 'Audience', 'Ads'].map(tab => (
            <button
              key={tab}
              className={`fb-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Not connected empty state ── */}
      {!isConnected && (
        <div className="fb-empty-state">
          <FacebookIcon fill="#1877F2" color="#1877F2" size={48} />
          <h2>Connect your Facebook page</h2>
          <p>Enter your page access token and page ID to start managing posts, viewing analytics, and automating your Facebook presence.</p>
          <button
            className="fb-connect-btn-large"
            onClick={() => setIsConnectModalOpen(true)}
          >
            Connect Facebook Page
          </button>
        </div>
      )}

      {/* ── Posts Tab ── */}
      {isConnected && activeTab === 'Posts' && (
        <div className="fb-posts-tab">
          <div className="fb-posts-tab-header">
            <h2>Published Posts</h2>
            <span className="fb-posts-count">{publishedPosts.length} post{publishedPosts.length !== 1 ? 's' : ''}</span>
          </div>

          {isFetchingPosts ? (
            <div className="fb-posts-loading">
              <div className="fb-spinner" />
              <p>Loading posts...</p>
            </div>
          ) : publishedPosts.length === 0 ? (
            <div className="fb-posts-empty">
              <FileText size={40} />
              <h3>No published posts yet</h3>
              <p>Posts you publish to Facebook will appear here.</p>
            </div>
          ) : (
            <div className="fb-posts-grid">
              {publishedPosts.map(post => (
                <div key={post._id} className="fb-post-card">
                  {post.imageUrl && (
                    <div className="fb-post-card-img">
                      <img src={post.imageUrl} alt={post.topic || ''} />
                    </div>
                  )}
                  <div className="fb-post-card-body">
                    <div className="fb-post-card-top">
                      <span className="fb-post-card-topic">{post.topic || 'Untitled'}</span>
                      <span className="fb-post-card-status">Published</span>
                    </div>
                    <p className="fb-post-card-content">
                      {post.content ? (post.content.length > 160 ? post.content.substring(0, 160) + '...' : post.content) : 'No content'}
                    </p>
                    <div className="fb-post-card-meta">
                      <span className="fb-post-card-date">
                        <Calendar size={13} />
                        {new Date(post.postedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {post.facebookPostId && (
                        <a
                          href={`https://facebook.com/${post.facebookPostId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="fb-post-card-link"
                        >
                          <ExternalLink size={13} /> View on Facebook
                        </a>
                      )}
                      <span className="fb-post-card-views" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '13px', marginLeft: 'auto' }} title="Real-time views">
                        <Eye size={13} />
                        {post.views !== undefined ? post.views.toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Dashboard (Overview) — only shown when connected ── */}
      {isConnected && activeTab === 'Overview' && (
        <div className="fb-grid">
          <div className="fb-main-col">

            {/* Stats row */}
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
                        <div className="fb-bar" style={{ height: `${h}%` }} />
                        <span className="fb-bar-label">
                          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent posts */}
              <div className="fb-card fb-recent-posts-card">
                <div className="fb-card-header">
                  <h3>Recent posts</h3>
                  <button className="fb-view-all" onClick={() => setActiveTab('Posts')}>View all</button>
                </div>
                <div className="fb-posts-list">
                  {isFetchingPosts ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#65676b', fontSize: '0.875rem' }}>
                      Loading...
                    </div>
                  ) : recentPublished.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#65676b', fontSize: '0.875rem' }}>
                      No published posts yet.
                    </div>
                  ) : (
                    recentPublished.map((post) => (
                      <div key={post._id} className="fb-post-item">
                        <div
                          className="fb-post-icon"
                          style={{ backgroundColor: '#1877F220', color: '#1877F2' }}
                        >
                          {post.imageUrl
                            ? <img src={post.imageUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: 6, objectFit: 'cover' }} />
                            : <FileText size={20} />}
                        </div>
                        <div className="fb-post-info">
                          <div className="fb-post-top">
                            <span className="fb-post-title" title={post.topic}>
                              {post.topic ? (post.topic.length > 22 ? post.topic.substring(0, 22) + '…' : post.topic) : 'Untitled'}
                            </span>
                            <span className="fb-post-badge live">Posted</span>
                          </div>
                          <div className="fb-post-time">
                            {new Date(post.postedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' · '}
                            {new Date(post.postedAt || post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="fb-post-time" style={{ marginTop: '0.2rem' }}>
                            {post.content ? (post.content.length > 50 ? post.content.substring(0, 50) + '…' : post.content) : ''}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="fb-sidebar-col">

            {/* Connected page card */}
            <div className="fb-card fb-connected-card">
              <div className="fb-card-header">
                <h3>Connected page</h3>
                <span className="fb-online-dot" title="Connected" />
              </div>
              <div className="fb-connected-info">
                {pageInfo.picture && (
                  <img
                    // src={pageInfo.picture}
                    alt={pageInfo.name}
                    className="fb-connected-avatar"
                  />
                )}
                <div>
                  <div className="fb-connected-name">{pageInfo.name}</div>
                  <div className="fb-connected-meta">
                    {pageInfo.category && <span>{pageInfo.category}</span>}
                    {pageInfo.fanCount > 0 && (
                      <span> · {pageInfo.fanCount.toLocaleString()} followers</span>
                    )}
                  </div>
                  {pageInfo.verified && (
                    <span className="fb-verified-badge">✓ Verified</span>
                  )}
                  {pageInfo.link && (
                    <a
                      href={pageInfo.link}
                      target="_blank"
                      rel="noreferrer"
                      className="fb-page-link"
                    >
                      View page ↗
                    </a>
                  )}
                </div>
              </div>
              {/* Token expiry warning */}
              {tokenInfo && !tokenInfo.isLongLived && tokenInfo.expiresAt && (
                <div className="fb-token-warning">
                  Token expires {new Date(tokenInfo.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Quick composer */}
            <div className="fb-card fb-composer-card">
              <div className="fb-card-header"><h3>Quick composer</h3></div>
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
              <div className="fb-card-header"><h3>Best time to post</h3></div>
              <div className="fb-peak-window">
                <span className="peak-label">Peak engagement window</span>
                <span className="peak-time">Tue & Thu · 7–9 PM</span>
              </div>
              <p className="fb-card-footer-text">Based on your last 90 days of data</p>
            </div>

            {/* Audience breakdown */}
            <div className="fb-card fb-audience-card">
              <div className="fb-card-header"><h3>Audience breakdown</h3></div>
              <div className="fb-audience-list">
                {audienceData.map((item, idx) => (
                  <div key={idx} className="fb-audience-item">
                    <div className="fb-audience-labels">
                      <span>{item.range}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="fb-progress-bar">
                      <div className="fb-progress-fill" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="fb-card fb-ai-card">
              <div className="fb-card-header"><h3>AI insight</h3></div>
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
              <div className="fb-card-header"><h3>Recent activity</h3></div>
              <div className="fb-activity-list">
                <div className="fb-activity-item">
                  <div className="fb-activity-avatar" />
                  <div className="fb-activity-info">
                    <p>New comment on "5 Mistakes every..."</p>
                    <span>2m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      <ConnectFacebookModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
};

export default FacebookDashboard;