import React from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api'

function LearnerDash(){
  const [courses, setCourses] = React.useState([])
  React.useEffect(()=>{ api('/api/courses').then(d=>setCourses(d.courses)) },[])
  return (
    <div className="grid">
      <div className="card">
        <h3>Available Courses</h3>
        <ul>
          {courses.map(c=> <li key={c.id}><b>{c.title}</b> — {c.mode}, ${c.price}, {c.location} <span className="muted">Provider: {c.providerName}</span></li>)}
        </ul>
      </div>
      <div className="card">
        <h3>Your Activity</h3>
        <p>In a full build, this shows enrollments & progress.</p>
      </div>
    </div>
  )
}

function CorporateDash(){
  const [learners, setLearners] = React.useState([])
  React.useEffect(()=>{ api('/api/corporate/learners').then(d=>setLearners(d.learners)) },[])
  return (
    <div className="grid">
      <div className="card">
        <h3>Staff (demo: all learners)</h3>
        <ul>{learners.map(l=> <li key={l.id}><b>{l.name}</b> — {l.email}</li>)}</ul>
        <p className="muted">Next: assign courses, track completions, export.</p>
      </div>
      <div className="card">
        <h3>Shortlists / Assignments</h3>
        <p>Placeholder.</p>
      </div>
    </div>
  )
}

function ProviderDash(){
  const [title, setTitle] = React.useState('')
  const [mode, setMode] = React.useState('Classroom')
  const [price, setPrice] = React.useState(0)
  const [location, setLocation] = React.useState('Singapore')
  const [courses, setCourses] = React.useState([])

  async function load(){ const d = await api('/api/provider/courses'); setCourses(d.courses) }
  React.useEffect(()=>{ load() },[])

  async function add(e){
    e.preventDefault()
    await api('/api/provider/courses', { method:'POST', body: JSON.stringify({ title, mode, price, location }) })
    setTitle(''); setMode('Classroom'); setPrice(0); setLocation('Singapore'); await load()
  }

  return (
    <div>
      <h3>Provider Portal</h3>
      <div className="card">
        <form onSubmit={add}>
          <label>Title</label><input value={title} onChange={e=>setTitle(e.target.value)} required/>
          <label>Mode</label><input value={mode} onChange={e=>setMode(e.target.value)} />
          <label>Price (SGD)</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} />
          <label>Location</label><input value={location} onChange={e=>setLocation(e.target.value)} />
          <div style={{marginTop:10}}><button type="submit">Add Course</button></div>
        </form>
      </div>
      <div className="card">
        <h3>Your Courses</h3>
        <ul>{courses.map(c=> <li key={c.id}><b>{c.title}</b> — {c.mode}, ${c.price}, {c.location}</li>)}</ul>
      </div>
    </div>
  )
}

function AdminDash(){
  const [s, setS] = React.useState(null)
  React.useEffect(()=>{ api('/api/admin/summary').then(setS) },[])
  if (!s) return null
  return (
    <div className="grid">
      <div className="card">
        <h3>Users</h3>
        <ul>
          <li>Total: <b>{s.totalUsers}</b></li>
          <li>Learners: <b>{s.learners}</b></li>
          <li>Corporate: <b>{s.corporates}</b></li>
          <li>Providers: <b>{s.providers}</b></li>
          <li>Admins: <b>{s.admins}</b></li>
        </ul>
      </div>
      <div className="card">
        <h3>Courses</h3>
        <p>Total: <b>{s.courses}</b></p>
      </div>
    </div>
  )
}

export default function Dashboard({ user }){
  if (!user) return <Navigate to="/login" />
  return (
    <div>
      <h1>Dashboard</h1>
      {user.role === 'learner' && <LearnerDash/>}
      {user.role === 'corporate' && <CorporateDash/>}
      {user.role === 'provider' && <ProviderDash/>}
      {user.role === 'admin' && <AdminDash/>}
    </div>
  )
}
