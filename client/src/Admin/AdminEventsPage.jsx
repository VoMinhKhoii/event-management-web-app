/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMoreVertical, FiEye, FiEdit, FiTrash2, FiX } from 'react-icons/fi';

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
import totalEvents from '../assets/total-events.png';
import rsvpRate from '../assets/rsvp-rate.png';
import AdminNavPane from '../components/AdminNavPane';

const AdminEventsPage = () => {
    const navigate = useNavigate();
    
    // Input filter values (change when user interacts with the form)
    const [inputFilters, setInputFilters] = useState({
        searchTerm: '',
        category: 'All categories',
        dateRange: 'Last 7 days'
    });
    
    // Applied filter values (only change when "Search" is clicked)
    const [appliedFilters, setAppliedFilters] = useState({
        searchTerm: '',
        category: 'All categories',
        dateRange: 'Last 7 days'
    });
    
    const [isFiltered, setIsFiltered] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
        totalEvents: 324,
        averageRsvpRate: 78 // percentage
    });
    const [activeMenu, setActiveMenu] = useState('events');
    
    // For search dropdown functionality
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    // Simulating data fetch on component mount
    useEffect(() => {
        // This would be an API call in a real application
        const mockEvents = [
            {
                id: 1,
                name: "Tech Summit 2025",
                category: "Conference",
                attendees: 45,
                maxAttendees: 120,
                organizer: "Vo Minh Khoi",
                organizerAvatar: "/images/avatar.png",
                rsvpRate: 82, // percentage
                date: "Mar 15, 2025"
            },
            {
                id: 2,
                name: "Design Workshop 2025",
                category: "Workshop",
                attendees: 28,
                maxAttendees: 60,
                organizer: "Jane Smith",
                organizerAvatar: "/images/avatar1.png",
                rsvpRate: 93, // percentage
                date: "Apr 5, 2025"
            },
            {
                id: 3,
                name: "Networking Mixer",
                category: "Networking",
                attendees: 55,
                maxAttendees: 100,
                organizer: "Vo Minh Khoi",
                organizerAvatar: "/images/avatar.png",
                rsvpRate: 67, // percentage
                date: "May 20, 2025"
            },
            {
                id: 4,
                name: "AI Conference 2025",
                category: "Conference",
                attendees: 75,
                maxAttendees: 150,
                organizer: "Alex Johnson",
                organizerAvatar: "/images/avatar.png",
                rsvpRate: 72, // percentage
                date: "Jun 10, 2025"
            },
            {
                id: 5,
                name: "Startup Pitch Day",
                category: "Workshop",
                attendees: 40,
                maxAttendees: 80,
                organizer: "Sarah Williams",
                organizerAvatar: "/images/avatar.png",
                rsvpRate: 77, // percentage
                date: "Jul 25, 2025"
            },
            {
                id: 6,
                name: "Game Development Summit",
                category: "Conference",
                attendees: 62,
                maxAttendees: 100,
                organizer: "Mike Chen",
                organizerAvatar: "/images/avatar.png",
                rsvpRate: 85, // percentage
                date: "Aug 12, 2025"
            },
            {
                id: 7,
                name: "UX Design Bootcamp",
                category: "Workshop",
                attendees: 32,
                maxAttendees: 40,
                organizer: "Emily Taylor",
                organizerAvatar: "/images/avatar.png",
                rsvpRate: 90, // percentage
                date: "Sep 8, 2025"
            },
            {
                id: 8,
                name: "Web3 Hackathon",
                category: "Hackathon",
                attendees: 85,
                maxAttendees: 120,
                organizer: "Vo Minh Khoi",
                organizerAvatar: "/images/avatar.png",
                rsvpRate: 71, // percentage
                date: "Oct 15, 2025"
            }
        ];

        setEvents(mockEvents);
        setFilteredEvents(mockEvents); // Initialize filtered events with all events
    }, []);

    // Apply filters when APPLIED filters change (not when input filters change)
    useEffect(() => {
        if (isFiltered) {
            const filtered = applyAllFilters();
            setFilteredEvents(filtered);
        } else {
            setFilteredEvents(events);
        }
    }, [appliedFilters, events, isFiltered]);

    // Apply all filters to the events list
    const applyAllFilters = () => {
        if (!isFiltered) return events;
        
        let result = [...events];
        
        // Filter by search term
        if (appliedFilters.searchTerm) {
            const term = appliedFilters.searchTerm.toLowerCase();
            result = result.filter(event => 
                event.name.toLowerCase().includes(term) ||
                event.category.toLowerCase().includes(term) ||
                event.organizer.toLowerCase().includes(term)
            );
        }
        
        // Filter by category
        if (appliedFilters.category && appliedFilters.category !== 'All categories') {
            result = result.filter(event => event.category === appliedFilters.category);
        }
        
        // Filter by date range
        if (appliedFilters.dateRange && appliedFilters.dateRange !== 'All time') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            switch(appliedFilters.dateRange) {
                case 'Last 7 days': {
                    const last7Days = new Date(today);
                    last7Days.setDate(last7Days.getDate() - 7);
                    result = result.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate >= last7Days && eventDate <= today;
                    });
                    break;
                }
                case 'Last 30 days': {
                    const last30Days = new Date(today);
                    last30Days.setDate(last30Days.getDate() - 30);
                    result = result.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate >= last30Days && eventDate <= today;
                    });
                    break;
                }
                case 'This month': {
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    result = result.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate >= firstDayOfMonth && eventDate <= today;
                    });
                    break;
                }
                case 'This year': {
                    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                    result = result.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate >= firstDayOfYear && eventDate <= today;
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
        const results = events.filter(event =>
            event.name.toLowerCase().includes(term_lower) ||
            event.category.toLowerCase().includes(term_lower) ||
            event.organizer.toLowerCase().includes(term_lower)
        ).slice(0, 5); // Limit to 5 results
        
        setSearchResults(results);
        setShowResults(results.length > 0);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setInputFilters({...inputFilters, searchTerm: term});
        
        if (selectedEvent && selectedEvent.name !== term) {
            setSelectedEvent(null);
        }
        
        updateSearchResults(term);
    };

    // Handle category filter change
    const handleCategoryChange = (e) => {
        setInputFilters({...inputFilters, category: e.target.value});
    };

    // Handle date range filter change
    const handleDateRangeChange = (e) => {
        setInputFilters({...inputFilters, dateRange: e.target.value});
    };

    // Handle event selection from dropdown
    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setInputFilters({...inputFilters, searchTerm: event.name});
        setShowResults(false);
    };

    // Handle search button click
    const handleSearch = () => {
        // Apply input filters when search button is clicked
        setAppliedFilters({...inputFilters});
        setIsFiltered(true);
    };

    // Clear all filters
    const clearAllFilters = () => {
        const defaultFilters = {
            searchTerm: '',
            category: 'All categories',
            dateRange: 'Last 7 days'
        };
        
        setInputFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        setIsFiltered(false);
        setSelectedEvent(null);
    };

    // Clear individual filter
    const clearFilter = (filterType) => {
        const defaultValue = filterType === 'searchTerm' ? '' : 
                            filterType === 'category' ? 'All categories' : 'Last 7 days';
        
        const updatedFilters = {
            ...appliedFilters,
            [filterType]: defaultValue
        };
        
        // Update both input and applied filters
        setInputFilters(updatedFilters);
        setAppliedFilters(updatedFilters);
        
        // If searchTerm is cleared, also clear selectedEvent
        if (filterType === 'searchTerm') {
            setSelectedEvent(null);
        }
        
        // Check if any filters are still active
        const hasActiveFilters = 
            updatedFilters.searchTerm !== '' || 
            updatedFilters.category !== 'All categories' || 
            updatedFilters.dateRange !== 'Last 7 days';
            
        setIsFiltered(hasActiveFilters);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target) && 
                searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Existing handlers
    const handleViewEvent = (eventId) => {
        console.log('View event:', eventId);
        navigate(`/event/${eventId}`);
    };

    const handleEditEvent = (eventId) => {
        console.log('Edit event:', eventId);
        // Navigate to event edit page
    };

    const handleDeleteEvent = (eventId) => {
        console.log('Delete event:', eventId);
        // Show delete confirmation dialog
    };

    return (
        <div className="flex h-screen bg-gray-50 font-[Poppins]">
            {/* Sidebar */}
            <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            {/* Main Content */}
            <div className="flex-1 overflow-auto px-6 py-8">
                <div className="flex flex-col">
                    {/* Search and Filter Bar */}
                    <div className="flex flex-wrap items-center mb-6 gap-4">
                        <div className="relative flex-grow min-w-[200px]">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search events..."
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={inputFilters.searchTerm}
                                onChange={handleSearchChange}
                                onClick={() => {
                                    if (inputFilters.searchTerm && !selectedEvent) {
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
                                    {searchResults.map((event) => (
                                        <div
                                            key={event.id}
                                            onClick={() => handleEventSelect(event)}
                                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className="font-medium">{event.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {event.category} • {event.date}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative min-w-[150px]">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                value={inputFilters.category}
                                onChange={handleCategoryChange}
                            >
                                <option>All categories</option>
                                <option>Conference</option>
                                <option>Workshop</option>
                                <option>Networking</option>
                                <option>Hackathon</option>
                                <option>Seminar</option>
                            </select>
                        </div>

                        <div className="relative min-w-[150px]">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                value={inputFilters.dateRange}
                                onChange={handleDateRangeChange}
                            >
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>This month</option>
                                <option>This year</option>
                                <option>All time</option>
                            </select>
                        </div>

                        <button
                            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            
                            {appliedFilters.category !== 'All categories' && (
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    Category: {appliedFilters.category}
                                    <button 
                                        onClick={() => clearFilter('category')}
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
                                    <img src={totalEvents} alt="Total Events" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{stats.totalEvents.toLocaleString()}</h2>
                                    <p className="text-gray-600">Total events</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-full bg-[#EFF6FF]">
                                    <img src={rsvpRate} alt="RSVP Rate" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{stats.averageRsvpRate}%</h2>
                                    <p className="text-gray-600">Average RSVP rate</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Table */}
                    <div className="bg-white shadow-sm rounded-md border border-gray-200 overflow-x-auto">
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">
                                {isFiltered 
                                    ? `Filtered Events (${filteredEvents.length})` 
                                    : `All Events (${events.length})`}
                            </h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                + Add New Event
                            </button>
                        </div>
                        
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Event Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Attendees
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Organizer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        RSVP Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {event.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {event.attendees} / {event.maxAttendees}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 flex-shrink-0">
                                                        <img
                                                            className="h-8 w-8 rounded-full"
                                                            src={event.organizerAvatar}
                                                            alt={event.organizer}
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {event.organizer}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                                        <div 
                                                            className={`h-2.5 rounded-full ${
                                                                event.rsvpRate >= 80 ? 'bg-green-500' : 
                                                                event.rsvpRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`} 
                                                            style={{ width: `${event.rsvpRate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-700">{event.rsvpRate}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {event.date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button 
                                                        onClick={() => handleViewEvent(event.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <FiEye className="h-5 w-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditEvent(event.id)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        <FiEdit className="h-5 w-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <FiTrash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center">
                                            <p className="text-gray-500">No events found matching your criteria.</p>
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
    );
};

export default AdminEventsPage;