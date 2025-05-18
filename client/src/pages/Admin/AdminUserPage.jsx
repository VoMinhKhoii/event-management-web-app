/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMoreVertical, FiX } from 'react-icons/fi';
import AdminNavPane from '../../components/AdminNavPane';

const AdminUserPage = () => {
    const navigate = useNavigate();
    
    // Constants for default filter values
    const DEFAULT_FILTERS = {
        searchTerm: '',
        dateRange: 'All time',
        status: 'All status'
    };
    
    // Input filters (change when user interacts with form)
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('Last 7 days');
    const [statusFilter, setStatusFilter] = useState('All status');
    
    // Applied filters (change when Search button is clicked)
    const [appliedFilters, setAppliedFilters] = useState({...DEFAULT_FILTERS});
    
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);
    
    // State for search suggestions
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [stats, setStats] = useState({
        totalUsers: 0,
        newUsersLastWeek: 0
    });
    const [activeMenu, setActiveMenu] = useState('users');
    const [isLoading, setIsLoading] = useState(true);
    
    // Refs for dropdown
    const resultsRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch real users data on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:8800/api/users', {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                
                const userData = await response.json();
                setUsers(userData);
                setFilteredUsers(userData);
                
                // Calculate stats
                const totalUsers = userData.length;
                
                // Calculate users created in the last 7 days
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                
                const newUsers = userData.filter(user => {
                    const userCreatedAt = new Date(user.createdAt);
                    return userCreatedAt >= lastWeek;
                }).length;
                
                setStats({
                    totalUsers,
                    newUsersLastWeek: newUsers
                });
                
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUsers();
    }, []);
    
    // Apply filters when applied filters change
    useEffect(() => {
        if (isFiltered) {
            const filtered = applyAllFilters();
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [appliedFilters, users, isFiltered]);

    // Update filtered results without applying filters to the main view
    const updateFilteredResults = (term = searchTerm) => {
        if (!term.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const searchLower = term.trim().toLowerCase();
        
        // Search for exact username matches first
        const exactUsernameMatches = users.filter(user => 
            (user.username || '').toLowerCase() === searchLower
        );
        
        // Then search for usernames containing the search string
        const usernameMatches = users.filter(user => 
            (user.username || '').toLowerCase().includes(searchLower) &&
            (user.username || '').toLowerCase() !== searchLower
        );
        
        // Then search for full names
        const nameMatches = users.filter(user => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().trim();
            return fullName.includes(searchLower) && 
                   !((user.username || '').toLowerCase().includes(searchLower));
        });
        
        // Finally, search for email addresses
        const emailMatches = users.filter(user => {
            const email = (user.email || '').toLowerCase();
            return email.includes(searchLower) && 
                   !((user.username || '').toLowerCase().includes(searchLower)) &&
                   !(`${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().trim().includes(searchLower));
        });
        
        // Combine all results - no limit on number of results
        const results = [...exactUsernameMatches, ...usernameMatches, ...nameMatches, ...emailMatches];
        setSearchResults(results);
        setShowResults(results.length > 0);
    };

    // Handle search when user types each character
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        if (selectedUser) {
            setSelectedUser(null);
        }
        
        updateFilteredResults(term);
    };

    // Handle when user selects a search result
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        // Prefer to display username
        setSearchTerm(user.username || 
            (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email));
        setShowResults(false);
    };

    // Helper function to filter by date range
    const applyDateFilter = (users, dateRange) => {
        if (!dateRange || dateRange === DEFAULT_FILTERS.dateRange) return users;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch(dateRange) {
            case 'Last 7 days': {
                const last7Days = new Date(today);
                last7Days.setDate(last7Days.getDate() - 7);
                return users.filter(user => {
                    const userCreatedAt = new Date(user.createdAt);
                    return userCreatedAt >= last7Days;
                });
            }
            case 'Last 30 days': {
                const last30Days = new Date(today);
                last30Days.setDate(last30Days.getDate() - 30);
                return users.filter(user => {
                    const userCreatedAt = new Date(user.createdAt);
                    return userCreatedAt >= last30Days;
                });
            }
            case 'This month': {
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                return users.filter(user => {
                    const userCreatedAt = new Date(user.createdAt);
                    return userCreatedAt >= firstDayOfMonth;
                });
            }
            case 'This year': {
                const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                return users.filter(user => {
                    const userCreatedAt = new Date(user.createdAt);
                    return userCreatedAt >= firstDayOfYear;
                });
            }
            default:
                return users;
        }
    };

    // Apply all filters to the users list
    const applyAllFilters = () => {
        if (!isFiltered) return users;
        
        let result = [...users];
        
        // Filter by search term
        if (appliedFilters.searchTerm) {
            if (selectedUser) {
                result = result.filter(user => user._id === selectedUser._id);
            } else {
                const term = appliedFilters.searchTerm.trim().toLowerCase();
                result = result.filter(user => {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().trim();
                    const username = (user.username || '').toLowerCase();
                    const email = (user.email || '').toLowerCase();
                    return fullName.includes(term) || 
                           username.includes(term) ||
                           email.includes(term);
                });
            }
        }
        
        // Filter by date range - use the helper function
        if (appliedFilters.dateRange && appliedFilters.dateRange !== DEFAULT_FILTERS.dateRange) {
            result = applyDateFilter(result, appliedFilters.dateRange);
        }
        
        // Filter by status
        if (appliedFilters.status && appliedFilters.status !== DEFAULT_FILTERS.status) {
            const statusValue = appliedFilters.status.toLowerCase();
            result = result.filter(user => 
                (user.status || '').toLowerCase() === statusValue
            );
        }
        
        return result;
    };

    // Handle when user clicks the Search button - apply all filters
    const handleSearchButtonClick = () => {
        const newFilters = {
            // Prefer using username if available, otherwise use search term value
            searchTerm: selectedUser ? selectedUser.username : searchTerm,
            dateRange: dateRange,
            status: statusFilter
        };
        
        setAppliedFilters(newFilters);
        setIsFiltered(true);
        setShowResults(false);
    };

    // Clear all filters
    const clearAllFilters = () => {
        // Reset form inputs
        setSearchTerm('');
        setSelectedUser(null);
        setDateRange(DEFAULT_FILTERS.dateRange);
        setStatusFilter(DEFAULT_FILTERS.status);
        
        // Reset applied filters
        setAppliedFilters({...DEFAULT_FILTERS});
        setIsFiltered(false);
    };

    // Clear individual filter 
    const clearFilter = (filterType) => {
        // Create a copy of current filters and remove the specific filter
        const updatedFilters = { ...appliedFilters };
        delete updatedFilters[filterType]; // Remove filter completely instead of setting default value
        
        // Update form inputs based on filter type
        switch(filterType) {
            case 'searchTerm':
                setSearchTerm('');
                setSelectedUser(null);
                break;
            case 'dateRange':
                setDateRange(DEFAULT_FILTERS.dateRange);
                break;
            case 'status':
                setStatusFilter(DEFAULT_FILTERS.status);
                break;
        }
        
        setAppliedFilters(updatedFilters);
        
        // Check if any filters are still active - base it on whether any filters exist
        const hasActiveFilters = Object.keys(updatedFilters).length > 0;
        setIsFiltered(hasActiveFilters);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fix the navigation handler
    const handleNavigation = (path, menu) => {
        setActiveMenu(menu);
        navigate(path);
    };
    
    // Add the missing date formatting function
    const formatUserDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    return (
        <div className="flex h-screen bg-gray-50 font-[Poppins]">
            {/* Sidebar */}
            <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            {/* Main Content */}
            <div className="flex-1 overflow-auto px-4 py-6">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-6">User Management</h1>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-wrap items-center mb-6 gap-3">
                        {/* Search box with dropdown */}
                        <div className="relative flex-grow min-w-[200px]">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search users..."
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={handleSearch}
                                onFocus={() => {
                                    if (searchTerm) updateFilteredResults(searchTerm);
                                }}
                                autoComplete="off"
                            />
                            
                            {/* Dropdown for search results */}
                            {showResults && (
                                <ul
                                    ref={resultsRef}
                                    className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto border border-gray-200"
                                >
                                    {searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <li 
                                                key={user._id}
                                                className="border-b border-gray-100 last:border-b-0"
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                <div className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                                                    <div className="flex-shrink-0">
                                                        <img 
                                                            src={user.avatar || 'https://via.placeholder.com/40'} 
                                                            alt={user.username || 'User'} 
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user.username || "Unknown user"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {user.firstName && user.lastName 
                                                                ? `${user.firstName} ${user.lastName}` 
                                                                : "No name"} • {user.email}
                                                        </p>
                                                        {user.createdAt && (
                                                            <p className="text-xs text-gray-500">
                                                                Joined: {formatUserDate(user.createdAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-4 text-center text-gray-500">
                                            No users found matching "{searchTerm}"
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            onClick={handleSearchButtonClick}
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
                                    <button onClick={() => clearFilter('searchTerm')} className="ml-2 text-blue-500 hover:text-blue-700">
                                        <FiX />
                                    </button>
                                </div>
                            )}
                            
                            {appliedFilters.dateRange  && (
                                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    Date: {appliedFilters.dateRange}
                                    <button onClick={() => clearFilter('dateRange')} className="ml-2 text-purple-500 hover:text-purple-700">
                                        <FiX />
                                    </button>
                                </div>
                            )}
                            
                            {appliedFilters.status  && (
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
                            
                            <button 
                                onClick={clearAllFilters}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-full bg-[#EFF6FF]">
                                    <img src="/src/assets/total-users.png" alt="Users" className="h-6 w-6" />
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
                                    <img src="/src/assets/new-user.png" alt="New Users" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{stats.newUsersLastWeek}</h2>
                                    <p className="text-gray-600">Last 7 days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            First Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            Last Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center">
                                                <p className="text-gray-500">Loading users...</p>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 flex-shrink-0">
                                                            <img
                                                                className="h-8 w-8 rounded-full"
                                                                src={user.avatar || 'https://via.placeholder.com/40'}
                                                                alt={user.username || 'User'}
                                                            />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.username || "User"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.firstName || "-"}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.lastName || "-"}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email || "-"}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.status === 'online' 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : user.status === 'away'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Offline'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <FiMoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-700" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center">
                                                <p className="text-gray-500">No users found matching your criteria.</p>
                                                <button 
                                                    onClick={clearAllFilters}
                                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Clear all filters
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserPage;