import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/Home/HomePage.jsx';
import Calendar from './pages/Calendar/Calendar.jsx';
import EventDetails from './components/EventDetails.jsx';
import Profile from './pages/Profile/ProfilePage.jsx';
import CreateEvent from './pages/CreateEvent/CreateEvent.jsx';
import LandingPage from './pages/Landing/LandingPage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import SignUpPage from './pages/SignUp/SignUpPage.jsx';
import NotificationPage from './pages/Notification/NotificationPage.jsx';

// Define routes as an array of route objects
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignUpPage />
  },
  {
    path: "/home",
    element: <HomePage />
  },
  {
    path: "/calendar",
    element: <Calendar />
  },
  {
    path: "/event/:id",
    element: <EventDetails />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/create-event",
    element: <CreateEvent />
  },
  {
    path: "/notifications",
    element: <NotificationPage />
  }

]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;