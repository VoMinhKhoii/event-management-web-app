/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import EventCard from '../../components/EventCard.jsx';
import NavPane from '../../components/NavPane.jsx';
import SearchBar from '../../components/SearchBar.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    date: ''
  });
  const [isFiltered, setIsFiltered] = useState(false);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); // Store filtered events
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);


    // Fetch events with caching - similar to AdminDashboard
  const fetchEvents = async (forceRefresh = false) => {
    setLoading(true);
  
    // Try to get cached data first
    const cachedData = localStorage.getItem('homePageEvents');
    const cacheTimestamp = localStorage.getItem('homePageEventsTimestamp');
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds
  
    // Use cached data if it exists, is not expired, and force refresh is not requested
    if (
        cachedData &&
        cacheTimestamp &&
        Date.now() - parseInt(cacheTimestamp) < THIRTY_MINUTES &&
        !forceRefresh
      ) {
        const events = JSON.parse(cachedData);
        setEvents(events);
        setFilteredEvents(isFiltered ? applyAllFilters(events) : events); // Apply any current filters
        setLastUpdated(new Date(parseInt(cacheTimestamp)));
        setLoading(false);
        return; // Exit early - no need to fetch
      }
      try {
        // Fetch fresh data
        const response = await fetch('http://localhost:8800/api/events', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
  
        const eventData = await response.json();
        
        // Update all events
        setEvents(eventData);
        // Apply any filters to the new data
        setFilteredEvents(isFiltered ? applyAllFilters(eventData) : eventData); // Apply filters to the new data
        
        // Cache the data
        localStorage.setItem('homePageEvents', JSON.stringify(eventData));
        localStorage.setItem('homePageEventsTimestamp', Date.now().toString());
        setLastUpdated(new Date());
  
      } catch (error) {
        console.error("Error fetching events:", error);
        
        // If there's cached data, use it as fallback on error
        if (cachedData) {
          const events = JSON.parse(cachedData);
          setEvents(events);
          setFilteredEvents(applyAllFilters(events));
          setLastUpdated(new Date(parseInt(cacheTimestamp)));
        }
      } finally {
        setLoading(false);
      }
    };

  
    useEffect(() => {
      const isReload = window.performance
        .getEntriesByType('navigation')
        .some((nav) => nav.type === 'reload');
    
      fetchEvents(isReload); // Force refresh if the page was reloaded
    }, []);

 
  useEffect(() => {
    if (events.length > 0) {
      const filtered = applyAllFilters(events);
      setFilteredEvents(filtered);
    }
  }, [events, filters, isFiltered]);

 
  const applyAllFilters = (eventsToFilter = events) => {
    if (!isFiltered) return eventsToFilter;

    let result = [...eventsToFilter];

   
    if (filters.searchTerm) {
      result = result.filter(event =>
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filter by category 
    if (filters.category) {
      result = result.filter(event => {
        const eventCat = event.eventType || event.category;
        return eventCat && eventCat.toLowerCase() === filters.category.toLowerCase();
      });
    }

    // Filter by date - use startDate
    if (filters.date) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      switch (filters.date) {
        case 'today':
          result = result.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === today.toDateString();
          });
          break;
        case 'tomorrow':
          result = result.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === tomorrow.toDateString();
          });
          break;
        case 'week': {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          result = result.filter(event => {
            const eventDate = new Date(event.startDate || event.date);
            return eventDate >= today && eventDate <= nextWeek;
          });
          break;
        }
        case 'month':
          result = result.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getMonth() === today.getMonth() &&
              eventDate.getFullYear() === today.getFullYear();
          });
          break;
      }
    }

    return result;
  };

  
  const handleSearchAndFilter = (term, category, date) => {
    const newFilters = {
      searchTerm: term || '',
      category: category || '',
      date: date || ''
    };
    
    setFilters(newFilters);
    setIsFiltered(true);
    
    setFilteredEvents(applyAllFilters(events));
  };

  // Handle clearing all filters
  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      date: ''
    });
    setIsFiltered(false);
  };

  // Handle clearing individual filters
  const clearFilter = (filterType) => {
    const updatedFilters = {
      ...filters,
      [filterType]: ''
    };

    setFilters(updatedFilters);

    if (!updatedFilters.searchTerm && !updatedFilters.category && !updatedFilters.date) {
      setIsFiltered(false);
    }
  };

  const handleEventClick = (eventId) => {
    if (!eventId) {
      console.error("Invalid event ID:", eventId);
      return;
    }
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins']">
      {/* Navigation Header */}
      <NavPane />

      {/* Under the title Section - Hidden on small screens, responsive text on medium */}
      <div className="hidden md:block bg-[#569DBA] text-white pt-[12px] pb-[40px] lg:pb-[64px] mt-[57px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[48px] lg:text-[60px] font-bold leading-tight">
            Discover Amazing Events Near You
          </h1>
          <p className="text-[16px] lg:text-[20px]">
            Join exciting events, connect with people, and create unforgettable memories.
          </p>
        </div>
      </div>

      {/* Adjusted margin for when banner is hidden */}
      <div className="md:hidden h-[18px]"></div>

      {/* Search Section with additional margin on small screens */}
      <div className="mt-[80px] md:mt-0">
        <SearchBar
          events={events}
          onSearch={handleSearchAndFilter}
          currentFilters={filters}
        />
      </div>

      {/* Filter tags to show active filters */}
      {isFiltered && (filters.searchTerm || filters.category || filters.date) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Search: {filters.searchTerm}
                <button
                  onClick={() => clearFilter('searchTerm')}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            )}

            {filters.category && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                Category: {filters.category}
                <button
                  onClick={() => clearFilter('category')}
                  className="ml-2 text-green-500 hover:text-green-700"
                >
                  ×
                </button>
              </div>
            )}

            {filters.date && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                Date: {filters.date.charAt(0).toUpperCase() + filters.date.slice(1)}
                <button
                  onClick={() => clearFilter('date')}
                  className="ml-2 text-purple-500 hover:text-purple-700"
                >
                  ×
                </button>
              </div>
            )}

            {(filters.searchTerm || filters.category || filters.date) && (
              <button
                onClick={clearAllFilters}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Events Grid - adjust top padding when banner is hidden */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                {...event}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event._id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No events found matching your criteria</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or browse all events.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;