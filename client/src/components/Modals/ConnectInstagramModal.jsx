import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  ExternalLink,
  Info,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useInstagramStore from '../../store/useInstagramStore';
import './ConnectInstagramModal.css';

const InstagramIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const validate = ({ pageId, accessToken }) => {
  const errors = {};
  if (!pageId.trim()) {
    errors.pageId = 'Facebook Page ID is required';
  } else if (!/^\d+$/.test(pageId.trim())) {
    errors.pageId = 'Page ID must contain numbers only';
  }
  if (!accessToken.trim()) {
    errors.accessToken = 'Access token is required';
  } else if (accessToken.trim().length < 40) {
    errors.accessToken = 'Access token appears too short';
  }
  return errors;
};

const ConnectInstagramModal = ({ isOpen, onClose, onConnected }) => {
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [errors, setErrors] = useState({});

  const { status, error, pageData, connectInstagram, reset } = useInstagramStore();

  const isChecking = status === 'checking';
  const isConnected = status === 'connected';
  const isFailed = status === 'failed';

  useEffect(() => {
    if (isConnected && onConnected) {
      const timer = setTimeout(() => {
        onConnected();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, onConnected]);

  const handleSubmit = async () => {
    const validationErrors = validate({ pageId, accessToken });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    await connectInstagram({ pageId: pageId.trim(), accessToken: accessToken.trim() });
  };

  const handleReset = () => {
    setPageId('');
    setAccessToken('');
    setErrors({});
    reset();
  };

  const handleClose = () => {
    handleReset();
    if (onClose) onClose();
  };

  const handleFieldChange = (field, value) => {
    if (field === 'pageId') setPageId(value);
    else setAccessToken(value);
    setErrors((prev) => ({ ...prev, [field]: null }));
    if (status !== 'idle') reset();
  };

  if (!isOpen) return null;

  const connectedProfile = pageData?.savedPlatform?.profile || pageData?.profile;

  return (
    <AnimatePresence>
      <div className="ig-modal-overlay" onClick={handleClose}>
        <motion.div
          className="ig-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="ig-modal__header">
            <div className="ig-modal__title-row">
              <div className="ig-modal__icon-bg">
                <InstagramIcon size={24} />
              </div>
              <div className="ig-modal__header-text">
                <h2 className="ig-modal__title">Connect Instagram Professional</h2>
                <p className="ig-modal__subtitle">
                  Connect your Instagram Business or Creator account linked to your Facebook Page.
                </p>
              </div>
            </div>
            <button className="ig-modal__close" onClick={handleClose} disabled={isChecking}>
              <X size={20} />
            </button>
          </div>

          <div className="ig-modal__body">
            {!isConnected && (
              <div className="ig-modal__form">
                {/* Page Access Token Field */}
                <div className="ig-modal__field">
                  <div className="ig-modal__field-header">
                    <label className="ig-modal__field-label">Page Access Token</label>
                    <a
                      href="https://developers.facebook.com/tools/explorer"
                      target="_blank"
                      rel="noreferrer"
                      className="ig-modal__field-link"
                    >
                      <Info size={13} /> Graph API Explorer <ExternalLink size={11} />
                    </a>
                  </div>
                  <div className="ig-modal__input-wrapper">
                    <input
                      className={`ig-modal__input ${errors.accessToken ? 'error' : ''}`}
                      type={showToken ? 'text' : 'password'}
                      placeholder="Enter Facebook Page access token with Instagram permissions"
                      value={accessToken}
                      onChange={(e) => handleFieldChange('accessToken', e.target.value)}
                      disabled={isChecking}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="ig-modal__input-toggle"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.accessToken && (
                    <span className="ig-modal__error-text">{errors.accessToken}</span>
                  )}
                </div>

                {/* Facebook Page ID Field */}
                <div className="ig-modal__field">
                  <label className="ig-modal__field-label">Linked Facebook Page ID</label>
                  <input
                    className={`ig-modal__input ${errors.pageId ? 'error' : ''}`}
                    type="text"
                    placeholder="e.g. 1029384756"
                    value={pageId}
                    onChange={(e) => handleFieldChange('pageId', e.target.value)}
                    disabled={isChecking}
                  />
                  {errors.pageId && (
                    <span className="ig-modal__error-text">{errors.pageId}</span>
                  )}
                </div>

                {/* Info / Permissions Box */}
                <div className="ig-modal__info-box">
                  <Info size={16} className="ig-modal__info-icon" />
                  <p className="ig-modal__info-text">
                    Ensure your Instagram account is switched to a <strong>Business</strong> or <strong>Creator</strong> profile and connected to your Facebook Page. Token requires permissions: <code>instagram_basic</code>, <code>instagram_content_publish</code>, <code>pages_show_list</code>.
                  </p>
                </div>

                {/* Status Messages */}
                {isChecking && (
                  <div className="ig-modal__status checking">
                    <Loader size={16} className="ig-modal__spinner" />
                    <span>Verifying and linking Instagram account...</span>
                  </div>
                )}

                {isFailed && error && (
                  <div className="ig-modal__status failed">
                    <AlertCircle size={16} />
                    <div className="ig-modal__status-content">
                      <p>{error.message}</p>
                      {error.hint && <p className="ig-modal__hint">{error.hint}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success state */}
            {isConnected && (
              <motion.div
                className="ig-modal__success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="ig-modal__success-icon">
                  <CheckCircle size={44} />
                </div>
                <h3 className="ig-modal__success-title">Connected to Instagram!</h3>
                <div className="ig-modal__preview-card">
                  <div className="ig-modal__preview-avatar">
                    {connectedProfile?.username ? connectedProfile.username[0].toUpperCase() : 'IG'}
                  </div>
                  <div className="ig-modal__preview-details">
                    <span className="ig-modal__preview-name">
                      @{connectedProfile?.username || 'instagram_account'}
                    </span>
                    <span className="ig-modal__preview-meta">
                      {connectedProfile?.mediaCount !== undefined
                        ? `${connectedProfile.mediaCount} posts`
                        : 'Professional account'}{' '}
                      · Connected
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="ig-modal__footer">
            <div className="ig-modal__footer-left">
              <div className="ig-modal__secure-badge">
                <span className="ig-modal__secure-dot" />
                SECURE INSTAGRAM API
              </div>
              <Lock size={13} style={{ color: '#94a3b8' }} />
            </div>
            <div className="ig-modal__footer-actions">
              {!isConnected ? (
                <>
                  <button className="ig-modal__btn-cancel" onClick={handleClose} disabled={isChecking}>
                    Cancel
                  </button>
                  <button
                    className="ig-modal__btn-connect"
                    onClick={handleSubmit}
                    disabled={isChecking || !pageId.trim() || !accessToken.trim()}
                  >
                    {isChecking ? 'Connecting...' : 'Connect Account'}
                  </button>
                </>
              ) : (
                <button className="ig-modal__btn-connect" onClick={handleClose}>
                  Done
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConnectInstagramModal;
