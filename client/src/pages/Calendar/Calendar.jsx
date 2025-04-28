/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavPane from '../../components/NavPane.jsx';

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
    // eslint-disable-next-line no-undef
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Sample event data
  const events = {
    5: [
      {
        id: 1,
        title: "EEET2205 Online lecture",
        time: "8:30 AM - 10:00 AM",
        location: "Microsoft Teams",
        description: "Intro to Embedded System course.",
        accepted: true
      },
      {
        id: 2,
        title: "Project Meeting",
        time: "2:00 PM - 3:00 PM",
        location: "Zoom",
        description: "Weekly team sync-up.",
        accepted: true
      }
    ],
    15: [
      {
        id: 3,
        title: "Tech Conference",
        time: "10:00 AM - 12:00 PM",
        location: "Convention Center",
        description: "Emerging technologies discussion.",
        accepted: true
      },
      {
        id: 4,
        title: "Lunch with Tai",
        time: "12:30 PM - 1:30 PM",
        location: "Cafe",
        description: "Catch up over lunch.",
        accepted: true
      },
      {
        id: 5,
        title: "Project Deadline",
        time: "All Day",
        location: "RMIT University",
        description: "Submit project report.",
        accepted: true
      },
      // Adding more events to test scrolling
      {
        id: 6,
        title: "Team Meeting",
        time: "3:00 PM - 4:00 PM",
        location: "Conference Room",
        description: "Weekly update",
        accepted: true
      },
      {
        id: 7,
        title: "Client Call",
        time: "4:30 PM - 5:30 PM",
        location: "Zoom",
        description: "Project progress review",
        accepted: true
      },
      {
        id: 8,
        title: "Evening Workshop",
        time: "6:00 PM - 8:00 PM",
        location: "Innovation Lab",
        description: "Hands-on session",
        accepted: true
      }
    ]
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  // NEW: Add a state for mobile view
  const [isListView, setIsListView] = useState(window.innerWidth < 768);

  // Generate list view of events for mobile
  const renderEventsList = () => {
    // Combine all events into a single array with dates
    const allEvents = [];
    Object.keys(events).forEach(day => {
      if (events[day] && events[day].length) {
        events[day].forEach(event => {
          allEvents.push({
            ...event,
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
          });
        });
      }
    });
    
    // Sort events by date
    allEvents.sort((a, b) => a.date - b.date);
    
    if (allEvents.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No events found for this month
        </div>
      );
    }
    
    return (
      <div className="space-y-4 px-2">
        {allEvents.map((event) => (
          <div 
            key={event.id}
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50"
            onClick={() => handleEventClick(event.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(event.date).getDate()} {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(event.date)}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#BFDAE5] rounded-full w-10 h-10 flex items-center justify-center text-xs font-medium text-gray-700">
                {new Date(event.date).getDate()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Generate calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Get previous month's last days
    const prevMonthDays = [];
    const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      prevMonthDays.push(prevMonthLastDate - i);
    }
    prevMonthDays.reverse();

    // Add next month's first days
    const nextMonthDays = [];
    const totalCells = 42; // 6 rows x 7 columns
    const remainingCells = totalCells - (prevMonthDays.length + daysInMonth);

    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push(i);
    }

    // Combine all days
    const allDays = [
      ...prevMonthDays.map(day => ({
        day,
        isCurrentMonth: false,
        isPrevMonth: true
      })),
      ...Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        isCurrentMonth: true,
        events: events[i + 1]
      })),
      ...nextMonthDays.map(day => ({
        day,
        isCurrentMonth: false,
        isNextMonth: true
      }))
    ];

    // Group days into weeks (rows)
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return (
      <tbody>
        {weeks.map((week, weekIndex) => (
          <tr key={`week-${weekIndex}`} className="calendar-row h-1/6">
            {week.map((dayData) => (
              <td
                key={`${dayData.isPrevMonth ? 'prev-' : dayData.isNextMonth ? 'next-' : ''}${dayData.day}`}
                className={`min-w-[20px] border border-gray-200 p-1 md:p-2 align-top overflow-hidden relative ${!dayData.isCurrentMonth ? 'text-black opacity-30'
                    : 'hover:bg-gray-100 cursor-pointer transition-colors duration-200'
                  }`}
                onClick={dayData.isCurrentMonth ? () => setSelectedDate(dayData.day) : undefined}
              >
                {/* Date header */}
                <div className="flex justify-between items-center mb-[2px] md:mb-[4px]">
                  <span className="font-light text-[12px] md:text-[14px]">{dayData.day}</span>
                  {dayData.events && dayData.events.length > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] md:text-xs px-1 md:px-2 py-[2px] md:py-[4px] rounded-full">
                      {dayData.events.length}
                    </span>
                  )}
                </div>


                <div className=" h-2/3 overflow-y-auto space-y-1">
                  {dayData.events && dayData.events.map((event, index) => (
                    <div
                      key={index}
                      className="mt-[2px] md:mt-1 p-1 rounded text-[10px] md:text-xs hover:opacity-75 cursor-pointer bg-[#BFDAE5]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event.id);
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.organizer && <div className="hidden md:block text-[10px] md:text-xs truncate">{event.organizer}</div>}
                    </div>
                  ))}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // Toggle between grid and list view
  const toggleView = () => {
    setIsListView(!isListView);
  };

  // Check window resize for responsive views
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsListView(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white font-['Poppins']">
      {/* Top Navigation */}
      <NavPane />

      {/* Main Content - adjusted for better responsiveness */}
      <div className="flex-1 flex flex-col p-2 md:p-4 w-full mx-auto mt-[57px]">
        {/* Calendar Header - made responsive */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6">
          {/* Month/Year Navigation - stacked on mobile, side-by-side on larger screens */}
          <div className="flex items-center justify-center mb-3 md:mb-0 w-full md:w-auto">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-[22px] md:text-[30px] mx-2 md:mx-4 text-center font-thin">
              {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate)} | {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle View Button - only show on tablet and larger screens */}
            <button
              onClick={toggleView}
              className="hidden md:flex bg-gray-100 text-gray-700 px-2 py-2 md:px-3 text-sm rounded-full hover:bg-gray-200 transition-colors items-center justify-center mr-2"
            >
              {isListView ? 
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Grid View
                </span> : 
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  List View
                </span>
              }
            </button>

            {/* Create Event Button */}
            <button
              onClick={() => navigate('/create-event')}
              className="bg-[#569DBA] text-white px-2 py-2 md:px-4 text-sm md:text-base rounded-full hover:bg-[#6ba9c2] transition-colors flex items-center justify-center"
            >
              Create event
            </button>
          </div>
        </div>

        {/* Conditional rendering based on view type */}
        {isListView ? (
          <div className="flex-1 overflow-y-auto">
            {renderEventsList()}
          </div>
        ) : (
          /* Calendar container with horizontal scroll on mobile */
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[700px] md:min-w-0 h-full">
              <table className="w-full table-fixed border-collapse h-[600px] md:h-full">
                {/* Responsive headers */}
                <thead>
                  <tr className="text-left">
                    <th className="font-extralight text-[14px] md:text-[18px] lg:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Mon</th>
                    <th className="font-extralight text-[14px] md:text-[18px] lg:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Tue</th>
                    <th className="font-extralight text-[14px] md:text-[18px] lg:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Wed</th>
                    <th className="font-extralight text-[14px] md:text-[18px] lg:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Thu</th>
                    <th className="font-extralight text-[14px] md:text-[18px] lg:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Fri</th>
                    <th className="font-extralight text-[14px] md:text-[18px] lg:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Sat</th>
                    <th className="font-extralight text-[14px] md:text-[18px] lg:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Sun</th>
                  </tr>
                </thead>
                {renderCalendar()}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;