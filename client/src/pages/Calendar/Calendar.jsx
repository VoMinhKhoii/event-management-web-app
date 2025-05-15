/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext.jsx';
import NavPane from '../../components/NavPane.jsx';

const Calendar = () => {
  const { currentUser } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  // Add states for events
  const [isLoading, setIsLoading] = useState(true);
  const [allEvents, setAllEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState({});

  // NEW: Add a state for mobile view
  const [isListView, setIsListView] = useState(window.innerWidth < 768);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8800/api/events?organizerId=${currentUser._id}&participantId=${currentUser._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const eventData = await response.json();
        setAllEvents(eventData);

        // Process events for calendar view
        processEventsForCalendar(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate]); // Refetch when month changes

  // Function to process events for calendar
  const processEventsForCalendar = (events) => {
    const eventsMap = {};

    events.forEach(event => {
      // Parse the start date to get the day
      const eventDate = new Date(event.startDate);

      // Only include events from current month
      if (eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()) {

        const day = eventDate.getDate();

        // Format the event for calendar display
        const calendarEvent = {
          id: event._id,
          title: event.title,
          time: `${event.startTime} - ${event.endTime}`,
          location: event.location,
          description: event.description,
          organizer: event.organizer?.username || 'Unknown',
          date: eventDate,
          accepted: true // Assuming all events are accepted by default
        };

        // Add to events map
        if (!eventsMap[day]) {
          eventsMap[day] = [];
        }
        eventsMap[day].push(calendarEvent);
      }
    });

    setCalendarEvents(eventsMap);
  };

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

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  // Generate list view of events for mobile
  const renderEventsList = () => {
    // Combine all events into a single array with dates
    const displayEvents = [];

    // Use real events from API
    allEvents.forEach(event => {
      const eventDate = new Date(event.startDate);

      // Only include events from current month
      if (eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()) {

        displayEvents.push({
          id: event._id,
          title: event.title,
          time: `${event.startTime} - ${event.endTime}`,
          location: event.location,
          description: event.description,
          organizer: event.organizer?.username || 'Unknown',
          date: eventDate,
          image: event.image,
          curAttendees: event.curAttendees,
          maxAttendees: event.maxAttendees
        });
      }
    });

    // Sort events by date
    displayEvents.sort((a, b) => a.date - b.date);

    if (isLoading) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading events...</p>
        </div>
      );
    }

    if (displayEvents.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No events found for this month</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 px-2 pb-4">
        {displayEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50"
            onClick={() => handleEventClick(event.id)}
          >
            <div className="flex gap-3 items-start">
              {event.image && (
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-lg">{event.title}</h3>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  {event.organizer && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Organized by {event.organizer}</span>
                    </div>
                  )}
                  {event.curAttendees !== undefined && event.maxAttendees !== undefined && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{event.curAttendees} / {event.maxAttendees} attending</span>
                    </div>
                  )}
                </div>
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
        events: calendarEvents[i + 1] || [] // Use real events from API
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

                <div className="h-2/3 overflow-y-auto space-y-1">
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
                      <div className="hidden md:block text-[10px] md:text-xs truncate">{event.time}</div>
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

  // Automatically switch to list view when there is data
  useEffect(() => {
    if (!isLoading) {
      // If there are many events, list view is easier to see on mobile
      const eventCount = Object.values(calendarEvents).reduce((count, events) => count + events.length, 0);
      if (eventCount > 10 && window.innerWidth < 1024) {
        setIsListView(true);
      }
    }
  }, [isLoading, calendarEvents]);

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
