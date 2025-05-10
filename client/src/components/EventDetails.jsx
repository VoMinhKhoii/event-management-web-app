/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NavPane from './NavPane.jsx';
import { useLoaderData } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/authContext.jsx';
import { NotificationContext } from '../context/notificationContext.jsx';


const EventDetails = () => {
  const { id } = useParams();
  const eventData = useLoaderData(); // Get event data from loader
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [inviteUsername, setInviteUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);

  const { sendNotification } = useContext(NotificationContext); // Use the notification context

  // Organizer statistics
  const [rsvpRate, setRsvpRate] = useState(0);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // check event access permissions
  useEffect(() => {
    if (eventData) {
      // if event is private, check if user has access
      if (!eventData.publicity) {
        let hasAccess = false;

        // check if is organizer
        if (currentUser && eventData.organizer &&
          (currentUser._id === eventData.organizer._id ||
            currentUser.email === eventData.organizer.email)) {
          hasAccess = true;
        }

        // check if user is approved invitee
        if (!hasAccess && currentUser && eventData.invitations) {
          hasAccess = eventData.invitations.some(
            inv => inv.user?._id === currentUser._id && inv.status === 'approved'
          );
        }

        // check if user has approved request
        if (!hasAccess && currentUser && eventData.requests) {
          hasAccess = eventData.requests.some(
            req => req.user?._id === currentUser._id && req.status === 'approved'
          );
        }

        if (!hasAccess) {
          alert("You don't have permission to view this event.");
          navigate('/home');
          return;
        }
      }
      setCheckingAccess(false);
    }
  }, [eventData, currentUser, navigate]);

  useEffect(() => {
    // Check if user is the organizer of this event
    if (currentUser && eventData && eventData.organizer) {
      setIsOrganizer(
        currentUser._id === eventData.organizer._id ||
        currentUser.email === eventData.organizer.email
      );
    }
  }, [currentUser, eventData]);

  // Fetch comments for the event
  useEffect(() => {
    if (!id) return;

    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:8800/api/comments/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        // Add this when fetching comments
        const normalizedComments = data.map(comment => ({
          ...comment,
          replies: comment.replies || []  // Ensure replies is always an array and prevent data inconsistency
        }));
        setComments(normalizedComments);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
      }
    };

    fetchComments();
  }, [id]);

  const fetchInvitationsAndStats = async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/events/${id}/invitations-get`);

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to fetch invitations');
        throw new Error('Failed to fetch invitations');
      }

      const dataArray = data.invitations || [];
      setInvitations(dataArray);
      console.log("Fetched invitations:", dataArray); // Debugging line

      // Calculate RSVP rate
      const acceptedCount = dataArray.filter(inv => inv.status === 'approved').length;
      const totalRespondedCount = dataArray.filter(inv => inv.status !== 'invited').length;

      if (totalRespondedCount === 0) {
        setRsvpRate(0);
      } else {
        const calculatedRate = Math.round((acceptedCount / totalRespondedCount) * 100);
        setRsvpRate(calculatedRate);
      }


    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/events/${id}/requests-get`);

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to fetch requests');
        throw new Error('Failed to fetch requests');
      }

      const dataArray = data.requests || [];

      setRequests(dataArray);

      console.log("Fetched requests:", data); // Debugging line
    } catch (err) {
      console.error('Error fetching requests:', err);

    }
  }

  // If the user is an organizer, fetch invitations and calculate RSVP stats
  useEffect(() => {
    if (!id || !isOrganizer) return;
    fetchInvitationsAndStats();
    fetchRequests();
  }, [id, isOrganizer]);

  // Set loading to false once event data is loaded
  useEffect(() => {
    if (eventData) {
      setIsLoading(false);
    }
  }, [eventData]);

  // Calculate invitation statistics for organizer view
  const invitationStats = {

    total: invitations.length,
    accepted: invitations.filter(inv => inv.status === 'approved'),
    pending: invitations.filter(inv => inv.status === 'invited'),
    declined: invitations.filter(inv => inv.status === 'rejected')
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !currentUser) return;

    try {
      const response = await fetch(`http://localhost:8800/api/comments/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment = await response.json();
      setComments(prev => [newComment, ...prev]);
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
  };

  const hasNoReplies = (comment) => {
    // This will be computed fresh on every render
    return !comment.replies || comment.replies.length === 0;
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim() || !currentUser) return;

    try {
      const response = await fetch(`http://localhost:8800/api/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: replyText }),
      });

      if (!response.ok) {
        throw new Error('Failed to post reply');
      }

      // This is the updated comment with the new reply already included
      const updatedComment = await response.json();

      // Replace the entire comment object in the comments array
      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === commentId ? updatedComment : comment
        )
      );
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply. Please try again.');
    }
  };

  const handleDeleteClick = async (commentId) => {
    if (!currentUser) return;

    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8800/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove the comment from state
      setComments(prevComments =>
        prevComments.filter(comment => comment._id !== commentId)
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!currentUser) return;

    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8800/api/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reply');
      }

      // This is the updated comment with the new reply already included
      const updatedComment = await response.json();

      // Update the comments state with the updated comment
      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === commentId ? updatedComment : comment
        )
      );
    } catch (err) {
      console.error('Error deleting reply:', err);
      setError('Failed to delete reply. Please try again.');
    }
  };

  const handleSendInviteeReminders = async () => {
    if (!isOrganizer || !eventData._id) return;

    if (!window.confirm('Send reminders to all users with pending invitations?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8800/api/events/${id}/reminders/pending-invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to send reminders');
        return;
      }

      alert(`${data.count} reminders sent successfully`);
    } catch (err) {
      console.error('Error sending reminders:', err);
      alert('Failed to send reminders');
    }
  };

  const handleSendAttendeeReminders = async () => {
    if (!isOrganizer || !id) return;

    if (!window.confirm('Send reminders to all attendees?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8800/api/events/${id}/reminders/attendees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to send reminders');
        return;
      }

      alert(`${data.count} reminders sent successfully`);
    } catch (err) {
      console.error('Error sending reminders:', err);
      alert('Failed to send reminders');
    }
  };

  const handleSendInvite = async (username) => {
    if (!isOrganizer) return;

    try {
      const response = await fetch(`http://localhost:8800/api/events/${id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username: username })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to send invitation');
        return;
      }

      // Show notification or success message
      alert(data.message || 'Invitation sent successfully');

      setInviteUsername('');
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Failed to send invitation. Please try again.');
    }
  };


  const handleJoinRequest = async () => {
    if (!currentUser) {
      alert("Please login to request joining this event.");
      return;
    }
    if (!window.confirm(`Are you sure you want to request to join "${eventData.title}"?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:8800/api/events/${id}/request-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: '' }) // Optional custom message
      });
      const data = await response.json();

      if (!response.ok) {

        if (response.status === 400 && data.conflicts) {
          const conflictMessages = data.conflicts.map(conflict =>
            `• ${conflict.eventTitle} (${conflict.eventTime})`
          ).join('\n');

          alert(`You have schedule conflicts with:\n\n${conflictMessages}`);
        } else {

          alert(data.message || 'Failed to send join request');
        }
        return;
      }


      alert('Your request to join has been sent successfully!');

    } catch (err) {
      alert('Error requesting to join event:');

    }
  };
  // Add useEffect to fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8800/api/users', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const userData = await response.json();
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Update filtered results without applying filters to the main view
  const updateFilteredResults = (term = inviteUsername) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchLower = term.toLowerCase();

    // Search for exact username matches first
    const exactUsernameMatches = users.filter(user =>
      (user.username || '').toLowerCase() === searchLower
    );

    // Then search for usernames containing the search string
    const usernameMatches = users.filter(user =>
      (user.username || '').toLowerCase().includes(searchLower) &&
      (user.username || '').toLowerCase() !== searchLower
    );

    // Combine all results
    const results = [...exactUsernameMatches, ...usernameMatches];
    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  // Handle search when user types each character
  const handleSearch = (e) => {
    const term = e.target.value;
    setInviteUsername(term);

    if (selectedUser) {
      setSelectedUser(null);
    }

    updateFilteredResults(term);
  };

  // Handle when user selects a search result
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setInviteUsername(user.username);
    setShowResults(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (checkingAccess || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/home" className="mt-4 inline-block bg-[#569DBA] text-white px-4 py-2 rounded-lg">
            Return to home page
          </Link>
        </div>
      </div>
    );
  }

  // Ensure we have an array of images, even if there's just one or none
  const images = eventData.images && eventData.images.length
    ? eventData.images
    : eventData.image
      ? [eventData.image]
      : ['/images/tech.png']; // Default image as fallback



  // Render the user's sidebar for regular attendees
  const renderAttendeeRightSidebar = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-[12px] sticky top-24">
        <button
          className="w-full py-[8px] bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors text-lg font-regular mb-8"
          onClick={handleJoinRequest}
        >
          Request to join
        </button>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-regular text-black text-[18px]">Date and time</span>
            </div>
            <p className="text-[#6B7280]">{eventData.startDate}</p>
            <p className="text-[#6B7280]">{eventData.startTime} - {eventData.endTime}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-regular text-black text-[18px]">Location</span>
            </div>
            <p className="text-[#6B7280]">{eventData.location}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-regular text-black text-[18px]">
                {eventData.curAttendees || 0} attending ({eventData.maxAttendees || 'unlimited'})
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the organizer's sidebar with event statistics
  const renderOrganizerRightSidebar = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 sticky top-24 space-y-6">
        {/* RSVP Rate Card */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-lg mb-2">RSVP Rate</h3>

          <div className="flex items-center mb-2">
            <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
              <div
                className={`h-4 rounded-full ${rsvpRate >= 80 ? 'bg-green-500' :
                  rsvpRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${rsvpRate}%` }}
              ></div>
            </div>
            <span className="font-medium text-lg">{rsvpRate}%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Event Stats */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Event Statistics</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Total Invites</div>
              <div className="text-xl font-semibold">{invitationStats.total}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Accepted</div>
              <div className="text-xl font-semibold text-green-600">{invitationStats.accepted.length}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-xl font-semibold text-yellow-600">{invitationStats.pending.length}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-xl font-semibold text-red-600">{invitationStats.declined.length}</div>
            </div>
          </div>
        </div>

        {/* Invite More Section */}
        <div className="w-full py-2 bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors text-base font-medium p-4">
          {/* Invite Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSendInvite(inviteUsername);
          }} className="space-y-4">
            <label className="block text-sm font-medium">Username</label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-black"
                value={inviteUsername}
                onChange={handleSearch}
                onFocus={() => {
                  if (inviteUsername) updateFilteredResults(inviteUsername);
                }}
                autoComplete="off"
              />

              {/* Dropdown for search results */}
              {showResults && (
                <ul
                  ref={resultsRef}
                  className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto border border-gray-200"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <li
                        key={user._id}
                        className="border-b border-gray-100 last:border-b-0"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center">
                            <img
                              src={user.avatar || '/images/avatar.png'}
                              alt={user.username}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{user.username}</div>
                              <div className="text-sm text-gray-500 break-all whitespace-normal max-w-[220px]">{user.email}</div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-center text-gray-500">
                      No users found matching "{inviteUsername}"
                    </li>
                  )}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-white text-[#569DBA] rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Invite
            </button>
          </form>
        </div>

        {/* Invitations List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg mb-3">Invitations</h3>
            {invitations.length > 0 && (
              <button
                onClick={() => handleSendInviteeReminders()}
                className={`ml-2 p-2 rounded-full transition-all duration-300 group ${invitationStats.pending.length > 0
                    ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    : "text-gray-300 cursor-not-allowed"
                  }`}
                disabled={invitationStats.pending.length === 0}
                title={invitationStats.pending.length > 0 ? "Send reminder" : "No pending invitations"}
              >
                <svg className={`w-5 h-5 ${invitationStats.pending.length > 0 ? "group-hover:animate-pulse" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            )}
          </div>

          {invitations.length > 0 ? (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {invitations.map((invitation) => (
                <div key={invitation._id || invitation.id} className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <img
                      src={invitation.user?.avatar || '/images/avatar.png'}
                      alt={invitation.user?.username || 'User'}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium text-sm">{invitation.user?.username || invitation.email}</div>
                      <div className="text-xs text-gray-500 break-all whitespace-normal max-w-[180px]">{invitation.user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${invitation.status === 'approved' ? 'bg-green-100 text-green-800' :
                        invitation.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}
                    >
                      {invitation.status === 'invited' ? ' Pending' : invitation.status === 'approved' ? ' Accepted' : 'Rejected'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No invitations yet</p>
          )}
        </div>

        {/* Requests List */}
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg mb-3">Requests</h3>
          </div>

          {requests.length > 0 ? (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {requests.map((request) => (
                <div key={request._id || request.id} className="flex items-center justify-between pb-2">
                  <div className="flex items-center">
                    <img
                      src={request.user?.avatar || '/images/avatar.png'}
                      alt={request.user?.username || 'User'}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium">{request.user?.username || request.email}</div>
                      <div className="text-xs text-gray-500">{request.user?.email || ''}</div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800' rounded-full text-xs font-medium">
                      Pending
                    </span>
                  )}

                  {request.status === 'approved' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Approved
                    </span>
                  )}

                  {request.status === 'rejected' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Declined
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No requests</p>
          )}
        </div>

        {/* Basic Event Info */}
        <div className="space-y-4 pt-2">
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-900">Date and time</span>
            </div>
            <p className="text-gray-600">{eventData.startDate}</p>
            <p className="text-gray-600">{eventData.startTime} - {eventData.endTime}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-gray-900">Location</span>
            </div>
            <p className="text-gray-600">{eventData.location}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium text-gray-900">
                {eventData.curAttendees || 0} attending ({eventData.maxAttendees || 'unlimited'})
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg mb-3">Attendees</h3>
            <button
              onClick={() => handleSendAttendeeReminders()}
              className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-300 group"
              title="Send reminder"
            >
              <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>

          {/* Show attendees - both from accepted invitations and approved requests */}
          {(invitationStats.accepted.length > 0 || requests.filter(req => req.status === 'approved').length > 0) ? (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {/* Render accepted invitations */}
              {invitationStats.accepted.map((invitation) => (
                <div key={`inv-${invitation._id || invitation.id}`} className="flex items-center pb-2 border-b border-gray-100">
                  <img
                    src={invitation.user?.avatar || '/images/avatar.png'}
                    alt={invitation.user?.username || 'User'}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium">{invitation.user?.username || invitation.email}</div>
                    <div className="text-xs text-gray-500">{invitation.user?.email || ''}</div>
                  </div>
                </div>
              ))}

              {/* Render approved requests */}
              {requests
                .filter(request => request.status === 'approved')
                .map((request) => (
                  <div key={request._id} className="flex items-center pb-2 border-b border-gray-100">
                    <img
                      src={request.user?.avatar || '/images/avatar.png'}
                      alt={request.user?.username || 'User'}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium">{request.user?.username || request.email}</div>
                      <div className="text-xs text-gray-500">{request.user?.email || ''}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No attendees yet</p>
          )}
        </div>

      </div>
    );
  };

  // Show error message if there is an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavPane />
        <div className="max-w-6xl mx-auto px-4 pt-20">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <NavPane />

      <div className="max-w-6xl mx-auto px-4 pt-20">
        {/* Image Carousel */}
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={eventData.title}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute top-4 right-4">
                <div className="flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-gray-400'}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          <div className="lg:col-span-2">
            <h1 className='text-[32px] md:text-[42px] lg:text-[52px] font-bold break-words mr-2'>{eventData.title}</h1>

            <div className="flex justify-between items-center mb-8">
              <div className='flex flex-wrap items-center gap-4 md:gap-6 text-gray-600'>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{eventData.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{eventData.startTime} - {eventData.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{eventData.location}</span>
                </div>
              </div>

              {isOrganizer && (
                <Link
                  to={`/event/${id}/edit`}
                  className='flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2 bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap'
                >
                  Edit
                </Link>
              )}
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About this event</h2>
              <p className="text-gray-600 mb-8">{eventData.description}</p>
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 mb-8">{eventData.summary}</p>
            </section>

            <section className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Organized by</h2>
              <div className="flex items-center">
                <img
                  src={eventData.organizer?.avatar || '/images/avatar.png'}
                  alt={eventData.organizer?.name || 'Organizer'}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-medium text-lg">{eventData.organizer?.username || 'Event Organizer'}</h3>
                  <p className="text-gray-500">{eventData.organizer?.email || ''}</p>
                </div>
              </div>
            </section>

            {/* Discussion Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Event discussion</h2>
              {currentUser ? (
                <div className="flex mb-6">
                  <img
                    src={currentUser.avatar || '/images/avatar.png'}
                    alt="Your avatar"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Ask a question or leave a comment..."
                      rows="3"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                      className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      onClick={handleCommentSubmit}
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">Sign in to join the discussion</p>
                  <Link to="/login" className="mt-2 inline-block text-[#569DBA]">
                    Login or sign up
                  </Link>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id || comment.id} className="flex flex-col">
                      <div className="flex">
                        <img
                          src={comment.user?.avatar || '/images/avatar.png'}
                          alt={comment.user?.name || 'User'}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="font-medium mr-2">{comment.user?.username || 'Anonymous'}</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(comment.createdAt || comment.time).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                          <button
                            className="mr-[16px] text-gray-500 text-sm mt-1 hover:text-gray-700"
                            onClick={() => handleReplyClick(comment._id || comment.id)}
                          >
                            Reply
                          </button>
                          {String(comment.user?._id) === String(currentUser?._id) &&
                            (!comment.replies || comment.replies.length === 0) && (
                              <button
                                className="mr-[16px] text-gray-500 text-sm mt-1 hover:text-gray-700"
                                onClick={() => handleDeleteClick(comment._id || comment.id)}
                              >
                                Delete
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Reply form */}
                      {replyingTo === (comment._id || comment.id) && (
                        <div className="ml-12 mt-3">
                          <div className="flex">
                            <img
                              src={currentUser?.avatar || '/images/avatar.png'}
                              alt="Your avatar"
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div className="flex-1">
                              <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                placeholder="Write a reply..."
                                rows="2"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <div className="flex gap-2 mt-1">
                                <button
                                  className="px-4 py-2 bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm"
                                  onClick={() => handleReplySubmit(comment._id || comment.id)}
                                >
                                  Reply
                                </button>
                                <button
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                  onClick={handleCancelReply}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display existing replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-12 mt-4 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="flex">
                              <img
                                src={reply.user?.avatar || '/images/avatar.png'}
                                alt={reply.user?.username || 'User'}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                              <div>
                                <div className="flex items-center mb-1">
                                  <span className="font-medium mr-2 text-sm">{reply.user?.username || 'Anonymous'}</span>
                                  <span className="text-gray-500 text-xs">
                                    {new Date(reply.createdAt || reply.time).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{reply.text}</p>
                                {console.log(`Comment ${comment._id}: replies=${JSON.stringify(comment.replies)}`)}
                                {String(reply.user?._id) === String(currentUser?._id) && (
                                  <button
                                    className="text-gray-500 text-sm mt-1 hover:text-gray-700"
                                    onClick={() => handleDeleteReply(comment._id, reply._id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Conditional Rendering */}
          <div className="lg:col-span-1">
            {isOrganizer ? renderOrganizerRightSidebar() : renderAttendeeRightSidebar()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
