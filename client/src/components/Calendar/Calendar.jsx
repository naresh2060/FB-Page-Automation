import React from 'react';
import { ChevronLeft, ChevronRight, Video, Link, Share2 as Twitter, Camera as InstaIcon } from 'lucide-react';
import WeeklyIntelligence from './WeeklyIntelligence';
import './Calendar.css';

const TaskCard = ({ type, title, platform, status, color }) => {
  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <InstaIcon size={14} />;
      case 'linkedin': return <Link size={14} />;
      case 'twitter': return <Twitter size={14} />;
      case 'reel': return <Video size={14} />;
      default: return null;
    }
  };

  return (
    <div className={`task-card platform-${platform.toLowerCase()}`} style={{ borderLeft: `3px solid ${color}` }}>
      <div className="task-header">
        <span className="platform-tag" style={{ backgroundColor: `${color}15`, color: color }}>
          {getIcon()}
          <span>{type || platform}</span>
        </span>
      </div>
      <p className="task-title">{title}</p>
      {status && <div className="task-status">{status}</div>}
    </div>
  );
};

const Calendar = () => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  const calendarData = [
    { day: 1, date: '01', tasks: [{ type: 'REEL', title: 'Morning Routine...', platform: 'instagram', color: '#8b5cf6' }] },
    { day: 2, date: '02', tasks: [{ type: 'LINKEDIN', title: 'The Future o...', platform: 'linkedin', color: '#0ea5e9' }] },
    { day: 3, date: '03', isToday: true, tasks: [{ type: 'X/TWITTER', title: '10 AI prompt...', platform: 'twitter', color: '#0f172a' }] },
    { day: 4, date: '04', tasks: [] },
    { day: 5, date: '05', tasks: [{ type: 'Weekly Round-up', title: '', platform: 'none', color: '#cbd5e1' }] },
    { day: 6, date: '06', tasks: [] },
    { day: 0, date: '', isEmpty: true }, // Empty cell for previous month
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title-group">
          <h1 className="calendar-month">October 2024</h1>
          <p className="calendar-subtitle">SocialFlow AI Content Strategy</p>
        </div>
        
        <div className="calendar-controls">
          <div className="view-toggle">
            <button className="active">Month</button>
            <button>Week</button>
          </div>
          
          <div className="nav-btns">
            <button className="nav-btn"><ChevronLeft size={18} /></button>
            <button className="today-btn">Today</button>
            <button className="nav-btn"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className="calendar-grid">
        {days.map(day => (
          <div key={day} className="grid-header">{day}</div>
        ))}
        
        {/* Mocking first row with empty cells and data */}
        <div className="grid-cell empty"></div>
        {calendarData.slice(0, 6).map((item, idx) => (
          <div key={idx} className={`grid-cell ${item.isToday ? 'today' : ''}`}>
            <span className="cell-date">{item.date}</span>
            <div className="cell-tasks">
              {item.tasks.map((task, tIdx) => (
                <TaskCard key={tIdx} {...task} />
              ))}
            </div>
            {item.date === '09' && (
               <button className="schedule-placeholder">
                  <div className="plus-icon">+</div>
                  <span>Schedule</span>
               </button>
            )}
          </div>
        ))}
        
        {/* Remaining cells for mocking */}
        {[7, 8, 9, 10, 11, 12, 13, 14].map(date => (
          <div key={date} className="grid-cell">
            <span className="cell-date">{date < 10 ? `0${date}` : date}</span>
            {date === 9 && (
               <button className="schedule-placeholder">
                  <div className="plus-icon">+</div>
                  <span>Schedule</span>
               </button>
            )}
          </div>
        ))}
      </div>
      <WeeklyIntelligence />
    </div>
  );
};

export default Calendar;
