import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Calendar from './components/Calendar';
import EventDetails from './components/EventDetails';
import Profile from './components/Profile';
import CreateEvent from './components/CreateEvent';

import SearchBar from './components/SearchBar';
import EventCard from './components/EventCard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-event" element={<CreateEvent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 