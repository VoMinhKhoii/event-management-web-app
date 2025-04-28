import { createContext } from "react";
import { useState, useEffect } from "react";

export const notificationContext = createContext();

export const notificationContextProvider = ({ children }) => {

    const { currentUser } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`http://localhost:8800/api/notifications/${currentUser._id}`, {
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


    const getEventInfoFromNotification = async (notificationId) => {
        try {
            const response = await fetch(`http://localhost:8800/api/notifications/${notificationId}`, {
                method: 'GET',
                credentials: 'include', // Important for cookies
            });
            if (!response.ok) {
                throw new Error('Failed to fetch event info from notification');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching event info from notification:', error);
        }
    };



    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <notificationContext.Provider value={{ notifications, sendNotification, markAsRead, deleteNotification, getEventInfoFromNotification }}>
            {children}
        </notificationContext.Provider>
    );
}