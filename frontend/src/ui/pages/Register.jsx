import React from 'react'
import { getContract } from '../../lib/contract'

export default function Register() {
  const [name, setName] = React.useState('')
  const [studentId, setStudentId] = React.useState('')
  const [status, setStatus] = React.useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('Submitting...')
    try {
      const c = await getContract()
      const tx = await c.registerStudent(name, studentId)
      await tx.wait()
      setStatus('Registered successfully')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 520 }}>
      <form onSubmit={onSubmit} className="grid">
        <h3>Register Student</h3>
        <div className="field">
          <label className="label">Name</label>
          <input className="input" placeholder="Jane Doe" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div className="field">
          <label className="label">Student ID</label>
          <input className="input" placeholder="ST2024xxx" value={studentId} onChange={(e)=>setStudentId(e.target.value)} required />
        </div>
        <div className="row">
          <button className="btn" type="submit">Register</button>
          <div className={`status ${status.includes('successfully') ? 'ok' : status ? 'err' : ''}`}>{status}</div>
        </div>
      </form>
    </div>
  )
}


