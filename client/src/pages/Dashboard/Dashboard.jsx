import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from "lucide-react";
import "./Dashboard.css";
import useDashboardStore from "../../store/useDashboardStore";

const ChannelCard = ({ platform, value, change, color }) => (
  <div className="channel-card">
    <div className="channel-card-header">
      <div className="platform-dot" style={{ backgroundColor: color }}></div>
      <span className="platform-name">{platform}</span>
    </div>
    <div className="channel-card-body">
      <span className="platform-value">{value}</span>
      <div className="platform-stat">
        <span className="stat-change">+{change}%</span>
        <span className="stat-label">engagement</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { fetchUser, user, isLoading } = useDashboardStore();
  const [selectedPage, setSelectedPage] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const pages = user?.facebook?.pages;

    if (pages?.length && !selectedPage) {
      setSelectedPage(pages[0].pageId);
    }
  }, [user]);

  const channels = [
    { platform: "Facebook", value: "18.4K", change: 9, color: "#1877F2" },
    { platform: "Instagram", value: "24.2K", change: 14, color: "#E4405F" },
    { platform: "LinkedIn", value: "6.8K", change: 22, color: "#0A66C2" },
    { platform: "Total", value: "49.4K", change: 12, color: "#6366f1" },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Performance overview</h1>
          <p className="dashboard-subtitle">
            Welcome back! <strong>{user?.name}.</strong> Here's what's happening
            across your channels.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

          {/* PAGE SELECT */}
          {user?.facebook?.pages?.length > 0 && (
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="page-select-dropdown"
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                color: "#1e293b",
                fontWeight: "500",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>
                Select a page
              </option>

              {user.facebook.pages.map((page) => (
                <option key={page.pageId} value={page.pageId}>
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="profile"
                      className="profile-img"
                    />
                  ) : user?.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User size={20} />
                  )}
                  {page.name}
                </option>
              ))}
            </select>
          )}

          {/* PROFILE ICON */}
          <div className="profile-icon">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="profile"
                className="profile-img"
              />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <User size={20} />
            )}
          </div>

        </div>
      </div>

      <div className="channels-grid">
        {channels.map((channel, idx) => (
          <ChannelCard key={idx} {...channel} />
        ))}
      </div>

      <div className="dashboard-main-grid">
        {/* Left Column: Analytics */}
        <div className="analytics-card card">
          <div className="card-header">
            <h3>Engagement analytics</h3>
            <div className="time-filters">
              <button className="active">7D</button>
              <button>1M</button>
              <button>3M</button>
            </div>
          </div>
          <div className="chart-container">
            <div className="mock-chart-legend">
              <div className="legend-item">
                <span className="dot fb"></span> Facebook
              </div>
              <div className="legend-item">
                <span className="dot ig"></span> Instagram
              </div>
              <div className="legend-item">
                <span className="dot li"></span> LinkedIn
              </div>
            </div>
            <div className="mock-bar-chart">
              {[60, 40, 80, 50, 90, 70, 85, 45, 65, 55, 75].map((h, i) => (
                <div
                  key={i}
                  className={`chart-bar-group ${i % 3 === 0 ? "fb" : i % 3 === 1 ? "ig" : "li"}`}
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Upcoming Queue */}
        <div className="queue-card card">
          <div className="card-header">
            <h3>Upcoming queue</h3>
            <button className="view-all">View all</button>
          </div>
          <div className="queue-list">
            <div className="queue-item">
              <div className="queue-date">
                <span className="day">Today</span>
                <span className="time">7 PM</span>
              </div>
              <div className="queue-info">
                <p className="queue-title">5 Mistakes every...</p>
                <div className="queue-platforms">
                  <div className="p-icon ig">IG</div>
                  <div className="p-icon fb">FB</div>
                </div>
              </div>
            </div>
            <div className="queue-item">
              <div className="queue-date">
                <span className="day">Fri</span>
                <span className="time">9 AM</span>
              </div>
              <div className="queue-info">
                <p className="queue-title">Why Prompt Eng...</p>
                <div className="queue-platforms">
                  <div className="p-icon fb">FB</div>
                  <div className="p-icon li">LI</div>
                </div>
              </div>
            </div>
            <div className="queue-item">
              <div className="queue-date">
                <span className="day">Sun</span>
                <span className="time">11 AM</span>
              </div>
              <div className="queue-info">
                <p className="queue-title">Weekend Tech ...</p>
                <div className="queue-platforms">
                  <div className="p-icon ig">IG</div>
                  <div className="p-icon fb">FB</div>
                  <div className="p-icon li">LI</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Health */}
        <div className="insights-column">
          <div className="health-card card-purple">
            <h3>AI content health</h3>
            <div className="health-content">
              <span className="health-value">92%</span>
              <p>Optimized for current trends</p>
            </div>
          </div>

          <div className="publish-card card-light">
            <p className="publish-label">Next post publishes to:</p>
            <div className="publish-platforms">
              <div className="pub-item">
                <span className="dot fb"></span> Facebook
              </div>
              <div className="pub-item">
                <span className="dot ig"></span> Instagram
              </div>
              <div className="pub-item">
                <span className="dot li"></span> LinkedIn
              </div>
            </div>
          </div>

          <div className="platforms-card card">
            <h3>Connected platforms</h3>
            <div className="platform-status-list">
              <div className="status-item">
                <div className="status-icon fb">FB</div>
                <span>Facebook</span>
                <div className="status-indicator online"></div>
              </div>
              <div className="status-item">
                <div className="status-icon ig">IG</div>
                <span>Instagram</span>
                <div className="status-indicator online"></div>
              </div>
              <div className="status-item">
                <div className="status-icon li">LI</div>
                <span>LinkedIn</span>
                <div className="status-indicator online"></div>
              </div>
              <div className="status-item inactive">
                <div className="status-icon tw">X</div>
                <span>X / Twitter</span>
                <button className="connect-link">Connect</button>
              </div>
            </div>
          </div>

          <div className="insights-card card">
            <h3>AI insights</h3>
            <div className="insight-item">
              <h4 className="ig-text">Instagram</h4>
              <p>
                Reels get <strong>24% more reach</strong> in your niche this
                week.
              </p>
            </div>
            <div className="insight-item">
              <h4 className="fb-text">Facebook</h4>
              <p>
                Sunday 11 AM posts get <strong>24% higher engagement</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
