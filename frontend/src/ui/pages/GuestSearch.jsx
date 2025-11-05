import React, { useState } from 'react'
import { getContractReadonly } from '../../lib/contract'
import { getIpfsUrl } from '../../lib/ipfs'

export default function GuestSearch() {
  const [prn, setPrn] = useState('')
  const [rows, setRows] = useState([])
  const [info, setInfo] = useState(null)
  const [status, setStatus] = useState('')

  const onSearch = async (e) => {
    e?.preventDefault?.()
    setStatus('Searching...')
    try {
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
      setStatus(items.length ? '' : 'No transcripts yet')
    } catch (e) {
      setStatus(e.message)
      setRows([])
      setInfo(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1>🔍 Guest Transcript Search</h1>
        <p style={{ color: 'var(--muted)' }}>Search by PRN. No login required.</p>
      </div>
      <form onSubmit={onSearch} className="row" style={{ gap: 12, marginBottom: 16 }}>
        <input className="input" placeholder="Enter PRN" value={prn} onChange={(e)=>setPrn(e.target.value)} required />
        <button className="btn" type="submit">Search</button>
      </form>
      {status && <div className={`status ${status.includes('No ') ? '' : status.startsWith('❌') ? 'err' : ''}`}>{status}</div>}
      {info && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div><strong>Wallet:</strong> <span style={{ fontFamily: 'monospace' }}>{info.wallet}</span></div>
          <div><strong>PRN:</strong> {info.prn}</div>
          <div><strong>Name:</strong> {info.name}</div>
          <div><strong>Branch:</strong> {info.branch}</div>
        </div>
      )}
      {rows.length > 0 && (
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
      )}
    </div>
  )
}





