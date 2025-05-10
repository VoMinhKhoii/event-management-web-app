/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavPane from '../../components/NavPane';
import { AuthContext } from '../../context/authContext.jsx';
import { useContext } from 'react';
import EventMiniCard from '../../components/EventMiniCard';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const { currentUser, updateUser, updateAvatar } = useContext(AuthContext);
  const [originalProfileInfo, setOriginalProfileInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPwdVisible, setCurrentPwdVisible] = useState(false);
  const [newPwdVisible, setNewPwdVisible] = useState(false);
  const [notifications, setNotifications] = useState({
    events: true,
    offers: false,
    darkMode: false
  });

  const [userBookings, setUserBookings] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Add state for profile image
  const [profileImage, setProfileImage] = useState(currentUser?.avatar || '');

  // Updated state for profile information with new fields
  const [profileInfo, setProfileInfo] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    name: currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : "",
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: ""
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
      const response = await fetch(`http://localhost:8800/api/events/?participantId=${currentUser._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Unable to retrieve your bookings');
      }

      const data = await response.json();
      setUserBookings(data);
    }
    catch (error) {
      console.error('Error while fetching bookings:', error);
      setEventsError(error.message || 'Failed to load your bookings');
    } finally {
      setIsLoadingEvents(false);
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
      const initialProfileInfo = {
        firstName: currentUser?.firstName || "",
        lastName: currentUser?.lastName || "",
        name: currentUser?.firstName && currentUser?.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "",
        username: currentUser?.username || "",
        email: currentUser?.email || "",
        password: ""
      };

      setProfileInfo(initialProfileInfo);
      setOriginalProfileInfo(initialProfileInfo);
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
    if (!isEditing) {
      setOriginalProfileInfo({ ...profileInfo });
      setIsEditing(true);
    } else {
      setProfileInfo(originalProfileInfo);
      setIsEditing(false);
    }
    // Reset password fields when toggling edit mode
    setCurrentPassword('');
    setCurrentPwdVisible(false);
    setNewPwdVisible(false);
  };
  const validateForm = () => {
    if (profileInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileInfo.email)) {
      alert("Please enter a valid email address");
      return false;
    }

    if (profileInfo.password && profileInfo.password.length > 0) {
      if (profileInfo.password.length < 8) {
        alert("Password must be at least 8 characters long");
        return false;
      }
    }
    return true;
  };
  const handleSaveProfile = async () => {
    try {
      if (!validateForm()) return;
      // Check password if the user wants to change the password
      if ((currentPassword && !profileInfo.password) || (!currentPassword && profileInfo.password)) {
        if (currentPassword && !profileInfo.password) {
          alert("Please enter your new password");
        } else {
          alert("Please enter your current password to change your password");
        }
        return;
      }

      // Create request body
      const requestBody = {
        firstName: profileInfo.firstName,
        lastName: profileInfo.lastName,
        username: profileInfo.username,
        email: profileInfo.email,
      };


      // Only send password information if the user wants to change the password
      if (profileInfo.password && profileInfo.password.trim() !== '') {
        // Ensure currentPassword is always available
        if (!currentPassword || currentPassword.trim() === '') {
          alert("Please enter your current password to change your password");
          return;
        }
        if (profileInfo.password === currentPassword) {
          alert("The new password cannot be the same as the current password");
          return;
        }
        requestBody.password = profileInfo.password;
        requestBody.currentPassword = currentPassword;
      }

      // Send request to API
      const res = await fetch(`http://localhost:8800/api/users/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();

      // Update local user state with the response data
      if (data.user) {
        updateUser(data.user);
      }

      // Reset password fields
      setCurrentPassword('');
      handleProfileChange('password', '');

      // Reset password visibility
      setCurrentPwdVisible(false);
      setNewPwdVisible(false);

      // Toggle edit mode off
      setIsEditing(false);

      // Show success message
      alert("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      // Display clearer error message to the user
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // client-side validation
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`http://localhost:8800/api/users/${currentUser._id}/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      // check if response is json
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(text || 'Server returned non-JSON response');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setProfileImage(data.avatar);
      updateAvatar(data.avatar);
    } catch (err) {
      console.error('Upload error', err);
      alert(err.message || 'Failed to upload avatar');
    }
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

  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:8800/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to delete event');
      }

      fetchUserEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event. Please try again.');
    }
  }

  const SettingsTab = () => {
    const navigate = useNavigate();
    const { updateUser } = useContext(AuthContext);

    const handleLogout = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Logout failed');
        }

        // Clear user data
        updateUser(null);

        // Redirect to login page
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
      }
    };

    return (
      <div className="py-6">
        {/* Account Management */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Account Management</h3>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-full">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleLogout}
                className="flex items-center px-8 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button
              className="absolute bottom-0 right-0 bg-[#569DBA] text-white p-2 rounded-full shadow-md hover:bg-opacity-90 transition-colors"
              onClick={() => document.getElementById('avatar-upload').click()}
              type="button"
              aria-label="Change profile picture"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>
          <div className="mt-2 space-y-5 text-gray-600">
            {isEditing && (
              <>
                <div className="flex items-center">
                  <div className="w-48 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>First Name: </span>
                  </div>
                  <input
                    type="text"
                    value={profileInfo.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="w-full min-w-[250px] border-b border-[#569DBA] focus:outline-none px-2 py-1"
                  />
                </div>

                <div className="flex items-center">
                  <div className="w-48 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Last Name: </span>
                  </div>
                  <input
                    type="text"
                    value={profileInfo.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full min-w-[250px] border-b border-[#569DBA] focus:outline-none px-2 py-1"
                  />
                </div>
              </>
            )}
            {!isEditing && (
              <h1 className="text-2xl font-bold text-gray-900">
                {profileInfo.firstName && profileInfo.lastName
                  ? `${profileInfo.firstName} ${profileInfo.lastName}`
                  : profileInfo.username}
              </h1>
            )}
            <div className="flex items-center">
              <div className={`${isEditing ? 'w-48' : 'w-30'} flex items-center`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Username: </span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={profileInfo.username}
                  onChange={(e) => handleProfileChange('username', e.target.value)}
                  className="w-full min-w-[250px] border-b border-[#569DBA] focus:outline-none px-2 py-1"
                />
              ) : (
                <span className="ml-2">{profileInfo.username}</span>
              )}
            </div>

            <div className="flex items-center">
              <div className={`${isEditing ? 'w-48' : 'w-30'} flex items-center`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email: </span>
              </div>
              {isEditing ? (
                <input
                  type="email"
                  value={profileInfo.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="w-full min-w-[250px] border-b border-[#569DBA] focus:outline-none px-2 py-1"
                />
              ) : (
                <span className="ml-2">{profileInfo.email}</span>
              )}
            </div>

            {isEditing && (
              <>
                <div className="flex items-center">
                  <div className="w-48 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Current Password: </span>
                  </div>
                  <div className="relative w-full min-w-[250px]">
                    <input
                      type={currentPwdVisible ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border-b border-[#569DBA] focus:outline-none px-2 py-1 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentPwdVisible(!currentPwdVisible)}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                    >
                      {currentPwdVisible ? (
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

                <div className="flex items-center">
                  <div className="w-48 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>New Password: </span>
                  </div>
                  <div className="relative w-full min-w-[250px]">
                    <input
                      type={newPwdVisible ? "text" : "password"}
                      placeholder="Enter new password"
                      value={profileInfo.password}
                      onChange={(e) => handleProfileChange('password', e.target.value)}
                      className="w-full border-b border-[#569DBA] focus:outline-none px-2 py-1 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setNewPwdVisible(!newPwdVisible)}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                    >
                      {newPwdVisible ? (
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
              </>
            )}

            <div className="mt-6">
              {isEditing ? (
                <div className="flex gap-2 justify-start">
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
                  className="px-6 py-2 bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  Update Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'bookings'
                ? 'border-b-2 border-[#569DBA] text-[#569DBA]'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('bookings')}
            >
              My Requests
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'events'
                ? 'border-b-2 border-[#569DBA] text-[#569DBA]'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('events')}
            >
              My Events
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'settings'
                ? 'border-b-2 border-[#569DBA] text-[#569DBA]'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'settings' && <SettingsTab />}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {userBookings.length > 0 ? (
              <div className="space-y-4">
                {userBookings.map((event) => (
                  <EventMiniCard
                    key={event._id}
                    {...event}
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
            <div className="flex justify-end items-center mb-6">
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
                  <div key={event._id} className='relative'>
                    <EventMiniCard
                      {...event}
                      onClick={() => navigate(`/event/${event._id}`)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this event?')) {
                          handleDeleteEvent(event._id);
                        }
                      }}
                      className='absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-80 hover:bg-red-100 transition-colors'
                      aria-label='Delete event'
                    >
                      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='red' strokeWidth='2'>
                        <path strokeLinecap='round' strokeLinejoin='round' d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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
