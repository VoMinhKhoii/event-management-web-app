import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex items-center bg-[#E9F2F6] font-['Poppins']">
            <div className="px-6 max-w-4xl">
                <div className="flex flex-col items-start ml-[24px]">
                    <h1 className="text-[56px] font-bold leading-tight text-black mb-6">
                        Effortlessly manage<br />
                        your events with ease
                    </h1>

                    <p className="text-[18px] leading-relaxed text-black max-w-2xl mb-10">
                        Our Event Planning & Management System simplifies the way you
                        create, manage, and participate in events. Whether public or private,
                        stay organized and connected with your attendees seamlessly.
                    </p>

                    <div className="flex space-x-4">
                        <Link
                            to="/signup"
                            className="px-8 py-3 bg-[#569DBA] text-white rounded-full hover:bg-opacity-90 transition-colors font-medium"
                        >
                            Sign up
                        </Link>

                        <Link
                            to="/login"
                            className="px-8 py-3 border border-[#569DBA] text-[#569DBA] rounded-full hover:bg-[#569DBA] hover:bg-opacity-10 transition-colors font-medium"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;