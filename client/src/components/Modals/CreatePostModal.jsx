import React from 'react';
import { X, Sparkles, HelpCircle, LineChart, Megaphone, Code, FileText, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onGenerate }) => {
  const [showProTip, setShowProTip] = React.useState(true);
  
  if (!isOpen) return null;

  const themes = [
    { icon: <LineChart size={14} />, label: 'Market Analysis' },
    { icon: <Megaphone size={14} />, label: 'Brand Story' },
    { icon: <Code size={14} />, label: 'Technical Guide' },
    { icon: <FileText size={14} />, label: 'Opinion Piece' },
  ];

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-container"
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
              <h2>Create New Content</h2>
              <p>Step 1: Define your vision</p>
            </div>
          </div>

          <div className="modal-body">
            <div className="input-label-group">
              <label>YOUR IDEA</label>
              <span className="char-count">0 / 500 characters</span>
            </div>
            
            <div className="textarea-container">
              <textarea placeholder="Enter your topic or idea..."></textarea>
              <div className="ai-badge">
                <Lightbulb size={12} />
                <span>AI-Enhanced</span>
              </div>
            </div>

            <div className="themes-section">
              <p className="themes-label">Popular themes</p>
              <div className="themes-grid">
                {themes.map((theme, idx) => (
                  <button key={idx} className="theme-chip">
                    {theme.icon}
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="help-link">
              <HelpCircle size={16} />
              <span>Need help?</span>
            </button>
            
            <div className="footer-actions">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="generate-btn gradient-bg" onClick={onGenerate}>
                <span>Generate with AI</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>

          {/* Pro Tip Tooltip */}
          {showProTip && (
            <div className="pro-tip">
              <button className="pro-tip-close" onClick={() => setShowProTip(false)}>
                <X size={12} />
              </button>
              <div className="pro-tip-header">
                <Lightbulb size={14} color="#6366f1" />
                <span>PRO TIP</span>
              </div>
              <p>
                Specify the <strong>tone of voice</strong> (e.g. professional, witty, urgent) to get better results from the AI engine.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePostModal;
