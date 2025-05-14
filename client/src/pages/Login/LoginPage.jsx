import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext.jsx';
import { AdminAuthContext } from '../../context/adminAuthContext';
import { useContext } from 'react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { updateUser } = useContext(AuthContext);
    const { updateAdmin } = useContext(AdminAuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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


            // Check if the response is JSON before trying to parse it
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Login failed with status: ${res.status}`);
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || `Login failed with status: ${res.status}`);
            }

            if (!data.user) {
                throw new Error('No user data in response');
            }


            updateUser(data.user);
            console.log('Login successful:', data);
            navigate('/home'); // Redirect to home page after successful login

        } catch (err) {
            console.error('Login error:', err);
            alert(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setIsAdminLoading(true);
        setError(null);

        try {
            // Use the specific admin login endpoint
            const res = await fetch('http://localhost:8800/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                }),
                credentials: 'include'
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Server returned ${res.status}: Expected JSON but got ${contentType || 'unknown content type'}`);
            }

            const data = await res.json();  

            if (!res.ok) {
                throw new Error(data.message || `Admin login failed with status: ${res.status}`);
            }

            if (!data.user) {
                throw new Error('No admin data in response');
            }

            // Store admin user data
            updateAdmin(data.user);
            console.log('Admin login successful:', data);
            navigate('/admin/dashboard');

        } catch (err) {
            console.error('Admin login error:', err);
            setError(err.message || 'Admin login failed. Please verify your credentials.');
        } finally {
            setIsAdminLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E9F2F6] font-['Poppins']">
            <div className="bg-white rounded-[12px] shadow-md max-w-md w-full p-6 transition-all duration-300 hover:shadow-xl hover:translate-y-[-1px]">
                <h1 className="text-[32px] font-bold text-center mb-[12px]">Log in</h1>
                <p className="text-center text-[#4B5563] mb-[24px]">Welcome back!</p>

                {/* Display error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

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
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                                style={{ height: '20px', width: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button
                            type="submit"
                            className="text-[16px] w-full bg-[#569DBA] text-white py-[12px] rounded-full hover:bg-opacity-90 transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </button>
                        
                        <div className="relative flex items-center justify-center">
                            <hr className="w-full border-gray-300" />
                            <span className="absolute bg-white px-2 text-xs text-gray-500">OR</span>
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleAdminLogin}
                            className="text-[16px] w-full bg-gray-800 text-white py-[12px] rounded-full hover:bg-gray-700 transition-colors flex items-center justify-center"
                            disabled={isAdminLoading}
                        >
                            {isAdminLoading ? 'Processing...' : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                    </svg>
                                    Login as Admin
                                </>
                            )}
                        </button>
                    </div>

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
}
export default LoginPage;