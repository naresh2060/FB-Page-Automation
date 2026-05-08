// client/src/components/Modals/CreatePostModal.jsx
import React, { useState } from 'react';
import {
  X, Sparkles, HelpCircle,
  LineChart, Megaphone, Code, FileText, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePostStore from '../../store/usePostStore';
import './CreatePostModal.css';

// ── moved outside component — no need to recreate on every render
const MAX_CHARS = 500;

const THEMES = [
  { icon: <LineChart size={14} />, label: 'Market Analysis' },
  { icon: <Megaphone size={14} />, label: 'Brand Story' },
  { icon: <Code size={14} />,      label: 'Technical Guide' },
  { icon: <FileText size={14} />,  label: 'Opinion Piece' },
];

const CreatePostModal = () => {

  // ── from store — no props needed ──────────────────────────────
  const {
    isCreateOpen,
    isLoading,
    error,
    handleGenerate,
    closeCreate,
  } = usePostStore();

  // ── local state — only this modal needs these ─────────────────
  const [topic, setTopic]               = useState('');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [showProTip, setShowProTip]     = useState(true);

  // don't render if closed
  if (!isCreateOpen) return null;

  // ── toggle theme selection ─────────────────────────────────────
  const handleThemeClick = (label) => {
    // click same theme again → deselect it
    setSelectedTheme(label === selectedTheme ? null : label);
  };

  // ── submit handler ─────────────────────────────────────────────
  const handleSubmit = () => {
    if (!topic.trim()) return;

    // send to store → store calls API → store opens RefineModal
    handleGenerate({
      topic: topic.trim(),
      theme: selectedTheme,
    });
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={closeCreate}>
        <motion.div
          className="modal-container"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Close button ── */}
          <button
            className="modal-close"
            onClick={closeCreate}
            disabled={isLoading}
          >
            <X size={20} />
          </button>

          {/* ── Header ── */}
          <div className="modal-header">
            <div className="modal-icon-bg gradient-bg">
              <Sparkles color="white" size={24} />
            </div>
            <div className="modal-title-group">
              <h2>Create New Content</h2>
              <p>Step 1: Define your vision</p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="modal-body">

            {/* char count updates live because topic.length changes */}
            <div className="input-label-group">
              <label>YOUR IDEA</label>
              <span className="char-count">
                {topic.length} / {MAX_CHARS} characters
              </span>
            </div>

            <div className="textarea-container">
              <textarea
                placeholder="Enter your topic or idea..."
                value={topic}
                maxLength={MAX_CHARS}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                // disabled during API call — prevent editing
              />
              <div className="ai-badge">
                <Lightbulb size={12} />
                <span>AI-Enhanced</span>
              </div>
            </div>

            {/* ── API error — modal stays open so user can retry ── */}
            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            {/* ── Theme chips ── */}
            <div className="themes-section">
              <p className="themes-label">Popular themes</p>
              <div className="themes-grid">
                {THEMES.map((theme, idx) => (
                  <button
                    key={idx}
                    className={`theme-chip ${selectedTheme === theme.label ? 'active' : ''}`}
                    onClick={() => handleThemeClick(theme.label)}
                    disabled={isLoading}
                  >
                    {theme.icon}
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            <button className="help-link">
              <HelpCircle size={16} />
              <span>Need help?</span>
            </button>

            <div className="footer-actions">
              <button
                className="cancel-btn"
                onClick={closeCreate}
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                className="generate-btn gradient-bg"
                onClick={handleSubmit}
                disabled={isLoading || !topic.trim()}
                // disabled if loading OR topic is empty
              >
                {isLoading ? (
                  <span>Generating...</span>
                ) : (
                  <>
                    <span>Generate with AI</span>
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Pro Tip ── */}
          {showProTip && !isLoading && (
            <div className="pro-tip">
              <button
                className="pro-tip-close"
                onClick={() => setShowProTip(false)}
              >
                <X size={12} />
              </button>
              <div className="pro-tip-header">
                <Lightbulb size={14} color="#6366f1" />
                <span>PRO TIP</span>
              </div>
              <p>
                Specify the <strong>tone of voice</strong> (e.g. professional,
                witty, urgent) to get better results from the AI engine.
              </p>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePostModal;