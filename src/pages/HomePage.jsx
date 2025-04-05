import React, { useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import EventCard from '../components/EventCard';

const HomePage = () => {
  const [events] = useState([
    {
      id: 1,
      title: 'Tech Summit 2025',
      date: 'Mar 15, 2025',
      time: '9:00 AM',
      location: 'Convention Center, New York',
      description: 'Join industry leaders for a day of insights into emerging technologies and digital transformation.',
      attendeeCount: 45,
      category: 'Tech',
      imageUrl: '/images/tech.png'
    },
    {
      id: 2,
      title: 'Business Fest 2024',
      date: 'Jun 15, 2024',
      time: '10:00 AM',
      location: 'Central Park, Moscow',
      description: 'The biggest music and technology festival in Russia.',
      attendeeCount: 45,
      category: 'Tech',
      imageUrl: '/images/business.png'
    },
    
  ]);

  const handleSearch = (searchParams) => {
    console.log('Search params:', searchParams);
    // Implement search logic here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <SearchBar onSearch={handleSearch} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 