import React from 'react'
import { useParams } from 'react-router-dom'
import { getContract } from '../../lib/contract'

export default function VerifyTranscript() {
  const { id } = useParams()
  const [status, setStatus] = React.useState('')

  const verify = async () => {
    setStatus('Verifying...')
    try {
      const c = await getContract()
      const tx = await c.verifyTranscript(BigInt(id))
      await tx.wait()
      setStatus('Verified successfully')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 520 }}>
      <h3>Verify Transcript #{id}</h3>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn" onClick={verify}>Verify</button>
        <div className={`status ${status.includes('success') ? 'ok' : status ? 'err' : ''}`}>{status}</div>
      </div>
    </div>
  )
}


