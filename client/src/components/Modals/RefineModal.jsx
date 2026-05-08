import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Copy, Check, FileText, Edit3,
  Image as ImageIcon, RotateCcw, Calendar, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePostStore from '../../store/usePostStore.js';
import './RefineModal.css';

const RefineModal = () => {

  const {
    isPreviewOpen,
    previewData,
    closePreview,
    isLoading,
    isImageLoading,   // ← image specific loading
    imageError,       // ← image specific error
    handleGenerateImage,
  } = usePostStore();

  const [copied, setCopied]                   = useState(false);
  const [editableContent, setEditableContent] = useState('');

  // ── editable image prompt state ───────────────────────────────
  const [editableImagePrompt, setEditableImagePrompt] = useState('');
  const [isEditingPrompt, setIsEditingPrompt]         = useState(false);

  // sync local state when previewData changes
  useEffect(() => {
    if (previewData?.content) {
      setEditableContent(previewData.content);
    }
    if (previewData?.imagePrompt) {
      setEditableImagePrompt(previewData.imagePrompt);
    }
  }, [previewData]);

  if (!isPreviewOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── called when user clicks "Generate Image" ─────────────────
  const handleImageGenerate = () => {
    if (!editableImagePrompt.trim()) return;
    // pass the current (possibly edited) prompt to store
    handleGenerateImage(editableImagePrompt.trim());
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={closePreview}>
        <motion.div
          className="modal-container refine-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Close ── */}
          <button className="modal-close" onClick={closePreview}>
            <X size={20} />
          </button>

          {/* ── Header ── */}
          <div className="modal-header">
            <div className="modal-icon-bg gradient-bg">
              <Sparkles color="white" size={20} />
            </div>
            <div className="modal-title-group">
              <h2>Step 2: Refine & Generate</h2>
              <p>Review AI output and generate visuals</p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="modal-body">
            {previewData ? (
              <div className="modal-content-grid">

                {/* ── Left: Generated Text ── */}
                <div className="generated-text-section">
                  <div className="section-header-inline">
                    <div className="label-with-icon">
                      <FileText size={16} />
                      <span>Generated Content</span>
                    </div>
                    <div className="action-icons">
                      <button onClick={handleCopy} title="Copy">
                        {copied
                          ? <Check size={16} />
                          : <Copy size={16} />
                        }
                      </button>
                      <button title="Edit content">
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="content-box editable-textarea"
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    placeholder="Refine your content here..."
                  />
                </div>

                {/* ── Right: Visuals Sidebar ── */}
                <div className="visuals-sidebar">

                  {/* ── Image Prompt Section — now editable ── */}
                  <div className="sidebar-section">
                    <div className="prompt-section-header">
                      <div className="label-with-icon" style={{ color: '#0891b2' }}>
                        <RotateCcw size={14} />
                        <span>AI Image Prompt</span>
                      </div>

                      {/* Edit / Done toggle button */}
                      <button
                        className="edit-prompt-btn"
                        onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                      >
                        {isEditingPrompt
                          ? <><Check size={12} /> Done</>
                          : <><Edit3 size={12} /> Edit</>
                        }
                      </button>
                    </div>

                    <div className="prompt-box">
                      {isEditingPrompt ? (
                        // ── Editable textarea ──
                        <textarea
                          className="prompt-textarea"
                          value={editableImagePrompt}
                          onChange={(e) => setEditableImagePrompt(e.target.value)}
                          rows={4}
                          placeholder="Describe the image you want..."
                          autoFocus
                        />
                      ) : (
                        // ── Read-only display ──
                        <p>{editableImagePrompt}</p>
                      )}
                      <span className="optimized-badge">OPTIMIZED</span>
                    </div>
                  </div>

                  {/* ── Image Preview Section ── */}
                  <div className="sidebar-section">
                    <div className="label-with-icon">
                      <ImageIcon size={16} />
                      <span>Image Preview</span>
                    </div>

                    <div className="image-preview-box">

                      {/* ── Loading state ── */}
                      {isImageLoading && (
                        <div className="image-loading">
                          <Loader size={28} className="spin-icon" />
                          <p>Generating image...</p>
                          <span>This may take a few seconds</span>
                        </div>
                      )}

                      {/* ── Error state ── */}
                      {imageError && !isImageLoading && (
                        <div className="image-error">
                          <p>{imageError}</p>
                          <button
                            className="retry-btn"
                            onClick={handleImageGenerate}
                          >
                            Try Again
                          </button>
                        </div>
                      )}

                      {/* ── Image ready — show it ── */}
                      {previewData.imageUrl && !isImageLoading && (
                        <div className="image-ready">
                          <img
                            src={previewData.imageUrl}
                            alt="Generated"
                            className="generated-image"
                          />
                          {/* regenerate with same or edited prompt */}
                          <button
                            className="regenerate-img-btn"
                            onClick={handleImageGenerate}
                            disabled={isImageLoading}
                          >
                            <RotateCcw size={13} />
                            <span>Regenerate</span>
                          </button>
                        </div>
                      )}

                      {/* ── No image yet — show placeholder ── */}
                      {!previewData.imageUrl && !isImageLoading && !imageError && (
                        <div className="placeholder-content">
                          <div className="edit-icon-circle">
                            <Edit3 size={20} />
                          </div>
                          <h4>No image generated yet</h4>
                          <p>Ready to transform your prompt into a masterpiece.</p>

                          <button
                            className="generate-img-btn"
                            onClick={handleImageGenerate}
                            disabled={!editableImagePrompt.trim()}
                          >
                            <Sparkles size={14} />
                            <span>Generate Image</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No content generated yet.</p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer refine-footer">
            <div className="footer-left">
              <button className="regenerate-link">
                <RotateCcw size={18} />
                <span>Regenerate</span>
              </button>
            </div>

            <div className="footer-actions">
              <button className="save-draft-btn" onClick={closePreview}>
                Save Draft
              </button>
              <button className="schedule-post-btn gradient-bg">
                <Calendar size={18} />
                <span>Schedule Post</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RefineModal;