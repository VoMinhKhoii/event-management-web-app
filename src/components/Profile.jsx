import React, { useState } from 'react';
import '../styles/Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [notifications, setNotifications] = useState({
    events: true,
    offers: false,
    darkMode: false
  });

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-image-container">
          <img
            src="/profile-placeholder.jpg"
            alt="Profile"
            className="profile-image"
          />
          <button className="edit-image-button">
            <svg  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </button>
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">Mr Worldwide</h1>
          <div className="profile-details">
            <p>Date of Birth: 24/10/2004</p>
            <p>Email ID: mrboss69420@gmail.com</p>
            <p>Contact number: 1234567890</p>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About me
        </button>
        <button
          className={`profile-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button>
        <button
          className={`profile-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          My Events
        </button>
        <button
          className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="settings-section">
          <div className="setting-item">
            <span className="setting-label">Get Event Notifications</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.events}
                onChange={() => handleNotificationChange('events')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <span className="setting-label">Get Offer's Notifications</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.offers}
                onChange={() => handleNotificationChange('offers')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <span className="setting-label">Dark Mode</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.darkMode}
                onChange={() => handleNotificationChange('darkMode')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <button className="logout-button">
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile; 