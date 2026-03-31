import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import { useAuth } from './contexts/AuthContext'

export default function App() {
  const auth = useAuth()

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/feed">Feed</Link>
          {auth.isAuthenticated ? (
            <>
              <Link to={`/profile/${auth.user?.username}`}>Profile</Link>
              <div className="nav-actions">
                <button className="btn" onClick={() => { auth.logout() }}>Logout</button>
              </div>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>
      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={auth.isAuthenticated ? <Navigate to={`/profile/${auth.user?.username}`} /> : <Navigate to="/login" />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/" element={<Feed />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
