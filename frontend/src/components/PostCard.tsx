import React, { useState } from 'react'
import api from '../services/api'

export default function PostCard({ post }:{ post:any }){
  const [likes, setLikes] = useState(post.like_count ?? 0)
  const [liked, setLiked] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState<any[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [savingReply, setSavingReply] = useState(false)

  async function like(){
    try{
      const res = await api.post(`/api/posts/${post.id}/like`)
      setLikes(res.data.likeCount ?? likes)
      setLiked(true)
    }catch(e){
      console.error(e)
    }
  }

  async function loadReplies(){
    setLoadingReplies(true)
    try{
      const res = await api.get(`/api/posts/${post.id}/replies`)
      setReplies(res.data.replies || [])
    }catch(e){
      console.error(e)
    }finally{
      setLoadingReplies(false)
    }
  }

  async function submitReply(){
    const content = replyText?.trim()
    if(!content) return
    if(content.length > 280) return alert('Reply must be 280 characters or less')
    setSavingReply(true)
    try{
      const res = await api.post(`/api/posts/${post.id}/reply`, { content })
      // backend returns the created reply object directly
      const created = res.data
      setReplies(prev => [created, ...prev])
      setReplyText('')
      setShowReply(false)
    }catch(e){
      console.error(e)
      alert(e?.response?.data?.error || 'Failed to post reply')
    }finally{
      setSavingReply(false)
    }
  }

  return (
    <div className="card post-card">
      <div className="post-body">
        <div className="post-content">{post.content}</div>
        <div className="post-meta">
          by <a href={`/profile/${post.username}`}>{post.username}</a> • {new Date(post.created_at).toLocaleString()}
        </div>

        <div className="post-actions" style={{ marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={like} disabled={liked}>Like ({likes})</button>
          {/* Only allow replying to top-level posts */}
          {post.parent_post_id == null && (
            <>
              <button className="btn" onClick={() => { setShowReply(s => !s); if(!showReply) loadReplies() }} style={{ marginLeft: 8 }}>
                Reply
              </button>
            </>
          )}
        </div>

        {/* Reply composer */}
        {showReply && post.parent_post_id == null && (
          <div className="composer" style={{ marginTop: 8 }}>
            <textarea rows={3} value={replyText} onChange={e=>setReplyText(e.target.value)} />
            <div>
              <button className="btn btn-primary" onClick={submitReply} disabled={savingReply}>Submit Reply</button>
              <button className="btn" onClick={()=>setShowReply(false)} style={{ marginLeft: 8 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Replies list */}
        {loadingReplies ? <div className="muted">Loading replies...</div> : (
          replies.length > 0 && (
            <div className="replies">
              {replies.map(r => (
                <div key={r.id} className="reply">
                  <div className="post-content">{r.content}</div>
                  <div className="post-meta">by {r.username} • {new Date(r.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
