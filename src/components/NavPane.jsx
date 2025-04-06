import React from 'react';
import { Link } from 'react-router-dom';
import homeIcon from '../assets/home-2-inactive.png'
import calendarIcon from '../assets/calendar.png';
import notificationIcon from '../assets/notification.png';

const NavPane = () => {
    return (
        <header className=" border-b bg-white fixed top-0 left-0 right-0 z-50 font-['Poppins']">
            <div className="max-w-6xl mx-auto flex items-center justify-center py-4">
                <nav className="flex items-center space-x-12">
                    <Link to="/" className="flex items-center">
                        <img
                            src={homeIcon}
                            alt=""
                            className="w-[20px] h-[20px] mr-[5px]" />
                        Home
                    </Link>
                    <Link to="/calendar" className="flex items-center hover:text-gray-900">
                        <img
                            src={calendarIcon}
                            alt=""
                            className="w-[20px] h-[20px] mr-[5px]" />
                        Calendar
                    </Link>
                    <Link to="/notifications" className="flex items-center hover:text-gray-900">
                        <img
                            src={notificationIcon}
                            alt=""
                            className="w-[20px] h-[20px] mr-[5px]" />
                        Notifications
                    </Link>
                </nav>
                <div className="absolute right-4">
                    <img src="/images/avatar.png" alt="Profile" className="w-8 h-8 rounded-full" />
                </div>
            </div>
        </header>
    );
}

export default NavPane;