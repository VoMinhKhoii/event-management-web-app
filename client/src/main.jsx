import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthContextProvider } from './context/authContext.jsx';
import { NotificationContextProvider } from './context/notificationContext.jsx';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

JavascriptTimeAgo.addLocale(en);  // Changed from addDefaultLocale to addLocale



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <NotificationContextProvider>
        <App />
      </NotificationContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);