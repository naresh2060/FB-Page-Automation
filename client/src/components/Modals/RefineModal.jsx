import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Copy, Check, FileText, Edit3,
  Image as ImageIcon, RotateCcw, Calendar, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '../../constants/themes';
import usePostStore from '../../store/usePostStore.js';
import './RefineModal.css';

const RefineModal = () => {

  const {
    isPreviewOpen,
    previewData,
    closePreview,
    isEditMode,
    handleSaveEditedPost,
    isSaving,
    isImageLoading,
    imageError,
    handleGenerateImage,
    handleRegenerate,
    isLoading,
  } = usePostStore();

  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [editableTopic, setEditableTopic] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  // ── editable image prompt state ───────────────────────────────
  const [editableImagePrompt, setEditableImagePrompt] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // sync local state when previewData changes
  useEffect(() => {
    if (previewData?.content) {
      setEditableContent(previewData.content);
    }
    if (previewData?.topic) {
      setEditableTopic(previewData.topic);
    }
    if (previewData?.theme) {
      setSelectedTheme(previewData.theme);
    }
    if (previewData?.imagePrompt) {
      setEditableImagePrompt(previewData.imagePrompt);
    }
    // reset options when modal opens/changes
    setShowSaveOptions(false);
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

  const handleRegenerateClick = async () => {
    await handleRegenerate(editableTopic, selectedTheme);
  };

  const onSave = async (asNew) => {
    const editedData = {
      ...previewData,
      topic: editableTopic,
      content: editableContent,
      imagePrompt: editableImagePrompt
    };
    await handleSaveEditedPost(editedData, asNew);
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
              <h2>{isEditMode ? "Edit Post Content" : "Step 2: Refine & Generate"}</h2>
              <p>{isEditMode ? "Modify your post and save changes" : "Review AI output and generate visuals"}</p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="modal-body">
            {previewData ? (
              <div className="modal-content-grid">

                {/* ── Left: Generated Text ── */}
                <div className="generated-text-section">

                  {/* Title Field */}
                  <div className="title-edit-section">
                    <label className="label-with-icon">
                      <Edit3 size={14} />
                      <span>Post Title / Topic</span>
                    </label>
                    <input
                      type="text"
                      className="topic-input"
                      value={editableTopic}
                      onChange={(e) => setEditableTopic(e.target.value)}
                      placeholder="Enter post title..."
                    />
                  </div>

                  {/* Theme Selection */}
                  {!isEditMode && (
                    <div className="theme-selection-section">
                      <p className="small-label">Refine Theme</p>
                      <div className="theme-chips-mini">
                        {THEMES.map((theme, idx) => (
                          <button
                            key={idx}
                            className={`theme-chip-mini ${selectedTheme === theme.label ? 'active' : ''}`}
                            onClick={() => setSelectedTheme(theme.label)}
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="section-header-inline">
                    <div className="label-with-icon">
                      <FileText size={16} />
                      <span>{isEditMode ? "Edit Content" : "Generated Content"}</span>
                    </div>
                    <div className="action-icons">
                      <button onClick={handleCopy} title="Copy">
                        {copied
                          ? <Check size={16} />
                          : <Copy size={16} />
                        }
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
              {!isEditMode && (
                <button
                  className="regenerate-link"
                  onClick={handleRegenerateClick}
                  disabled={isLoading}
                >
                  <RotateCcw size={18} className={isLoading ? "spin-icon" : ""} />
                  <span>{isLoading ? "Regenerating..." : "Regenerate"}</span>
                </button>
              )}
            </div>

            <div className="footer-actions">
              {isEditMode ? (
                <>
                  {showSaveOptions ? (
                    <div className="save-options-group">
                      <button
                        className="save-as-new-btn"
                        onClick={() => onSave(true)}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save as New"}
                      </button>
                      <button
                        className="update-existing-btn gradient-bg"
                        onClick={() => onSave(false)}
                        disabled={isSaving}
                      >
                        {isSaving ? "Updating..." : "Update Existing"}
                      </button>
                      <button className="btn-cancel-mini" onClick={() => setShowSaveOptions(false)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="save-draft-btn gradient-bg" onClick={() => setShowSaveOptions(true)}>
                      Save Changes
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button className="save-draft-btn" onClick={closePreview}>
                    Save Draft
                  </button>
                  <button className="schedule-post-btn gradient-bg">
                    <Calendar size={18} />
                    <span>Schedule Post</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RefineModal;