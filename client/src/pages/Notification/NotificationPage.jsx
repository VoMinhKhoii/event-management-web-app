import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavPane from "../../components/NavPane.jsx";
import { NotificationContext } from "../../context/notificationContext.jsx";
import { AuthContext } from "../../context/authContext.jsx";

const NotificationPage = () => {
    // Add current user context for avatar handling
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { notificationId } = useParams();
    // State to keep track of selected notification/event
    const { markAsRead, deleteNotification, markAllAsSeen } = useContext(NotificationContext);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [selectedNotificationId, setSelectedNotificationId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showNotificationList, setShowNotificationList] = useState(true);

    // Check if mobile based on window width
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setShowNotificationList(true);
            }
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Toggle between notification list and details on mobile
    const toggleMobileView = () => {
        if (isMobile) {
            setShowNotificationList(!showNotificationList);
        }
    };

    useEffect(() => {
        if (notificationId && notifications.length > 0) {
            const notification = notifications.find(n => n._id === notificationId);
            if (notification) {
                handleNotificationClick(notification, false); // false means don't update URL (to avoid loops)
            }
        }
    }, [notificationId, notifications]);

    // Fetch notifications with caching 
    const fetchNotifications = async (forceRefresh = false) => {
        // Check if we've already fetched data in this browser session
        const hasFetchedInSession = sessionStorage.getItem('hasFetchedNotifications') === 'true';

        if (!forceRefresh && hasFetchedInSession) {
            const sessionData = sessionStorage.getItem('userNotifications');
            if (sessionData) {
                const notificationData = JSON.parse(sessionData);
                setNotifications(notificationData);
                setLastUpdated(new Date(parseInt(sessionStorage.getItem('userNotificationsTimestamp') || Date.now())));
                return;
            }
        }

        // Try to get cached data first
        const cachedData = localStorage.getItem('userNotifications');
        const cacheTimestamp = localStorage.getItem('userNotificationsTimestamp');
        const FIFTEEN_MINUTES = 15 * 60 * 1000; // 15 minutes in milliseconds

        // Use cached data if it exists, is not expired, and force refresh is not requested
        if (
            cachedData &&
            cacheTimestamp &&
            Date.now() - parseInt(cacheTimestamp) < FIFTEEN_MINUTES &&
            !forceRefresh
        ) {
            const notificationData = JSON.parse(cachedData);
            setNotifications(notificationData);
            setLastUpdated(new Date(parseInt(cacheTimestamp)));

            // Store in sessionStorage for faster access
            sessionStorage.setItem('userNotifications', JSON.stringify(notificationData));
            sessionStorage.setItem('userNotificationsTimestamp', cacheTimestamp);
            sessionStorage.setItem('hasFetchedNotifications', 'true');

            setIsLoading(false);
            return; // Exit early - no need to fetch
        }

        if (notifications.length === 0 || forceRefresh) {
            setIsLoading(true);
        }

        try {
            // Fetch fresh data
            const response = await fetch('http://localhost:8800/api/notifications', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const notificationData = await response.json();

            // Update notifications
            setNotifications(notificationData);

            // Cache the data
            localStorage.setItem('userNotifications', JSON.stringify(notificationData));
            localStorage.setItem('userNotificationsTimestamp', Date.now().toString());
            sessionStorage.setItem('userNotifications', JSON.stringify(notificationData));
            sessionStorage.setItem('userNotificationsTimestamp', Date.now().toString());
            sessionStorage.setItem('hasFetchedNotifications', 'true');

            setLastUpdated(new Date());

        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError("Failed to load notifications. Please try again.");

            // If there's cached data, use it as fallback on error
            if (cachedData) {
                const notificationData = JSON.parse(cachedData);
                setNotifications(notificationData);
                setLastUpdated(new Date(parseInt(cacheTimestamp)));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to update notification cache
    const updateNotificationCache = (id, updates) => {
        // Update in-memory notifications
        setNotifications(prev =>
            prev.map(item =>
                item._id === id
                    ? { ...item, ...updates }
                    : item
            )
        );

        // Update localStorage cache
        const cachedData = localStorage.getItem('userNotifications');
        if (cachedData) {
            const notificationData = JSON.parse(cachedData);
            const updatedNotifications = notificationData.map(item =>
                item._id === id
                    ? { ...item, ...updates }
                    : item
            );
            localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
            sessionStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
        }
    };

    // Effect to load notifications on component mount
    useEffect(() => {
        const isReload = window.performance
            .getEntriesByType('navigation')
            .some((nav) => nav.type === 'reload');

        fetchNotifications(isReload); // Force refresh if the page was reloaded
        markAllAsSeen();
    }, []);

    // Handle notification click
    const handleNotificationClick = async (notification, updateUrl = true) => {
        setSelectedNotificationId(notification._id);

        if (updateUrl) {
            navigate(`/notifications/${notification._id}`);
        }

        if (notification.isRead === false) {
            try {
                await markAsRead(notification._id);
                // Update notification cache
                updateNotificationCache(notification._id, { isRead: true });
            } catch (err) {
                console.error("Failed to mark notification as read:", err);
            }
        }

        if (notification.relatedId !== null) {
            const eventInfo = notification.relatedId.event;
            setSelectedEvent(eventInfo); // Set the event info
        } else {
            setSelectedEvent(null); // No associated event
        }

        setSelectedNotification(notification);

        // On mobile, switch to details view
        if (isMobile) {
            setShowNotificationList(false);
        }
    };

    // Handle accept invitation
    const handleAcceptInvitation = async (eventId, invitationId) => {
        if (!selectedNotification || !selectedEvent) return;

        if (
            !window.confirm(`Are you sure you want to join "${selectedEvent.title}"?`)
        ) {
            return; // Exit if user cancels
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:8800/api/events/${eventId}/invitations/${invitationId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ action: "accept" }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 400 && data.conflicts) {
                    setError(
                        `Schedule conflict detected: You already have events during this time.`
                    );
                    alert(data.error || data.message);
                } else {
                    setError(data.error || "Failed to accept invitation");
                    alert(data.error || data.message);
                }
                return;
            }

            setSelectedNotification((prev) => ({
                ...prev,
                relatedId: { ...prev.relatedId, status: "approved" },
            }));

            // Refresh notifications to get updated data
            await markAsRead(selectedNotification._id);
            // updateNotificationCache(selectedNotification._id, { isRead: true });

            // Show success message
            alert("You have successfully accepted the invitation");
        } catch (err) {
            setError("Network error. Please try again.");
            console.error("Error accepting invitation:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle decline invitation
    const handleDeclineInvitation = async (eventId, invitationId) => {
        if (!selectedNotification || !selectedEvent) return;

        if (
            !window.confirm(
                `Are you sure you want to decline the invitation to "${selectedEvent.title}"?`
            )
        ) {
            return; // Exit if user cancels
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:8800/api/events/${eventId}/invitations/${invitationId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ action: "decline" }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to decline invitation");
                return;
            }

            // Update local state
            setSelectedNotification((prev) => ({
                ...prev,
                relatedId: { ...prev.relatedId, status: "rejected" },
            }));

            // Mark notification as read
            await markAsRead(selectedNotification._id);

            // Show success message
            alert("You have declined the invitation");
        } catch (err) {
            setError("Network error. Please try again.");
            console.error("Error declining invitation:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle join request approval
    const handleApproveRequest = async (eventId, requestId) => {
        if (!selectedNotification || !selectedEvent) return;

        const username =
            selectedNotification.relatedId?.user?.username || "this user";

        // Add confirmation dialog with username
        if (
            !window.confirm(
                `Are you sure you want to approve ${username}'s request to join your event?`
            )
        ) {
            return; // Exit if user cancels
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:8800/api/events/${eventId}/requests/${requestId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ action: "approve" }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to approve request");
                return;
            }

            // Update local state
            setSelectedNotification((prev) => ({
                ...prev,
                relatedId: { ...prev.relatedId, status: "approved" },
            }));

            // Mark notification as read
            await markAsRead(selectedNotification._id);

            // Show success message
            alert("You have approved the join request");
        } catch (err) {
            setError("Network error. Please try again.");
            console.error("Error approving request:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle join request decline
    const handleDeclineRequest = async (eventId, requestId) => {
        if (!selectedNotification || !selectedEvent) return;

        const username =
            selectedNotification.relatedId?.user?.username || "this user";

        // Add confirmation dialog with username
        if (
            !window.confirm(
                `Are you sure you want to decline ${username}'s request to join your event?`
            )
        ) {
            return; // Exit if user cancels
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:8800/api/events/${eventId}/requests/${requestId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ action: "decline" }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to decline request");
                return;
            }

            // Update local state
            setSelectedNotification((prev) => ({
                ...prev,
                relatedId: { ...prev.relatedId, status: "rejected" },
            }));

            // Mark notification as read
            await markAsRead(selectedNotification._id);

            // Show success message
            alert("You have declined the join request");
        } catch (err) {
            setError("Network error. Please try again.");
            console.error("Error declining request:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Always show scrollbar to prevent layout shifts */}
            <div
                style={{
                    overflowY: "scroll",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            >
                {/* Navigation Header */}
                <NavPane />

                {/* Mobile Navigation Bar - Only show when a notification is selected on mobile */}
                {isMobile && selectedNotification && !showNotificationList && (
                    <div className="fixed top-16 z-10 w-full bg-white border-b border-gray-200 p-3 flex items-center">
                        <button
                            onClick={toggleMobileView}
                            className="flex items-center text-blue-600"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to notifications
                        </button>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 pt-20 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column - Fixed position for desktop, normal flow for mobile */}
                        {(!isMobile || showNotificationList) && (
                            <div className="md:col-span-1 min-w-0 md:min-w-[300px]">
                                <div
                                    className={`bg-gray-50 rounded-lg shadow ${!isMobile
                                        ? "fixed"
                                        : "relative"
                                        }`}
                                    style={!isMobile ? {
                                        width: "30%",
                                        maxWidth: "380px",
                                        top: "90px",
                                        height: "calc(100vh - 120px)",
                                    } : {}}
                                >
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h2 className="text-2xl font-semibold">Primary</h2>
                                    </div>
                                    <div
                                        className="divide-y divide-gray-200 overflow-y-auto"
                                        style={!isMobile ? { height: "calc(100vh - 185px)" } : { maxHeight: "calc(100vh - 185px)" }}
                                    >
                                        {isLoading ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <p>Loading notifications...</p>
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                                <p>No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification._id}
                                                    className={`p-4 hover:bg-gray-100 cursor-pointer transition-colors ${selectedNotificationId === notification._id
                                                        ? "bg-gray-100"
                                                        : ""
                                                        }`}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="flex items-center">
                                                        <img
                                                            src={
                                                                // Direct sender reference
                                                                (notification.notificationSender && notification.notificationSender.avatar) ||
                                                                // Check embedded data sender
                                                                (notification.data && notification.data.notificationSender && notification.data.notificationSender.avatar) ||
                                                                // Check organizer in embedded data
                                                                (notification.data && notification.data.organizer && notification.data.organizer.avatar) ||
                                                                // Check participation-related user
                                                                (notification.relatedId && notification.relatedId.user && notification.relatedId.user.avatar) ||
                                                                // Check event organizer through participation
                                                                (notification.relatedId && notification.relatedId.event &&
                                                                    notification.relatedId.event.organizer && notification.relatedId.event.organizer.avatar) ||
                                                                "/images/avatar.png"
                                                            }
                                                            alt="User avatar"
                                                            className="w-10 h-10 rounded-full mr-3"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center">
                                                                <span className={`${!notification.isRead ? "font-medium" : "text-gray-800"} truncate`}>
                                                                    {(notification.notificationSender && notification.notificationSender.username) ||
                                                                        (notification.data && notification.data.notificationSender && notification.data.notificationSender.username) ||
                                                                        (notification.data && notification.data.organizer && notification.data.organizer.username) ||
                                                                        (notification.relatedId && notification.relatedId.user && notification.relatedId.user.username) ||
                                                                        (notification.relatedId && notification.relatedId.event &&
                                                                            notification.relatedId.event.organizer && notification.relatedId.event.organizer.username) ||
                                                                        "User"}
                                                                </span>
                                                            </div>
                                                            <p className={`${!notification.isRead ? "font-medium" : "text-gray-800"} truncate`}>
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Right Column - Offset to account for fixed left column on desktop, full width on mobile */}
                        {(!isMobile || !showNotificationList) && (
                            <div className={`${!isMobile
                                ? "md:col-span-3 md:ml-[calc(33.333%-20px)]"
                                : "w-full"
                                }`}>
                                {selectedNotification === null ? (
                                    // Default message when no notification is selected
                                    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-160px)]">
                                        {error ? (
                                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                                <p>{error}</p>
                                                <button
                                                    className="underline text-sm mt-2"
                                                    onClick={() => fetchNotifications(true)}
                                                >
                                                    Try again
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-16 h-16 text-gray-300 mb-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="1.5"
                                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                    />
                                                </svg>
                                                <h3 className="text-xl font-medium text-gray-700 mb-2">
                                                    No notification selected
                                                </h3>
                                                <p className="text-gray-500">
                                                    Select a notification from the list to view details
                                                </p>
                                            </>
                                        )}
                                    </div>
                                ) : selectedEvent === null ? (
                                    // Show notification details if there is no associated event
                                    <div className="p-6 whitespace-pre-line">
                                        <h1 className="text-2xl font-bold mb-4">
                                            Notification Details
                                        </h1>
                                        <p className="text-gray-600">{selectedNotification.data}</p>
                                    </div>
                                ) : (
                                    // Show event details if the notification has an associated event
                                    <div className={`max-h-[calc(100vh-160px)] ${isMobile ? "mt-6" : ""}`}>
                                        {/* Consistent Email-like header for ALL notification types */}
                                        <div className="bg-white pt-6 px-6 pb-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center mb-3 sm:mb-0">
                                                    <img
                                                        src={
                                                            (selectedNotification.notificationSender && selectedNotification.notificationSender.avatar) ||
                                                            (selectedNotification.data && selectedNotification.data.notificationSender && selectedNotification.data.notificationSender.avatar) ||
                                                            (selectedNotification.data && selectedNotification.data.organizer && selectedNotification.data.organizer.avatar) ||
                                                            (selectedNotification.relatedId && selectedNotification.relatedId.user && selectedNotification.relatedId.user.avatar) ||
                                                            (selectedNotification.relatedId && selectedNotification.relatedId.event &&
                                                                selectedNotification.relatedId.event.organizer && selectedNotification.relatedId.event.organizer.avatar) ||
                                                            "/images/avatar.png"
                                                        }
                                                        alt="Sender"
                                                        className="w-12 h-12 rounded-full mr-4"
                                                    />
                                                    <div>
                                                        <h3 className="font-medium text-lg">
                                                            {selectedNotification.notificationSender?.username ||
                                                                selectedNotification.data?.notificationSender?.username ||
                                                                selectedNotification.data?.organizer?.username ||
                                                                selectedNotification.relatedId?.user?.username ||
                                                                (selectedNotification.relatedId?.event?.organizer?.username) ||
                                                                "User"}
                                                        </h3>
                                                        <p className="text-gray-500 text-sm">
                                                            {(selectedNotification.notificationSender && selectedNotification.notificationSender.email) ||
                                                                (selectedNotification.data && selectedNotification.data.notificationSender && selectedNotification.data.notificationSender.email) ||
                                                                (selectedNotification.data && selectedNotification.data.organizer && selectedNotification.data.organizer.email) ||
                                                                (selectedNotification.relatedId && selectedNotification.relatedId.user && selectedNotification.relatedId.user.email) ||
                                                                (selectedNotification.relatedId && selectedNotification.relatedId.event &&
                                                                    selectedNotification.relatedId.event.organizer && selectedNotification.relatedId.event.organizer.email) ||
                                                                ""}

                                                            {((selectedNotification.notificationSender && selectedNotification.notificationSender.firstName) ||
                                                                (selectedNotification.data && selectedNotification.data.notificationSender && selectedNotification.data.notificationSender.firstName) ||
                                                                (selectedNotification.data && selectedNotification.data.organizer && selectedNotification.data.organizer.firstName)) &&
                                                                ` (${(selectedNotification.notificationSender && selectedNotification.notificationSender.firstName) ||
                                                                (selectedNotification.data && selectedNotification.data.notificationSender && selectedNotification.data.notificationSender.firstName) ||
                                                                (selectedNotification.data && selectedNotification.data.organizer && selectedNotification.data.organizer.firstName)} 
                                                                    ${(selectedNotification.notificationSender && selectedNotification.notificationSender.lastName) ||
                                                                (selectedNotification.data && selectedNotification.data.notificationSender && selectedNotification.data.notificationSender.lastName) ||
                                                                (selectedNotification.data && selectedNotification.data.organizer && selectedNotification.data.organizer.lastName) ||
                                                                ""})`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-gray-500 text-sm">
                                                    {new Date(
                                                        selectedNotification.createdAt
                                                    ).toLocaleString("en-US", {
                                                        weekday: "short",
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Show event update message if it's an event update notification */}
                                        {selectedNotification.type === "eventUpdate" && selectedNotification.data?.message && (
                                            <div className="px-6 py-4 border-b border-blue-100">
                                                <div className="text-gray-700 whitespace-pre-line">{selectedNotification.data.message}</div>
                                            </div>
                                        )}

                                        {/* Event Image (for all event-related notification types) */}
                                        {(selectedNotification.type === "joinRequest" ||
                                            selectedNotification.type === "invitation" ||
                                            selectedNotification.type === "eventUpdate") && (
                                                <div className="relative">
                                                    <img
                                                        src={selectedEvent.image || "/images/tech.png"}
                                                        alt={selectedEvent.title}
                                                        className="w-full h-[400px] object-cover"
                                                    />

                                                    {/* Action buttons */}
                                                    {selectedNotification.type === "invitation" &&
                                                        selectedNotification.relatedId.status === "invited" && (
                                                            <div className="absolute bottom-0 left-0 right-0 flex flex-col sm:flex-row justify-between p-4 bg-gradient-to-t from-black/50 to-transparent">
                                                                <button
                                                                    className="bg-white text-blue-500 font-medium py-2 px-6 rounded-full shadow hover:bg-blue-50 flex items-center justify-center mb-2 sm:mb-0"
                                                                    onClick={() =>
                                                                        handleAcceptInvitation(
                                                                            selectedEvent._id,
                                                                            selectedNotification.relatedId._id
                                                                        )
                                                                    }
                                                                    disabled={isLoading}
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5 mr-2"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M5 13l4 4L19 7"
                                                                        />
                                                                    </svg>
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="bg-white text-red-500 font-medium py-2 px-6 rounded-full shadow hover:bg-red-50 flex items-center justify-center"
                                                                    onClick={() =>
                                                                        handleDeclineInvitation(
                                                                            selectedEvent._id,
                                                                            selectedNotification.relatedId._id
                                                                        )
                                                                    }
                                                                    disabled={isLoading}
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5 mr-2"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        )}

                                                    {/* Status indicators */}
                                                    {selectedNotification.type === "invitation" &&
                                                        (selectedNotification.relatedId.status === "approved" ||
                                                            selectedNotification.relatedId.status === "rejected") && (
                                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                                                                <div className="bg-white text-gray-800 font-medium py-2 px-6 rounded-full shadow text-center">
                                                                    {selectedNotification.relatedId.status === "approved"
                                                                        ? "✓ You have accepted this invitation"
                                                                        : "✗ You have declined this invitation"}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Join Request */}
                                                    {selectedNotification.type === "joinRequest" &&
                                                        selectedNotification.relatedId.status === "pending" && (
                                                            <div className="absolute bottom-0 left-0 right-0 flex flex-col sm:flex-row justify-between p-4 bg-gradient-to-t from-black/50 to-transparent">
                                                                <button
                                                                    className="bg-white text-green-500 font-medium py-2 px-6 rounded-full shadow hover:bg-green-50 flex items-center justify-center mb-2 sm:mb-0"
                                                                    onClick={() =>
                                                                        handleApproveRequest(
                                                                            selectedEvent._id,
                                                                            selectedNotification.relatedId._id
                                                                        )
                                                                    }
                                                                    disabled={isLoading}
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5 mr-2"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M5 13l4 4L19 7"
                                                                        />
                                                                    </svg>
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    className="bg-white text-red-500 font-medium py-2 px-6 rounded-full shadow hover:bg-red-50 flex items-center justify-center"
                                                                    onClick={() =>
                                                                        handleDeclineRequest(
                                                                            selectedEvent._id,
                                                                            selectedNotification.relatedId._id
                                                                        )
                                                                    }
                                                                    disabled={isLoading}
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5 mr-2"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        )}
                                                    {selectedNotification.type === "joinRequest" &&
                                                        (selectedNotification.relatedId.status === "approved" ||
                                                            selectedNotification.relatedId.status === "rejected") && (
                                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                                                                <div className="bg-white text-gray-800 font-medium py-2 px-6 rounded-full shadow text-center">
                                                                    {selectedNotification.relatedId.status === "approved"
                                                                        ? "✓ You have approved this request"
                                                                        : "✗ You have declined this request"}
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            )}

                                        {/* Content area - adapt based on notification type */}
                                        {(selectedNotification.type === "invitation" ||
                                            selectedNotification.type === "joinRequest" ||
                                            selectedNotification.type === "eventUpdate") ? (
                                            <div className="p-6">
                                                <h1 className="text-4xl font-bold mb-4">
                                                    {selectedEvent.title}
                                                </h1>

                                                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        <span>{selectedEvent.startDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        <span>
                                                            {selectedEvent.startTime}-{selectedEvent.endTime}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                        </svg>
                                                        <span>{selectedEvent.location}</span>
                                                    </div>
                                                </div>

                                                <section className="mb-8">
                                                    <h2 className="text-2xl font-semibold mb-4">
                                                        About this event
                                                    </h2>
                                                    <p className="text-gray-600 mb-8">
                                                        {selectedEvent.description}
                                                    </p>

                                                    {/* Display summary if available */}
                                                    {selectedEvent.summary && (
                                                        <>
                                                            <h2 className="text-2xl font-semibold mb-4">Description</h2>
                                                            <p className="text-gray-600 mb-8 whitespace-pre-line">{selectedEvent.summary}</p>
                                                        </>
                                                    )}
                                                </section>

                                                {/* Add Organizer Information */}
                                                <section className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                                                    <h2 className="text-xl font-bold mb-4">Organized by</h2>
                                                    <div className="flex items-center">
                                                        <img
                                                            src={selectedEvent.organizer?.avatar || '/images/avatar.png'}
                                                            alt={selectedEvent.organizer?.name || 'Organizer'}
                                                            className="w-12 h-12 rounded-full mr-4"
                                                        />
                                                        <div>
                                                            <h3 className="font-medium text-lg">{selectedEvent.organizer?.username || 'Event Organizer'}</h3>
                                                            <p className="text-gray-500">{selectedEvent.organizer?.email || ''}</p>
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>
                                        ) : (
                                            /* For other notification types */
                                            <div className="bg-white p-6">
                                                {/* Message content */}
                                                <div className="text-gray-700 whitespace-pre-line">
                                                    <p className="mb-6">{selectedNotification.data?.message}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;