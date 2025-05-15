/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMoreVertical, FiEye, FiEdit, FiTrash2, FiX } from 'react-icons/fi';

// Import custom icons
import totalEvents from '../../assets/total-events.png';
import rsvpRate from '../../assets/rsvp-rate.png';
import AdminNavPane from '../../components/AdminNavPane';  

const AdminEventsPage = () => {
    const navigate = useNavigate();
    
    // Individual input filter state variables (like AdminUserPage)
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All categories');
    const [dateRangeFilter, setDateRangeFilter] = useState('All time');
    
    // Applied filter values (only change when "Search" is clicked)
    const [appliedFilters, setAppliedFilters] = useState({});
    
    const [isFiltered, setIsFiltered] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
        totalEvents: 0,
        averageRsvpRate: 0
    });
    const [deleteEvent, setDeleteEvent] = useState(0);
    const [eventRsvpRates, setEventRsvpRates] = useState({});


    const [activeMenu, setActiveMenu] = useState('events');
    const [isLoading, setIsLoading] = useState(false);
    const [isRsvpLoading, setIsRsvpLoading] = useState(false);
    
    // For search dropdown functionality
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    // Fetch real events data on component mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:8800/api/events', {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                
                const eventData = await response.json();
                setEvents(eventData);
                setFilteredEvents(eventData);
                
                // Calculate stats
                const totalEvents = eventData.length;
                
                // Set stats
                setStats(prevStats => ({
                    ...prevStats,
                    totalEvents
                }));
                
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRSVP = async () => {
            try {
                const response = await fetch(`http://localhost:8800/api/events/invitations-get`);

                const data = await response.json();
                if (!response.ok) throw new Error('Failed to fetch invitations');

                const dataArray = data.invitations || [];

                // Calculate RSVP rate
                const acceptedCount = dataArray.filter(inv => inv.status === 'approved').length;
                const totalRespondedCount = dataArray.filter(inv => inv.status !== 'invited').length;
                console.log("Data: ", dataArray);
                console.log('Accepted Count:', acceptedCount);
                console.log('Total Responded Count:', totalRespondedCount);

                if (totalRespondedCount === 0) {
                    setStats(prevStats => ({
                        ...prevStats, averageRsvpRate : 0
                    }));
                } else {
                    const calculatedRate = Math.round((acceptedCount / totalRespondedCount) * 100);
                    setStats(prevStats => ({
                        ...prevStats, averageRsvpRate : calculatedRate
                    }));
                }

            } catch (error) {
                console.error('Error fetching RSVP:', error);
            }
        }
        fetchEvents();
        fetchRSVP();
        
    }, [deleteEvent]);

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
        
        // Filter by search term (only if property exists)
        if ('searchTerm' in appliedFilters && appliedFilters.searchTerm) {
            const term = appliedFilters.searchTerm.toLowerCase();
            result = result.filter(event => 
                event.title?.toLowerCase().includes(term)
            );
        }
        
        // Filter by category (only if property exists)
        if ('category' in appliedFilters && appliedFilters.category !== 'All categories') {
            result = result.filter(event => 
                event.eventType && 
                event.eventType.toLowerCase() === appliedFilters.category.toLowerCase()
            );
        }
        
        // Filter by date range (only if property exists)
        if ('dateRange' in appliedFilters && appliedFilters.dateRange !== 'All time') {
            const today = new Date();
            
            switch(appliedFilters.dateRange) {
                case 'Last 7 days': {
                    const last7Days = new Date();
                    last7Days.setDate(today.getDate() - 7);
                    const endOfToday = new Date(today);
                    endOfToday.setHours(23, 59, 59, 999);
    
                    result = result.filter(event => {
                    if (!event.startDate) return false;
                    const eventDate = new Date(event.startDate);
                    return eventDate >= last7Days && eventDate <= endOfToday;
                });
                    break;
                }
                case 'Last 30 days': {
                    const last30Days = new Date();
                    last30Days.setDate(today.getDate() - 30);
                    result = result.filter(event => {
                        if (!event.startDate) return false;
                        const eventDate = new Date(event.startDate);
                        return eventDate >= last30Days && eventDate <= new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    });
                    break;
                }
                case 'This month': {
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                    
                    result = result.filter(event => {
                        if (!event.startDate) return false;
                        const eventDate = new Date(event.startDate);
                        return eventDate >= firstDayOfMonth && eventDate < firstDayOfNextMonth;
                    });
                    break;
                }
                case 'This year': {
                    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                    const firstDayOfNextYear = new Date(today.getFullYear() + 1, 0, 1);
                    result = result.filter(event => {
                        if (!event.startDate) return false;
                        const eventDate = new Date(event.startDate);
                        return eventDate >= firstDayOfYear && eventDate < firstDayOfNextYear;
                    });
                    break;
                }
            }
        }
        
        return result;
    };

    // Update search results for dropdown
    const updateSearchResults = (term) => {
        if (!term || term.trim() === '') {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        
        const term_lower = term.toLowerCase();
        const results = events.filter(event =>
            (event.title && event.title.toLowerCase().includes(term_lower))
        );
        
        setSearchResults(results);
        setShowResults(results.length > 0);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        // Reset selectedEvent if user changes text
        if (selectedEvent && selectedEvent.title !== term) {
            setSelectedEvent(null);
        }
        
        updateSearchResults(term);
    };

    // Handle category filter change
    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value);
    };

    // Handle date range filter change
    const handleDateRangeChange = (e) => {
        setDateRangeFilter(e.target.value);
    };

    // Handle event selection from dropdown
    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setSearchTerm(event.title);
        setShowResults(false);
    };

    // Handle search button click
    const handleSearch = () => {
        const effectiveSearchTerm = selectedEvent ? selectedEvent.title : searchTerm;
        
        const newFilters = {
            searchTerm: effectiveSearchTerm,
            category: categoryFilter,
            dateRange: dateRangeFilter
        };
        
        setAppliedFilters(newFilters);
        setIsFiltered(true);
        setShowResults(false);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedEvent(null);
        setCategoryFilter('All categories');
        setDateRangeFilter('All time');
        
        const defaultFilters = {};  // Empty object with no default filters
        
        setAppliedFilters(defaultFilters);
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
                setSelectedEvent(null);
                break;
            case 'category':
                setCategoryFilter('All categories');
                break;
            case 'dateRange':
                setDateRangeFilter('All time');
                break;
        }
        
        setAppliedFilters(updatedFilters);
        
        // Check if any filters are still active
        const hasActiveFilters = Object.keys(updatedFilters).length > 0;
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
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const deleteResponse = await fetch(`http://localhost:8800/api/events/${eventId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            //Don't need error testing for this since an event can't be deleted if it doesn't exist
        

            setDeleteEvent(prev => prev + 1);
    
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event. Please try again.');
        }
    };

    const handleEventRsvp = async (eventId) => {

        try {
            const response = await fetch(`http://localhost:8800/api/events/invitations-get?eventId=${eventId}`);
    
            const data = await response.json();
            if (!response.ok) throw new Error('Failed to fetch invitations');
    
            const dataArray = data.invitations || [];
    
            // Calculate RSVP rate
            const acceptedCount = dataArray.filter(inv => inv.status === 'approved').length;
            const totalRespondedCount = dataArray.filter(inv => inv.status !== 'invited').length;
    
            if (totalRespondedCount === 0) {
                return 0;
            } else {
                const calculatedRate = Math.round((acceptedCount / totalRespondedCount) * 100);
                return calculatedRate;
            }
            
        } catch (error) {
            console.error('Error fetching event RSVP:', error);
        }
    }

    // Fetch all RSVP rates whenever events change
    useEffect(() => {
    if (events.length === 0) return;

    const fetchAllRsvpRates = async () => {
        setIsRsvpLoading(true);
        const rates = {};
        for (const event of events) {
        try {
            const rate = await handleEventRsvp(event._id);
            rates[event._id] = rate;
        } catch {
            rates[event._id] = 0;
        }
        }
        setEventRsvpRates(rates);
        setIsRsvpLoading(false);
    };

    fetchAllRsvpRates();
    }, [events, stats]);

    

    return (
        <div className="flex h-screen bg-gray-50 font-[Poppins]">
            {/* Sidebar */}
            <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            {/* Main Content */}
            <div className="flex-1 overflow-auto px-4 py-6">
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
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onClick={() => {
                                    if (searchTerm && !selectedEvent) {
                                        updateSearchResults(searchTerm);
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
                                    {searchResults.length > 0 ? (
                                        searchResults.map((event) => (
                                            <div
                                                key={event._id}
                                                onClick={() => handleEventSelect(event)}
                                                className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 mr-3">
                                                        <img 
                                                            src={event.image || 'https://via.placeholder.com/40'} 
                                                            alt={event.title || 'Event'} 
                                                            className="h-10 w-10 rounded-md object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{event.title}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {event.eventType 
                                                                ? event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1) 
                                                                : 'N/A'} • {new Date(event.startDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-gray-500">
                                            No events found matching "{searchTerm}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative min-w-[150px]">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                value={categoryFilter}
                                onChange={handleCategoryChange}
                            >
                                <option value="All categories">All Categories</option>
                                <option value="Tech">Tech</option>
                                <option value="Business">Business</option>
                                <option value="Game">Game</option>
                                <option value="Music">Music</option>
                                <option value="Sports">Sports</option>
                            </select>
                        </div>

                        <div className="relative min-w-[150px]">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                value={dateRangeFilter}
                                onChange={handleDateRangeChange}
                            >
                                <option value="All time">All time</option>
                                <option value="Last 7 days">Last 7 days</option>
                                <option value="Last 30 days">Last 30 days</option>
                                <option value="This month">This month</option>
                                <option value="This year">This year</option>
                            </select>
                        </div>

                        <button
                            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>

                    {/* Filter tags - only show if the property exists */}
                    {isFiltered && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {'searchTerm' in appliedFilters && appliedFilters.searchTerm && (
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
                            
                            {'category' in appliedFilters && (
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
                            
                            {'dateRange' in appliedFilters && (
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
                                        <tr key={event._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {event.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {event.eventType 
                                                ? event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1) 
                                                : 'N/A'}
                                            </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {event.curAttendees ? event.curAttendees : 0} / {event.maxAttendees || 'Unlimited'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 flex-shrink-0">
                                                        <img
                                                            className="h-8 w-8 rounded-full"
                                                            src={event.organizer?.avatar || '/images/avatar.png'}
                                                            alt={event.organizer?.username || 'Organizer'}
                                                            onError={(e) => { e.target.src = '/images/avatar.png' }}
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {event.organizer?.username || 'Unknown'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {isRsvpLoading ? (
                                                        <span className="text-sm text-gray-500">
                                                            Loading...
                                                        </span> ) : 
                                                    (eventRsvpRates[event._id] !== undefined && eventRsvpRates[event._id] !== 0) ? (
                                                        <>
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                                            <div 
                                                                className={`h-2.5 rounded-full
                                                                ${
                                                                    eventRsvpRates[event._id] >= 80 ? 'bg-green-500' :
                                                                    eventRsvpRates[event._id] >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`} 
                                                                style={{ width: `${Math.min(eventRsvpRates[event._id] || 0, 100)}%` }}
                                                            ></div>
                                                            </div>
                                                            <span className="text-sm text-gray-500">
                                                                {eventRsvpRates[event._id]}
                                                            </span> 
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(event.startDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button 
                                                        onClick={() => handleViewEvent(event._id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <FiEye className="h-5 w-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditEvent(event._id)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        <FiEdit className="h-5 w-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteEvent(event._id)}
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