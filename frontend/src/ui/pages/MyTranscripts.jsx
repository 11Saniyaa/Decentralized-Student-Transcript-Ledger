import React, { useState } from 'react'
import { getContractReadonly } from '../../lib/contract'
import { getIpfsUrl } from '../../lib/ipfs'

export default function MyTranscripts() {
  const [prn, setPrn] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSearch = async (e) => {
    e?.preventDefault?.()
    setLoading(true)
    setError('')
    try {
      const c = getContractReadonly()
      const addr = await (await c).getStudentAddressById(prn.trim())
      if (addr === '0x0000000000000000000000000000000000000000') {
        setRows([])
        setError('Student not found')
        setLoading(false)
        return
      }
      const ids = await (await c).getStudentTranscripts(addr)
      const list = []
      for (let i = 0; i < ids.length; i++) {
        const id = Number(ids[i])
        const t = await (await c).getTranscript(id)
        list.push({
          id,
          degree: t.degree,
          major: t.major,
          verified: Boolean(t.isVerified),
          createdAt: Number(t.createdAt),
          ipfsHash: t.ipfsHash
        })
      }
      setRows(list)
    } catch (e) {
      console.error(e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1>📚 My Transcripts</h1>
        <p style={{ color: 'var(--muted)' }}>Enter your PRN to view all transcripts.</p>
      </div>
      <form onSubmit={onSearch} className="row" style={{ gap: 12, marginBottom: 16 }}>
        <input className="input" placeholder="Enter PRN" value={prn} onChange={(e)=>setPrn(e.target.value)} required />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
      </form>
      {error && <div className={`status ${error ? 'err' : ''}`}>{error}</div>}
      {rows.length > 0 && (
        <div className="table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Degree</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Major</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Created</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>IPFS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px' }}>{r.id}</td>
                  <td style={{ padding: '8px' }}>{r.degree}</td>
                  <td style={{ padding: '8px' }}>{r.major}</td>
                  <td style={{ padding: '8px' }}><span className={`badge ${r.verified ? 'ok' : 'warn'}`}>{r.verified ? 'Verified' : 'Pending'}</span></td>
                  <td style={{ padding: '8px' }}>{new Date(r.createdAt * 1000).toLocaleString()}</td>
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


