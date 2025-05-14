// context/AdminAuthContext.jsx
import { createContext } from "react";
import { useState, useEffect } from "react";

export const AdminAuthContext = createContext();

export const AdminAuthContextProvider = ({ children }) => {
    const [currentAdmin, setCurrentAdmin] = useState(() => {
        const saved = localStorage.getItem("admin");
        return saved ? JSON.parse(saved) : null;
    });

    const updateAdmin = (data) => {
        setCurrentAdmin(data);
    };

    useEffect(() => {
        if (currentAdmin === null) {
            localStorage.removeItem("admin");
        } else {
            localStorage.setItem("admin", JSON.stringify(currentAdmin));
        }
    }, [currentAdmin]);

    return (
        <AdminAuthContext.Provider value={{ currentAdmin, updateAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

