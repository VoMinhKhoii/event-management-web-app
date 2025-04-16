import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventMiniCard = ({ event }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Navigate to event details page
        navigate(`/event/${event.id}`);
    };

    return (
        <div
            className="flex bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleClick}
        >
            {/* Event image */}
            <div className="w-24 sm:w-32 flex-shrink-0">
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Event information */}
            <div className="flex flex-col justify-between p-3 pb-2 flex-grow">
                <div>
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-1">{event.title}</h3>

                    <div className="mt-1 space-y-0.5">
                        {/* Date */}
                        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{event.date}</span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{event.time}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>
                </div>

                {/* Status badge */}
                {event.status && (
                    <div className="flex justify-end mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
              ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                event.status === 'active' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'}`}
                        >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventMiniCard;