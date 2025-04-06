import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  // Calendar navigation functions
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Get calendar data
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Format time to ensure AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Sample event data
  const events = {
    5: [
      {
        id: 1,
        title: "Tech Summit 2025",
        time: "9:00 AM - 1:00 PM",
        type: "Tech",
        color: "bg-blue-100 text-blue-800",
        image: "/tech-summit.jpg"
      }
    ],
    15: [
      {
        id: 2,
        title: "EEET2205 Online lecture",
        time: "10:00 AM - 12:00 PM",
        type: "Online",
        color: "bg-green-100 text-green-800"
      }
    ]
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  // Generate calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add week days header
    weekDays.forEach(day => {
      days.push(
        <div key={day} className="font-medium text-gray-500 text-sm py-2">
          {day}
        </div>
      );
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border border-gray-100"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvents = events[day];
      days.push(
        <div
          key={day}
          className={`border border-gray-100 min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 ${
            selectedDate === day ? 'bg-blue-50' : ''
          }`}
          onClick={() => setSelectedDate(day)}
        >
          <div className="font-medium text-sm">{day}</div>
          {hasEvents && hasEvents.map((event, index) => (
            <div
              key={index}
              className={`mt-1 p-2 rounded-lg ${event.color} hover:opacity-90 transition-opacity cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(event.id);
              }}
            >
              {event.image && (
                <div className="w-full h-16 mb-1 rounded-md overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="font-medium">{event.title}</div>
              <div className="text-xs mt-0.5">{event.time}</div>
              <div className="text-xs mt-0.5 inline-block px-2 py-0.5 rounded-full bg-opacity-50 bg-white">
                {event.type}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <Link to="/" className="text-blue-600 font-bold text-2xl block mb-8">
            EventPro
          </Link>
          <nav className="space-y-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link to="/calendar" className="flex items-center text-blue-600">
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
            <Link to="/profile" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">{formatDate(currentDate)}</h2>
              <div className="ml-4 flex space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <Link
              to="/create-event"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <span className="mr-1">+</span>
              Create Event
            </Link>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {renderCalendar()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 