/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import totalUsers from '../assets/total-users.png';
import totalEvents from '../assets/total-events.png';
import newUser from '../assets/new-user.png';
import calendarActive from '../assets/calendar-active.png';
import calendarInactive from '../assets/calendar-inactive.png';
import userActive from '../assets/user-active.png';
import userInactive from '../assets/user-inactive.png';
import settingActive from '../assets/setting-active.png';
import settingInactive from '../assets/setting-inactive.png';
import chartActive from '../assets/chart-active.png';
import chartInactive from '../assets/chart-inactive.png';
import rsvpRate from '../assets/rsvp-rate.png';
import onlineUsersIcon from '../assets/online-users.png';
import ongoingIcon from '../assets/ongoing.png';
import upcomingIcon from '../assets/upcoming.png';
import recentActivityIcon from '../assets/recent-activity.png';
import AdminNavPane from '../components/AdminNavPane';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    // Add this with your other useState declarations
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        ongoingEvents: 0,
        upcomingEvents: 0,
        onlineUsers: 0,
        newUsersToday: 0,
        rsvpRate: 0
    });

    // Add this with your state declarations
    const [activities, setActivities] = useState([
        { id: 1, desc: "John created a new event", action: "created", type: "event", time: "2 hours ago" },
        { id: 2, desc: "Sarah updated her profile", action: "updated", type: "user", time: "5 hours ago" },
        // Add more mock activities as needed
    ]);

    // Track window width for responsive layout
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchDashboardStats = async (forceRefresh = false) => {
        // Try to get cached data first
        const cachedData = localStorage.getItem('dashboardStats');
        const cacheTimestamp = localStorage.getItem('dashboardStatsTimestamp');
        const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
        
        // Use cached data if it exists, is not expired, and force refresh is not requested
        if (
            cachedData && 
            cacheTimestamp && 
            Date.now() - parseInt(cacheTimestamp) < ONE_HOUR && 
            !forceRefresh
        ) {
            setStats(JSON.parse(cachedData));
            return; // Exit early - no need to fetch
        }
        
        try {
            // Fetch fresh data
            const users = await fetch('http://localhost:8800/api/users', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const events = await fetch('http://localhost:8800/api/events', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const userData = await users.json();
            const eventData = await events.json();

            // Calculate stats
            const newStats = {
                totalUsers: userData.length,
                totalEvents: eventData.length,
                ongoingEvents: eventData.filter(event => 
                    new Date(event.startDate) <= new Date() && 
                    new Date(event.endDate || event.startDate) >= new Date()
                ).length,
                upcomingEvents: eventData.filter(event => 
                    new Date(event.startDate) > new Date()
                ).length,
                onlineUsers: userData.filter(user => user.isOnline).length,
                newUsersToday: userData.filter(user => {
                    const today = new Date();
                    const userDate = new Date(user.createdAt);
                    return userDate.getDate() === today.getDate() &&
                        userDate.getMonth() === today.getMonth() &&
                        userDate.getFullYear() === today.getFullYear();
                }).length,
                rsvpRate: 75 // Placeholder - replace with actual calculation
            };

            // Update state with all stats
            setStats(newStats);
            
            // Cache the data
            localStorage.setItem('dashboardStats', JSON.stringify(newStats));
            localStorage.setItem('dashboardStatsTimestamp', Date.now().toString());

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            
            // If there's cached data, use it as fallback on error
            if (cachedData) {
                setStats(JSON.parse(cachedData));
            }
        }
    };

    // Add this effect
    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const handleNavigation = (path, menu) => {
        setActiveMenu(menu);
        navigate(path);
    };
    // Label color map
    const actionColor = {
        created: 'bg-green-100 text-green-800',
        updated: 'bg-yellow-100 text-yellow-800',
        deleted: 'bg-red-100 text-red-800',
    };
    return (
        <div className="flex bg-gray-50 font-[Poppins] min-h-screen">
            <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            {/* Main Content with responsive padding */}
            <div className="flex-1 transition-all duration-300">
                {/* Top bar for mobile */}
                {windowWidth < 640 && (
                    <div className="h-16 bg-white shadow-sm flex items-center justify-center sticky top-0 z-10 px-4">
                        <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    </div>
                )}

                {/* Dashboard content with responsive padding */}
                <div className={`p-4 md:p-6 ${windowWidth < 640 ? 'pt-20' : ''}`}>
                    <div className="flex flex-col gap-6">
                        {/* Top Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Total Users */}
                            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-start">
                                <div className="p-3 rounded-full bg-[#EFF6FF] w-12 h-12 flex items-center justify-center mb-4">
                                    <img src={totalUsers} alt="Total Users" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{stats.totalUsers}</h2>
                                    <p className="text-gray-600">Total users</p>
                                </div>
                            </div>
                            {/* Total Events */}
                            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-start">
                                <div className="p-3 rounded-full bg-[#DEFFF4] w-12 h-12 flex items-center justify-center mb-4">
                                    <img src={totalEvents} alt="Total Events" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{stats.totalEvents}</h2>
                                    <p className="text-gray-600">Total events</p>
                                </div>
                            </div>
                        </div>
                        {/* Second Row: Sub Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* New Users Today */}
                            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-start">
                                <div className="p-3 rounded-full bg-[#EFF6FF] w-12 h-12 flex items-center justify-center mb-4">
                                    <img src={newUser} alt="New Users Today" className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-semibold">{stats.newUsersToday}</div>
                                    <div className="text-sm text-gray-600">New users today</div>
                                </div>
                            </div>
                            {/* Currently Online Users */}
                            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-start">
                                <div className="p-3 rounded-full bg-[#EFF6FF] w-12 h-12 flex items-center justify-center mb-4">
                                    <img src={onlineUsersIcon} alt="Currently Online" className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-semibold">{stats.onlineUsers}</div>
                                    <div className="text-sm text-gray-600">Currently online</div>
                                </div>
                            </div>
                            {/* Ongoing Events */}
                            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-start">
                                <div className="p-3 rounded-full bg-[#DEFFF4] w-12 h-12 flex items-center justify-center mb-4">
                                    <img src={ongoingIcon} alt="Ongoing Events" className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-semibold">{stats.ongoingEvents}</div>
                                    <div className="text-sm text-gray-600">Ongoing events</div>
                                </div>
                            </div>
                            {/* Upcoming Events */}
                            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-start">
                                <div className="p-3 rounded-full bg-[#DEFFF4] w-12 h-12 flex items-center justify-center mb-4">
                                    <img src={upcomingIcon} alt="Upcoming Events" className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-semibold">{stats.upcomingEvents}</div>
                                    <div className="text-sm text-gray-600">Upcoming events</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Recent Activity Table */}
                        <div className="bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden">
                            <div className="p-6 pb-2">
                                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">

                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {activities.map((activity) => (
                                                <tr key={activity.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <span className="inline-flex items-center gap-2">
                                                            <img src={recentActivityIcon} alt="activity" className="w-4 h-4 inline-block" />
                                                            {activity.desc}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${actionColor[activity.action]}`}>{activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
