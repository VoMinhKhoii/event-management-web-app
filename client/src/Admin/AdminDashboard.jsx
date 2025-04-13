/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMoreVertical } from 'react-icons/fi';

// Import custom icons
import homeActive from '../assets/home-2.png';
import homeInactive from '../assets/home-2-inactive.png';
import userActive from '../assets/user-active.png';
import userInactive from '../assets/user-inactive.png';
import calendarActive from '../assets/calendar-active.png';
import calendarInactive from '../assets/calendar-inactive.png';
import settingActive from '../assets/setting-active.png';
import settingInactive from '../assets/setting-inactive.png';
import chartInactive from '../assets/chart-inactive.png';
import chartActive from '../assets/chart-active.png';
import totalUsers from '../assets/total-users.png';
import newUser from '../assets/new-user.png';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('Last 7 days');
    const [statusFilter, setStatusFilter] = useState('All status');
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 1234,
        newUsersLastWeek: 12
    });
    const [activeMenu, setActiveMenu] = useState('users'); // Track which menu is active

    // Simulating data fetch on component mount
    useEffect(() => {
        // This would be an API call in a real application
        const mockUsers = Array(10).fill().map((_, index) => ({
            id: index + 1,
            username: 'vominhkhoi',
            firstName: 'Khoi',
            lastName: 'Vo',
            email: 'minhkhoitdn@gmail.com',
            status: 'Online',
            avatar: `https://randomuser.me/api/portraits/men/${index + 10}.jpg`
        }));

        setUsers(mockUsers);
    }, []);

    const handleSearch = () => {
        console.log('Searching for:', searchTerm, 'with filters:', dateRange, statusFilter);
        // Implement search functionality
    };

    const handleNavigation = (path, menu) => {
        setActiveMenu(menu);
        navigate(path);
    };

    return (
        <div className="flex h-screen bg-gray-50 font-[Poppins]">
            {/* Sidebar */}
            <div className=" px-2 w-48 bg-white shadow-sm">
                <nav className="mt-[24px] space-y-6"> {/* Added spacing between sections */}
                    <div
                        className={`flex items-center px-6 py-4 cursor-pointer ${activeMenu === 'dashboard' ? 'bg-[#E0E0E0] rounded-[12px]' : 'hover:bg-[#F5F5F5] hover:rounded-[12px]'} transition-all`}
                        onClick={() => handleNavigation('/admindashboard', 'dashboard')}
                    >
                        <img 
                            src={activeMenu === 'dashboard' ? chartActive : chartInactive} 
                            alt="Dashboard" 
                            className="h-5 w-5"
                        />
                        <span className="mx-4 font-medium">Dashboard</span>
                    </div>
                    <div
                        className={`flex items-center px-6 py-4 cursor-pointer ${activeMenu === 'users' ? 'bg-[#E0E0E0] rounded-[12px]' : 'hover:bg-[#F5F5F5] hover:rounded-[12px]'} transition-all`}
                        onClick={() => handleNavigation('/admindashboard', 'users')}
                    >
                        <img 
                            src={activeMenu === 'users' ? userActive : userInactive} 
                            alt="Users" 
                            className="h-5 w-5"
                        />
                        <span className="mx-4 font-medium">User</span>
                    </div>
                    <div
                        className={`flex items-center px-6 py-4 cursor-pointer ${activeMenu === 'events' ? 'bg-[#E0E0E0] rounded-[12px]' : 'hover:bg-[#F5F5F5] hover:rounded-[12px]'} transition-all`}
                        onClick={() => handleNavigation('/adminevents', 'events')}
                    >
                        <img 
                            src={activeMenu === 'events' ? calendarActive : calendarInactive} 
                            alt="Events" 
                            className="h-5 w-5"
                        />
                        <span className="mx-4 font-medium">Events</span>
                    </div>
                    <div
                        className={`flex items-center px-6 py-4 cursor-pointer ${activeMenu === 'settings' ? 'bg-[#E0E0E0] rounded-[12px]' : 'hover:bg-[#F5F5F5] hover:rounded-[12px]'} transition-all`}
                        onClick={() => handleNavigation('/admindashboard', 'settings')}
                    >
                        <img 
                            src={activeMenu === 'settings' ? settingActive : settingInactive} 
                            alt="Settings" 
                            className="h-5 w-5"
                        />
                        <span className="mx-4 font-medium">Setting</span>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto px-6 py-8">
                <div className="flex flex-col">
                    {/* Search and Filter Bar */}
                    <div className="flex items-center mb-8 space-x-4">
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>This month</option>
                                <option>This year</option>
                            </select>
                        </div>

                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option>All status</option>
                                <option>Online</option>
                                <option>Offline</option>
                                <option>Away</option>
                            </select>
                        </div>

                        <button
                            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-full bg-[#EFF6FF]">
                                    <img src={totalUsers} alt="Users" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</h2>
                                    <p className="text-gray-600">Total users</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-full bg-[#EFF6FF]">
                                    <img src={newUser} alt="New Users" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{stats.newUsersLastWeek}</h2>
                                    <p className="text-gray-600">Last 7 days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white shadow-sm rounded-md border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-msemibold text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-msemibold text-gray-500 uppercase tracking-wider">
                                        First name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-msemibold text-gray-500 uppercase tracking-wider">
                                        Last name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-msemibold text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-msemibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-msemibold text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={user.avatar}
                                                        alt={user.username}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.firstName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <FiMoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-700" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;