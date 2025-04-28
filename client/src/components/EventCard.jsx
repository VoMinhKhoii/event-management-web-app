import React from 'react';

const EventCard = ({ title, image, startDate, startTime, endTime, location, description, curAttendees, category , onClick}) => {
  return (  
    
    <div className="event-card bg-white rounded-lg shadow-md overflow-hidden font-['Poppins'] flex flex-col h-full" onClick={onClick}>
      <div className="card-image-container relative h-48">
        <img
          src={image}
          alt={title}
          className="card-image w-full h-full object-cover"
        />
        
        <span className="category-badge absolute top-4 right-4 bg-blue-500 px-3 py-1 rounded-full text-white text-sm">
          {category}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-grow" >
        <h2 className="text-[24px] font-semibold mb-4 text-gray-900">{title}</h2>
        <div className="space-y-4 text-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-regular text-[#6B7280]">{startDate}</span>
            <span className="mx-[18px]"></span>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-regular text-[#6B7280]">{startTime} - {endTime}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-regular text-[#6B7280]">{location}</span>
          </div>
        </div>
        
        {/* Description with fixed height and overflow handling */}
        <div className=" mt-4 h-[82px] overflow-hidden">
          <p className="text-[#4B5563] text-[18px] line-clamp-3">{description}</p>
        </div>
        
        
        {/* Footer section always at the bottom */}
        <div className="mt-6 pt-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{curAttendees} attending</span>
          </div>
          <button className="px-4 py-2 rounded-[50px] text-white font-medium bg-[#569DBA]">
            Request to join
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;