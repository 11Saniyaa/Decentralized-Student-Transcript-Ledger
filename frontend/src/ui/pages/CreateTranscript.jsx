import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getContract } from '../../lib/contract'
import { uploadFileWithFallback } from '../../lib/ipfs'
import { getCurrentUser, addAuthListener, ROLES, canPerform } from '../../lib/auth'

export default function CreateTranscript() {
  const [user, setUser] = useState(getCurrentUser())
  const [student, setStudent] = useState('')
  const [degree, setDegree] = useState('')
  const [major, setMajor] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const removeListener = addAuthListener(setUser)
    return removeListener
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!canPerform('createTranscript')) {
      setStatus('❌ Only institutions can create transcripts')
      return
    }
    
    setLoading(true)
    setStatus('Creating transcript...')
    
    try {
      let ipfsHash = ''
      if (file) {
        setStatus('Uploading document to IPFS...')
        ipfsHash = await uploadFileWithFallback(file)
      }
      
      setStatus('Creating transcript on blockchain...')
      const c = await getContract()
      const tx = await c.createTranscript(student, degree, major, ipfsHash)
      
      setStatus('Waiting for confirmation...')
      const receipt = await tx.wait()
      
      setStatus(`✅ Transcript created successfully! Transaction: ${receipt.hash}`)
      
      // Reset form
      setStudent('')
      setDegree('')
      setMajor('')
      setFile(null)
      
    } catch (e) {
      console.error('Create transcript error:', e)
      setStatus(`❌ Failed to create transcript: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!canPerform('createTranscript')) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h3>Access Restricted</h3>
          <p className="card-subtitle" style={{ marginBottom: '24px' }}>
            Only registered institutions can create transcripts. Connect with an institution wallet to proceed.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link className="btn" to="/">
              Return to Dashboard
            </Link>
            <Link className="btn ghost" to="/register">
              Register as Student
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: 800 }}>
      <div className="card-header">
        <h3 className="card-title">📝 Create New Transcript</h3>
        <div className="role-badge institution">
          <span>🏛️</span>
          Institution Only
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="grid">
        <div className="grid cols-2">
          <div className="field">
            <label className="label">
              <span>👤</span>
              Student Wallet Address
            </label>
            <input 
              className="input" 
              placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" 
              value={student} 
              onChange={(e)=>setStudent(e.target.value)} 
              required 
            />
            <small style={{ color: 'var(--muted)', fontSize: '12px' }}>
              The student must be registered in the system
            </small>
          </div>
          
          <div className="field">
            <label className="label">
              <span>🎓</span>
              Degree Type
            </label>
            <select className="select" value={degree} onChange={(e)=>setDegree(e.target.value)} required>
              <option value="">Select degree...</option>
              <option value="Bachelor of Science">Bachelor of Science</option>
              <option value="Bachelor of Arts">Bachelor of Arts</option>
              <option value="Master of Science">Master of Science</option>
              <option value="Master of Arts">Master of Arts</option>
              <option value="Doctor of Philosophy">Doctor of Philosophy</option>
              <option value="Associate Degree">Associate Degree</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
        </div>
        
        <div className="grid cols-2">
          <div className="field">
            <label className="label">
              <span>📚</span>
              Major/Field of Study
            </label>
            <input 
              className="input" 
              placeholder="Computer Science, Business Administration, etc." 
              value={major} 
              onChange={(e)=>setMajor(e.target.value)} 
              required 
            />
          </div>
          
          <div className="field">
            <label className="label">
              <span>📄</span>
              Supporting Documents
            </label>
            <input 
              className="file" 
              type="file" 
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e)=>setFile(e.target.files?.[0] || null)} 
            />
            <small style={{ color: 'var(--muted)', fontSize: '12px' }}>
              Optional: Upload transcript, certificates, or supporting documents
            </small>
          </div>
        </div>
        
        <div className="row" style={{ marginTop: '16px' }}>
          <button 
            className="btn" 
            type="submit" 
            disabled={loading}
            style={{ minWidth: '140px' }}
          >
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Creating...
              </div>
            ) : (
              <>
                <span>➕</span>
                Create Transcript
              </>
            )}
          </button>
          
          <Link className="btn ghost" to="/institution/dashboard">
            Cancel
          </Link>
        </div>
        
        {status && (
          <div className={`status ${status.includes('✅') ? 'ok' : status.includes('❌') ? 'err' : ''}`}>
            {status}
          </div>
        )}
      </form>
    </div>
  )
}


