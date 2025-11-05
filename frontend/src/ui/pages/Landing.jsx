import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="grid cols-3" style={{ alignItems: 'stretch' }}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🎓 Student Login</h3>
        </div>
        <p style={{ color: 'var(--muted)' }}>Login with PRN to view your transcripts.</p>
        <Link className="btn" to="/student-login">Go to Student Login</Link>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🏛️ Institution Access</h3>
        </div>
        <p style={{ color: 'var(--muted)' }}>Create transcripts and search records. Public access for now.</p>
        <Link className="btn" to="/institution">Go to Institution</Link>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔍 Guest Search</h3>
        </div>
        <p style={{ color: 'var(--muted)' }}>Search any student's transcripts by PRN.</p>
        <Link className="btn" to="/guest">Go to Guest Search</Link>
      </div>
    </div>
  )
}





