import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { connectWallet, disconnectWallet, getCurrentUser, addAuthListener, getRoleInfo, ROLES, setDemoRole } from '../../lib/auth'

export default function Header() {
  const [user, setUser] = useState(getCurrentUser())
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const removeListener = addAuthListener(setUser)
    return removeListener
  }, [])
  
  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      alert(error.message)
    }
  }
  
  const handleDisconnect = () => {
    disconnectWallet()
  }
  
  const isActive = (path) => location.pathname === path
  
  const roleInfo = getRoleInfo(user.role)
  
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/', label: 'Institution Access' },
      { path: '/register', label: 'Register' }
    ]
    
    if (user.role === ROLES.STUDENT) {
      return [
        ...baseItems,
        { path: '/register', label: 'Register', icon: '📝' }
      ]
    }
    
    if (user.role === ROLES.INSTITUTION) {
      return baseItems
    }
    
    if (user.role === ROLES.VERIFIER) {
      return [
        ...baseItems,
        { path: '/verify', label: 'Verify', icon: '✅' }
      ]
    }
    
    if (user.role === ROLES.ADMIN) {
      return [
        ...baseItems,
        { path: '/admin', label: 'Admin', icon: '⚙️' }
      ]
    }
    
    return baseItems
  }
  
  return (
    <header className="header">
      <div className="brand">
        <div>
          <h2 className="title">Transcript Ledger</h2>
          <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '-4px' }}>
            Decentralized Academic Records
          </div>
        </div>
      </div>
      
      <nav className="nav">
        {getNavigationItems().map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="row" style={{ gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Role:</span>
          <select
            className="select"
            value={user.role || ''}
            onChange={(e) => {
              const val = e.target.value
              if (!val) return
              setDemoRole(val)
              if (val === ROLES.INSTITUTION) navigate('/institution')
              if (val === ROLES.STUDENT) navigate('/my-transcripts')
            }}
            style={{ padding: '6px 8px' }}
          >
            <option value="">Guest</option>
            <option value={ROLES.INSTITUTION}>Institution</option>
            <option value={ROLES.STUDENT}>Student</option>
          </select>
        </div>
        {user.isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="role-badge" data-role={roleInfo.color}>
              <span>{roleInfo.icon}</span>
              {roleInfo.name}
            </div>
            
            <div style={{
              fontSize: '12px',
              color: 'var(--muted)',
              fontFamily: 'monospace',
              background: 'var(--bg)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {user.account.slice(0, 6)}...{user.account.slice(-4)}
            </div>
            
            <button 
              className="btn ghost"
              onClick={handleDisconnect}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button className="btn" onClick={handleConnect}>
            <span>🔗</span>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  )
}
