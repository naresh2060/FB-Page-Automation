import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Image as ImageIcon,
  Film,
  Layers,
  Calendar,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import './PostsAndReels.css';
import useInstagramStore from '../../store/useInstagramStore';

const POSTS_PER_PAGE = 9;

/* ── Helper: format ISO timestamp to a readable date ── */
const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const timeAgo = (isoString) => {
  if (!isoString) return '';
  const now = new Date();
  const d = new Date(isoString);
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDate(isoString);
};

/* ── Helper: format Instagram media type into capsule info ── */
const getMediaTypeInfo = (type) => {
  const t = (type || 'IMAGE').toUpperCase();
  if (t.includes('VIDEO') || t.includes('REEL')) {
    return { label: 'Video', Icon: Film, className: 'video' };
  }
  if (t.includes('CAROUSEL') || t.includes('ALBUM')) {
    return { label: 'Carousel', Icon: Layers, className: 'carousel' };
  }
  return { label: 'Image', Icon: ImageIcon, className: 'image' };
};

const PostsAndReelsTab = ({ onOpenCreateModal }) => {
  const {
    fetchInstagramPostList,
    instagramPostList,
    instagramPostListLoading,
    instagramPostListError,
  } = useInstagramStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [toastMessage, setToastMessage] = useState(null);
  const [activePage, setActivePage] = useState(1);

  // Fetch Instagram posts on mount
  useEffect(() => {
    fetchInstagramPostList();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter posts by caption search
  const filteredPosts = useMemo(() => {
    const source = instagramPostList || [];
    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase();
    return source.filter((post) =>
      post.caption?.toLowerCase().includes(q)
    );
  }, [instagramPostList, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const start = (activePage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, activePage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setActivePage(1);
  }, [searchQuery]);

  /* ── Loading State ── */
  if (instagramPostListLoading) {
    return (
      <div className="pr-container">
        <div className="pr-loading-state">
          <div className="pr-loading-spinner" />
          <span>Fetching your Instagram posts...</span>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (instagramPostListError) {
    return (
      <div className="pr-container">
        <div className="pr-error-state">
          <div className="pr-error-icon">!</div>
          <h3>Unable to load posts</h3>
          <p>{instagramPostListError}</p>
          <button
            className="pr-btn-retry"
            onClick={() => fetchInstagramPostList()}
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ── Empty State ── */
  if (!instagramPostList || instagramPostList.length === 0) {
    return (
      <div className="pr-container">
        <div className="pr-empty-state">
          <div className="pr-empty-icon">
            <ImageIcon size={40} strokeWidth={1.5} />
          </div>
          <h3>No posts yet</h3>
          <p>Your Instagram posts will appear here once they're published.</p>
          <button
            className="pr-btn-retry"
            onClick={() => fetchInstagramPostList()}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-container">
      {/* ── KPI Summary ── */}
      <div className="pr-metrics-grid">
        <div className="pr-metric-card">
          <div className="pr-metric-header">
            <span className="pr-metric-label">Total Posts</span>
            <span className="pr-metric-badge gray">Fetched</span>
          </div>
          <div className="pr-metric-value">{instagramPostList.length}</div>
          <div className="pr-metric-subtext">Posts from your Instagram account</div>
        </div>

        <div className="pr-metric-card">
          <div className="pr-metric-header">
            <span className="pr-metric-label">With Captions</span>
            <span className="pr-metric-badge blue">Content</span>
          </div>
          <div className="pr-metric-value">
            {instagramPostList.filter((p) => p.caption).length}
          </div>
          <div className="pr-metric-subtext">Posts with caption text</div>
        </div>

        <div className="pr-metric-card">
          <div className="pr-metric-header">
            <span className="pr-metric-label">With Media</span>
            <span className="pr-metric-badge green">Visual</span>
          </div>
          <div className="pr-metric-value">
            {instagramPostList.filter((p) => p.media_url).length}
          </div>
          <div className="pr-metric-subtext">Posts with media attached</div>
        </div>

        <div className="pr-metric-card">
          <div className="pr-metric-header">
            <span className="pr-metric-label">Search Results</span>
          </div>
          <div className="pr-metric-value">{filteredPosts.length}</div>
          <div className="pr-metric-subtext">
            {searchQuery ? `Matching "${searchQuery}"` : 'Showing all posts'}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="pr-filter-panel">
        <div className="pr-filter-row-top">
          <div className="pr-search-wrapper">
            <Search size={16} className="pr-search-icon" />
            <input
              type="text"
              placeholder="Search captions, hashtags..."
              className="pr-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="pr-actions-group">
            <button
              className="pr-action-btn"
              onClick={() => fetchInstagramPostList()}
              title="Refresh posts"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            <div className="pr-view-toggle">
              <button
                className={`pr-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                className={`pr-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Posts Grid ── */}
      <div className={`pr-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
        {paginatedPosts.map((post) => {
          const mediaInfo = getMediaTypeInfo(post.media_type);
          const { Icon: MediaIcon } = mediaInfo;

          return (
            <div key={post.id} className="pr-card">
              {/* Media Preview - Opens original content in new tab on click */}
              <a
                href={post.permalink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="pr-media-preview-real pr-media-link"
                title={post.permalink ? "Click to open in a new tab" : "No media URL"}
                onClick={(e) => {
                  if (!post.permalink) {
                    e.preventDefault();
                    showToast('No media URL available');
                  }
                }}
              >
                {post.media_url ? (
                  <img
                    src={post.media_url}
                    alt={post.caption?.slice(0, 60) || 'Instagram post'}
                    className="pr-media-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}

                <div
                  className="pr-media-fallback"
                  style={{ display: post.media_url ? 'none' : 'flex' }}
                >
                  <ImageIcon size={36} strokeWidth={1.2} />
                  <span>No preview</span>
                </div>

                {/* Overlay Top Badges: Media Type Capsule & Published status */}
                <div className="pr-preview-overlay-top">
                  <div className={`pr-media-type-capsule ${mediaInfo.className}`}>
                    <MediaIcon size={12} />
                    <span>{mediaInfo.label}</span>
                  </div>

                  <span className="pr-status-pill published">Published</span>
                </div>

                {/* Hover Actions / Link Indicator */}
                <div className="pr-media-hover-actions">
                  <div className="pr-hover-link-hint">
                    <ExternalLink size={14} />
                    <span>Open Media</span>
                  </div>
                </div>
              </a>

              {/* Card Content */}
              <div className="pr-card-content">
                {/* Date Row */}
                <div className="pr-content-meta-row">
                  <div className="pr-date-group">
                    <Calendar size={13} className="pr-date-icon" />
                    <span className="pr-post-date">
                      {formatDate(post.timestamp)}
                    </span>
                    <span className="pr-post-time-ago">{timeAgo(post.timestamp)}</span>
                  </div>
                </div>

                {/* Caption */}
                <div className="pr-caption">
                  {post.caption || (
                    <span className="pr-no-caption">No caption</span>
                  )}
                </div>

                {/* Details Capsule Row */}
                <div className="pr-details-capsules-row">
                  <div className={`pr-detail-pill ${mediaInfo.className}`}>
                    <MediaIcon size={13} />
                    <span>{mediaInfo.label} </span>
                  </div>

                  {post.media_url && (
                    <a
                      href={post.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pr-detail-open-link"
                      title="Open full resolution in new tab"
                    >
                      <ExternalLink size={13} />
                      <span>Open Media</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pr-pagination-bar">
          <div className="pr-pagination-info">
            Showing{' '}
            <strong>
              {(activePage - 1) * POSTS_PER_PAGE + 1}–
              {Math.min(activePage * POSTS_PER_PAGE, filteredPosts.length)}
            </strong>{' '}
            of <strong>{filteredPosts.length}</strong> posts
          </div>

          <div className="pr-pagination-controls">
            <button
              className="pr-page-btn"
              disabled={activePage === 1}
              onClick={() => setActivePage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (activePage <= 3) {
                pageNum = i + 1;
              } else if (activePage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = activePage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`pr-page-btn ${activePage === pageNum ? 'active' : ''}`}
                  onClick={() => setActivePage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="pr-page-btn"
              disabled={activePage === totalPages}
              onClick={() => setActivePage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMessage && (
        <div className="pr-toast">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default PostsAndReelsTab;