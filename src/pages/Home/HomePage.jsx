import React from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../../components/EventCard.jsx';
import NavPane from '../../components/NavPane.jsx';
import SearchBar from '../../components/SearchBar.jsx';

const HomePage = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins']">
      {/* Navigation Header */}
      <NavPane/>

      {/* Under the title Section */}
      <div className="bg-[#569DBA] text-white pt-[12px] pb-[64px] mt-[57px]">
        <div className="max-w-7xl min-y-[145px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[60px] font-bold">
            Discover Amazing Events Near You
          </h1>
          <p className="text-[20px]">
            Join exciting events, connect with people, and create unforgettable memories.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <SearchBar/>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              {...event} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;