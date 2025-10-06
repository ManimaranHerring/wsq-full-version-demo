import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Courses from './pages/Courses.jsx'
import { api } from './api'

function Nav({ user, onLogout }){
  return (
    <nav>
      <div><Link to="/" style={{fontWeight:700}}>WSQ Demo</Link></div>
      <div>
        <Link to="/courses">Courses</Link>
        {user ? (
          <>
            <span style={{margin:'0 8px'}}>Hi, {user.name} ({user.role})</span>
            <Link to="/dashboard">Dashboard</Link>
            <a href="#" onClick={(e)=>{e.preventDefault(); onLogout()}} style={{marginLeft:8}}>Logout</a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default function App(){
  const [user, setUser] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(()=>{
    api('/api/auth/me').then(d=>{ setUser(d.user); setReady(true); }).catch(()=> setReady(true));
  },[]);

  async function logout(){
    await api('/api/auth/logout', { method:'POST' });
    setUser(null);
    navigate('/login');
  }

  if (!ready) return null;

  return (
    <div>
      <Nav user={user} onLogout={logout}/>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/courses" />} />
          <Route path="/courses" element={<Courses/>} />
          <Route path="/login" element={<Login onAuthed={setUser}/>} />
          <Route path="/register" element={<Register onAuthed={setUser}/>} />
          <Route path="/dashboard" element={<Dashboard user={user}/>} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </div>
    </div>
  )
}
