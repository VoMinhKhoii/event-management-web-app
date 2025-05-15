/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext.jsx';
import { NotificationContext } from '../context/notificationContext.jsx';

// Import active and inactive icons
import homeActive from '../assets/home-2.png';
import homeInactive from '../assets/home-2-inactive.png';
import calendarActive from '../assets/calendar-active.png';
import calendarInactive from '../assets/calendar-inactive.png';
import notificationIcon from '../assets/notification.png';
import notificationActiveIcon from '../assets/notification-active.png';


const NavPane = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, updateUser, updateAvatar } = useContext(AuthContext);
    const { newCount } = useContext(NotificationContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Default avatar to use if user has no avatar
    const defaultAvatar = "https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg";

    // Determine active menu directly without using state - eliminates flicker
    const getActiveMenu = () => {
        const path = location.pathname;
        
        // Check if we're viewing an event detail or editing an event
        if (path.match(/^\/event\/[^/]+$/) || path.match(/^\/event\/[^/]+\/edit$/)) {
            // Check navigation state
            if (location.state?.source === 'home') {
                return 'home';
            } else if (location.state?.source === 'calendar') {
                return 'calendar';
            }
            
            // No source state, check if we can infer from sessionStorage
            const lastActiveMenu = sessionStorage.getItem('lastActiveMenu');
            if (lastActiveMenu) {
                return lastActiveMenu;
            }
        }
        
        // Normal path handling
        if (path.includes('/home')) {
            return 'home';
        } else if (path.includes('/calendar')) {
            return 'calendar';
        } else if (path.includes('/notifications')) {
            return 'notifications';
        }
        
        // Default to empty if none match
        return '';
    };
    
    // Current active menu - computed directly in render
    const activeMenu = getActiveMenu();
    
    // Store the current active menu in sessionStorage for persistence
    useEffect(() => {
        if (activeMenu) {
            sessionStorage.setItem('lastActiveMenu', activeMenu);
        }
    }, [activeMenu]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const goToProfile = () => {
        navigate('/profile');
    };

    // Add a class to the body to fix scrollbar issue
    useEffect(() => {
        document.body.classList.add('pr-0');
        document.body.style.overflowY = 'scroll'; // Always show scrollbar

        return () => {
            document.body.classList.remove('pr-0');
            document.body.style.overflowY = '';
        };
    }, []);

    return (
        <header className="border-b bg-white fixed top-0 left-0 right-0 z-50 font-['Poppins'] shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16">

                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            aria-expanded={mobileMenuOpen}
                            onClick={toggleMobileMenu}
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Hamburger icon */}
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop menu centered */}
                    <nav className="hidden md:flex items-center justify-center mx-auto">
                        <div className="flex items-center">
                            <Link
                                to="/home"
                                className={`flex items-center px-4 py-2 text-sm font-medium ${activeMenu === 'home'
                                        ? 'bg-[#E0E0E0] rounded-[12px] text-gray-900'
                                        : 'text-gray-600 hover:bg-[#F5F5F5] hover:rounded-[12px] hover:text-gray-900'
                                    } transition-all`}
                            >
                                <img
                                    src={activeMenu === 'home' ? homeActive : homeInactive}
                                    alt="Home"
                                    className="w-5 h-5 mr-3"
                                />
                                Home
                            </Link>
                            <Link
                                to="/calendar"
                                className={`flex items-center px-4 py-2 text-sm font-medium mx-4 ${activeMenu === 'calendar'
                                        ? 'bg-[#E0E0E0] rounded-[12px] text-gray-900'
                                        : 'text-gray-600 hover:bg-[#F5F5F5] hover:rounded-[12px] hover:text-gray-900'
                                    } transition-all`}
                            >
                                <img
                                    src={activeMenu === 'calendar' ? calendarActive : calendarInactive}
                                    alt="Calendar"
                                    className="w-5 h-5 mr-3"
                                />
                                Calendar
                            </Link>
                            <Link
                                to="/notifications"
                                className={`flex items-center px-4 py-2 text-sm font-medium relative ${activeMenu === 'notifications'
                                        ? 'bg-[#E0E0E0] rounded-[12px] text-gray-900'
                                        : 'text-gray-600 hover:bg-[#F5F5F5] hover:rounded-[12px] hover:text-gray-900'
                                    } transition-all`}
                            >
                                <img
                                    src={activeMenu === 'notifications' ? notificationActiveIcon : notificationIcon}
                                    alt="Notifications"
                                    className="w-5 h-5 mr-3"
                                />
                                Notifications
                                {newCount > 0 && location.pathname !== '/notifications' && (
                                    <span className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                                        {newCount > 9 ? '9+' : newCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </nav>

                    {/* Profile button - absolute positioned to be at the rightmost edge */}
                    <div className="absolute right-4 sm:right-6 lg:right-8">
                        <button
                            onClick={goToProfile}
                            className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:opacity-80 transition-opacity"
                        >
                            <span className="sr-only">Go to profile</span>
                            <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={currentUser?.avatar || defaultAvatar}
                                alt="Profile"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
                    <Link
                        to="/home"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${activeMenu === 'home'
                                ? 'bg-[#E0E0E0] text-gray-900'
                                : 'text-gray-600 hover:bg-[#F5F5F5] hover:text-gray-900'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="flex items-center">
                            <img
                                src={activeMenu === 'home' ? homeActive : homeInactive}
                                alt="Home"
                                className="w-5 h-5 mr-3"
                            />
                            Home
                        </div>
                    </Link>
                    <Link
                        to="/calendar"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${activeMenu === 'calendar'
                                ? 'bg-[#E0E0E0] text-gray-900'
                                : 'text-gray-600 hover:bg-[#F5F5F5] hover:text-gray-900'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="flex items-center">
                            <img
                                src={activeMenu === 'calendar' ? calendarActive : calendarInactive}
                                alt="Calendar"
                                className="w-5 h-5 mr-3"
                            />
                            Calendar
                        </div>
                    </Link>
                    <Link
                        to="/notifications"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${activeMenu === 'notifications'
                                ? 'bg-[#E0E0E0] text-gray-900'
                                : 'text-gray-600 hover:bg-[#F5F5F5] hover:text-gray-900'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="flex items-center">
                            <img
                                src={activeMenu === 'notifications' ? notificationActiveIcon : notificationIcon}
                                alt="Notifications"
                                className="w-5 h-5 mr-3"
                            />
                            Notifications
                            {newCount > 0 && location.pathname !== '/notifications' && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {newCount > 9 ? '9+' : newCount}
                                </span>
                            )}
                        </div>
                    </Link>
                    <Link
                        to="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-[#F5F5F5] hover:text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="flex items-center">
                            <img
                                src={currentUser?.avatar || defaultAvatar}
                                alt="Profile"
                                className="w-5 h-5 mr-3 rounded-full object-cover"
                            />
                            Profile
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default NavPane;