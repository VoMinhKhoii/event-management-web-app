import { createContext } from "react";
import { useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const updateUser = (data) => {
        console.log("updateUser called with:", data); // Debug log
        setCurrentUser(data);
    }
    
    const updateAvatar = async (avatarUrl) => {
        try {
            if (currentUser) {
                // Update in local state first for immediate UI update
                setCurrentUser({
                    ...currentUser,
                    avatar: avatarUrl
                });
                
                // Then update in the database
                const response = await fetch(`http://localhost:8800/api/users/${currentUser._id}/avatar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', // Important for cookies
                    body: JSON.stringify({ avatarUrl })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Failed to update avatar in database:', errorData.message);
                    // You might want to handle this error or show a notification to the user
                }
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    }
    
    useEffect(() => {
        // Only save to localStorage if user is not null
        if (currentUser === null) {
            localStorage.removeItem("user");
        } else {
            localStorage.setItem("user", JSON.stringify(currentUser));
        }
    }, [currentUser]);

    return (
        <AuthContext.Provider value = {{currentUser, updateUser, updateAvatar}}>
            {children}
        </AuthContext.Provider>
    );
}