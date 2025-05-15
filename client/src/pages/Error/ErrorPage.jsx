import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    // Determine which error message to show
    const errorStatus = error?.status || error?.statusText || "Error";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-6xl font-bold text-red-600 mb-2">{errorStatus}</h1>
                <p className="text-gray-600 mb-6">We cannot find this page</p>
                <button
                    onClick={() => navigate('/home')}
                    className="w-full bg-[#569DBA] text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    Back to Home Page
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;