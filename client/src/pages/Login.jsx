import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login({ onAuthed }){
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError('')
    try{
      const { user } = await api('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
      onAuthed(user)
      navigate('/dashboard')
    }catch(err){ setError(err.message) }
  }

  return (
    <div>
      <h1>Login</h1>
      <div className="card">
        {error && <div className="muted">{error}</div>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          <div style={{marginTop:10}}>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Demo Accounts</h3>
        <ul>
          <li>Admin — admin@wsq.sg / Admin@123</li>
          <li>Corporate HR — hr@company.sg / Hr@123</li>
          <li>Provider — provider@train.sg / Prov@123</li>
          <li>Learner — learner@demo.sg / Learn@123</li>
        </ul>
      </div>
    </div>
  )
}
