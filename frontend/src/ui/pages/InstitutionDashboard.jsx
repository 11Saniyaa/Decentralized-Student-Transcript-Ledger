import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getContractReadonly, getContract } from '../../lib/contract'
import { getCurrentUser, addAuthListener, ROLES } from '../../lib/auth'

export default function InstitutionDashboard() {
  const [user, setUser] = useState(getCurrentUser())
  const [institution, setInstitution] = useState(null)
  const [stats, setStats] = useState({
    totalTranscripts: 0n,
    totalStudents: 0n,
    verifiedTranscripts: 0n
  })
  const [recentTranscripts, setRecentTranscripts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const removeListener = addAuthListener(setUser)
    return removeListener
  }, [])

  useEffect(() => {
    if (user.role === ROLES.INSTITUTION && user.institutionId !== null) {
      loadInstitutionData()
    }
  }, [user])

  const loadInstitutionData = async () => {
    try {
      const contract = getContractReadonly()
      
      // Get institution details
      const institutionData = await contract.getInstitution(BigInt(user.institutionId))
      setInstitution(institutionData)
      
      // Get stats
      const totalTranscripts = await contract.getTotalTranscripts()
      setStats(prev => ({ ...prev, totalTranscripts }))
      
      // Load recent transcripts (simplified - in real app you'd filter by institution)
      // For now, we'll just show total count
      
    } catch (error) {
      console.error('Failed to load institution data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user.role !== ROLES.INSTITUTION) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h3>Access Denied</h3>
          <p className="card-subtitle">
            This page is only accessible to registered institutions.
          </p>
          <Link className="btn" to="/" style={{ marginTop: '16px' }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading">
          <div className="spinner"></div>
          Loading institution data...
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>🏛️ Institution Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '18px', margin: '8px 0 0 0' }}>
          Manage your institution's academic records and student transcripts
        </p>
      </div>

      {institution && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">{institution.name}</h3>
              <p className="card-subtitle">
                {institution.location} • Institution ID: {user.institutionId}
              </p>
            </div>
            <div className="role-badge institution">
              <span>🏛️</span>
              Institution
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
            {institution.description}
          </p>
        </div>
      )}

      <div className="grid cols-4" style={{ marginBottom: '32px' }}>
        <div className="kpi">
          <div className="value">{stats.totalTranscripts.toString()}</div>
          <div className="caption">Total Transcripts</div>
        </div>
        <div className="kpi">
          <div className="value">{stats.totalStudents.toString()}</div>
          <div className="caption">Registered Students</div>
        </div>
        <div className="kpi">
          <div className="value">{stats.verifiedTranscripts.toString()}</div>
          <div className="caption">Verified Transcripts</div>
        </div>
        <div className="kpi">
          <div className="value">
            {stats.totalTranscripts > 0n 
              ? Math.round((Number(stats.verifiedTranscripts) / Number(stats.totalTranscripts)) * 100)
              : 0
            }%
          </div>
          <div className="caption">Verification Rate</div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 Quick Actions</h3>
          </div>
          <div className="grid" style={{ gap: '12px' }}>
            <Link className="btn" to="/create">
              <span>➕</span>
              Create New Transcript
            </Link>
            <Link className="btn ghost" to="/institution/students">
              <span>👥</span>
              Manage Students
            </Link>
            <Link className="btn ghost" to="/institution/transcripts">
              <span>📚</span>
              View All Transcripts
            </Link>
            <Link className="btn ghost" to="/institution/analytics">
              <span>📊</span>
              Analytics & Reports
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Recent Activity</h3>
          </div>
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
            <p>No recent activity</p>
            <small>Transcript creation and updates will appear here</small>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '32px' }}>
        <div className="card-header">
          <h3 className="card-title">🏛️ Institution Management</h3>
        </div>
        <div className="grid cols-3">
          <div className="field">
            <label className="label">Institution Status</label>
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: institution?.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: institution?.isActive ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${institution?.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              fontWeight: '600'
            }}>
              {institution?.isActive ? '✅ Active' : '❌ Inactive'}
            </div>
          </div>
          
          <div className="field">
            <label className="label">Admin Address</label>
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              fontFamily: 'monospace',
              fontSize: '12px',
              wordBreak: 'break-all'
            }}>
              {institution?.admin}
            </div>
          </div>
          
          <div className="field">
            <label className="label">Registration Date</label>
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)'
            }}>
              {institution?.registrationDate ? 
                new Date(Number(institution.registrationDate) * 1000).toLocaleDateString() :
                'N/A'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
