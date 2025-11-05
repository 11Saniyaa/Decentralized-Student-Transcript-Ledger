import React, { useState } from 'react'
import { getContractReadonly } from '../../lib/contract'
import { getIpfsUrl } from '../../lib/ipfs'

export default function StudentPortal() {
  const [prn, setPrn] = useState('')
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')

  const onSearch = async () => {
    setStatus('Searching...')
    try {
      const c = getContractReadonly()
      const addr = await (await c).getStudentAddressById(prn.trim())
      if (addr === '0x0000000000000000000000000000000000000000') {
        setRows([])
        setStatus('No student found for this PRN')
        return
      }
      const ids = await (await c).getStudentTranscripts(addr)
      const items = []
      for (let i = 0; i < ids.length; i++) {
        const id = Number(ids[i])
        const t = await (await c).getTranscript(id)
        items.push({
          id,
          degree: t.degree,
          major: t.major,
          verified: Boolean(t.isVerified),
          createdAt: Number(t.createdAt),
          ipfsHash: t.ipfsHash
        })
      }
      setRows(items)
      setStatus(items.length ? '' : 'No transcripts yet')
    } catch (e) {
      setStatus(e.message)
      setRows([])
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1>🎓 My Transcripts</h1>
        <p style={{ color: 'var(--muted)' }}>Enter your PRN to view all transcripts.</p>
      </div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="row" style={{ gap: '12px' }}>
          <input className="input" placeholder="Enter PRN e.g. PRN001" value={prn} onChange={(e)=>setPrn(e.target.value)} />
          <button className="btn" onClick={onSearch}>Search</button>
        </div>
        {status && <div className={`status ${status.includes('No ') ? '' : status.startsWith('❌') ? 'err' : ''}`} style={{ marginTop: 8 }}>{status}</div>}
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📚 Transcript List</h3>
        </div>
        {rows.length === 0 ? (
          <div style={{ color: 'var(--muted)', padding: '16px' }}>No transcripts to display</div>
        ) : (
          <div className="table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Degree</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Major</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>IPFS Hash</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>{r.id}</td>
                    <td style={{ padding: '8px' }}>{r.degree}</td>
                    <td style={{ padding: '8px' }}>{r.major}</td>
                    <td style={{ padding: '8px' }}><span className={`badge ${r.verified ? 'ok' : 'warn'}`}>{r.verified ? 'Verified' : 'Pending'}</span></td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{r.ipfsHash || '-'}</td>
                    <td style={{ padding: '8px' }}>{r.ipfsHash ? <a className="link" href={getIpfsUrl(r.ipfsHash)} target="_blank" rel="noreferrer">Open</a> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


