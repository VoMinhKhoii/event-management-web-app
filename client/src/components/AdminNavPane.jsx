    import React, { useState, useEffect } from 'react';
    import chartActive from '../assets/chart-active.png';
    import chartInactive from '../assets/chart-inactive.png';
    import userActive from '../assets/user-active.png';
    import userInactive from '../assets/user-inactive.png';
    import calendarActive from '../assets/calendar-active.png';
    import calendarInactive from '../assets/calendar-inactive.png';
    import settingActive from '../assets/setting-active.png';
    import settingInactive from '../assets/setting-inactive.png';
    import { useNavigate } from 'react-router-dom';
    import { AdminAuthContext } from '../context/adminAuthContext';

    const AdminNavPane = ({ activeMenu, setActiveMenu }) => {
        const navigate = useNavigate();
        const { updateAdmin } = React.useContext(AdminAuthContext);
        const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
        const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
        const [windowWidth, setWindowWidth] = useState(window.innerWidth);

        // Handle screen size changes
        useEffect(() => {
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
                // Auto-collapse sidebar on small screens
                if (window.innerWidth < 768) {
                    setIsSidebarCollapsed(true);
                }
            };

            window.addEventListener('resize', handleResize);
            // Initialize on mount
            handleResize();

            return () => window.removeEventListener('resize', handleResize);
        }, []);

        const handleNavigation = (path, menu) => {
            setActiveMenu(menu);
            setIsMobileMenuOpen(false);
            navigate(path);
        };

        const handleLogout = async () => {
            try {
                // Call the backend API to log out
                await fetch('/api/admin/logout', {
                    method: 'POST',
                    credentials: 'include', // Include cookies for authentication
                });
        
                // Clear the auth token from local storage
                localStorage.clear();
                updateAdmin(null);
                // Redirect to the login page
                navigate('/login');
            } catch (error) {
                console.error('Logout error:', error);
            }
        };
        

        const toggleSidebar = () => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
        };

        // Navigation items array to easily map through
        const navItems = [
            {
                name: 'Dashboard',
                path: '/admin/dashboard',
                menu: 'dashboard',
                activeIcon: chartActive,
                inactiveIcon: chartInactive,
            },
            {
                name: 'Users',
                path: '/admin/userpage',
                menu: 'users',
                activeIcon: userActive,
                inactiveIcon: userInactive,
            },
            {
                name: 'Events',
                path: '/admin/events',
                menu: 'events',
                activeIcon: calendarActive,
                inactiveIcon: calendarInactive,
            },
            {
                name: 'Settings',
                path: '/admin/setting',
                menu: 'settings',
                activeIcon: settingActive,
                inactiveIcon: settingInactive,
            },
        ];

        return (
            <>
                {/* Extra Small Screens (< sm): Just a fixed hamburger button */}
                {windowWidth < 640 ? (
                    <div className="fixed top-0 left-0 z-50">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-3 m-2 bg-white rounded-full shadow-md text-gray-600 hover:bg-gray-100 focus:outline-none"
                            aria-label="Toggle navigation menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Mobile full screen overlay menu */}
                        {isMobileMenuOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="bg-white h-full w-64 p-4 shadow-lg transform transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold">Admin Panel</h2>
                                        <button
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="p-2 rounded-full hover:bg-gray-100"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <nav>
                                        {navItems.map((item) => (
                                            <div
                                                key={item.menu}
                                                className={`flex items-center px-4 py-3 my-1 rounded-lg cursor-pointer ${activeMenu === item.menu ? 'bg-[#E0E0E0]' : 'hover:bg-[#F5F5F5]'
                                                    } transition-all`}
                                                onClick={() => handleNavigation(item.path, item.menu)}
                                            >
                                                <img
                                                    src={activeMenu === item.menu ? item.activeIcon : item.inactiveIcon}
                                                    alt={item.name}
                                                    className="h-5 w-5"
                                                />
                                                <span className="ml-3 font-medium">{item.name}</span>
                                            </div>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Small to Medium Screens (sm - lg): Collapsible sidebar
                    <div
                        className={`h-screen bg-white shadow-sm fixed top-0 left-0 z-40 transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'w-14' : 'w-56'
                            }`}
                    >
                        {/* Logo and toggle button */}
                        <div className={`flex items-center p-3 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                            {!isSidebarCollapsed && <h1 className="text-base font-bold">Admin Panel</h1>}
                            <button
                                onClick={toggleSidebar}
                                className="p-1 rounded-full hover:bg-gray-100"
                                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                <svg
                                    className={`h-4 w-4 transform transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 mt-4">
                            {navItems.map((item) => (
                                <div
                                    key={item.menu}
                                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'
                                        } py-3 my-1 mx-2 cursor-pointer ${activeMenu === item.menu ? 'bg-[#E0E0E0] rounded-lg' : 'hover:bg-[#F5F5F5] hover:rounded-lg'
                                        } transition-all`}
                                    onClick={() => handleNavigation(item.path, item.menu)}
                                >
                                    <img
                                        src={activeMenu === item.menu ? item.activeIcon : item.inactiveIcon}
                                        alt={item.name}
                                        className="h-5 w-5"
                                    />
                                    {!isSidebarCollapsed && <span className="ml-3 text-sm font-medium">{item.name}</span>}

                                    {/* Tooltip for collapsed mode */}
                                    {isSidebarCollapsed && (
                                        <div className="absolute left-14 bg-gray-800 text-white px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                                            {item.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Bottom section for profile/logout (optional) */}
                        {!isSidebarCollapsed && (
                            <div className="p-3 border-t">
                                <div className="text-xs text-gray-500 mb-1">Logged in as:</div>
                                <div className="text-sm font-medium mb-3">Admin</div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center px-3 py-2 text-sm bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        )}

                    </div>
                )}

                {/* Spacer div to push content to the right */}
                <div className={`transition-all duration-300 ${windowWidth < 640 ? 'w-0' : (isSidebarCollapsed ? 'w-14' : 'w-56')
                    }`}></div>
            </>
        );
    };

    export default AdminNavPane;
