import { createContext } from "react";
import { useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const updateUser = (data) => {
        setCurrentUser(data);
    }
    
    const updateAvatar = (avatarUrl) => {
        if (currentUser) {
            setCurrentUser({
                ...currentUser,
                avatar: avatarUrl
            });
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