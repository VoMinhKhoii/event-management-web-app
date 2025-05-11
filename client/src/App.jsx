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
import AdminUserPage from './pages/Admin/AdminUserPage.jsx';
import AdminEventsPage from './pages/Admin/AdminEventsPage.jsx';
import AdminSettingPage from './pages/Admin/AdminSettingPage.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import { singleEventLoader } from "./lib/loaders";
import { eventCommentsLoader } from "./lib/loaders";
import EditEvent from './pages/EditEvent/EditEvent.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';


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
      path: "/admin/dashboard",
      element: 
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    },
    {
      path: "admin/userpage",
      element: 
        <AdminRoute>
          <AdminUserPage />
        </AdminRoute>
    },
    {
      path: "/admin/events",
      element: 
      <AdminRoute>
        <AdminEventsPage />
      </AdminRoute>
    },
    {
      path: "/admin/setting",
      element: 
      <AdminRoute>
        <AdminSettingPage />
      </AdminRoute>
    },
    {
      path: "/signup",
      element: <SignUpPage />
    },
    {
      path: "/home",
      element: 
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    },
    {
      path: "/calendar",
      element: 
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    },
    {
      path: "/event/:id",
      element: 
      <ProtectedRoute>
        <EventDetails />
      </ProtectedRoute>,
      loader: singleEventLoader
    },
    {
      path: "/event/:id/edit",
      element: 
      <ProtectedRoute>
        <EditEvent />
      </ProtectedRoute>,
      loader: singleEventLoader
    },
    {
      path: "/profile",
      element: 
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    },
    {
      path: "/create-event",
      element: 
      <ProtectedRoute>
        <CreateEvent />
      </ProtectedRoute>
    },
    {
      path: "/notifications",
      element: 
      <ProtectedRoute> 
        <NotificationPage />
      </ProtectedRoute>
    }
  ]);
  return <RouterProvider router={router} />;
}

export default App;