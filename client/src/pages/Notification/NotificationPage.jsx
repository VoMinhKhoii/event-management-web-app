/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavPane from '../../components/NavPane.jsx';

const NotificationPage = () => {
    // State to keep track of selected notification/event
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'invitation',
            message: 'You have been invited to an event',
            read: false,
            event: {
                id: 101,
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
                image: "/images/tech.png"
            }
        },
        {
            id: 2,
            type: 'invitation',
            message: 'You have been invited to an event',
            read: false,
            event: {
                id: 102,
                title: "Design Workshop 2025",
                date: "Apr 5, 2025",
                time: "10:00 AM - 3:00 PM",
                location: "Design Hub, San Francisco",
                attendees: 30,
                maxAttendees: 60,
                description: "A hands-on workshop focused on the latest UI/UX design trends and techniques.",
                organizer: {
                    name: "Vo Minh Khoi",
                    email: "minhkhoitdn@gmail.com",
                    avatar: "/images/avatar.png"
                },
                expectations: [
                    "Design thinking methodology sessions",
                    "Portfolio reviews and feedback",
                    "Networking with design professionals",
                    "Tool demonstrations and tutorials",
                    "Lunch and coffee provided"
                ],
                image: "/images/design.png"
            }
        },
        {
            id: 3,
            type: 'invitation',
            message: 'You have been invited to an event',
            read: false,
            event: {
                id: 103,
                title: "Networking Mixer",
                date: "May 20, 2025",
                time: "6:00 PM - 9:00 PM",
                location: "Skyline Lounge, Chicago",
                attendees: 55,
                maxAttendees: 100,
                description: "Connect with professionals from various tech industries in a relaxed social setting.",
                organizer: {
                    name: "Vo Minh Khoi",
                    email: "minhkhoitdn@gmail.com",
                    avatar: "/images/avatar.png"
                },
                expectations: [
                    "Speed networking sessions",
                    "Industry discussion groups",
                    "Career opportunity conversations",
                    "Appetizers and drinks provided",
                    "Business card exchange"
                ],
                image: "/images/networking.png"
            }
        },
        {
            id: 4,
            type: 'invitation',
            message: 'You have been invited to an event',
            read: false,
            event: {
                id: 104,
                title: "AI Conference 2025",
                date: "Jun 10, 2025",
                time: "8:30 AM - 4:30 PM",
                location: "Tech Center, Boston",
                attendees: 75,
                maxAttendees: 150,
                description: "Explore the latest advancements in artificial intelligence and machine learning.",
                organizer: {
                    name: "Vo Minh Khoi",
                    email: "minhkhoitdn@gmail.com",
                    avatar: "/images/avatar.png"
                },
                expectations: [
                    "Research presentations from AI experts",
                    "Demo sessions of cutting-edge AI applications",
                    "Panel discussions on AI ethics and future",
                    "Networking with AI researchers and developers",
                    "Full catering including breakfast and lunch"
                ],
                image: "/images/ai.png"
            }
        },
        {
            id: 5,
            type: 'invitation',
            message: 'You have been invited to an event',
            read: false,
            event: {
                id: 105,
                title: "Startup Pitch Day",
                date: "Jul 25, 2025",
                time: "1:00 PM - 5:00 PM",
                location: "Innovation Hub, Austin",
                attendees: 40,
                maxAttendees: 80,
                description: "Watch innovative startups pitch their ideas to investors and industry leaders.",
                organizer: {
                    name: "Vo Minh Khoi",
                    email: "minhkhoitdn@gmail.com",
                    avatar: "/images/avatar.png"
                },
                expectations: [
                    "Live pitch presentations from selected startups",
                    "Q&A sessions with founders",
                    "Networking with entrepreneurs and investors",
                    "Feedback sessions with industry mentors",
                    "Refreshments and snacks provided"
                ],
                image: "/images/startup.png"
            }
        }
    ]);

    // Handle notification click
    const handleNotificationClick = (notification) => {
        // Mark notification as read
        const updatedNotifications = notifications.map(item =>
            item.id === notification.id ? { ...item, read: true } : item
        );
        setNotifications(updatedNotifications);

        // Set selected event
        setSelectedEvent(notification.event);
    };

    // Handle accept invitation
    const handleAccept = (eventId) => {
        console.log(`Accepted invitation to event ${eventId}`);
        // Here you would typically call an API to update the user's response
        // For now we'll just update the UI
        alert(`You have accepted the invitation to ${selectedEvent.title}`);
    };

    // Handle decline invitation
    const handleDecline = (eventId) => {
        console.log(`Declined invitation to event ${eventId}`);
        // Here you would typically call an API to update the user's response
        // For now we'll just update the UI
        alert(`You have declined the invitation to ${selectedEvent.title}`);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Always show scrollbar to prevent layout shifts */}
            <div style={{ overflowY: 'scroll', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                {/* Navigation Header */}
                <NavPane />

                <div className="max-w-7xl mx-auto px-4 pt-20 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column - Fixed position */}
                        <div className="md:col-span-1">
                            <div className="bg-gray-50 rounded-lg shadow fixed"
                                style={{
                                    width: "30%",
                                    maxWidth: "380px",
                                    top: "90px",
                                    height: "calc(100vh - 120px)"
                                }}>
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="text-2xl font-semibold">Primary</h2>
                                </div>
                                <div className="divide-y divide-gray-200 overflow-y-auto"
                                    style={{ height: "calc(100vh - 185px)" }}>
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedEvent && selectedEvent.id === notification.event.id ? 'bg-blue-50' : ''
                                                } ${notification.read ? 'opacity-70' : 'font-medium'}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    src="/images/avatar.png"
                                                    alt="User avatar"
                                                    className="w-10 h-10 rounded-full mr-3"
                                                />
                                                <div>
                                                    <div className="flex items-center">
                                                        <span className="text-gray-800">vominhkhoi</span>
                                                    </div>
                                                    <p className="text-gray-600">{notification.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Offset to account for fixed left column */}
                        <div className="md:col-span-3 md:ml-[calc(33.333%-20px)]">
                                {selectedEvent ? (
                                    <div className="max-h-[calc(100vh-160px)]">
                                        {/* Event Image */}
                                        <div className="relative h-[400px]">
                                            <img
                                                src={selectedEvent.image}
                                                alt={selectedEvent.title}
                                                className="w-full h-full object-cover rounded-t-lg"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
                                                <button
                                                    className="bg-white text-blue-500 font-medium py-2 px-6 rounded-full shadow hover:bg-blue-50 flex items-center"
                                                    onClick={() => handleAccept(selectedEvent.id)}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Accept
                                                </button>
                                                <button
                                                    className="bg-white text-red-500 font-medium py-2 px-6 rounded-full shadow hover:bg-red-50 flex items-center"
                                                    onClick={() => handleDecline(selectedEvent.id)}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Decline
                                                </button>
                                            </div>
                                        </div>

                                        {/* Event Details */}
                                        <div className="p-6">
                                            <h1 className="text-4xl font-bold mb-4">{selectedEvent.title}</h1>

                                            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{selectedEvent.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{selectedEvent.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{selectedEvent.location}</span>
                                                </div>
                                            </div>

                                            <section className="mb-8">
                                                <h2 className="text-2xl font-semibold mb-4">About this event</h2>
                                                <p className="text-gray-600 mb-8">{selectedEvent.description}</p>

                                                <h3 className="text-xl font-semibold mb-4">What to expect</h3>
                                                <ul className="space-y-3">
                                                    {selectedEvent.expectations.map((item, index) => (
                                                        <li key={index} className="flex items-center gap-3 text-gray-600">
                                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>

                                            <section className="rounded-lg border border-gray-200 p-6">
                                                <h2 className="text-xl font-bold mb-4">Organized by</h2>
                                                <div className="flex items-center">
                                                    <img
                                                        src={selectedEvent.organizer.avatar}
                                                        alt={selectedEvent.organizer.name}
                                                        className="w-12 h-12 rounded-full mr-4"
                                                    />
                                                    <div>
                                                        <h3 className="font-medium text-lg">{selectedEvent.organizer.name}</h3>
                                                        <p className="text-gray-500">{selectedEvent.organizer.email}</p>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-160px)]">
                                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        <h3 className="text-xl font-medium text-gray-700 mb-2">No notification selected</h3>
                                        <p className="text-gray-500">Select a notification from the list to view details</p>
                                    </div>
                                )}
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;