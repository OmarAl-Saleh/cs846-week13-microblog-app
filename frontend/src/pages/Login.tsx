import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, signup } from '../services/auth'
import { useAuth } from '../contexts/AuthContext'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const auth = useAuth()

  async function handle(action: 'login' | 'signup'){
    setError(null)
    try{
      if(action === 'login') await auth.login(username, password)
      else await auth.signup(username, password, displayName)
      nav('/feed')
    }catch(e:any){
      const resp = e?.response?.data
      const serverMsg = resp?.errors?.[0]?.msg || resp?.error || resp?.message
      setError(serverMsg || e?.message || 'Unknown error')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Login / Signup</h2>
        <label>Username</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} />
        <label>Display name (optional for signup)</label>
        <input value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" onClick={()=>handle('login')}>Login</button>
          <button className="btn" onClick={()=>handle('signup')} style={{ marginLeft: 8 }}>Signup</button>
        </div>
      </div>
    </div>
  )
}
