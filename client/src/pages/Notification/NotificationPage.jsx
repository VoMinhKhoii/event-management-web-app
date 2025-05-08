/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import NavPane from '../../components/NavPane.jsx';
import { NotificationContext } from '../../context/notificationContext.jsx'; // adjust path if needed
const NotificationPage = () => {
    // State to keep track of selected notification/event
    const { notifications, markAsRead, deleteNotification } = useContext(NotificationContext);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        if (notification.isRead === false) {
            markAsRead(notification._id);
        }

        if (notification.relatedId !== null) {


            const eventInfo = notification.relatedId.event;
            setSelectedEvent(eventInfo); // Set the event info

        } else {
            setSelectedEvent(null); // No associated event
        }
        console.log('Selected notification data:', notification);
        setSelectedNotification(notification);
    };

    // Handle accept invitation
    const handleAcceptInvitation = async (eventId, invitationId) => {
        if (!selectedNotification || !selectedEvent) return;

        if (!window.confirm(`Are you sure you want to join "${selectedEvent.title}"?`)) {
            return; // Exit if user cancels
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8800/api/events/${eventId}/invitations/${invitationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ action: 'accept' })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 400 && data.conflicts) {
                    setError(`Schedule conflict detected: You already have events during this time.`);
                } else {
                    setError(data.error || 'Failed to accept invitation');
                }
                return;
            }

            // Refresh notifications to get updated data
            await markAsRead(selectedNotification._id);

            // Show success message
            alert('You have successfully accepted the invitation');
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error accepting invitation:', err);
        } finally {
            setIsLoading(false);
        }
    };


    // Handle decline invitation
    const handleDeclineInvitation = async (eventId, invitationId) => {
        if (!selectedNotification || !selectedEvent) return;

        if (!window.confirm(`Are you sure you want to decline the invitation to "${selectedEvent.title}"?`)) {
            return; // Exit if user cancels
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8800/api/events/${eventId}/invitations/${invitationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ action: 'decline' })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to decline invitation');
                return;
            }

            // Update local state
            setSelectedNotification(prev => ({
                ...prev,
                relatedId: { ...prev.relatedId, status: 'rejected' }
            }));

            // Mark notification as read
            await markAsRead(selectedNotification._id);

            // Show success message
            alert('You have declined the invitation');
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error declining invitation:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle join request approval (for event organizers)
    const handleApproveRequest = async (eventId, requestId) => {
        if (!selectedNotification || !selectedEvent) return;

        const username = selectedNotification.relatedId?.user?.username || 'this user';

        // Add confirmation dialog with username
        if (!window.confirm(`Are you sure you want to approve ${username}'s request to join your event?`)) {
            return; // Exit if user cancels
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8800/api/events/${eventId}/requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ action: 'approve' })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to approve request');
                return;
            }

            // Update local state
            setSelectedNotification(prev => ({
                ...prev,
                relatedId: { ...prev.relatedId, status: 'approved' }
            }));

            // Mark notification as read
            await markAsRead(selectedNotification._id);

            // Show success message
            alert('You have approved the join request');
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error approving request:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle join request decline (for event organizers)
    const handleDeclineRequest = async (eventId, requestId) => {
        if (!selectedNotification || !selectedEvent) return;

        const username = selectedNotification.relatedId?.user?.username || 'this user';

        // Add confirmation dialog with username
        if (!window.confirm(`Are you sure you want to decline ${username}'s request to join your event?`)) {
            return; // Exit if user cancels
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8800/api/events/${eventId}/requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ action: 'decline' })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to decline request');
                return;
            }

            // Update local state
            setSelectedNotification(prev => ({
                ...prev,
                relatedId: { ...prev.relatedId, status: 'rejected' }
            }));

            // Mark notification as read
            await markAsRead(selectedNotification._id);

            // Show success message
            alert('You have declined the join request');
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error declining request:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Always show scrollbar to prevent layout shifts */}
            <div style={{ overflowY: 'scroll', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                {/* Navigation Header */}
                <NavPane />

                <div className="max-w-7xl mx-auto px-4 pt-20 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column - Fixed position */}
                        <div className="md:col-span-1 min-w-[300px]">
                            <div className="bg-gray-50 rounded-lg shadow fixed"
                                style={{
                                    width: "30%",
                                    maxWidth: "380px",
                                    top: "90px",
                                    height: "calc(100vh - 120px)"
                                }}>
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="text-2xl font-semibold">Primary</h2>
                                </div>
                                <div className="divide-y divide-gray-200 overflow-y-auto"
                                    style={{ height: "calc(100vh - 185px)" }}>

                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`p-4 hover:bg-gray-100 cursor-pointer transition-colors ${selectedEvent &&
                                                    notification.relatedId?.event?._id &&
                                                    selectedEvent._id === notification.relatedId.event._id
                                                    ? 'bg-gray-100'
                                                    : ''
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    src={
                                                        (notification.type === 'eventReminder' || notification.type === 'invitationReminder')
                                                            ? (notification.data?.organizer?.avatar || "/images/avatar.png")
                                                            : (notification.relatedId?.user?.avatar || "/images/avatar.png")
                                                    }
                                                    alt="User avatar"
                                                    className="w-10 h-10 rounded-full mr-3"
                                                />
                                                <div>
                                                    <div className="flex items-center">

                                                        <span className="text-gray-800">
                                                            {(notification.type === 'eventReminder' || notification.type === 'invitationReminder')
                                                                ? (notification.data?.organizer?.username || "Event Organizer")
                                                                : (notification.relatedId?.user?.username || "A user")}
                                                        </span>

                                                    </div>
                                                    <p className="text-gray-600">{notification.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Offset to account for fixed left column */}
                        {/* Tao thêm 1 cái giờ nó thu nhỏ bị ngu rồi, có j sửa lại mấy cái này giúp tao */}
                        <div className="md:col-span-3 md:ml-[calc(33.333%-20px)]">
                            {selectedNotification === null ? (
                                // Default message when no notification is selected
                                <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-160px)]">
                                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">No notification selected</h3>
                                    <p className="text-gray-500">Select a notification from the list to view details</p>
                                </div>
                            ) : selectedEvent === null ? (
                                // Show notification details if there is no associated event
                                <div className="p-6">
                                    <h1 className="text-2xl font-bold mb-4">Notification Details</h1>
                                    <p className="text-gray-600">{selectedNotification.data}</p>
                                </div>
                            ) : (
                                // Show event details if the notification has an associated event
                                <div className="max-h-[calc(100vh-160px)]">
                                    {/* Event Image */}
                                    {(selectedNotification.type === 'joinRequest' || selectedNotification.type === 'invitation') && (
                                        <div className="relative h-[400px]">

                                            <img
                                                src={selectedEvent.image}
                                                alt={selectedEvent.title}
                                                className="w-full h-full object-cover rounded-t-lg"
                                            />

                                            {/* For invitation notifications */}
                                            {selectedNotification.type === 'invitation' && selectedNotification.relatedId.status === "invited" && (
                                                <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
                                                    <button
                                                        className="bg-white text-blue-500 font-medium py-2 px-6 rounded-full shadow hover:bg-blue-50 flex items-center"
                                                        onClick={() => handleAcceptInvitation(
                                                            selectedEvent._id,
                                                            selectedNotification.relatedId._id
                                                        )}
                                                        disabled={isLoading}
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="bg-white text-red-500 font-medium py-2 px-6 rounded-full shadow hover:bg-red-50 flex items-center"
                                                        onClick={() => handleDeclineInvitation(
                                                            selectedEvent._id,
                                                            selectedNotification.relatedId._id
                                                        )}
                                                        disabled={isLoading}
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Decline
                                                    </button>
                                                </div>
                                            )}

                                            {/* For join request notifications (NEW) */}
                                            {selectedNotification.type === 'joinRequest' && selectedNotification.relatedId.status === "pending" && (
                                                <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
                                                    <button
                                                        className="bg-white text-green-500 font-medium py-2 px-6 rounded-full shadow hover:bg-green-50 flex items-center"
                                                        onClick={() => handleApproveRequest(
                                                            selectedEvent._id,
                                                            selectedNotification.relatedId._id
                                                        )}
                                                        disabled={isLoading}
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="bg-white text-red-500 font-medium py-2 px-6 rounded-full shadow hover:bg-red-50 flex items-center"
                                                        onClick={() => handleDeclineRequest(
                                                            selectedEvent._id,
                                                            selectedNotification.relatedId._id
                                                        )}
                                                        disabled={isLoading}
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Event Details */}
                                    {selectedNotification.type !== 'eventReminder' && selectedNotification.type !== 'invitationReminder' && (
                                        <div className="p-6">
                                            <h1 className="text-4xl font-bold mb-4">{selectedEvent.title}</h1>

                                            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{selectedEvent.startDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{selectedEvent.startTime}-{selectedEvent.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{selectedEvent.location}</span>
                                                </div>
                                            </div>
                                            <section className="mb-8">
                                                <h2 className="text-2xl font-semibold mb-4">About this event</h2>
                                                <p className="text-gray-600 mb-8">{selectedEvent.description}</p>
                                            </section>
                                        </div>
                                    )}

                                    {(selectedNotification.type === 'eventReminder' || selectedNotification.type === 'invitationReminder') && (
                                        <div className="p-6">
                                            {/* Email-like header */}
                                            <div className="bg-white mb-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start justify-between">
                                                        <img
                                                            src={selectedNotification.data?.organizer?.avatar || "/images/avatar.png"}
                                                            alt="Sender"
                                                            className="w-[48px] h-[48px] rounded-full mr-3"
                                                        />
                                                        <div>
                                                            <h3 className="font-medium">{selectedNotification.data?.organizer?.username || "Event Organizer"}</h3>
                                                            <p className="text-gray-500 text-sm">{selectedNotification.data?.organizer?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-500 text-sm">
                                                        {new Date(selectedNotification.createdAt).toLocaleString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Email body */}
                                            <div className="bg-white">
                                                <div className="text-gray-700 whitespace-pre-line">
                                                    {selectedNotification.data.message}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;