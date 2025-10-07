import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './ui/App'
import Register from './ui/pages/Register'
import Dashboard from './ui/pages/Dashboard'
import CreateTranscript from './ui/pages/CreateTranscript'
import ViewTranscript from './ui/pages/ViewTranscript'
import VerifyTranscript from './ui/pages/VerifyTranscript'
import InstitutionDashboard from './ui/pages/InstitutionDashboard'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Dashboard /> },
    { path: 'register', element: <Register /> },
    { path: 'create', element: <CreateTranscript /> },
    { path: 'view/:id', element: <ViewTranscript /> },
    { path: 'verify/:id', element: <VerifyTranscript /> },
    { path: 'institution/dashboard', element: <InstitutionDashboard /> },
    { path: 'my-transcripts', element: <div className="card"><h3>📚 My Transcripts</h3><p>Coming soon...</p></div> },
    { path: 'verify', element: <div className="card"><h3>🔍 Verify Transcripts</h3><p>Coming soon...</p></div> },
    { path: 'admin', element: <div className="card"><h3>⚙️ Admin Panel</h3><p>Coming soon...</p></div> },
  ]}
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)



