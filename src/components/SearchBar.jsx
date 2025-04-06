import React from 'react';

const SearchBar = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6 flex gap-[16px]">
                <input
                    type="text"
                    placeholder="Search events by name, location, or organizer"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex gap-4">
                    <div className="relative inline-block">
                        <select className="block w-40 appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="">All</option>
                            <option value="tech">Tech</option>
                            <option value="business">Business</option>
                            <option value="game">Game</option>
                            <option value="music">Music</option>
                            <option value="sports">Sports</option>
                        </select>
                    </div>
                    <div className="relative inline-block">
                        <select className="block w-40 appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="">Date</option>
                            <option value="today">Today</option>
                            <option value="tomorrow">Tomorrow</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                    <button 
                        className="bg-[#569DBA] text-white px-6 py-2 rounded-lg hover:bg-[#4a8ba6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#569DBA] focus:ring-offset-2"
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SearchBar;