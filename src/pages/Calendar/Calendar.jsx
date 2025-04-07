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

  // Sample event data with accepted events
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
      }
    ]
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  // Sample colors
  const eventColors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-red-100 text-red-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800"
  ];

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
                className={`border border-gray-200 p-2 align-top overflow-auto ${
                  !dayData.isCurrentMonth ? 'text-black opacity-30' 
                                          : 'hover:bg-gray-100 cursor-pointer transition-colors duration-200'
                }`}
                onClick={dayData.isCurrentMonth ? () => setSelectedDate(dayData.day) : undefined}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-light text-sm">{dayData.day}</span>
                  {dayData.events && dayData.events.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {dayData.events.length}
                    </span>
                  )}
                </div>
                <div className="max-h-24 overflow-y-auto space-y-2">
                  {dayData.events && dayData.events.map((event, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-xs hover:opacity-75 cursor-pointer ${
                        eventColors[index % eventColors.length]
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event.id);
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs truncate">{event.time}</div>
                      {event.accepted && (
                        <div className="text-green-600 text-xs font-semibold">Accepted</div>
                      )}
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
    <div className="flex flex-col h-screen bg-white fonts-['Poppins']">
      {/* Top Navigation */}
      <NavPane />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 w-full max-w-[1100px] min-w-[500px] mx-auto mt-[57px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center w-96">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-[30px] mx-4 w-72 text-center font-thin">
              {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate)} | {currentDate.getFullYear()}
            </h2>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => navigate('/create-event')}
            className="bg-[#569DBA] text-white px-4 py-2 rounded-full hover:bg-[#6ba9c2] transition-colors flex items-center"
          >
            Create event
          </button>
        </div>

        {/* Calendar container */}
        <div className="flex-1 flex flex-col w-full overflow-auto">
          <table className="w-full table-fixed border-collapse h-full">
            <thead>
              <tr className="text-left">
                <th className="font-extralight text-[22px] py-2 pl-2 w-[14.28%]">Monday</th>
                <th className="font-extralight text-[22px] py-2 pl-2 w-[14.28%]">Tuesday</th>
                <th className="font-extralight text-[22px] py-2 pl-2 w-[14.28%]">Wednesday</th>
                <th className="font-extralight text-[22px] py-2 pl-2 w-[14.28%]">Thursday</th>
                <th className="font-extralight text-[22px] py-2 pl-2 w-[14.28%]">Friday</th>
                <th className="font-extralight text-[22px] py-2 pl-2 w-[14.28%]">Saturday</th>
                <th className="font-extralight text-[22px] py-2 pl-2 w-[14.28%]">Sunday</th>
              </tr>
            </thead>
            {renderCalendar()}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calendar;