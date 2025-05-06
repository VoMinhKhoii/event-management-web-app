/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavPane from './NavPane.jsx';
import { useLoaderData } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/authContext.jsx';


const EventDetails = () => {
  const { id } = useParams();
  console.log("Event ID from URL parameters:", id); // Add this debugging line
  const eventData = useLoaderData(); // Get event data from loader

  const { currentUser } = useContext(AuthContext);

  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState(null);

  // Organizer statistics
  const [rsvpRate, setRsvpRate] = useState(0);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

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

  // // If the user is an organizer, fetch invitations and calculate RSVP stats
  // useEffect(() => {
  //   if (!id || !isOrganizer) return;

  //   const fetchInvitationsAndStats = async () => {
  //     try {
  //       const response = await fetch(`/api/events/${id}/invitations`);
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch invitations');
  //       }
  //       const data = await response.json();
  //       setInvitations(data);

  //       // Calculate RSVP rate (percentage of accepted invitations)
  //       if (data.length > 0) {
  //         const acceptedCount = data.filter(inv => inv.status === 'accepted').length;
  //         setRsvpRate(Math.round((acceptedCount / data.length) * 100));
  //       }
  //     } catch (err) {
  //       console.error('Error fetching invitations:', err);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchInvitationsAndStats();
  // }, [id, isOrganizer]);

  // Set loading to false once event data is loaded
  useEffect(() => {
    if (eventData) {
      setIsLoading(false);
    }
  }, [eventData]);

  // Calculate invitation statistics for organizer view
  const invitationStats = {
    total: invitations.length,
    accepted: invitations.filter(inv => inv.status === 'accepted').length,
    pending: invitations.filter(inv => inv.status === 'pending').length,
    declined: invitations.filter(inv => inv.status === 'declined').length
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

  // const handleSendReminder = async (invitationId) => {
  //   if (!isOrganizer) return;

  //   try {
  //     const response = await fetch(`/api/events/${id}/invitations/${invitationId}/reminder`, {
  //       method: 'POST',
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to send reminder');
  //     }

  //     // Show notification or success message
  //     alert('Reminder sent successfully');
  //   } catch (err) {
  //     console.error('Error sending reminder:', err);
  //     setError('Failed to send reminder. Please try again.');
  //   }
  // };

  // const handleResendInvite = async (invitationId) => {
  //   if (!isOrganizer) return;

  //   try {
  //     const response = await fetch(`/api/events/${id}/invitations/${invitationId}/resend`, {
  //       method: 'POST',
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to resend invitation');
  //     }

  //     // Show notification or success message
  //     alert('Invitation resent successfully');
  //   } catch (err) {
  //     console.error('Error resending invitation:', err);
  //     setError('Failed to resend invitation. Please try again.');
  //   }
  // };

  // const handleJoinRequest = async () => {
  //   if (!currentUser) {
  //     // Redirect to login if not logged in
  //     window.location.href = '/login';
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/events/${id}/join`, {
  //       method: 'POST',
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to request to join');
  //     }

  //     // Show success message
  //     alert('Your request to join has been submitted');
  //   } catch (err) {
  //     console.error('Error requesting to join:', err);
  //     setError('Failed to send join request. Please try again.');
  //   }
  // };

  if (isLoading) {
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

  // // Format date and time for display
  // const formatDate = (dateString) => {
  //   if (!dateString) return '';
  //   const options = { year: 'numeric', month: 'long', day: 'numeric' };
  //   return new Date(dateString).toLocaleDateString(undefined, options);
  // };

  // const formatTime = (startTime, endTime) => {
  //   if (!startTime) return '';

  //   const formatTimeString = (timeString) => {
  //     if (!timeString) return '';

  //     if (typeof timeString === 'string' && timeString.includes(':')) {
  //       return timeString;
  //     }

  //     try {
  //       const date = new Date(timeString);
  //       return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  //     } catch (e) {
  //       return timeString;
  //     }
  //   };

  //   const formattedStartTime = formatTimeString(startTime);
  //   const formattedEndTime = endTime ? formatTimeString(endTime) : '';

  //   return formattedEndTime ? `${formattedStartTime} - ${formattedEndTime}` : formattedStartTime;
  // };

  // Ensure we have an array of images, even if there's just one or none
  const images = eventData.images && eventData.images.length
    ? eventData.images
    : eventData.image
      ? [eventData.image]
      : ['/images/tech.png']; // Default image as fallback

  // Expectations might be part of the description or a separate field
  const expectations = eventData.expectations || [
    "Details about this event will be provided by the organizer",
    "Check back soon for more information"
  ];

  // Render the user's sidebar for regular attendees
  const renderAttendeeRightSidebar = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-[12px] sticky top-24">
        <button
          className="w-full py-[8px] bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors text-lg font-regular mb-8"
        // onClick={handleJoinRequest}
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
              <div className="text-xl font-semibold text-green-600">{invitationStats.accepted}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-xl font-semibold text-yellow-600">{invitationStats.pending}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Declined</div>
              <div className="text-xl font-semibold text-red-600">{invitationStats.declined}</div>
            </div>
          </div>
        </div>

        {/* Invite More Button */}
        <button className="w-full py-2 bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors text-base font-medium">
          Invite More People
        </button>

        {/* Invitations List */}
        {invitations.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Invitations</h3>
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {invitations.map((invitation) => (
                <div key={invitation._id || invitation.id} className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <img
                      src={invitation.user?.avatar || '/images/avatar.png'}
                      alt={invitation.user?.name || 'User'}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium text-sm">{invitation.user?.name || invitation.email}</div>
                      <div className="text-xs text-gray-500">{invitation.user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}
                    >
                      {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    </span>

                    {invitation.status === 'pending' && (
                      <button
                        // onClick={() => handleSendReminder(invitation._id || invitation.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                        title="Send reminder"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </button>
                    )}

                    {invitation.status === 'declined' && (
                      <button
                        // onClick={() => handleResendInvite(invitation._id || invitation.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                        title="Resend invitation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <h1 className="text-[32px] md:text-[42px] lg:text-[52px] font-bold mb-4">{eventData.title}</h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 mb-8">
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

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About this event</h2>
              <p className="text-gray-600 mb-8">{eventData.description}</p>
              {expectations.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold mb-4">What to expect</h3>
                  <ul className="space-y-3">
                    {expectations.map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
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
