import React, { useMemo, useState } from 'react'
import { uploadFileWithFallback, getIpfsUrl } from '../../lib/ipfs'
import { getContract, getContractReadonly } from '../../lib/contract'
import { canPerform } from '../../lib/auth'

const BRANCHES = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology', 'Electronics & Telecom']
const YEARS = ['FY', 'SY', 'TY', 'BE']
const SEMS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8']

const DEMO_STUDENTS = [
  { prn: 'PRN001', name: 'Ayesha Khan', branch: 'Computer Science', year: 'BE', sem: 'Sem 8' },
  { prn: 'PRN002', name: 'Ravi Patel', branch: 'Computer Science', year: 'TY', sem: 'Sem 6' },
  { prn: 'PRN003', name: 'Neha Sharma', branch: 'Electrical', year: 'SY', sem: 'Sem 4' },
  { prn: 'PRN004', name: 'Arjun Mehta', branch: 'Mechanical', year: 'FY', sem: 'Sem 2' },
]

function makeMockTranscript({ id, prn, degree = 'B.E.', branch = 'Computer Science', semIndex = 7 }) {
  const cgpa = (7 + Math.random() * 3).toFixed(2) // under 10
  const courses = Array.from({ length: 5 }, (_, i) => ({
    code: `CS${semIndex + 1}0${i + 1}`,
    name: `Course ${i + 1}`,
    credits: 4,
    grade: ['A', 'A-', 'B+', 'B'][Math.floor(Math.random() * 4)]
  }))
  return {
    id,
    prn,
    degree,
    branch,
    semester: SEMS[semIndex] || 'Sem 8',
    cgpa,
    verified: Math.random() > 0.3,
    ipfsHash: '',
    courses
  }
}

