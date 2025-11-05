import React, { useState } from 'react'
import { getContractReadonly } from '../../lib/contract'
import { getIpfsUrl } from '../../lib/ipfs'

export default function StudentLogin() {
  const [prn, setPrn] = useState('')
  const [password, setPassword] = useState('')
  const [rows, setRows] = useState([])
  const [info, setInfo] = useState(null)
  const [status, setStatus] = useState('')

  const onLogin = async (e) => {
    e.preventDefault()
    setStatus('Logging in...')
    try {
      // Accept any password for now
      const c = getContractReadonly()
      const addr = await (await c).getStudentAddressById(prn.trim())
      if (addr === '0x0000000000000000000000000000000000000000') {
        setRows([])
        setInfo(null)
        setStatus('No student found for this PRN')
        return
      }
      const student = await (await c).getStudentById(prn.trim())
      setInfo({ wallet: addr, name: student.name, branch: student.branch, prn: student.studentId })
      const ids = await (await c).getStudentTranscripts(addr)
      const items = []
      for (let i = 0; i < ids.length; i++) {
        const id = Number(ids[i])
        const t = await (await c).getTranscript(id)
        items.push({
          id,
          degree: t.degree,
          major: t.major,
          semester: t.semester,
          verified: Boolean(t.isVerified),
          createdAt: Number(t.createdAt),
          ipfsHash: t.ipfsHash
        })
      }
      setRows(items)
      setStatus('')
    } catch (e) {
      setStatus(e.message)
      setRows([])
      setInfo(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1>🎓 Student Login</h1>
        <p style={{ color: 'var(--muted)' }}>Enter PRN and any password to proceed.</p>
      </div>
      <form onSubmit={onLogin} className="grid" style={{ maxWidth: 600 }}>
        <div className="grid cols-2">
          <div className="field">
            <label className="label">PRN</label>
            <input className="input" placeholder="PRN001" value={prn} onChange={(e)=>setPrn(e.target.value)} required />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button className="btn" type="submit">Login</button>
        </div>
        {status && <div className={`status ${status.includes('No ') ? '' : status.startsWith('❌') ? 'err' : ''}`} style={{ marginTop: 8 }}>{status}</div>}
      </form>
      {info && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div><strong>Wallet:</strong> <span style={{ fontFamily: 'monospace' }}>{info.wallet}</span></div>
          <div><strong>PRN:</strong> {info.prn}</div>
          <div><strong>Name:</strong> {info.name}</div>
          <div><strong>Branch:</strong> {info.branch}</div>
        </div>
      )}
      {rows.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <h3 className="card-title">📚 My Transcripts</h3>
          </div>
          <div className="table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Semester</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Degree</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Major</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>IPFS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>{r.id}</td>
                    <td style={{ padding: '8px' }}>{r.semester}</td>
                    <td style={{ padding: '8px' }}>{r.degree}</td>
                    <td style={{ padding: '8px' }}>{r.major}</td>
                    <td style={{ padding: '8px' }}><span className={`badge ${r.verified ? 'ok' : 'warn'}`}>{r.verified ? 'Verified' : 'Pending'}</span></td>
                    <td style={{ padding: '8px' }}>{r.ipfsHash ? <a className="link" href={getIpfsUrl(r.ipfsHash)} target="_blank" rel="noreferrer">View</a> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}





