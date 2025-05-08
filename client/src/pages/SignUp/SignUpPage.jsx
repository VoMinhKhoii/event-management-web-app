/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {

    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: "",
        color: ""
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const checkPasswordStrength = (password) => {
        let score = 0;
        let message = "";
        let color = "";

        if (!password || password.length === 0) {
            setPasswordStrength({ score: 0, message: "", color: "" });
            return;
        }

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 0:
            case 1:
                message = "Weak";
                color = "#f44336";
                break;
            case 2:
                message = "Fair";
                color = "#ff9800";
                break;
            case 3:
                message = "Good";
                color = "#2196f3";
                break;
            case 4:
                message = "Strong";
                color = "#4caf50";
                break;
            default:
                break;
        }

        setPasswordStrength({ score, message, color });
    };

    const handlePasswordChange = (e) => {
        checkPasswordStrength(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset error state
        setIsLoading(true); // Start loading

        const formData = new FormData(e.target);

        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            setIsLoading(false); // Stop loading
            return;
        }

        if (passwordStrength.score < 2) {
            setError("Please choose a stronger password");
            setIsLoading(false); // Stop loading
            return;
        }

        console.log("Register:", { firstName, lastName, username, email, password });

        try {
            const res = await fetch('http://localhost:8800/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    username,
                    email,
                    password,
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Registration failed');
                return;
            }

            alert('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate("/login");
            }, 1500);
            console.log(data);
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E9F2F6] font-['Poppins']">
            <div className="bg-white rounded-[12px] shadow-md max-w-md w-full p-6 transition-all duration-300 hover:shadow-xl hover:translate-y-[-1px]">
                <h1 className="text-[32px] font-bold text-center mb-[12px]">Sign up</h1>
                <p className="text-center text-[#4B5563] mb-[24px]">Join us today and start your journey</p>

                {/* Show error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-5 mb-4">
                        <div className="flex-1">
                            <label htmlFor="firstName" className="block font-medium text-[#374151] mb-[4px]">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label htmlFor="lastName" className="block font-medium text-[#374151] mb-1">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="username" className="block font-medium text-[#374151] mb-1">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="email" className="block font-medium text-[#374151] mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block font-medium text-[#374151] mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none pr-10"
                                required
                                onChange={handlePasswordChange}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Password strength indicator */}
                        {passwordStrength.message &&  (
                            <div className="mt-2">
                                <div className="h-1 w-full bg-gray-200 rounded">
                                    <div 
                                        className="h-full rounded transition-all duration-300" 
                                        style={{ 
                                            width: `${(passwordStrength.score / 4) * 100}%`,
                                            backgroundColor: passwordStrength.color
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs mt-1" style={{ color: passwordStrength.color }}>
                                    {passwordStrength.message}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="text-[16px] w-full bg-[#569DBA] text-white py-[12px] rounded-full hover:bg-opacity-90 transition-colors"
                    >
                        {isLoading ? 'Signing up...' : 'Sign up'}
                    </button>
                </form>

                <p className="text-[12px] text-center text-black mt-3">
                    By clicking this button, you acknowledge that your information will be
                    stored securely and used only for event management purposes.
                </p>

                <p className="text-[16px] text-center mt-6">
                    Already have an account?
                    <Link to="/login" className="font-medium text-[#569DBA] hover:underline ml-1">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
export default SignUpPage;