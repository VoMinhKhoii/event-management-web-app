import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavPane from '../../components/NavPane';
import { AuthContext } from '../../context/authContext.jsx';
import { useContext } from 'react';
import EventMiniCard from '../../components/EventMiniCard';
// import { set } from 'mongoose';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, updateAvatar } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('settings');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    events: true,
    offers: false,
    darkMode: false
  });
  
  const [userBookings, setUserBookings] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  // Add password visibility state
  const [pwdInputType, setPwdInputType] = useState({
    type: 'password',
    show: false
  });
  
  // Add state for profile image and Cloudinary widget reference
  const [profileImage, setProfileImage] = useState(currentUser?.avatar || '');
  const widgetRef = useRef(null);
  
  // Updated state for profile information with new fields
  const [profileInfo, setProfileInfo] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    name: currentUser?.firstName && currentUser?.lastName 
      ? `${currentUser.firstName} ${currentUser.lastName}` 
      : "",
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: currentUser?.password || ""
  });

  // Function to fetch user events from the API
  const fetchUserEvents = async () => {
    if (!currentUser) return;
    
    setIsLoadingEvents(true);
    setEventsError(null);
    
    try {
      const response = await fetch(`http://localhost:8800/api/events?organizerId=${currentUser._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Unable to retrieve your events');
      }
      
      const data = await response.json();
      setUserEvents(data);
    } catch (error) {
      console.error('Error while fetching events:', error);
      setEventsError(error.message || 'Failed to load your events');
    } finally {
      setIsLoadingEvents(false);
    }
  };


  const fetchUserBookings = async () => {
    if (!currentUser) return;

    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const response = await fetch(`http://localhost:8800/api/events/?bookingId=${currentUser._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Unable to retrieve your bookings');
      }

      const data = await response.json();
      console.log('User Bookings:', data);
      setUserBookings(data);

    }
    catch (error) {
      console.error('Error while fetching bookings:', error);
      setEventsError(error.message || 'Failed to load your bookings');
    }
  };


  
  useEffect(() => {
    if (activeTab === 'events' && currentUser) {
      fetchUserEvents();
    }
    if (activeTab === 'bookings') {
      fetchUserBookings();
    }
  }, [activeTab, currentUser]);

  // Update profileImage when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileImage(currentUser.avatar || "https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg");
    }
  }, [currentUser]);

  const handleProfileChange = (field, value) => {
    setProfileInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  // Function to handle show/hide password
  const handleOnClick = () => {
    setPwdInputType({
      type: pwdInputType.type === 'password' ? 'text' : 'password',
      show: !pwdInputType.show
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Update full name when first name or last name changes
      const updatedProfileInfo = {
        ...profileInfo,
        name: `${profileInfo.firstName} ${profileInfo.lastName}`
      };
      
      setProfileInfo(updatedProfileInfo);
      

      // Send request to API to update the user's profile
      const res = await fetch(`http://localhost:8800/api/users/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: profileInfo.firstName,
          lastName: profileInfo.lastName,
          username: profileInfo.username,
          email: profileInfo.email,
          password: profileInfo.password || undefined 
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Update local user state with the response data
      if (data.user) {
        updateUser(data.user);
      }
      
      // Toggle edit mode off
      setIsEditing(false);
      // Show success message
      alert("Profile updated successfully!");
    } catch (error) {
      console.error('Profile update error:', error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const res = await fetch(`http://localhost:8800/api/auth/logout`, {
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

  // Initialize Cloudinary widget
  useEffect(() => {
    // Load the Cloudinary upload widget script
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => {
        initWidget();
      };
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    function initWidget() {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: 'dtc1fgnvp',
          uploadPreset: 'ml_default',    
          folder: 'permanent_assets', 
        },
        async (error, result) => {
          if (!error && result && result.event === 'success') {
            console.log('Upload successful:', result.info);
            const avatarUrl = result.info.secure_url;
            // Update local state
            setProfileImage(avatarUrl);
            // Update shared context state
            updateAvatar(avatarUrl);
            
            // Update avatar in the database
            try {
              const res = await fetch(`http://localhost:8800/api/users/${currentUser._id}/avatar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ avatarUrl })
              });
              
              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
              }
              
              console.log('Avatar updated in database');
            } catch (err) {
              console.error('Failed to update avatar in database:', err);
            }
          } else if (error) {
            console.error('Upload Error:', error);
          }
        }
      );
    }
  }, [updateAvatar]);

  // Function to open the Cloudinary widget
  const handleImageUpload = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      console.error('Widget not initialized yet');
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
              src={profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
            />
            <button 
              className="absolute bottom-0 right-0 bg-[#569DBA] text-white p-2 rounded-full shadow-md hover:bg-opacity-90 transition-colors"
              onClick={handleImageUpload}
              type="button"
              aria-label="Change profile picture"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </button>
          </div>
          
          <div className="text-center md:text-left flex-grow">
            {!isEditing && (
              <h1 className="text-2xl font-bold text-gray-900">{profileInfo.name}</h1>
            )}
            
            <div className="mt-2 space-y-3 text-gray-600">
              {isEditing && (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>First Name: </span>
                    <input
                      type="text"
                      value={profileInfo.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      className="border-b border-[#569DBA] focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Last Name: </span>
                    <input
                      type="text"
                      value={profileInfo.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      className="border-b border-[#569DBA] focus:outline-none"
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Username: </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileInfo.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                    className="border-b border-[#569DBA] focus:outline-none"
                  />
                ) : (
                  <span>{profileInfo.username}</span>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email: </span>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileInfo.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="border-b border-[#569DBA] focus:outline-none"
                  />
                ) : (
                  <span>{profileInfo.email}</span>
                )}
              </div>
              
              
              {isEditing && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Password: </span>
                <div className="relative flex items-center">
                  <input
                    type={pwdInputType.type}
                    placeholder="Enter new password"
                    value={profileInfo.password}
                    onChange={(e) => handleProfileChange('password', e.target.value)}
                    className="border-b border-[#569DBA] focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={handleOnClick}
                    className="absolute right-0 text-gray-500 focus:outline-none"
                  >
                    {pwdInputType.show ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              )}
            </div>
            
            <div className="mt-4">
              {isEditing ? (
                <div className="flex gap-2 justify-center md:justify-start">
                  <button 
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-[#569DBA] text-white rounded hover:bg-opacity-90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                onClick={handleEditToggle}
                className="w-full md:w-auto mt-4 px-6 py-3 md:py-2 bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center md:justify-start gap-2 text-base md:text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
                Update Profile
              </button>
              )}
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
            {userBookings.length > 0 ? (
              <div className="space-y-4">
                {userBookings.map((event) => (
                  <EventMiniCard 
                    key={event._id} 
                    event={{
                      id: event._id,
                      title: event.title,
                      date: event.startDate,
                      time: `${event.startTime} - ${event.endTime}`,
                      location: event.location,
                      image: event.image,
                      status: (() => {
                        const now = new Date(); 
                        const startDateTime = new Date(`${event.startDate}T${event.startTime}`);
                        const endDateTime = new Date(`${event.endDate}T${event.endTime}`);
                        // Determine the status based on the current time and event times
                        if (now > endDateTime) return "ended";
                        if (now < startDateTime) return "upcoming";
                        return "active";
                      })()
                    }}
                    onClick={() => navigate(`/event/${event._id}`)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You haven't booked any events yet.</p>
            )}
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
            
            {isLoadingEvents ? (
              <div className="flex justify-center items-center py-10">
                <svg className="animate-spin h-10 w-10 text-[#569DBA]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : eventsError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-3">{eventsError}</p>
                <button 
                  onClick={fetchUserEvents}
                  className="px-4 py-2 bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : userEvents.length > 0 ? (
              <div className="space-y-4">
                {userEvents.map((event) => (
                  <EventMiniCard 
                    key={event._id} 
                    event={{
                      id: event._id,
                      title: event.title,
                      date: event.startDate,
                      time: `${event.startTime} - ${event.endTime}`,
                      location: event.location,
                      image: event.image,
                      status: (() => {
                        const now = new Date(); 
                        const startDateTime = new Date(`${event.startDate}T${event.startTime}`);
                        const endDateTime = new Date(`${event.endDate}T${event.endTime}`);
                        // Determine the status based on the current time and event times
                        if (now > endDateTime) return "ended";
                        if (now < startDateTime) return "upcoming";
                        return "active";
                      })()
                    }}
                    onClick={() => navigate(`/event/${event._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">You haven't created any events yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;