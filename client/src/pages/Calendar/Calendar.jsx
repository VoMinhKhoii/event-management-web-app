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

          {/* Create Event Button */}
          <button
            onClick={() => navigate('/create-event')}
            className="bg-[#569DBA] text-white px-2 py-2 md:px-4 text-sm md:text-base rounded-full hover:bg-[#6ba9c2] transition-colors flex items-center justify-center"
          >
            Create event
          </button>
        </div>

        {/* Calendar container with horizontal scroll on mobile */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[700px] md:min-w-0 h-full">
            <table className="w-full table-fixed border-collapse h-[600px] md:h-full">
              {/* Responsive headers */}
              <thead>
                <tr className="text-left">
                  <th className="font-extralight text-[16px] md:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Mon</th>
                  <th className="font-extralight text-[16px] md:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Tue</th>
                  <th className="font-extralight text-[16px] md:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Wed</th>
                  <th className="font-extralight text-[16px] md:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Thu</th>
                  <th className="font-extralight text-[16px] md:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Fri</th>
                  <th className="font-extralight text-[16px] md:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Sat</th>
                  <th className="font-extralight text-[16px] md:text-[22px] py-2 pl-1 md:pl-2 w-[14.28%]">Sun</th>
                </tr>
              </thead>
              {renderCalendar()}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;