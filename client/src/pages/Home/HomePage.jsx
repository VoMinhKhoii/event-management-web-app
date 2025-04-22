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
  
  // Sample event data
  const events = [
    {
      id: 1,
      title: "Tech Summit 2025",
      date: "Mar 15, 2025",
      time: "9:00 AM",
      location: "Convention Center, New York",
      description: "Join industry leaders for a day of insights into emerging technologies and digital transformation.",
      category: "Tech",
      image: "/images/tech.png",
      attendees: 45,
      maxAttendees: 120
    },
    {
      id: 2,
      title: "VK Fest 2024",
      date: "Apr 15, 2025",
      time: "10:00 AM",
      location: "Convention Center, New York",
      description: "The biggest music festival of the year.",
      category: "Business",
      image: "/images/business.png",
      attendees: 45,
      maxAttendees: 120
    },
    {
      id: 3,
      title: "Tech Development Conference",
      date: "Mar 15, 2025",
      time: "10:00 AM",
      location: "Convention Center, New York",
      description: "The biggest game development conference of the year.",
      category: "Tech",
      image: "/images/business.png",
      attendees: 45,
      maxAttendees: 120
    },
    {
      id: 4,
      title: "Gaming Expo 2024",
      date: "Apr 22, 2025",
      time: "10:00 AM",
      location: "Convention Center, New York",
      description: "The biggest game event of the year.",
      category: "Game",
      image: "/images/game.png",
      attendees: 45,
      maxAttendees: 120
    },
  ];
  
  // Apply all filters to the events list
  const applyAllFilters = () => {
    if (!isFiltered) return events;
    
    let result = [...events];
    
    // Filter by search term
    if (filters.searchTerm) {
      result = result.filter(event => 
        event.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (filters.category) {
      result = result.filter(event => event.category === filters.category);
    }
    
    // Filter by date
    if (filters.date) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      switch(filters.date) {
        case 'today':
          result = result.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === today.toDateString();
          });
          break;
        case 'tomorrow':
          result = result.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === tomorrow.toDateString();
          });
          break;
        case 'week':
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          result = result.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
          });
          break;
        case 'month':
          result = result.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === today.getMonth() && 
                   eventDate.getFullYear() === today.getFullYear();
          });
          break;
      }
    }
    
    return result;
  };
  
  // Filter events based on all criteria
  const filteredEvents = applyAllFilters();
  
  // Handle search and filter updates from SearchBar
  const handleSearchAndFilter = (term, category, date) => {
    setFilters({
      searchTerm: term || '',
      category: category || '',
      date: date || ''
    });
    setIsFiltered(true); // Mark that filters are now active
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
    navigate(`/event/${eventId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins']">
      {/* Navigation Header */}
      <NavPane/>

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
                key={event.id} 
                {...event}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event.id);
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