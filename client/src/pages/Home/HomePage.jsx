import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import EventCard from '../../components/EventCard.jsx';
import NavPane from '../../components/NavPane.jsx';
import SearchBar from '../../components/SearchBar.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  
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
      date: "Mar 15, 2025",
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
      title: "VK Fest 2024",
      date: "Mar 15, 2025",
      time: "10:00 AM",
      location: "Convention Center, New York",
      description: "The biggest music festival of the year.",
      category: "Tech",
      image: "/images/business.png",
      attendees: 45,
      maxAttendees: 120
    },
    {
      id: 4,
      title: "VK Fest 2024",
      date: "Mar 15, 2025",
      time: "10:00 AM",
      location: "Convention Center, New York",
      description: "The biggest game event of the year.",
      category: "Game",
      image: "/images/game.png",
      attendees: 45,
      maxAttendees: 120
    }
  ];
  
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
        <SearchBar/>
      </div>

      {/* Events Grid - adjust top padding when banner is hidden */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
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
      </div>
    </div>
  );
};


export default HomePage;