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
import AdminUserPage from './Admin/AdminUserPage.jsx';
import AdminEventsPage from './Admin/AdminEventsPage.jsx';
import AdminDashboard from './Admin/AdminDashboard.jsx';
import { singleEventLoader } from "./lib/loaders";
import { eventCommentsLoader } from "./lib/loaders";
import EditEvent from './pages/EditEvent/EditEvent.jsx';

function App() {
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
      path: "/admindashboard",
      element: <AdminDashboard />
    },
    {
      path: "/adminuserpage",
      element: <AdminUserPage />
    },
    {
      path: "/adminevents",
      element: <AdminEventsPage />
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
      element: <EventDetails />,
      loader: singleEventLoader
    },
    {
      path: "/event/:id/edit",
      element: <EditEvent />,
      loader: singleEventLoader
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
  return <RouterProvider router={router} />;
}

export default App;
