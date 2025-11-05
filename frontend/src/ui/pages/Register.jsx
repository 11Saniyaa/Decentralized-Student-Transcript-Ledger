import React from 'react'
import { getContract } from '../../lib/contract'

export default function Register() {
  const [name, setName] = React.useState('')
  const [studentId, setStudentId] = React.useState('')
  const [branch, setBranch] = React.useState('Computer Science')
  const [contact, setContact] = React.useState('')
  const [status, setStatus] = React.useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('Submitting...')
    try {
      const c = await getContract()
      const tx = await c.registerStudent(name, studentId, branch, contact)
      await tx.wait()
      setStatus('Registered successfully')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 700 }}>
      <form onSubmit={onSubmit} className="grid">
        <h3>Register Student</h3>
        <div className="field">
          <label className="label">Name</label>
          <input className="input" placeholder="Jane Doe" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div className="field">
          <label className="label">PRN</label>
          <input className="input" placeholder="PRN001" value={studentId} onChange={(e)=>setStudentId(e.target.value.toUpperCase())} required />
        </div>
        <div className="grid cols-2">
          <div className="field">
            <label className="label">Branch</label>
            <select className="select" value={branch} onChange={(e)=>setBranch(e.target.value)}>
              <option>Computer Science</option>
              <option>Electrical</option>
              <option>Mechanical</option>
              <option>Civil</option>
              <option>Information Technology</option>
              <option>Electronics & Telecom</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Contact</label>
            <input className="input" placeholder="email or phone" value={contact} onChange={(e)=>setContact(e.target.value)} required />
          </div>
        </div>
        <div className="row">
          <button className="btn" type="submit">Register</button>
          <div className={`status ${status.includes('successfully') ? 'ok' : status ? 'err' : ''}`}>{status}</div>
        </div>
      </form>
    </div>
  )
}


