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
  const [allTranscripts, setAllTranscripts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const removeListener = addAuthListener(setUser)
    return removeListener
  }, [])

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const contract = getContractReadonly()
      // Try to load institution details if user has an institutionId
      if (user?.institutionId) {
        try {
          const inst = await contract.getInstitution(BigInt(user.institutionId))
          // Normalize fields to what the UI expects
          setInstitution({
            name: inst.name,
            isActive: inst.isActive,
            admin: inst.institutionAddress,
            location: inst.accreditationNumber,
            description: `Accreditation: ${inst.accreditationNumber}`,
            registrationDate: BigInt(inst.createdAt)
          })
        } catch (_) {}
      }

      // Load all transcripts
      const totalTranscripts = await contract.getTotalTranscripts()
      const total = Number(totalTranscripts)
      const transcripts = []
      const studentSet = new Set()
      let verifiedCount = 0

      for (let i = 1; i <= total; i++) {
        try {
          const t = await contract.getTranscript(i)
          const normalized = {
            id: Number(t.id),
            studentAddress: t.studentAddress,
            institutionId: Number(t.institutionId),
            degree: t.degree,
            major: t.major,
            ipfsHash: t.ipfsHash,
            isVerified: Boolean(t.isVerified),
            createdAt: Number(t.createdAt),
            updatedAt: Number(t.updatedAt)
          }
          transcripts.push(normalized)
          studentSet.add(normalized.studentAddress.toLowerCase())
          if (normalized.isVerified) verifiedCount++
        } catch (e) {
          // ignore holes
        }
      }

      setAllTranscripts(transcripts)
      setStats({
        totalTranscripts: BigInt(total),
        totalStudents: BigInt(studentSet.size),
        verifiedTranscripts: BigInt(verifiedCount)
      })
    } catch (error) {
      console.error('Failed to load institution data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Access relaxed: allow viewing for any role (for demo/teacher access)

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
            {/* Create action removed for demo */}
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
          <h3 className="card-title">📚 All Student Transcripts</h3>
        </div>
        {allTranscripts.length === 0 ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
            <p>No transcripts found</p>
          </div>
        ) : (
          <div className="table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Student</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Degree</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Major</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Created</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allTranscripts.map(t => (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{t.id}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{t.studentAddress}</td>
                    <td style={{ padding: '8px' }}>{t.degree}</td>
                    <td style={{ padding: '8px' }}>{t.major}</td>
                    <td style={{ padding: '8px' }}>
                      <span className={`badge ${t.isVerified ? 'ok' : 'warn'}`}>
                        {t.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>{new Date(t.createdAt * 1000).toLocaleString()}</td>
                    <td style={{ padding: '8px' }}>
                      <div className="row" style={{ gap: '8px' }}>
                        <Link className="btn xs ghost" to={`/view/${t.id}`}>View</Link>
                        <Link className="btn xs ghost" to={`/verify/${t.id}`}>Verify</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
