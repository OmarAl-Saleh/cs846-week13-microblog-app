import React, { useEffect, useState } from 'react'
import api from '../services/api'
import PostCard from '../components/PostCard'
import Composer from '../components/Composer'

export default function Feed(){
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function load(){
    setLoading(true)
    try{
      const res = await api.get('/api/posts?limit=20&page=1')
      setPosts(res.data.posts || [])
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="container">
      <h2 style={{ marginBottom: 12 }}>Global Feed</h2>
      <Composer onCreated={p=>setPosts(prev=>[p, ...prev])} />
      <div className="feed">
        {loading ? <div className="muted">Loading...</div> : posts.map(p=> <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  )
}
