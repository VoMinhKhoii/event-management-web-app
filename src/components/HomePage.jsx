import React from 'react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-4">
          <nav className="flex items-center space-x-12">
            <Link to="/" className="flex items-center text-blue-600">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link to="/calendar" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </Link>
            <Link to="/notifications" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </Link>
          </nav>
          <div className="absolute right-4">
            <img src="/images/avatar.png" alt="Profile" className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Under the title Section */}
      <div className="bg-blue-500 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            Discover Amazing Events Near You
          </h1>
          <p className="text-xl">
            Join exciting events, connect with people, and create unforgettable memories.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 flex gap-4">
          <input
            type="text"
            placeholder="Search events by name, location, or organizer"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-4">
            <div className="relative inline-block">
              <select className="block w-40 appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Category</option>
                <option value="tech">Tech</option>
                <option value="business">Business</option>
                <option value="game">Game</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
              </select>
            
            </div>
            <div className="relative inline-block">
              <select className="block w-40 appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Date</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    {event.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {event.date} • {event.time}
                </div>
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {event.attendees} attending ({event.maxAttendees} max)
                  </div>
                  <button className="bg-[#5BA4A4] text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors">
                    Request to join
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 