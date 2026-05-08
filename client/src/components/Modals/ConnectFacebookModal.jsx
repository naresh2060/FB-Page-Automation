import React, { useState, useEffect } from "react";
import { X, Shield, AlertCircle, CheckCircle, Loader, ExternalLink, RefreshCw, Info, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePlatformStore from "../../store/usePlatformStore.js";
import "./ConnectFacebookModal.css";

// ── Validation ───────────────────────────────────────────────────
const validate = ({ pageId, accessToken }) => {
  const errors = {};
  if (!pageId.trim()) {
    errors.pageId = "Page ID is required";
  } else if (!/^\d+$/.test(pageId.trim())) {
    errors.pageId = "Page ID must contain numbers only";
  }
  if (!accessToken.trim()) {
    errors.accessToken = "Access token is required";
  } else if (accessToken.trim().length < 50) {
    errors.accessToken = "Access token appears too short";
  }
  return errors;
};

// ── Error hint per error code ────────────────────────────────────
const ErrorHint = ({ error }) => {
  if (!error) return null;

  const hints = {
    TOKEN_EXPIRED: (
      <p className="fb-error__hint">
        Generate a new token from{" "}
        <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noreferrer">
          Graph API Explorer <ExternalLink size={11} />
        </a>
      </p>
    ),
    TOKEN_INVALID: (
      <p className="fb-error__hint">
        The token may have been revoked. Please generate a fresh one.
      </p>
    ),
    PAGE_NOT_MANAGED: (
      <p className="fb-error__hint">
        {error.hint || "Make sure you are an admin of this Facebook page."}
      </p>
    ),
    MISSING_PERMISSIONS: (
      <div className="fb-error__scopes">
        <p className="fb-error__hint">Regenerate your token with these permissions:</p>
        <div className="fb-scope-list">
          {error.missingScopes?.map((scope) => (
            <span key={scope} className="fb-scope-pill missing">{scope}</span>
          ))}
        </div>
      </div>
    ),
  };

  return hints[error.code] || (
    <p className="fb-error__hint">Check your credentials and try again.</p>
  );
};

// ── Main modal ───────────────────────────────────────────────────
const FacebookConnectModal = ({ isOpen, onClose, onConnected }) => {
  const [pageId, setPageId]           = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showToken, setShowToken]     = useState(false);
  const [errors, setErrors]           = useState({});

  const { status, pageInfo, tokenInfo, error, connectFacebook, reset } =
    usePlatformStore();

  const isChecking  = status === "checking";
  const isConnected = status === "connected";
  const isFailed    = status === "failed";

  // ── Auto-close after successful connection ───────────────────
  useEffect(() => {
    if (isConnected && onConnected) {
      const timer = setTimeout(onConnected, 1500); 
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
    connectFacebook({ pageId: pageId.trim(), accessToken: accessToken.trim() });
  };

  const handleReset = () => {
    setPageId("");
    setAccessToken("");
    setErrors({});
    reset();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFieldChange = (field, value) => {
    if (field === "pageId") setPageId(value);
    else setAccessToken(value);
    setErrors((prev) => ({ ...prev, [field]: null }));
    if (status !== "idle") reset();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fb-overlay" onClick={handleClose}>
        <motion.div
          className="fb-modal"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="fb-modal__header">
            <div className="fb-modal__title-row">
              <div className="fb-icon-wrapper">
                <div className="fb-icon-bg">
                  <ShieldCheck size={20} className="fb-icon" />
                </div>
              </div>
              <div className="fb-header-text">
                <h2 className="fb-modal__title">Connect Facebook Page</h2>
                <p className="fb-modal__subtitle">
                  Enter your page credentials to enable automated posting and analytics.
                </p>
              </div>
            </div>
            <button className="fb-modal__close" onClick={handleClose} disabled={isChecking}>
              <X size={20} />
            </button>
          </div>

          <div className="fb-modal__body">
            {/* ── Form — hidden after connect ── */}
            {!isConnected && (
              <div className="fb-form">
                {/* Page Access Token Field */}
                <div className="fb-field">
                  <div className="fb-field__header">
                    <label className="fb-field__label">Page Access Token</label>
                    <a
                      href="https://developers.facebook.com/tools/explorer"
                      target="_blank"
                      rel="noreferrer"
                      className="fb-field__link"
                    >
                      <Info size={14} /> How to find these?
                    </a>
                  </div>
                  <div className="fb-input-wrapper">
                    <input
                      className={`fb-field__input ${errors.accessToken ? "error" : ""}`}
                      type={showToken ? "text" : "password"}
                      placeholder="Enter access token"
                      value={accessToken}
                      onChange={(e) => handleFieldChange("accessToken", e.target.value)}
                      disabled={isChecking}
                      autoComplete="off"
                    />
                    <button 
                      type="button"
                      className="fb-input-toggle"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.accessToken && <span className="fb-field__error">{errors.accessToken}</span>}
                </div>

                {/* Page ID Field */}
                <div className="fb-field">
                  <label className="fb-field__label">Page ID</label>
                  <input
                    className={`fb-field__input ${errors.pageId ? "error" : ""}`}
                    type="text"
                    placeholder="e.g. 1029384756"
                    value={pageId}
                    onChange={(e) => handleFieldChange("pageId", e.target.value)}
                    disabled={isChecking}
                  />
                  {errors.pageId && <span className="fb-field__error">{errors.pageId}</span>}
                </div>

                {/* Info Box */}
                <div className="fb-info-box">
                  <div className="fb-info-box__icon">
                    <Info size={16} />
                  </div>
                  <p className="fb-info-box__text">
                    By connecting your page, you authorize SaaS Manager to read insights, manage posts, and view engagement metrics. You can revoke access at any time from your Facebook App Settings.
                  </p>
                </div>

                {/* ── Status Messages ── */}
                {isChecking && (
                  <div className="fb-status checking">
                    <Loader size={16} className="fb-status__spin" />
                    <span>Verifying connection...</span>
                  </div>
                )}

                {isFailed && error && (
                  <div className="fb-status failed">
                    <AlertCircle size={16} />
                    <div className="fb-status__content">
                      <p>{error.message}</p>
                      <ErrorHint error={error} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Success state ── */}
            {isConnected && pageInfo && (
              <motion.div
                className="fb-success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="fb-success-icon">
                  <CheckCircle size={48} />
                </div>
                <h3 className="fb-success-title">Connected Successfully!</h3>
                <div className="fb-page-preview">
                  <div className="fb-page-avatar">
                    {pageInfo.picture ? (
                      <img src={pageInfo.picture} alt={pageInfo.name} />
                    ) : (
                      <span>{pageInfo.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="fb-page-details">
                    <span className="fb-page-name">{pageInfo.name}</span>
                    <span className="fb-page-category">{pageInfo.category}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="fb-modal__footer">
            <div className="fb-footer-left">
              <div className="fb-secure-badge">
                <span className="fb-secure-dot"></span>
                SECURE CONNECTION
              </div>
              <div className="fb-footer-icons">
                {/* <Facebook size={14} className="fb-footer-icon" /> */}
                <Lock size={14} className="fb-footer-icon" />
              </div>
            </div>
            <div className="fb-footer-actions">
              {!isConnected ? (
                <>
                  <button className="fb-btn-cancel" onClick={handleClose} disabled={isChecking}>
                    Cancel
                  </button>
                  <button
                    className="fb-btn-connect"
                    onClick={handleSubmit}
                    disabled={isChecking || !pageId.trim() || !accessToken.trim()}
                  >
                    {isChecking ? "Connecting..." : "Connect Account"}
                  </button>
                </>
              ) : (
                <button className="fb-btn-connect" onClick={handleClose}>
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

export default FacebookConnectModal;