/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMoreVertical, FiX } from 'react-icons/fi';
import AdminNavPane from '../components/AdminNavPane';

// Import custom icons
import totalUsers from '../assets/total-users.png';
import newUser from '../assets/new-user.png';

const AdminUserPage = () => {
    const navigate = useNavigate();
    
    // Applied filter values (only change when "Search" is clicked)
    const [appliedFilters, setAppliedFilters] = useState({
        searchTerm: '',
        dateRange: 'Last 7 days',
        status: 'All status'
    });
    
    // Input filter values (change when user interacts with the form)
    const [inputFilters, setInputFilters] = useState({
        searchTerm: '',
        dateRange: 'Last 7 days',
        status: 'All status'
    });
    
    const [isFiltered, setIsFiltered] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        newUsersLastWeek: 0
    });
    const [activeMenu, setActiveMenu] = useState('users'); // Track which menu is active

    // Fetch real users data on component mount
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

    // Apply filters when APPLIED filters change (not when input filters change)
    useEffect(() => {
        if (isFiltered) {
            const filtered = applyAllFilters();
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [appliedFilters, users, isFiltered]);

    // Apply all filters to the users list
    const applyAllFilters = () => {
        if (!isFiltered) return users;
        
        let result = [...users];
        
        // Filter by search term (search in username, firstName, lastName, email)
        if (appliedFilters.searchTerm) {
            const term = appliedFilters.searchTerm.toLowerCase();
            result = result.filter(user => 
                user.username.toLowerCase().includes(term) ||
                user.firstName.toLowerCase().includes(term) ||
                user.lastName.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term)
            );
        }
        
        // Filter by status
        if (appliedFilters.status && appliedFilters.status !== 'All status') {
            result = result.filter(user => user.status === appliedFilters.status);
        }
        
        // Filter by date range (using registration date or last active date)
        if (appliedFilters.dateRange && appliedFilters.dateRange !== 'All time') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            switch(appliedFilters.dateRange) {
                case 'Last 7 days': {
                    const last7Days = new Date(today);
                    last7Days.setDate(last7Days.getDate() - 7);
                    result = result.filter(user => {
                        const lastActiveDate = new Date(user.lastActive);
                        return lastActiveDate >= last7Days;
                    });
                    break;
                }
                case 'Last 30 days': {
                    const last30Days = new Date(today);
                    last30Days.setDate(last30Days.getDate() - 30);
                    result = result.filter(user => {
                        const lastActiveDate = new Date(user.lastActive);
                        return lastActiveDate >= last30Days;
                    });
                    break;
                }
                case 'This month': {
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    result = result.filter(user => {
                        const lastActiveDate = new Date(user.lastActive);
                        return lastActiveDate >= firstDayOfMonth;
                    });
                    break;
                }
                case 'This year': {
                    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                    result = result.filter(user => {
                        const lastActiveDate = new Date(user.lastActive);
                        return lastActiveDate >= firstDayOfYear;
                    });
                    break;
                }
            }
        }
        
        return result;
    };

    // Update search results for dropdown
    const updateSearchResults = (term) => {
        if (term.trim() === '') {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        
        const term_lower = term.toLowerCase();
        const results = users.filter(user =>
            user.username.toLowerCase().includes(term_lower) ||
            user.firstName.toLowerCase().includes(term_lower) ||
            user.lastName.toLowerCase().includes(term_lower) ||
            user.email.toLowerCase().includes(term_lower)
        ).slice(0, 5); // Limit to 5 results
        
        setSearchResults(results);
        setShowResults(results.length > 0);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setInputFilters({...inputFilters, searchTerm: term});
        setSelectedUser(null);
        updateSearchResults(term);
    };

    // Handle status filter change
    const handleStatusChange = (e) => {
        setInputFilters({...inputFilters, status: e.target.value});
    };

    // Handle date range filter change
    const handleDateRangeChange = (e) => {
        setInputFilters({...inputFilters, dateRange: e.target.value});
    };

    // Handle user selection from dropdown
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setInputFilters({...inputFilters, searchTerm: user.username});
        setShowResults(false);
    };

    // Handle search button click
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
            <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            {/* Main Content */}
            <div className="flex-1 overflow-auto px-4 py-6">
                <div className="flex flex-col">
                    {/* Search and Filter Bar */}
                    <div className="flex items-center mb-8 space-x-4">
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search users..."
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={inputFilters.searchTerm}
                                onChange={handleSearchChange}
                                onClick={() => {
                                    if (inputFilters.searchTerm && !selectedUser) {
                                        updateSearchResults(inputFilters.searchTerm);
                                        setShowResults(true);
                                    }
                                }}
                            />
                            
                            {/* Search results dropdown */}
                            {showResults && (
                                <div 
                                    ref={resultsRef}
                                    className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                                >
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleUserSelect(user)}
                                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <img 
                                                    src={user.avatar} 
                                                    alt={user.username}
                                                    className="w-8 h-8 rounded-full mr-3" 
                                                />
                                                <div>
                                                    <div className="font-medium">{user.username}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.firstName} {user.lastName} • {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative min-w-[150px]">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>This month</option>
                                <option>This year</option>
                                <option>All time</option>
                            </select>
                        </div>

                        <div className="relative min-w-[150px]">
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
                            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>

                    {/* Filter tags */}
                    {isFiltered && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {appliedFilters.searchTerm && (
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    Search: {appliedFilters.searchTerm}
                                    <button 
                                        onClick={() => clearFilter('searchTerm')}
                                        className="ml-2 text-blue-500 hover:text-blue-700"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            )}
                            
                            {appliedFilters.status !== 'All status' && (
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    Status: {appliedFilters.status}
                                    <button 
                                        onClick={() => clearFilter('status')}
                                        className="ml-2 text-green-500 hover:text-green-700"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            )}
                            
                            {appliedFilters.dateRange !== 'Last 7 days' && (
                                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    Date: {appliedFilters.dateRange}
                                    <button 
                                        onClick={() => clearFilter('dateRange')}
                                        className="ml-2 text-purple-500 hover:text-purple-700"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            )}
                            
                            <button 
                                onClick={clearAllFilters}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                                    <p className="text-gray-600">New users (Last 7 days)</p>
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

export default AdminUserPage;