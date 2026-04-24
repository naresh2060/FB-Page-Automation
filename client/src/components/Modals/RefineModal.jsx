import React from 'react';
import { X, Sparkles, RefreshCcw, Copy, Edit3, Image as ImageIcon, Calendar, AtSign, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RefineModal.css';

const RefineModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-container refine-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>

          <div className="modal-header">
            <div className="modal-icon-bg gradient-bg">
              <Sparkles color="white" size={24} />
            </div>
            <div className="modal-title-group">
              <h2>Step 2: Refine & Generate</h2>
              <p>Review AI output and generate visuals</p>
            </div>
          </div>

          <div className="modal-content-grid">
            <div className="generated-text-section">
              <div className="section-header-inline">
                <div className="label-with-icon">
                  <FileTextIcon />
                  <span>Generated Content</span>
                </div>
                <div className="action-icons">
                  <button title="Copy"><Copy size={16} /></button>
                  <button title="Edit"><Edit3 size={16} /></button>
                </div>
              </div>
              
              <div className="content-box">
                <p>The future of creative collaboration isn't just about sharing files—it's about sharing a collective digital consciousness.</p>
                <p>With Luminous AI, we're bridging the gap between raw intuition and structured data. Our latest update introduces "Flux Synapse," a real-time rendering engine that adapts to your creative rhythm.</p>
                <p>Whether you're drafting high-concept strategies or pixel-perfect visuals, the AI acts as a luminous mirror, reflecting your best ideas back at you with enhanced clarity.</p>
                <p className="hashtags">#LuminousAI #CreativeIntelligence #FutureOfWork #AIInnovation</p>
              </div>
            </div>

            <div className="visuals-sidebar">
              <div className="sidebar-section">
                <div className="label-with-icon">
                  <RefreshCcw size={14} className="rotate-icon" />
                  <span>AI Image Prompt</span>
                </div>
                <div className="prompt-box">
                  <p>A futuristic workspace with glass holographic displays, floating nodes of light, deep indigo and vibrant cyan color palette, cinematic lighting, ultra detailed.</p>
                  <span className="optimized-badge">OPTIMIZED</span>
                </div>
              </div>

              <div className="sidebar-section">
                <div className="label-with-icon">
                  <ImageIcon size={14} />
                  <span>Image Preview</span>
                </div>
                <div className="image-placeholder">
                   <div className="placeholder-content">
                      <div className="edit-icon-circle">
                        <Edit3 size={20} />
                      </div>
                      <h4>No image generated yet</h4>
                      <p>Ready to transform your prompt into a masterpiece.</p>
                      <button className="generate-img-btn">
                        <Sparkles size={14} />
                        <span>Generate Image</span>
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer refine-footer">
            <div className="footer-left">
              <button className="regenerate-link">
                <RefreshCcw size={16} />
                <span>Regenerate</span>
              </button>
              <div className="platform-pills">
                <div className="pill"><AtSign size={12} /></div>
                <div className="pill"><Hash size={12} /></div>
              </div>
            </div>
            
            <div className="footer-actions">
              <button className="save-draft-btn">Save Draft</button>
              <button className="schedule-post-btn gradient-bg">
                <Calendar size={16} />
                <span>Schedule Post</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const FileTextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default RefineModal;
