import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Calendar from './components/Calendar/Calendar';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ProtectedLayout from './layout/ProtectedLayout';
import AuthLayout from './layout/AuthLayout/AuthLayout';
import FacebookDashboard from './pages/FacebookDashboard/FacebookDashboard';
import MainLayout from './layout/MainLayout/MainLayout';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/channels/facebook" element={<FacebookDashboard />} />
        </Route>

        {/* Public / Main Routes */}
        <Route element={<MainLayout />}>
          <Route path="/privacy" element={<div>Privacy Policy Page</div>} />
          <Route path="/terms" element={<div>Terms of Service Page</div>} />
          <Route path="/contact" element={<div>Contact Page</div>} />
          <Route path="/support" element={<div>Support Page</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


