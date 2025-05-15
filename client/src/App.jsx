import React, { useContext, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/Home/HomePage.jsx';
import Calendar from './pages/Calendar/Calendar.jsx';
import EventDetails from './pages/EventDetails/EventDetails.jsx';
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
import ErrorPage from './pages/Error/ErrorPage.jsx';
import AdminErrorPage from './pages/Error/AdminErrorPage.jsx';
import { singleEventLoader } from "./lib/loaders";
import EditEvent from './pages/EditEvent/EditEvent.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import { NotificationContext } from './context/notificationContext.jsx';
import { AuthContext } from './context/authContext.jsx';


function App() {
  const { fetchNewCount } = useContext(NotificationContext);
  const { currentUser } = useContext(AuthContext);

  // Fetch notifications when the app loads and user is logged in
  useEffect(() => {
    if (currentUser) {
      console.log("App initialized with user, checking for notifications");
      fetchNewCount();
    }
  }, [currentUser, fetchNewCount]);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
      errorElement: <ErrorPage />
    },
    {
      path: "/login",
      element: <LoginPage />,
      errorElement: <ErrorPage />
    },
    {
      path: "/admin/dashboard",
      element:
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>,
      errorElement: <AdminErrorPage />
    },
    {
      path: "admin/userpage",
      element:
        <AdminRoute>
          <AdminUserPage />
        </AdminRoute>,
      errorElement: <AdminErrorPage />
    },
    {
      path: "/admin/events",
      element:
        <AdminRoute>
          <AdminEventsPage />
        </AdminRoute>,
      errorElement: <AdminErrorPage />,
    },
    {
      path: "/admin/setting",
      element:
        <AdminRoute>
          <AdminSettingPage />
        </AdminRoute>,
      errorElement: <AdminErrorPage />,
    },
    {
      path: "/signup",
      element: <SignUpPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/home",
      element:
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "event/:id",
          element: <EventDetails />,
          errorElement: <ErrorPage />,
          loader: singleEventLoader
        }
      ]
    },
    {
      path: "/calendar",
      element:
        <ProtectedRoute>
          <Calendar />
        </ProtectedRoute>,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "event/:id",
          element: <EventDetails />,
          errorElement: <ErrorPage />,
          loader: singleEventLoader
        }
      ]
    },
    {
      path: "/event/:id",
      element:
        <ProtectedRoute>
          <EventDetails />
        </ProtectedRoute>,
      errorElement: <ErrorPage />,
      loader: singleEventLoader
    },
    {
      path: "/event/:id/edit",
      element:
        <ProtectedRoute>
          <EditEvent />
        </ProtectedRoute>,
      errorElement: <ErrorPage />,
      loader: singleEventLoader
    },
    {
      path: "/profile",
      element:
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "event/:id",
          element: <EventDetails />,
          errorElement: <ErrorPage />,
          loader: singleEventLoader
        }
      ]
    },
    {
      path: "/create-event",
      element:
        <ProtectedRoute>
          <CreateEvent />
        </ProtectedRoute>,
      errorElement: <ErrorPage />,
    },
    {
      path: "/notifications",
      element:
        <ProtectedRoute>
          <NotificationPage />
        </ProtectedRoute>,
      errorElement: <ErrorPage />,
    },
    {
      path: "/notifications/:notificationId",
      element:
        <ProtectedRoute>
          <NotificationPage />
        </ProtectedRoute>,
      errorElement: <ErrorPage />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;