import React from 'react'
import { api } from '../api'

export default function Courses(){
  const [courses, setCourses] = React.useState([])
  React.useEffect(()=>{ api('/api/courses').then(d=>setCourses(d.courses)) },[])
  return (
    <div>
      <h1>All Courses</h1>
      <div className="card">
        {courses.length === 0 ? <p>No courses yet.</p>:
          <ul>
            {courses.map(c=> <li key={c.id}><b>{c.title}</b> — {c.mode}, ${c.price}, {c.location} <span className="muted">Provider: {c.providerName}</span></li>)}
          </ul>
        }
      </div>
    </div>
  )
}
