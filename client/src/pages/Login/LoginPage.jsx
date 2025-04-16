/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext.jsx';
import { useContext } from 'react';

const LoginPage = () => {

    const navigate = useNavigate();

    const { updateUser } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            const res = await fetch('http://localhost:8800/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                }),
                credentials: 'include' // Important for storing cookies
            });

            const data = await res.json();
            console.log("Login response:", data);

            
            if (!res.ok) {
                console.error("No user data in response");
                throw new Error(data.message || 'Login failed');
            }

            updateUser(data.user); 
            
            console.log('Login successful:', data);
            navigate('/home'); // Redirect to home page after successful login
            
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E9F2F6] font-['Poppins']">
            <div className="bg-white rounded-[12px] shadow-md max-w-md w-full p-6 transition-all duration-300 hover:shadow-xl hover:translate-y-[-1px]">
                <h1 className="text-[32px] font-bold text-center mb-[12px]">Log in</h1>
                <p className="text-center text-[#4B5563] mb-[24px]">Welcome back!</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block font-medium text-[#374151] mb-1">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="block font-medium text-[#374151]">Password</label>
                            <a href="#" className="text-[14px] text-[#569DBA] hover:underline">Forgot password?</a>
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="text-[16px] w-full bg-[#569DBA] text-white py-[12px] rounded-full hover:bg-opacity-90 transition-colors mt-4"
                    >
                        Log in
                    </button>
                </form>

                <p className="text-[16px] text-center mt-6">
                    Don't have an account?
                    <Link to="/signup" className="font-medium text-[#569DBA] hover:underline ml-1">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;