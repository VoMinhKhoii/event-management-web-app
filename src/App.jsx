import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomePage.jsx';
import Calendar from './pages/Calendar/Calendar.jsx';
import EventDetails from './components/EventDetails';
import Profile from './components/Profile';
import CreateEvent from './components/CreateEvent';


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