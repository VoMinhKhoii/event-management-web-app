import React from 'react';

const EventCard = ({ title, date, time, location, description, attendeeCount, category }) => {
  return (
    <div className="event-card bg-white rounded-lg shadow-md overflow-hidden">
      <div className="card-image-container relative h-48">
        <img
          src="/images/tech.png"
          alt={title}
          className="card-image w-full h-full object-cover"
        />
        
        <span className="category-badge absolute top-4 right-4 text-white text-sm">
          {category}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{date}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </div>
        </div>
        <p className="mt-4 text-gray-600 line-clamp-2">{description}</p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">{attendeeCount} attending</span>
          </div>
          <button className="btn-primary px-4 py-2 rounded-md text-white font-medium">
            Request to join
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;