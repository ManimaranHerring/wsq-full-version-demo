import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register({ onAuthed }){
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState('learner')
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError('')
    try{
      const { user } = await api('/api/auth/register', { method:'POST', body: JSON.stringify({ name, email, password, role }) })
      onAuthed(user)
      navigate('/dashboard')
    }catch(err){ setError(err.message) }
  }

  return (
    <div>
      <h1>Register</h1>
      <p>In this demo, only <b>Learner</b> and <b>Provider</b> can self-register.</p>
      <div className="card">
        {error && <div className="muted">{error}</div>}
        <form onSubmit={submit}>
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} required />
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          <div style={{margin:'8px 0'}}>
            <label><input type="radio" name="role" value="learner" checked={role==='learner'} onChange={()=>setRole('learner')} /> Learner</label>{' '}
            <label><input type="radio" name="role" value="provider" checked={role==='provider'} onChange={()=>setRole('provider')} /> Provider</label>
          </div>
          <button type="submit">Create account</button>
        </form>
      </div>
    </div>
  )
}
