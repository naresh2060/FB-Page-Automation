import React from 'react';
import { Sparkles, X } from 'lucide-react';
import './WeeklyIntelligence.css';

const WeeklyIntelligence = () => {
  return (
    <div className="intelligence-card">
      <div className="intelligence-icon gradient-bg">
        <Sparkles color="white" size={24} />
      </div>
      
      <div className="intelligence-content">
        <h3 className="intelligence-title">Weekly Intelligence Report</h3>
        <p className="intelligence-text">
          Your audience engagement is projected to peak this Thursday. We suggest moving your 
          <span className="text-highlight"> "Tech Trends" </span> reel from Friday to Thursday morning.
        </p>
      </div>

      <div className="intelligence-actions">
        <button className="dismiss-btn">Dismiss</button>
        <button className="apply-btn gradient-bg">Apply Suggestion</button>
      </div>
    </div>
  );
};

export default WeeklyIntelligence;
