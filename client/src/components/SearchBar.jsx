import React from 'react';

const SearchBar = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-8">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col md:flex-row gap-3 md:gap-4">
                {/* Search input - full width on mobile, reduced placeholder text on smaller screens */}
                <input
                    type="text"
                    placeholder="Search events"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm md:text-base"
                />
                
                {/* Filter controls - stack on mobile, row on desktop with full width */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
                    {/* Category dropdown - fills available space with min-width */}
                    <div className="relative flex-1 min-w-[160px]">
                        <select className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm md:text-base">
                            <option value="">All Categories</option>
                            <option value="tech">Tech</option>
                            <option value="business">Business</option>
                            <option value="game">Game</option>
                            <option value="music">Music</option>
                            <option value="sports">Sports</option>
                        </select>
                    </div>
                    
                    {/* Date dropdown - fills available space with min-width */}
                    <div className="relative flex-1 min-w-[140px]">
                        <select className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm md:text-base">
                            <option value="">Date</option>
                            <option value="today">Today</option>
                            <option value="tomorrow">Tomorrow</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                    
                    {/* Search button - fills available space */}
                    <button 
                        className="bg-[#569DBA] text-white py-2 px-6 rounded-lg hover:bg-[#4a8ba6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#569DBA] focus:ring-offset-2 flex-1 min-w-[100px] whitespace-nowrap"
                    >
                        <div className="flex items-center justify-center">
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