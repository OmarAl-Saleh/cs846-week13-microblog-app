import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import PostCard from '../components/PostCard'

export default function Profile(){
  const { username } = useParams()
  const [posts, setPosts] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(()=>{
    if(!username) return
    api.get(`/api/users/${encodeURIComponent(username)}`).then(r=> setProfile(r.data.user))
    api.get(`/api/users/${encodeURIComponent(username)}/posts`).then(r=> setPosts(r.data.posts || []))
  },[username])

  return (
    <div className="container">
      <div className="profile-header card">
        <div className="avatar">{profile?.display_name?.slice(0,2) ?? username?.slice(0,2)}</div>
        <div>
          <h2 style={{ margin: 0 }}>{profile?.display_name || username}</h2>
          <div className="muted">@{username}</div>
          {profile && <div className="muted">Joined: {new Date(profile.created_at).toLocaleDateString()}</div>}
        </div>
      </div>

      <div className="feed">
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  )
}