export default function InstitutionAccess() {
  const [prnQuery, setPrnQuery] = useState('')
  const [branch, setBranch] = useState('Computer Science')
  const [year, setYear] = useState('BE')
  const [sem, setSem] = useState('Sem 8')
  const [creating, setCreating] = useState(false)
  const [createStatus, setCreateStatus] = useState('')
  const [file, setFile] = useState(null)
  const [studentAddress, setStudentAddress] = useState('')
  const [prnForCreate, setPrnForCreate] = useState('')
  const [degree, setDegree] = useState('Bachelor of Engineering')
  const [major, setMajor] = useState('Computer Science')
  const [semester, setSemester] = useState('Sem 8')
  const [transcripts, setTranscripts] = useState([])
  const [searchResults, setSearchResults] = useState([])

  const filteredStudents = useMemo(() => {
    return DEMO_STUDENTS.filter(s => s.branch === branch && s.year === year && s.sem === sem)
  }, [branch, year, sem])

  const onCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setCreateStatus('Preparing transcript...')
    try {
      let ipfsHash = ''
      if (file) {
        setCreateStatus('Uploading to IPFS...')
        ipfsHash = await uploadFileWithFallback(file)
      } else {
        const demoBlob = new Blob([JSON.stringify({ degree, major, semester, createdAt: Date.now() })], { type: 'application/json' })
        const demoFile = new File([demoBlob], 'transcript.json', { type: 'application/json' })
        ipfsHash = await uploadFileWithFallback(demoFile)
      }
      setCreateStatus('Finalizing...')

      // Resolve address by PRN if wallet not provided
      let targetAddress = studentAddress
      if (!targetAddress && prnForCreate) {
        const cr = getContractReadonly()
        const addr = await (await cr).getStudentAddressById(prnForCreate.trim())
        if (addr && addr !== '0x0000000000000000000000000000000000000000') {
          targetAddress = addr
        }
      }

      if (targetAddress) {
        const c = await getContract()
        const tx = await c.createTranscript(targetAddress, degree, major, semester, ipfsHash)
        await tx.wait()
        setCreateStatus(`✅ Transcript created on-chain. IPFS: ${ipfsHash}`)
      } else {
        // Local-only fallback record if no chain access
        const nextId = transcripts.length + 1
        const newT = makeMockTranscript({ id: nextId, prn: prnForCreate || prnQuery || 'PRN001', semIndex: Math.min(transcripts.length, 7) })
        newT.ipfsHash = ipfsHash
        newT.verified = false
        setTranscripts(prev => [newT, ...prev])
        setCreateStatus(`✅ Transcript created. IPFS: ${ipfsHash}`)
      }
      setStudentAddress('')
      setPrnForCreate('')
      setDegree('Bachelor of Engineering')
      setMajor('Computer Science')
      setSemester('Sem 8')
      setFile(null)
    } catch (e) {
      console.error(e)
      setCreateStatus(`❌ Failed: ${e.message}`)
    } finally {
      setCreating(false)
    }
  }

  const verifyTranscript = async (id) => {
    setTranscripts(prev => prev.map(t => t.id === id ? { ...t, verified: true } : t))
  }

  const onSearch = async () => {
    const prn = prnQuery.trim()
    if (!prn) return
    try {
      const c = getContractReadonly()
      const addr = await (await c).getStudentAddressById(prn)
      if (addr === '0x0000000000000000000000000000000000000000') {
        setSearchResults([])
        return
      }
      const student = await (await c).getStudentById(prn)
      const ids = await (await c).getStudentTranscripts(addr)
      const rows = []
      for (let i = 0; i < ids.length; i++) {
        const id = Number(ids[i])
        const t = await (await c).getTranscript(id)
        rows.push({
          id,
          wallet: addr,
          prn,
          name: student.name,
          branch: student.branch,
          semester: t.semester,
          ipfsHash: t.ipfsHash,
          verified: Boolean(t.isVerified),
          degree: t.degree,
          major: t.major,
          createdAt: Number(t.createdAt)
        })
      }
      setSearchResults(rows)
    } catch (e) {
      console.error(e)
      setSearchResults([])
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1>Institution Access</h1>
        <p style={{ color: 'var(--muted)' }}>Public access page. Wallet not required for viewing.</p>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Create New Transcript</h3>
          </div>
          <form onSubmit={onCreate} className="grid">
            <div className="grid cols-2">
              <div className="field">
                <label className="label">Student Wallet (optional)</label>
                <input className="input" placeholder="0x..." value={studentAddress} onChange={(e)=>setStudentAddress(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Degree</label>
                <input className="input" value={degree} onChange={(e)=>setDegree(e.target.value)} />
              </div>
            </div>
            <div className="grid cols-2">
              <div className="field">
                <label className="label">PRN</label>
                <input className="input" placeholder="PRN001" value={prnForCreate} onChange={(e)=>setPrnForCreate(e.target.value.toUpperCase())} />
              </div>
              <div className="field">
                <label className="label">Major/Branch</label>
                <input className="input" value={major} onChange={(e)=>setMajor(e.target.value)} />
              </div>
            </div>
            <div className="grid cols-2">
              <div className="field">
                <label className="label">Semester</label>
                <select className="select" value={semester} onChange={(e)=>setSemester(e.target.value)}>
                  {SEMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Attach File (optional)</label>
                <input className="file" type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
              </div>
            </div>
            <div className="row" style={{ gap: '12px' }}>
              <button className="btn" type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Transcript'}
              </button>
            </div>
            {createStatus && <div className={`status ${createStatus.toLowerCase().includes('failed') || createStatus.toLowerCase().includes('error') ? 'err' : 'ok'}`}>{createStatus}</div>}
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Search by PRN</h3>
          </div>
          <div className="row" style={{ gap: '12px' }}>
            <input className="input" placeholder="Enter PRN e.g. PRN001" value={prnQuery} onChange={(e)=>setPrnQuery(e.target.value)} />
            <button className="btn" onClick={onSearch}>Search</button>
          </div>
          <small style={{ color: 'var(--muted)' }}>Enter PRN to see that student's transcript records.</small>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Students by Branch • Year • Sem</h3>
        </div>
        <div className="grid cols-3">
          <div className="field">
            <label className="label">Branch</label>
            <select className="select" value={branch} onChange={(e)=>setBranch(e.target.value)}>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Year</label>
            <select className="select" value={year} onChange={(e)=>setYear(e.target.value)}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Semester</label>
            <select className="select" value={sem} onChange={(e)=>setSem(e.target.value)}>
              {SEMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {filteredStudents.length === 0 ? (
          <div style={{ color: 'var(--muted)', padding: '16px' }}>No students in this selection</div>
        ) : (
          <div className="table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>PRN</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Branch</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Year/Sem</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.prn} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>{s.prn}</td>
                    <td style={{ padding: '8px' }}>{s.name}</td>
                    <td style={{ padding: '8px' }}>{s.branch}</td>
                    <td style={{ padding: '8px' }}>{s.year} / {s.sem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Transcript Records</h3>
        </div>
        {searchResults.length === 0 ? (
          <div style={{ color: 'var(--muted)', padding: '16px' }}>Search a PRN to view transcripts</div>
        ) : (
          <div className="table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Wallet</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>PRN</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Branch</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Semester</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Degree</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Major</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>IPFS Hash</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>{r.id}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{r.wallet}</td>
                    <td style={{ padding: '8px' }}>{r.prn}</td>
                    <td style={{ padding: '8px' }}>{r.name}</td>
                    <td style={{ padding: '8px' }}>{r.branch}</td>
                    <td style={{ padding: '8px' }}>{r.semester}</td>
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

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Registered Students</h3>
        </div>
        <RegisteredStudents />
      </div>
    </div>
  )
}

function RegisteredStudents() {
  const [list, setList] = React.useState([])
  React.useEffect(() => {
    (async () => {
      try {
        const c = getContractReadonly()
        const total = await (await c).getTotalStudents()
        const items = []
        for (let i = 0; i < Number(total); i++) {
          const s = await (await c).getStudentAt(i)
          items.push({ prn: s.studentId, name: s.name, branch: s.branch, wallet: s.studentAddress })
        }
        setList(items)
      } catch (e) {
        setList([])
      }
    })()
  }, [])
  if (list.length === 0) return <div style={{ color: 'var(--muted)', padding: '16px' }}>No students found</div>
  return (
    <div className="table" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>PRN</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Branch</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Wallet</th>
          </tr>
        </thead>
        <tbody>
          {list.map(s => (
            <tr key={s.prn} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px' }}>{s.prn}</td>
              <td style={{ padding: '8px' }}>{s.name}</td>
              <td style={{ padding: '8px' }}>{s.branch}</td>
              <td style={{ padding: '8px', fontFamily: 'monospace' }}>{s.wallet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


