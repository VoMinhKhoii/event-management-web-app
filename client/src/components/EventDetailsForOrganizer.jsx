/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavPane from './NavPane.jsx';
import { useLoaderData } from 'react-router-dom';

const EventDetailsForOrganizer = () => {
    const event = useLoaderData();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [comment, setComment] = useState('');

    // Sample event data with organizer-specific information
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
        ],
        // Organizer-specific statistics
        rsvpRate: 78, // percentage
        invitations: [
            {
                id: 1,
                user: {
                    name: "John Smith",
                    email: "john@example.com",
                    avatar: "/images/avatar1.png"
                },
                status: "accepted", // accepted, pending, declined
                responseTime: "1 day ago"
            },
            {
                id: 2,
                user: {
                    name: "Emily Johnson",
                    email: "emily@example.com",
                    avatar: "/images/avatar.png"
                },
                status: "accepted",
                responseTime: "2 days ago"
            },
            {
                id: 3,
                user: {
                    name: "Michael Brown",
                    email: "michael@example.com",
                    avatar: "/images/avatar1.png"
                },
                status: "pending",
                responseTime: null
            },
            {
                id: 4,
                user: {
                    name: "Sarah Davis",
                    email: "sarah@example.com",
                    avatar: "/images/avatar.png"
                },
                status: "declined",
                responseTime: "12 hours ago"
            },
            {
                id: 5,
                user: {
                    name: "Alex Wilson",
                    email: "alex@example.com",
                    avatar: "/images/avatar1.png"
                },
                status: "pending",
                responseTime: null
            }
        ]
    };

    // Calculate invitation statistics
    const invitationStats = {
        total: eventData.invitations.length,
        accepted: eventData.invitations.filter(inv => inv.status === "accepted").length,
        pending: eventData.invitations.filter(inv => inv.status === "pending").length,
        declined: eventData.invitations.filter(inv => inv.status === "declined").length
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        console.log('Comment submitted:', comment);
        setComment('');
    };

    const handleSendReminder = (userId) => {
        console.log('Sending reminder to user ID:', userId);
        // API call would go here
    };

    const handleResendInvite = (userId) => {
        console.log('Resending invitation to user ID:', userId);
        // API call would go here
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <NavPane />
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
                                    className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-gray-400'}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{eventData.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 mb-8">
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

                    {/* Right Sidebar - Organizer View */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 sticky top-24 space-y-6">
                            {/* RSVP Rate Card */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-2">RSVP Rate</h3>
                                <div className="flex items-center mb-2">
                                    <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                                        <div
                                            className={`h-4 rounded-full ${eventData.rsvpRate >= 80 ? 'bg-green-500' :
                                                    eventData.rsvpRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${eventData.rsvpRate}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-medium text-lg">{eventData.rsvpRate}%</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Event Stats */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">Event Statistics</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Total Invites</div>
                                        <div className="text-xl font-semibold">{invitationStats.total}</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Accepted</div>
                                        <div className="text-xl font-semibold text-green-600">{invitationStats.accepted}</div>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Pending</div>
                                        <div className="text-xl font-semibold text-yellow-600">{invitationStats.pending}</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Declined</div>
                                        <div className="text-xl font-semibold text-red-600">{invitationStats.declined}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Invite More Button */}
                            <button className="w-full py-2 bg-[#569DBA] text-white rounded-lg hover:bg-opacity-90 transition-colors text-base font-medium">
                                Invite More People
                            </button>

                            {/* Invitations List */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Invitations</h3>
                                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                                    {eventData.invitations.map((invitation) => (
                                        <div key={invitation.id} className="flex items-center justify-between pb-3 border-b border-gray-100">
                                            <div className="flex items-center">
                                                <img
                                                    src={invitation.user.avatar}
                                                    alt={invitation.user.name}
                                                    className="w-8 h-8 rounded-full mr-3"
                                                />
                                                <div>
                                                    <div className="font-medium text-sm">{invitation.user.name}</div>
                                                    <div className="text-xs text-gray-500">{invitation.user.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                        invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}
                                                >
                                                    {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                                                </span>

                                                {invitation.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleSendReminder(invitation.id)}
                                                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                                                        title="Send reminder"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {invitation.status === 'declined' && (
                                                    <button
                                                        onClick={() => handleResendInvite(invitation.id)}
                                                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                                                        title="Resend invitation"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Basic Event Info */}
                            <div className="space-y-4 pt-2">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium text-gray-900">Date and time</span>
                                    </div>
                                    <p className="text-gray-600">{eventData.date}</p>
                                    <p className="text-gray-600">{eventData.time}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="font-medium text-gray-900">Location</span>
                                    </div>
                                    <p className="text-gray-600">{eventData.location}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="font-medium text-gray-900">{eventData.attendees} attending ({eventData.maxAttendees} max)</span>
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

export default EventDetailsForOrganizer;