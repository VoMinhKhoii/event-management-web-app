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

    // Track window width for responsive layout
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mock stats
    const [stats, setStats] = useState({
        totalUsers: 1234,
        totalEvents: 324,
        newUsersToday: 5,
        onlineUsers: 42,
        ongoingEvents: 3,
        upcomingEvents: 7,
        rsvpRate: 78 // percent
    });
    // Mock recent activity
    const [activities, setActivities] = useState([
        { id: 1, type: 'user', action: 'created', desc: 'User John Doe created', time: '1 minute ago' },
        { id: 2, type: 'event', action: 'updated', desc: 'Event "Tech Summit" updated', time: '5 minutes ago' },
        { id: 3, type: 'user', action: 'deleted', desc: 'User Jane Smith deleted', time: '10 minutes ago' },
        { id: 4, type: 'event', action: 'created', desc: 'Event "Design Workshop" created', time: '30 minutes ago' },
        { id: 5, type: 'user', action: 'updated', desc: 'User Alex Johnson updated', time: '1 hour ago' },
        { id: 6, type: 'event', action: 'deleted', desc: 'Event "Startup Pitch Day" deleted', time: '2 hours ago' },
    ]);
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
                                    <h2 className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</h2>
                                    <p className="text-gray-600">Total users</p>
                                </div>
                            </div>
                            {/* Total Events */}
                            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-start">
                                <div className="p-3 rounded-full bg-[#DEFFF4] w-12 h-12 flex items-center justify-center mb-4">
                                    <img src={totalEvents} alt="Total Events" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{stats.totalEvents.toLocaleString()}</h2>
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
                        {/* Donut Chart */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-start-3 bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                                <h3 className="text-lg font-semibold mb-2">Overall RSVP Rate</h3>
                                {/* Donut chart mockup */}
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg width="128" height="128" viewBox="0 0 42 42" className="transform -rotate-90">
                                        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                                        <circle 
                                            cx="21" 
                                            cy="21" 
                                            r="15.9155" 
                                            fill="none" 
                                            stroke="#3B82F6" 
                                            strokeWidth="6" 
                                            strokeDasharray={`${stats.rsvpRate} ${100 - stats.rsvpRate}`} 
                                            strokeDashoffset="25" 
                                        />
                                    </svg>
                                    <span className="absolute text-2xl font-bold">{stats.rsvpRate}%</span>
                                </div>
                                <div className="text-gray-500 text-sm mt-2">of all events</div>
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
