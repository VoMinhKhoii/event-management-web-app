import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import LandingPage from '../pages/Landing/LandingPage.jsx';
import LoginPage from '../pages/Login/LoginPage.jsx';
import SignUpPage from '../pages/SignUp/SignUpPage.jsx';
import HomePage from '../pages/Home/HomePage.jsx';
import Calendar from '../pages/Calendar/Calendar.jsx';
import EventDetails from '../components/EventDetails.jsx';
import Profile from '../pages/Profile/ProfilePage.jsx';
import CreateEvent from '../pages/CreateEvent/CreateEvent.jsx';
import NotificationPage from '../pages/Notification/NotificationPage.jsx';

import ProtectedRoute from '../routes/ProtectedRoute.jsx'; 

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },

  // Protected routes -> redict to login if not authenticated
  // Minh chua co logout nen delete local storage la test logout duoc nha
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/calendar',
    element: (
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    ),
  },
  {
    path: '/event/:id',
    element: (
      <ProtectedRoute>
        <EventDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-event',
    element: (
      <ProtectedRoute>
        <CreateEvent />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <NotificationPage />
      </ProtectedRoute>
    ),
  },
]);

export default router;
