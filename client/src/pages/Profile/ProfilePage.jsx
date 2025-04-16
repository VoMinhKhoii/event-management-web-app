import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavPane from '../../components/NavPane';
import { AuthContext } from '../../context/authContext.jsx';
import { useContext } from 'react';
import EventMiniCard from '../../components/EventMiniCard';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('settings');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState({
    events: true,
    offers: false,
    darkMode: false
  });
  
  // Sample user events data
  const [userEvents, setUserEvents] = useState([
    {
      id: 1,
      title: "Tech Summit 2025",
      date: "Mar 15, 2025",
      time: "9:00 AM - 1:00 PM",
      location: "Convention Center, New York",
      image: "/images/tech.png",
      status: "upcoming"
    },
    {
      id: 2,
      title: "Business Workshop",
      date: "Apr 22, 2025",
      time: "2:00 PM - 5:00 PM",
      location: "Downtown Conference Hall",
      image: "/images/business.png",
      status: "active"
    },
    {
      id: 3,
      title: "Gaming Tournament",
      date: "May 10, 2025",
      time: "10:00 AM - 6:00 PM",
      location: "Esports Arena, Las Vegas",
      image: "/images/game.png",
      status: "upcoming"
    }
  ]);

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const res = await fetch('http://localhost:8800/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Important for cookie handling
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Logout failed');
      }
      
      // Clear any user data from localStorage
      updateUser(null);
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins']">
      <NavPane />
      
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Profile header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative">
            <img
              src="/images/avatar.png"
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
            />
            <button className="absolute bottom-0 right-0 bg-[#569DBA] text-white p-2 rounded-full shadow-md hover:bg-opacity-90 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </button>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">Mr Worldwide</h1>
            <div className="mt-2 space-y-1 text-gray-600">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Date of Birth: 24/10/2004</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email: mrboss69420@gmail.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Contact: 1234567890</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'bookings' 
                  ? 'border-b-2 border-[#569DBA] text-[#569DBA]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              My Bookings
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'events' 
                  ? 'border-b-2 border-[#569DBA] text-[#569DBA]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('events')}
            >
              My Events
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'settings' 
                  ? 'border-b-2 border-[#569DBA] text-[#569DBA]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Get Event Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.events}
                    onChange={() => handleNotificationChange('events')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#569DBA]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700">Get Offer's Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.offers}
                    onChange={() => handleNotificationChange('offers')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#569DBA]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.darkMode}
                    onChange={() => handleNotificationChange('darkMode')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#569DBA]"></div>
                </label>
              </div>
              
              <div className="pt-6">
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full sm:w-auto px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6">About Me</h2>
            <p className="text-gray-600">No information added yet.</p>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6">My Bookings</h2>
            <p className="text-gray-600">You haven't booked any events yet.</p>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Events</h2>
              <button 
                onClick={() => navigate('/create-event')}
                className="bg-[#569DBA] text-white px-4 py-2 rounded-full text-sm hover:bg-opacity-90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Event
              </button>
            </div>
            
            {userEvents.length > 0 ? (
              <div className="space-y-4">
                {userEvents.map((event) => (
                  <EventMiniCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You haven't created any events yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;