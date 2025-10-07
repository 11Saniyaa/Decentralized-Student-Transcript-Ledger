import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getContractReadonly } from '../../lib/contract'
import { getCurrentUser, addAuthListener, ROLES, getRoleInfo } from '../../lib/auth'
import IpfsTest from '../components/IpfsTest'

export default function Dashboard() {
  const [user, setUser] = useState(getCurrentUser())
  const [stats, setStats] = useState({ institutions: 0n, transcripts: 0n })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const removeListener = addAuthListener(setUser)
    return removeListener
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const c = getContractReadonly()
        const totalInstitutions = await c.getTotalInstitutions()
        const totalTranscripts = await c.getTotalTranscripts()
        setStats({ institutions: totalInstitutions, transcripts: totalTranscripts })
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const roleInfo = getRoleInfo(user.role)

  const getRoleBasedContent = () => {
    switch (user.role) {
      case ROLES.STUDENT:
        return (
          <div className="grid cols-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🎓 Student Portal</h3>
                <div className="role-badge student">
                  <span>🎓</span>
                  Student
                </div>
              </div>
              <p className="card-subtitle">
                View your academic transcripts and records
              </p>
              <div className="row" style={{ marginTop: '16px' }}>
                <Link className="btn" to="/my-transcripts">
                  📚 My Transcripts
                </Link>
                <Link className="btn ghost" to="/register">
                  📝 Update Profile
                </Link>
              </div>
            </div>
            
            <div className="card">
              <h3>Quick Stats</h3>
              <div className="grid cols-2">
                <div className="kpi">
                  <div className="value">0</div>
                  <div className="caption">My Transcripts</div>
                </div>
                <div className="kpi">
                  <div className="value">0</div>
                  <div className="caption">Verified Records</div>
                </div>
              </div>
            </div>
          </div>
        )

      case ROLES.INSTITUTION:
        return (
          <div className="grid cols-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🏛️ Institution Portal</h3>
                <div className="role-badge institution">
                  <span>🏛️</span>
                  Institution
                </div>
              </div>
              <p className="card-subtitle">
                Manage student transcripts and academic records
              </p>
              <div className="row" style={{ marginTop: '16px' }}>
                <Link className="btn" to="/create">
                  ➕ Create Transcript
                </Link>
                <Link className="btn ghost" to="/institution/students">
                  👥 Manage Students
                </Link>
              </div>
            </div>
            
            <div className="card">
              <h3>Institution Stats</h3>
              <div className="grid cols-2">
                <div className="kpi">
                  <div className="value">0</div>
                  <div className="caption">Issued Transcripts</div>
                </div>
                <div className="kpi">
                  <div className="value">0</div>
                  <div className="caption">Active Students</div>
                </div>
              </div>
            </div>
          </div>
        )

      case ROLES.VERIFIER:
        return (
          <div className="grid cols-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">✅ Verifier Portal</h3>
                <div className="role-badge verifier">
                  <span>✅</span>
                  Verifier
                </div>
              </div>
              <p className="card-subtitle">
                Verify transcript authenticity and integrity
              </p>
              <div className="row" style={{ marginTop: '16px' }}>
                <Link className="btn" to="/verify">
                  🔍 Verify Transcripts
                </Link>
              </div>
            </div>
            
            <div className="card">
              <h3>Verification Stats</h3>
              <div className="grid cols-2">
                <div className="kpi">
                  <div className="value">0</div>
                  <div className="caption">Verified Today</div>
                </div>
                <div className="kpi">
                  <div className="value">0</div>
                  <div className="caption">Total Verified</div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
              <h3>Connect Your Wallet</h3>
              <p className="card-subtitle" style={{ marginBottom: '24px' }}>
                Connect your wallet to access role-based features and manage academic records
              </p>
              <div className="row" style={{ justifyContent: 'center' }}>
                <Link className="btn" to="/register">
                  📝 Register as Student
                </Link>
                <Link className="btn ghost" to="/create">
                  🏛️ Institution Access
                </Link>
              </div>
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading">
          <div className="spinner"></div>
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>Welcome to Transcript Ledger</h1>
        <p style={{ color: 'var(--muted)', fontSize: '18px', margin: '8px 0 0 0' }}>
          {user.isConnected 
            ? `Hello, ${roleInfo.name}! ${roleInfo.description}` 
            : 'Connect your wallet to get started'
          }
        </p>
      </div>

      {getRoleBasedContent()}

      <div className="grid cols-2" style={{ marginTop: '32px' }}>
        <div className="card">
          <h3>🌐 Network Overview</h3>
          <div className="grid cols-2">
            <div className="kpi">
              <div className="value">{stats.institutions.toString()}</div>
              <div className="caption">Institutions</div>
            </div>
            <div className="kpi">
              <div className="value">{stats.transcripts.toString()}</div>
              <div className="caption">Total Transcripts</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3>🧪 IPFS Test</h3>
          <p className="card-subtitle">
            Test file uploads to decentralized storage
          </p>
          <IpfsTest />
        </div>
      </div>
    </div>
  )
}


