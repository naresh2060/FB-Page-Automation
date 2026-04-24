import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  User,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Signup.css';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async  (e) => {
    e.preventDefault();
    setError('')
    setLoading(true);

    // Validation
    if(!fullName || !email || !password){
      setError('All fields are required');
      setLoading(false);
      return;
    } 

    //  Need to add a Confirm Password Validation Here after adding the confirm password field in frontend

    if(password.length < 6){
       setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }


    try{
      const response = await axios.post('http://localhost:5000/api/auth/register',{
        name : fullName,
        email : email,
        password : password,
      });
          // ✅ axios puts response data directly in response.data
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    navigate('/dashboard');

    } catch(error){
      // ✅ axios puts server error message in error.response.data
    setError(error.response?.data?.error || 'Registration failed');
    } finally {
          setLoading(false);

    }
    


  };

  return (
    <div className="signup-container">
      {/* Left Side - Marketing Section */}
      <div className="signup-left">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        
        <div className="left-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Elevate your social <br />
            <span className="highlight-text">intelligence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="description"
          >
            Join the next generation of content creators using 
            Luminous Intelligence to predict trends before they happen.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="testimonial-card"
          >
            <div className="card-header">
              <div className="icon-box">
                <Sparkles size={20} />
              </div>
              <div className="header-info">
                <h4>AI Insight Engine</h4>
                <p>Processing global trends in real-time</p>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-bar">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '94%' }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="progress-fill"
                ></motion.div>
              </div>
              <div className="progress-labels">
                <span>ANALYSIS ACTIVE</span>
                <span>94% OPTIMIZATION</span>
              </div>
            </div>

            <p className="quote">
              "SocialFlow AI hasn't just changed how we post; it's changed how we understand our audience fundamentally."
            </p>

            <div className="user-profile">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Sarah Jenkins" />
              <div className="user-info">
                <strong>Sarah Jenkins</strong>
                <span>Head of Growth, Lumina Digital</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>



      {/* Right Side - Form Section */}
      <div className="signup-right">
        <header className="right-header">
          <div className="logo">
            <span className="logo-text">SocialFlow AI</span>
          </div >
          <div className="header-link">
            <Link to="/support">Support</Link>
          </div>
        </header>

        <main className="form-section">
          <div className="form-header">
            <h2>Create an account</h2>
            <p>Already have an account? <Link to="/login" className="login-link">Log in</Link></p>
          </div>

          <div className="social-login">
            <button type="button" className="social-btn" title="Google">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
            <button type="button" className="social-btn" title="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#0077b5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </button>
            <button type="button" className="social-btn" title="X (Twitter)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
          </div>

          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Work Email</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 8 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="form-agreement">
              <label className="checkbox-container">
                <input type="checkbox" required />
                <span className="checkmark"></span>
                <span className="agreement-text">
                  By creating an account, I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <button type="submit" className="submit-btn">
              Create your account
            </button>
          </form>

          <div className="security-badge">
            <ShieldCheck size={18} className="shield-icon" />
            <span>Enterprise-grade 256-bit encryption active</span>
          </div>
        </main>

        <footer className="right-footer">
          <div className="footer-left">
             <span className="footer-logo">SocialFlow AI</span>
             <div className="footer-links">
               <Link to="/privacy">Privacy</Link>
               <Link to="/terms">Terms</Link>
               <Link to="/contact">Contact</Link>
             </div>
          </div>
          <p className="copyright">© 2024 SocialFlow AI. Luminous Intelligence.</p>
        </footer>
      </div>
    </div>
  );
};

export default Signup;
