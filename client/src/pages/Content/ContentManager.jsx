import React, { useState, useEffect, useRef } from "react";
import {
  Search, Bell, Calendar, MoreHorizontal, Heart, MessageCircle,
  Share2, Trash2, RefreshCw, ChevronLeft, ChevronRight, Sparkles,
  Plus, ArrowRight, FileEdit, CheckCircle, Clock, Edit2, BarChart2,
  RotateCcw, Link, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ContentManager.css";
import usePostStore from "../../store/usePostStore";

// ── Dropdown menu per row ────────────────────────────────────────
const ActionDropdown = ({ post, onClose, onPublish, onSchedule, onDelete, onEdit, onInsights, onRepost }) => {
  const isDraft = post.status === "draft" || post.status === "pending";
  const isPosted = post.status === "posted";

  return (
    <div className="action-dropdown">
      <div className="action-dropdown-header">Actions</div>

      {isDraft && (
        <>
          <button className="action-dd-item green" onClick={() => { onPublish(post); onClose(); }}>
            <CheckCircle size={13} /> Publish now
          </button>
          <button className="action-dd-item amber" onClick={() => { onSchedule(post); onClose(); }}>
            <Clock size={13} /> Schedule post
          </button>
          <button className="action-dd-item" onClick={() => { onEdit(post); onClose(); }}>
            <Edit2 size={13} /> Edit post
          </button>
        </>
      )}

      {isPosted && (
        <>
          <button className="action-dd-item" onClick={() => { onEdit(post); onClose(); }}>
            <Edit2 size={13} /> Edit post
          </button>
          <button className="action-dd-item blue" onClick={() => { onInsights(post); onClose(); }}>
            <BarChart2 size={13} /> View insights
          </button>
          <button className="action-dd-item amber" onClick={() => { onRepost(post); onClose(); }}>
            <RotateCcw size={13} /> Repost
          </button>
          <button className="action-dd-item" onClick={() => { onClose(); }}>
            <Link size={13} /> Copy link
          </button>
        </>
      )}

      <div className="action-dd-divider" />
      <button className="action-dd-item red" onClick={() => { onDelete(post); onClose(); }}>
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
};

// ── Schedule modal ────────────────────────────────────────────────
const ScheduleModal = ({ post, onClose, onConfirm }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="schedule-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="schedule-modal-header">
          <h3>Schedule post</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="schedule-modal-body">
          <p className="schedule-post-title">{post.topic}</p>
          <div className="schedule-fields">
            <div className="schedule-field">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="schedule-field">
              <label>Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="schedule-modal-footer">
          <button className="btn-cancel-modal" onClick={onClose}>Cancel</button>
          <button
            className="btn-confirm-schedule"
            disabled={!date || !time}
            onClick={() => { onConfirm(post, date, time); onClose(); }}
          >
            <Clock size={14} /> Confirm schedule
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Confirm modal ────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onClose, confirmText, confirmClass }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="schedule-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="schedule-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="schedule-modal-body">
          <p className="schedule-post-title" style={{ fontWeight: 'normal', lineHeight: '1.5' }}>{message}</p>
        </div>
        <div className="schedule-modal-footer">
          <button className="btn-cancel-modal" onClick={onClose}>Cancel</button>
          <button
            className={confirmClass || "btn-confirm-schedule"}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText || "Confirm"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────
const ContentManager = () => {
  const [activeTab, setActiveTab] = useState("All Content");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [schedulePost, setSchedulePost] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);


  // const { posts, isFetchingPosts, fetchPosts, pagination, publishToFacebook, isPublishing, deletePost, openEdit } = usePostStore();
  const { userPosts, isFetchingUserPosts, fetchUserPosts, pagination, publishToFacebook, isPublishing, deletePost, openEdit } = usePostStore();

  useEffect(() => { fetchUserPosts(); }, [fetchUserPosts]);

  useEffect(() => {
    fetchUserPosts({ page: currentPage, limit: 10 });
  }, [fetchUserPosts, currentPage]);

  // close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenDropdownId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ── Toast helper ─────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filter tabs ──────────────────────────────────────────────
  const filtered = userPosts.filter(p => {
    if (activeTab === "Scheduled") return p.status === "scheduled";
    if (activeTab === "Published") return p.status === "posted";
    if (activeTab === "Draft") return p.status === "draft" || p.status === "pending";

    return true;
  });

  // ── Selection ────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(p => p._id)));
  };

  // ── Actions ──────────────────────────────────────────────────
  const handlePublish = (post) => {
    setConfirmModal({
      title: "Publish Post",
      message: `Are you sure you want to publish "${post.topic || 'Untitled'}" to Facebook now?`,
      confirmText: "Publish",
      onConfirm: async () => {
        showToast(`Publishing "${post.topic || 'Untitled'}" to Facebook...`, "info");
        const result = await publishToFacebook(post._id);
        if (result.success) {
          showToast(`"${post.topic || 'Untitled'}" published to Facebook!`);
        } else {
          showToast(result.message, "danger");
        }
      }
    });
  };

  const handleSchedule = (post) => {
    setSchedulePost(post);
  };

  const handleScheduleConfirm = (post, date, time) => {
    // call your API: api.post('/facebook/posts/schedule', { postId: post._id, scheduledAt: ... })
    showToast(`"${post.topic}" scheduled for ${date} at ${time}`);
  };

  const handleEdit = (post) => {
    openEdit(post);
  };

  const handleDelete = (post) => {
    setConfirmModal({
      title: "Delete Post",
      message: `Are you sure you want to delete "${post.topic || 'Untitled'}"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmClass: "btn-confirm-danger",
      onConfirm: async () => {
        showToast(`Deleting "${post.topic || 'Untitled'}"...`, "info");
        const result = await deletePost(post._id);
        if (result.success) {
          showToast(`"${post.topic || 'Untitled'}" deleted`, "danger");
        } else {
          showToast(result.message, "danger");
        }
      }
    });
  };

  const handleInsights = (post) => {
    showToast(`Loading insights for "${post.topic}"`, "info");
  };

  const handleRepost = (post) => {
    setConfirmModal({
      title: "Repost",
      message: `Are you sure you want to repost "${post.topic || 'Untitled'}" to Facebook?`,
      confirmText: "Repost",
      onConfirm: async () => {
        showToast(`Reposting "${post.topic || 'Untitled'}"...`, "info");
        const result = await publishToFacebook(post._id, true);
        if (result.success) {
          showToast(`"${post.topic || 'Untitled'}" reposted successfully!`);
        } else {
          showToast(result.message, "danger");
        }
      }
    });
  };

  const handleBulkDelete = () => {
    setConfirmModal({
      title: "Bulk Delete",
      message: `Are you sure you want to delete ${selectedIds.size} selected post(s)? This action cannot be undone.`,
      confirmText: "Delete",
      confirmClass: "btn-confirm-danger",
      onConfirm: () => {
        showToast(`${selectedIds.size} posts deleted`, "danger");
        setSelectedIds(new Set());
      }
    });
  };

  const handleBulkPublish = () => {
    setConfirmModal({
      title: "Bulk Publish",
      message: `Are you sure you want to publish ${selectedIds.size} selected post(s)?`,
      confirmText: "Publish",
      onConfirm: () => {
        showToast(`${selectedIds.size} posts published`);
        setSelectedIds(new Set());
      }
    });
  };

  return (
    <motion.div
      className="content-manager"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`cm-toast cm-toast-${toast.type}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {toast.type === "success" && <CheckCircle size={14} />}
            {toast.type === "danger" && <Trash2 size={14} />}
            {toast.type === "info" && <BarChart2 size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="content-header">
        <div className="header-left"><h1>Content Manager</h1></div>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search posts, captions, or tags..." className="search-input" />
        </div>
        <div className="header-right">
          <button className="icon-btn"><Bell size={20} /></button>
          <button className="icon-btn"><Calendar size={20} /></button>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">Alex Rivera</span>
              <span className="user-role">Admin</span>
            </div>
            <div className="user-avatar">AR</div>
          </div>
        </div>
      </header>

      {/* ── Controls ── */}
      <div className="controls-bar">
        <div className="tabs">
          {["All Content", "Scheduled", "Published", "Draft"].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="filters">
          <select className="filter-select">
            <option>Platform: All</option>
            <option>Facebook</option>
            <option>Instagram</option>
            <option>LinkedIn</option>
          </select>
          <select className="filter-select">
            <option>Date: Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Custom Range</option>
          </select>
          <div className="action-btns">
            <button className="btn-bulk-delete" onClick={handleBulkDelete}>
              <Trash2 size={16} /> Bulk Delete
            </button>
            <button className="btn-update-status" onClick={handleBulkPublish}>
              <RefreshCw size={16} /> Update Status
            </button>
          </div>
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            className="bulk-action-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <span className="bulk-count">{selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected</span>
            <button className="bulk-btn-publish" onClick={handleBulkPublish}>
              <CheckCircle size={13} /> Publish now
            </button>
            <button className="bulk-btn-schedule" onClick={() => showToast("Schedule modal for bulk — coming soon", "info")}>
              <Clock size={13} /> Schedule
            </button>
            <button className="bulk-btn-delete" onClick={handleBulkDelete}>
              <Trash2 size={13} /> Delete
            </button>
            <button className="bulk-btn-clear" onClick={() => setSelectedIds(new Set())}>
              Clear selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div className="content-table-card">
        <table className="content-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>Content</th>
              <th>Platform</th>
              <th>Theme</th>
              <th>Status</th>
              <th>Schedule</th>
              <th>Engagement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetchingUserPosts ? (
              <tr><td colSpan="7" className="table-empty">Loading posts...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" className="table-empty">No posts found.</td></tr>
            ) : filtered.map(post => {
              const isDraft = post.status === "draft" || post.status === "pending";
              const isPosted = post.status === "posted";
              const postDate = new Date(post.createdAt);

              return (
                <tr key={post._id} className={selectedIds.has(post._id) ? "row-selected" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(post._id)}
                      onChange={() => toggleSelect(post._id)}
                    />
                  </td>

                  <td>
                    <div className="cell-content">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="" className="content-img" />
                      ) : (
                        <div className="content-img content-img-placeholder">
                          <FileEdit size={16} color="#94a3b8" />
                        </div>
                      )}
                      <div className="content-info">
                        <span className="content-title">{post.topic || "Untitled"}</span>
                        <span className="content-subtitle">
                          {post.content ? post.content.substring(0, 35) + "..." : "No content"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="platform-cell" style={{ textTransform: "capitalize" }}>
                    {post.platform || "Facebook"}
                  </td>

                  <td>
                    {post.theme ? (
                      <span className="theme-pill">{post.theme}</span>
                    ) : (
                      <span className="no-theme-text">—</span>
                    )}
                  </td>

                  <td>
                    <span className={`status-pill status-${(post.status || "draft").toLowerCase()}`}>
                      {(post.status || "DRAFT").toUpperCase()}
                    </span>
                  </td>

                  <td>
                    <div className="schedule-cell">
                      <span className="schedule-date">{postDate.toLocaleDateString()}</span>
                      <span className="schedule-time">
                        {postDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="engagement-cell">
                      {isDraft ? (
                        <span className="pending-text">Pending publishing...</span>
                      ) : (
                        <>
                          <div className="engagement-item"><Heart size={14} /> 0</div>
                          <div className="engagement-item"><MessageCircle size={14} /> 0</div>
                          <div className="engagement-item"><Share2 size={14} /> 0</div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* ── Action buttons ── */}
                  <td>
                    <div className="row-actions">
                      {isDraft && (
                        <>
                          <button
                            className="row-action-btn green"
                            title="Publish now"
                            onClick={() => handlePublish(post)}
                          >
                            <CheckCircle size={13} />
                          </button>
                          <button
                            className="row-action-btn amber"
                            title="Schedule"
                            onClick={() => handleSchedule(post)}
                          >
                            <Clock size={13} />
                          </button>
                          <button
                            className="row-action-btn blue"
                            title="Edit"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit2 size={13} />
                          </button>
                        </>
                      )}
                      {isPosted && (
                        <>
                          <button
                            className="row-action-btn blue"
                            title="Edit"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="row-action-btn blue"
                            title="View insights"
                            onClick={() => handleInsights(post)}
                          >
                            <BarChart2 size={13} />
                          </button>
                          <button
                            className="row-action-btn amber"
                            title="Repost"
                            onClick={() => handleRepost(post)}
                          >
                            <RotateCcw size={13} />
                          </button>
                        </>
                      )}
                      <button
                        className="row-action-btn red"
                        title="Delete"
                        onClick={() => handleDelete(post)}
                      >
                        <Trash2 size={13} />
                      </button>
                      <div
                        className="row-more-btn"
                        onClick={e => { e.stopPropagation(); setOpenDropdownId(openDropdownId === post._id ? null : post._id); }}
                      >
                        <MoreHorizontal size={14} />
                        {openDropdownId === post._id && (
                          <ActionDropdown
                            post={post}
                            onClose={() => setOpenDropdownId(null)}
                            onPublish={handlePublish}
                            onSchedule={handleSchedule}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onInsights={handleInsights}
                            onRepost={handleRepost}
                          />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="pagination-info">
            Showing {userPosts.length} of {pagination?.total || 0} posts
          </span>

          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page number pills */}
            {Array.from({ length: pagination?.totalPages || 1 }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-num-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.min(pagination?.totalPages || 1, p + 1))}
              disabled={currentPage === pagination?.totalPages || pagination?.totalPages === 0}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom cards ── */}
      <div className="bottom-section">
        <div className="card ai-card">
          <div className="ai-icon-wrapper"><Sparkles size={24} /></div>
          <div className="card-content">
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase" }}>AI Suggestion</span>
              <span className="badge badge-ai">New Trend</span>
            </div>
            <h3>Trending: "AI-Driven Logistics" is up 42%</h3>
            <p>Engagement is peaking for logistics themes. Try a draft on sustainable shipping.</p>
            <button className="btn-generate">Generate Draft</button>
          </div>
        </div>
        <div className="card create-card">
          <div className="create-icon-wrapper"><Plus size={24} /></div>
          <div className="card-content">
            <h3>Create New Post</h3>
            <p>Quickly add to your library</p>
          </div>
          <ArrowRight size={24} className="arrow-icon" />
        </div>
      </div>

      {/* ── Schedule modal ── */}
      <AnimatePresence>
        {schedulePost && (
          <ScheduleModal
            post={schedulePost}
            onClose={() => setSchedulePost(null)}
            onConfirm={handleScheduleConfirm}
          />
        )}
      </AnimatePresence>

      {/* ── Confirm modal ── */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            title={confirmModal.title}
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onClose={() => setConfirmModal(null)}
            confirmText={confirmModal.confirmText}
            confirmClass={confirmModal.confirmClass}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContentManager;