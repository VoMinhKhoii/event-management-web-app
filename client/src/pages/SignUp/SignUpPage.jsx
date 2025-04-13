/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const formData = new FormData(e.target);

        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const username = formData.get('username');
        const email = formData.get('email');
        const contact = formData.get('contact');
        const password = formData.get('password');


        console.log("Register:", {firstName, lastName, username, email, contact, password});

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
                contact,
                password, 
               
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        navigate("/login");
        console.log(data);
    } catch (error) {
            console.error('Error during registration:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E9F2F6] font-['Poppins']">
            <div className="bg-white rounded-[12px] shadow-md max-w-md w-full p-6 transition-all duration-300 hover:shadow-xl hover:translate-y-[-1px]">
                <h1 className="text-[32px] font-bold text-center mb-[12px]">Sign up</h1>
                <p className="text-center text-[#4B5563] mb-[24px]">Join us today and start your journey</p>

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
                        <label htmlFor="contact" className="block font-medium text-[#374151] mb-1">Contact</label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block font-medium text-[#374151] mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                            required
                        />
                    </div>


                    <button
                        type="submit"
                        className="text-[16px] w-full bg-[#569DBA] text-white py-[12px] rounded-full hover:bg-opacity-90 transition-colors"
                    >
                        Sign up
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
};

export default SignUpPage;