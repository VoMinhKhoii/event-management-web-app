import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthContextProvider } from './context/authContext.jsx';
import { AdminAuthContextProvider } from "./context/adminAuthContext"; // << include this
import { NotificationContextProvider } from './context/notificationContext.jsx';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

JavascriptTimeAgo.addLocale(en);  // Changed from addDefaultLocale to addLocale

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <AdminAuthContextProvider>
        <NotificationContextProvider>
          <App />
        </NotificationContextProvider>
      </AdminAuthContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);