import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getContractReadonly } from '../../lib/contract'
import { getIpfsUrl } from '../../lib/ipfs'

export default function ViewTranscript() {
  const { id } = useParams()
  const [t, setT] = React.useState(null)
  const [courses, setCourses] = React.useState([])
  const [gpa, setGpa] = React.useState('0.00')

  React.useEffect(() => {
    (async () => {
      const c = getContractReadonly()
      const tr = await c.getTranscript(BigInt(id))
      const cs = await c.getTranscriptCourses(BigInt(id))
      const g = await c.calculateGPA(BigInt(id))
      setT(tr)
      setCourses(cs)
      setGpa((Number(g)/100).toFixed(2))
    })()
  }, [id])

  if (!t) return <div>Loading...</div>

  return (
    <div className="grid cols-2">
      <div className="panel">
        <h3>Transcript #{id}</h3>
        <div className="grid">
          <div className="row"><span className="label" style={{ minWidth: 140 }}>Student</span> {t.studentAddress}</div>
          <div className="row"><span className="label" style={{ minWidth: 140 }}>Degree</span> {t.degree}</div>
          <div className="row"><span className="label" style={{ minWidth: 140 }}>Major</span> {t.major}</div>
          <div className="row"><span className="label" style={{ minWidth: 140 }}>Graduation</span> {t.graduationDate?.toString?.() || 'N/A'}</div>
          <div className="row"><span className="label" style={{ minWidth: 140 }}>Verified</span> {t.isVerified ? 'Yes' : 'No'}</div>
          {t.ipfsHash && (
            <div className="row"><span className="label" style={{ minWidth: 140 }}>Document</span> <a className="link" href={getIpfsUrl(t.ipfsHash)} target="_blank" rel="noreferrer">View Document</a></div>
          )}
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <div className="kpi"><div className="value">{gpa}</div><div className="caption">GPA</div></div>
          <Link className="btn" to={`/verify/${id}`}>Verify</Link>
        </div>
      </div>
      <div className="panel">
        <h3>Courses</h3>
        <div className="grid">
          {courses.map((c, i) => (
            <div key={i} className="kpi" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div className="caption">{c.courseCode}</div>
              <div style={{ textAlign: 'right' }}>{c.credits} cr</div>
              <div style={{ gridColumn: '1 / span 2' }}>{c.courseName}</div>
              <div className="row" style={{ gridColumn: '1 / span 2', justifyContent: 'space-between' }}>
                <span className="caption">Grade</span>
                <strong>{c.grade}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


