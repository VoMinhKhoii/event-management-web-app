/* eslint-disable no-unused-vars */
import { createContext } from "react";
import { useState, useEffect, useCallback } from "react";
import { useContext } from "react";
import { AuthContext } from "./authContext.jsx";

export const NotificationContext = createContext();

export const NotificationContextProvider = ({ children }) => {

    const { currentUser } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [newCount, setNewCount] = useState(0);

    const fetchNotifications = async () => {
        clearNotifications(); // Clear notifications before fetching new ones to prevent memory leaks
        try {
            const response = await fetch(`http://localhost:8800/api/notifications`, {
                method: 'GET',
                credentials: 'include', // Important for cookies
            });
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchNewCount = useCallback(async () => {
        try {
            // Get timestamp of when user last visited notifications page
            const lastVisitTimestamp = localStorage.getItem('userNotificationsTimestamp') || '0';

            console.log("Last visit timestamp:", lastVisitTimestamp);
            console.log("As date:", new Date(parseInt(lastVisitTimestamp)).toLocaleString());
            console.log("Current time:", new Date().toLocaleString());

            const response = await fetch(`http://localhost:8800/api/notifications/new?since=${lastVisitTimestamp}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) return;

            const data = await response.json();
            console.log("New notifications count:", data.count);
            setNewCount(data.count);
        } catch (error) {
            console.error("Error fetching new notification count:", error);
        }
    }, []);

    // Mark all as seen (when visiting notifications page)
    const markAllAsSeen = useCallback(() => {
        // Update the last visit timestamp
        localStorage.setItem('userNotificationsTimestamp', Date.now().toString());
        // Reset new count
        setNewCount(0);
    }, []);


    const sendNotification = async (notification) => {
        try {
            const response = await fetch(`http://localhost:8800/api/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify(notification)
            });
            if (!response.ok) {
                throw new Error('Failed to send notification');
            }
            const data = await response.json();
            setNotifications((prev) => [...prev, data]);
            console.log('Notification sent successfully:', data);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    const markAsRead = async (notificationId) => {
        try {

            const response = await fetch(`http://localhost:8800/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                credentials: 'include', // Important for cookies
            });
            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }
            setNotifications((prev) => prev.map(notification => notification._id === notificationId ? { ...notification, isRead: true } : notification));

            console.log('Notification marked as read successfully:', notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`http://localhost:8800/api/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'include', // Important for cookies
            });
            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }
            setNotifications((prev) => prev.filter(notification => notification._id !== notificationId));

            console.log('Notification deleted successfully:', notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }


    const clearNotifications = () => {
        setNotifications([]); // Clear all notifications from the state
        console.log('All notifications cleared');
    };

    useEffect(() => {
        fetchNewCount();

        // Add page visibility change listener
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // When tab becomes visible, check for new notifications
                fetchNewCount();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Poll for new notifications periodically
        const intervalId = setInterval(fetchNewCount, 60000); // Check every minute

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(intervalId);
        };
    }, [fetchNewCount]);

    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchNotifications();
        } else {
            clearNotifications(); // Clear notifications if no user is logged in
        }
    }, [currentUser]);

    return (
        <NotificationContext.Provider value={{ newCount, fetchNewCount, markAllAsSeen, notifications, sendNotification, markAsRead, deleteNotification, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}