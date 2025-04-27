import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ events = [], onSearch, currentFilters = {} }) => {
    const [searchTerm, setSearchTerm] = useState(currentFilters.searchTerm || '');
    const [categoryFilter, setCategoryFilter] = useState(currentFilters.category || '');
    const [dateFilter, setDateFilter] = useState(currentFilters.date || '');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();
    const resultsRef = useRef(null);
    const inputRef = useRef(null);

    // Update filtered results without applying filters to the main view
    const updateFilteredResults = (term = searchTerm) => {
        if (term.trim() === '') {
            setFilteredEvents([]);
            setShowResults(false);
            return;
        }
        
        // Filter by search term only for the dropdown
        const filtered = events.filter(event => 
            event.title.toLowerCase().includes(term.toLowerCase())
        );
        
        setFilteredEvents(filtered);
        setShowResults(filtered.length > 0);
    };

    // Handle search when user types each character
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedEvent(null); // Clear selected event when typing
        updateFilteredResults(value);
    };
    
    // Handle category filter change
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setCategoryFilter(value);
    };
    
    // Handle date filter change
    const handleDateChange = (e) => {
        const value = e.target.value;
        setDateFilter(value);
    };
    
    // Handle when user selects a search result
    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setSearchTerm(event.title);
        setShowResults(false);
    };
    
    // Handle when user clicks the Search button - apply all filters
    const handleSearchButtonClick = () => {
        // Always use onSearch to filter events on homepage
        if (onSearch) {
            // If we have a selected event, use its title as the search term
            const effectiveSearchTerm = selectedEvent ? selectedEvent.title : searchTerm;
            onSearch(effectiveSearchTerm, categoryFilter, dateFilter);
        }
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync with HomePage's filters
    useEffect(() => {
        setSearchTerm(currentFilters.searchTerm || '');
        setCategoryFilter(currentFilters.category || '');
        setDateFilter(currentFilters.date || '');
        // Clear selected event if search term changes externally
        if (selectedEvent && selectedEvent.title !== currentFilters.searchTerm) {
            setSelectedEvent(null);
        }
    }, [currentFilters]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-8">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col md:flex-row gap-3 md:gap-4">
                {/* Search input with dropdown results */}
                <div className="relative w-full">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search events"
                        value={searchTerm}
                        onChange={handleSearch}
                        onClick={() => {
                            if (searchTerm && !selectedEvent) {
                                updateFilteredResults();
                                setShowResults(true);
                            }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm md:text-base"
                    />
                    
                    {/* Show the result */}
                    {showResults && filteredEvents.length > 0 && (
                        <div 
                            ref={resultsRef}
                            className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                        >
                            {filteredEvents.map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => handleEventSelect(event)}
                                    className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-sm text-gray-500">{event.date} • {event.location}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Filter controls - stack on mobile, row on desktop with full width */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
                    {/* Category dropdown - fills available space with min-width */}
                    <div className="relative flex-1 min-w-[160px]">
                        <select 
                            className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm md:text-base"
                            value={categoryFilter}
                            onChange={handleCategoryChange}
                        >
                            <option value="">All Categories</option>
                            <option value="Tech">Tech</option>
                            <option value="Business">Business</option>
                            <option value="Game">Game</option>
                            <option value="Music">Music</option>
                            <option value="Sports">Sports</option>
                        </select>
                    </div>
                    
                    {/* Date dropdown - fills available space with min-width */}
                    <div className="relative flex-1 min-w-[140px]">
                        <select 
                            className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm md:text-base"
                            value={dateFilter}
                            onChange={handleDateChange}
                        >
                            <option value="">Any Date</option>
                            <option value="today">Today</option>
                            <option value="tomorrow">Tomorrow</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                    
                    {/* Search button - fills available space */}
                    <button 
                        onClick={handleSearchButtonClick}
                        className="bg-[#569DBA] text-white py-2 px-6 rounded-lg hover:bg-[#4a8ba6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#569DBA] focus:ring-offset-2 flex-1 min-w-[100px] whitespace-nowrap"
                    >
                        <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;