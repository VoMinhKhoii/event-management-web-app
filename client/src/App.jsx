import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes'; // This uses index.jsx by default

function App() {
  return <RouterProvider router={router} />;
}

export default App;
