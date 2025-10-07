import React from 'react'
import { uploadFileWithFallback } from '../../lib/ipfs'

export default function IpfsTest() {
  const [file, setFile] = React.useState(null)
  const [status, setStatus] = React.useState('')
  const [hash, setHash] = React.useState('')

  const testUpload = async () => {
    if (!file) {
      setStatus('Please select a file first')
      return
    }

    setStatus('Uploading...')
    try {
      const ipfsHash = await uploadFileWithFallback(file)
      setHash(ipfsHash)
      setStatus('✅ Upload successful!')
    } catch (error) {
      setStatus(`❌ Upload failed: ${error.message}`)
    }
  }

  const openInIpfs = () => {
    if (hash) {
      window.open(`https://ipfs.io/ipfs/${hash}`, '_blank')
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 500 }}>
      <h3>🧪 IPFS Upload Test</h3>
      <div className="grid">
        <div className="field">
          <label className="label">Test File</label>
          <input 
            className="file" 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
          />
        </div>
        
        <div className="row">
          <button className="btn" onClick={testUpload} disabled={!file}>
            Upload to IPFS
          </button>
          {hash && (
            <button className="btn ghost" onClick={openInIpfs}>
              View in IPFS
            </button>
          )}
        </div>
        
        {hash && (
          <div className="field">
            <label className="label">IPFS Hash</label>
            <div style={{ 
              background: '#0e1629', 
              padding: '8px 12px', 
              borderRadius: '8px', 
              fontFamily: 'monospace',
              fontSize: '12px',
              wordBreak: 'break-all'
            }}>
              {hash}
            </div>
          </div>
        )}
        
        <div className={`status ${status.includes('✅') ? 'ok' : status.includes('❌') ? 'err' : ''}`}>
          {status}
        </div>
      </div>
    </div>
  )
}
