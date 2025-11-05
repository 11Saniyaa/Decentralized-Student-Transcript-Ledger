import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentDashboardNew from './pages/StudentDashboardNew';
import InstitutionDashboardNew from './pages/InstitutionDashboardNew';
import TranscriptViewer from './pages/TranscriptViewer';
import Profile from './pages/Profile';
import TransactionLog from './pages/TransactionLog';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      // Student routes
      { path: 'student/dashboard', element: <StudentDashboardNew /> },
      { path: 'student/transactions', element: <TransactionLog /> },
      { path: 'student/profile', element: <Profile /> },
      // Institution routes
      { path: 'institution/dashboard', element: <InstitutionDashboardNew /> },
      { path: 'institution/transactions', element: <TransactionLog /> },
      { path: 'institution/profile', element: <Profile /> },
      // Shared routes
      { path: 'transcript/:id', element: <TranscriptViewer /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
