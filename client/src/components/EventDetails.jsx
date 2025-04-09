/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavPane from './NavPane.jsx';

const EventDetails = ({ event }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState('');

  const eventData = {
    title: "Tech Summit 2025",
    date: "Mar 15, 2025",
    time: "9:00 AM - 1:00 PM",
    location: "Convention Center, New York",
    attendees: 45,
    maxAttendees: 120,
    description: "Join industry leaders for a day of insights into emerging technologies and digital transformation.",
    organizer: {
      name: "Vo Minh Khoi",
      email: "minhkhoitdn@gmail.com",
      avatar: "/images/avatar.png"
    },
    expectations: [
      "Keynote presentations from industry experts",
      "Interactive workshops and hands-on sessions",
      "Networking opportunities with tech professionals",
      "Product demonstrations and exhibitions",
      "Catered lunch and refreshments"
    ],
    images: ["/images/tech.png"],
    comments: [
      {
        id: 1,
        user: {
          name: "Vo Minh Khoi",
          avatar: "/images/avatar.png"
        },
        text: "Haha vui vai i, dit con me",
        time: "2 hours ago"
      },
      {
        id: 2,
        user: {
          name: "Vo Minh Khoi",
          avatar: "/images/avatar.png"
        },
        text: "Haha vui vai i, dit con me",
        time: "2 hours ago"
      }
    ]
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    console.log('Comment submitted:', comment);
    setComment('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <NavPane/>

      <div className="max-w-6xl mx-auto px-4 pt-20">
        {/* Image Carousel */}
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <img
            src={eventData.images[currentImageIndex]}
            alt={eventData.title}
            className="w-full h-full object-cover"
          />
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
            onClick={() => setCurrentImageIndex(prev => (prev - 1 + eventData.images.length) % eventData.images.length)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
            onClick={() => setCurrentImageIndex(prev => (prev + 1) % eventData.images.length)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute top-4 right-4">
            <div className="flex space-x-2">
              {eventData.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentImageIndex === index ? 'bg-white' : 'bg-gray-400'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-8 pb-8">
          <div className="col-span-2">
            <h1 className="text-[52px] font-bold mb-4">{eventData.title}</h1>
            
            <div className="flex items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{eventData.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{eventData.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{eventData.location}</span>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About this event</h2>
              <p className="text-gray-600 mb-8">{eventData.description}</p>
              
              <h3 className="text-xl font-semibold mb-4">What to expect</h3>
              <ul className="space-y-3">
                {eventData.expectations.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Organized by</h2>
              <div className="flex items-center">
                <img
                  src={eventData.organizer.avatar}
                  alt={eventData.organizer.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-medium text-lg">{eventData.organizer.name}</h3>
                  <p className="text-gray-500">{eventData.organizer.email}</p>
                </div>
              </div>
            </section>

            {/* Discussion Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Event discussion</h2>
              <div className="flex mb-6">
                <img
                  src="/images/avatar.png"
                  alt="User avatar"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ask a question or leave a comment..."
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={handleCommentSubmit}
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-6">
                {eventData.comments.map((comment) => (
                  <div key={comment.id} className="flex">
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="font-medium mr-2">{comment.user.name}</span>
                        <span className="text-gray-500 text-sm">{comment.time}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                      <button className="text-gray-500 text-sm mt-1 hover:text-gray-700">
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-[12px] sticky top-24">
              <button className="w-full py-[8px] bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors text-lg font-regular mb-8">
                Request to join
              </button>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-regular text-black text-[18px]">Date and time</span>
                  </div>
                  <p className="text-[#6B7280]">{eventData.date}</p>
                  <p className="text-[#6B7280]">{eventData.time}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-regular text-black text-[18px]">Location</span>
                  </div>
                  <p className="text-[#6B7280]">{eventData.location}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-regular text-black text-[18px]">{eventData.attendees} attending ({eventData.maxAttendees} max)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;