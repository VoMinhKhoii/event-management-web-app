import { createContext } from "react";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "./authContext.jsx";

export const NotificationContext = createContext();

export const NotificationContextProvider = ({ children }) => {

    const { currentUser } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
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
        } finally {

        }
    };


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
        if (currentUser && currentUser._id) {
            fetchNotifications();
        } else {
            clearNotifications(); // Clear notifications if no user is logged in
        }
    }, [currentUser]);

    return (
        <NotificationContext.Provider value={{ notifications, sendNotification, markAsRead, deleteNotification, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}