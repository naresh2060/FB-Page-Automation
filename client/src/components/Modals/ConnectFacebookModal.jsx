import React, { useState, useEffect } from "react";
import { X, Shield, AlertCircle, CheckCircle, Loader, ExternalLink, RefreshCw, Info } from "lucide-react";
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

// ── Step indicator ───────────────────────────────────────────────
const STEPS = ["Input", "Verify token", "Check pages", "Result"];

const StepIndicator = ({ currentStep, failed }) => (
  <div className="fb-steps">
    {STEPS.map((label, i) => {
      const stepNum  = i + 1;
      const isDone   = stepNum < currentStep && !(failed && stepNum === currentStep - 1);
      const isActive = stepNum === currentStep;
      const isFailed = failed && stepNum === currentStep;
      return (
        <React.Fragment key={label}>
          <div className={`fb-step ${isDone ? "done" : ""} ${isActive ? "active" : ""} ${isFailed ? "fail" : ""}`}>
            <div className="fb-step__dot">
              {isDone   && <CheckCircle size={12} />}
              {isFailed && <AlertCircle size={12} />}
              {!isDone && !isFailed && <span>{stepNum}</span>}
            </div>
            <span className="fb-step__label">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`fb-step__line ${stepNum < currentStep ? "done" : ""}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

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
  const [errors, setErrors]           = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const { status, pageInfo, tokenInfo, error, checkFacebook, reset } =
    usePlatformStore();

  const isChecking  = status === "checking";
  const isConnected = status === "connected";
  const isFailed    = status === "failed";

  // ── Auto-close after successful connection ───────────────────
  useEffect(() => {
    if (isConnected && onConnected) {
      const timer = setTimeout(onConnected, 1500); // 1.5s so user sees success state
      return () => clearTimeout(timer);
    }
  }, [isConnected, onConnected]);

  // ── Animate through steps while checking ────────────────────
  const runSteps = async (cb) => {
    setCurrentStep(1);
    await delay(200);  setCurrentStep(2);
    await delay(700);  setCurrentStep(3);
    await delay(700);  setCurrentStep(4);
    cb();
  };

  const handleSubmit = async () => {
    const validationErrors = validate({ pageId, accessToken });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    runSteps(() => {
      checkFacebook({ pageId: pageId.trim(), accessToken: accessToken.trim() });
    });
  };

  const handleReset = () => {
    setPageId("");
    setAccessToken("");
    setErrors({});
    setCurrentStep(1);
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
              <div className="fb-logo">
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div>
                <h2 className="fb-modal__title">Connect Facebook page</h2>
                <p className="fb-modal__subtitle">Validate via Facebook Graph API</p>
              </div>
            </div>
            <button className="fb-modal__close" onClick={handleClose} disabled={isChecking}>
              <X size={18} />
            </button>
          </div>

          {/* ── Step indicator ── */}
          <div className="fb-modal__steps">
            <StepIndicator currentStep={currentStep} failed={isFailed} />
          </div>

          <div className="fb-modal__body">

            {/* ── Form — hidden after connect ── */}
            {!isConnected && (
              <div className="fb-form">
                <div className="fb-field">
                  <label className="fb-field__label">
                    Facebook page ID
                    <a
                      href="https://www.facebook.com/help/1503421039731588"
                      target="_blank"
                      rel="noreferrer"
                      className="fb-field__help"
                      title="How to find your Page ID"
                    >
                      <Info size={13} />
                    </a>
                  </label>
                  <input
                    className={`fb-field__input ${errors.pageId ? "error" : ""}`}
                    type="text"
                    placeholder="e.g. 123456789012345"
                    value={pageId}
                    onChange={(e) => handleFieldChange("pageId", e.target.value)}
                    disabled={isChecking}
                    autoComplete="off"
                  />
                  {errors.pageId
                    ? <span className="fb-field__error"><AlertCircle size={12} />{errors.pageId}</span>
                    : <span className="fb-field__hint">Found in your page → About → Page ID</span>
                  }
                </div>

                <div className="fb-field">
                  <label className="fb-field__label">
                    Access token
                    <a
                      href="https://developers.facebook.com/tools/explorer"
                      target="_blank"
                      rel="noreferrer"
                      className="fb-field__help"
                      title="Open Graph API Explorer"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </label>
                  <textarea
                    className={`fb-field__textarea ${errors.accessToken ? "error" : ""}`}
                    placeholder="Paste your access token here..."
                    value={accessToken}
                    onChange={(e) => handleFieldChange("accessToken", e.target.value)}
                    disabled={isChecking}
                    rows={3}
                  />
                  {errors.accessToken
                    ? <span className="fb-field__error"><AlertCircle size={12} />{errors.accessToken}</span>
                    : <span className="fb-field__hint">Get from Facebook Developers → Graph API Explorer</span>
                  }
                </div>

                {/* ── Checking status ── */}
                {isChecking && (
                  <motion.div
                    className="fb-status checking"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Loader size={15} className="fb-status__spin" />
                    <div>
                      <p className="fb-status__title">Verifying connection</p>
                      <p className="fb-status__desc">Checking token and page access via Graph API...</p>
                    </div>
                  </motion.div>
                )}

                {/* ── Error status ── */}
                {isFailed && error && (
                  <motion.div
                    className="fb-status failed"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle size={16} className="fb-status__icon" />
                    <div className="fb-status__content">
                      <span className="fb-error__code">{error.code}</span>
                      <p className="fb-status__title">Connection failed</p>
                      <p className="fb-status__desc">{error.message}</p>
                      <ErrorHint error={error} />
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Success state ── */}
            {isConnected && pageInfo && (
              <motion.div
                className="fb-success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="fb-success__badge">
                  <CheckCircle size={20} />
                  <span>Connected successfully — closing in a moment…</span>
                </div>

                {/* page card */}
                <div className="fb-page-card">
                  <div className="fb-page-card__avatar">
                    {pageInfo.picture
                      ? <img src={pageInfo.picture} alt={pageInfo.name} />
                      : <span>{pageInfo.name?.slice(0, 2).toUpperCase()}</span>
                    }
                  </div>
                  <div className="fb-page-card__info">
                    <div className="fb-page-card__name">
                      {pageInfo.name}
                      {pageInfo.verified && (
                        <span className="fb-verified">
                          <Shield size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="fb-page-card__meta">
                      {pageInfo.category}
                      {pageInfo.fanCount > 0 && (
                        <> · {pageInfo.fanCount.toLocaleString()} followers</>
                      )}
                    </div>
                  </div>
                </div>

                {/* token info */}
                <div className="fb-token-info">
                  <div className={`fb-token-info__row ${tokenInfo?.isLongLived ? "good" : "warn"}`}>
                    <span className="fb-token-info__dot" />
                    {tokenInfo?.isLongLived
                      ? "Long-lived token — no expiry"
                      : `Token expires ${new Date(tokenInfo?.expiresAt).toLocaleDateString()}`
                    }
                  </div>
                  {tokenInfo?.scopes?.length > 0 && (
                    <div className="fb-scope-list">
                      {tokenInfo.scopes.map((scope) => (
                        <span key={scope} className="fb-scope-pill">{scope}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="fb-modal__footer">
            {isConnected ? (
              <>
                <button className="fb-btn secondary" onClick={handleReset}>
                  <RefreshCw size={14} /> Connect another
                </button>
                <button className="fb-btn primary" onClick={handleClose}>
                  <CheckCircle size={14} /> Save & close
                </button>
              </>
            ) : (
              <>
                <button className="fb-btn ghost" onClick={handleClose} disabled={isChecking}>
                  Cancel
                </button>
                <button
                  className="fb-btn primary"
                  onClick={handleSubmit}
                  disabled={isChecking || !pageId.trim() || !accessToken.trim()}
                >
                  {isChecking
                    ? <><Loader size={14} className="fb-status__spin" /> Checking...</>
                    : <><Shield size={14} /> Check connection</>
                  }
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default FacebookConnectModal;