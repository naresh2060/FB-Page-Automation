import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import "./Login.css";

const handleLoginWithFacebook = () => {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  const redirectUri = import.meta.env.VITE_FB_REDIRECT_URI;

  const scope = [
    "public_profile",
    "email",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "pages_manage_metadata"
  ].join(",");

  const fbAuthUrl =
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}` +
    `&response_type=code` +
    `&auth_type=rerequest`;

  window.location.href = fbAuthUrl;
};


const Login = () => {
  const { login, isLoading, error, setError, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    // login({ email, password });
    // store handles everything from here
    // on success → isLoggedIn = true → ProtectedLayout lets user through
    // on failure → error = "Invalid credentials"

    try {
      await login({ email, password }); // ⏳ wait for login

      navigate("/dashboard"); // ✅ only after success
    } catch (err) {
      // ❌ login failed
      console.log(err);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Marketing Section */}
      <div className="login-left">
        <div className="background-pattern">
          <span>M</span>
          <span>A</span>
          <span>R</span>
          <span>K</span>
          <span>I</span>
          <span>T</span>
          <span>_</span>
          <span>H</span>
          <span>E</span>
          <span>R</span>
          <span>E</span>
        </div>

        <div className="left-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="badge"
          >
            <Sparkles size={14} className="sparkle-icon" />
            <span>POWERED BY LUMINOUS INTELLIGENCE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Redefine your <br />
            social <span className="highlight-text">ecosystem</span> <br />
            with AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="description"
          >
            Join over 2,000+ creators and businesses optimizing their digital
            workflow with real-time predictive analysis.
          </motion.p>

          <div className="stats-container">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="stat-card"
            >
              <h3 className="stat-value">98%</h3>
              <p className="stat-label">Efficiency Increase</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="stat-card"
            >
              <h3 className="stat-value">2.4M</h3>
              <p className="stat-label">Posts Optimized</p>
            </motion.div>
          </div>
        </div>

        <div className="glow-effect"></div>
      </div>

      {/* Right Side - Form Section */}
      <div className="login-right">
        <header className="right-header">
          <div className="logo">
            <span className="logo-text">SocialFlow AI</span>
          </div>
          <div className="header-link">
            New here? <Link to="/signup">Create account</Link>
          </div>
        </header>

        <main className="form-section">
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Enter your credentials to access your dashboard</p>
          </div>

          <div className="social-login">
            <button type="button" className="social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
            <button type="button" className="social-btn" title="GitHub">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </button>
            <button type="button" className="social-btn" title="Twitter">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </button>
            <button type="button" onClick={handleLoginWithFacebook} className="social-btn" title="Facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </button>
          </div>

          <div className="divider">
            <span>OR EMAIL LOGIN</span>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
                style={{
                  color: "#ff4d4d",
                  fontSize: "14px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {error}
              </motion.div>
            )}
            <div className="input-group">
              <label>Email address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link
                to="/forgot-password"
                title="Forgot Password"
                className="forgot-link"
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="submit-btn">
              Sign into Dashboard <ArrowRight size={18} />
            </button>
          </form>

          <div className="security-info">
            <div className="security-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="security-text">
              <h4>Enterprise Security Enabled</h4>
              <p>
                Your session is protected by AES-256 encryption and multi-factor
                authentication protocols.
              </p>
            </div>
          </div>
        </main>

        <footer className="right-footer">
          <p>© 2024 SocialFlow AI. Luminous Intelligence.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;
