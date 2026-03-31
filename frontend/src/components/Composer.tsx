import React, { useState } from 'react'
import api from '../services/api'

export default function Composer({ onCreated }:{ onCreated?: (p:any)=>void }){
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(){
    if(!text.trim()) return
    if(text.trim().length > 280) return alert('Post must be 280 characters or less')
    setSaving(true)
    try{
      const res = await api.post('/api/posts', { content: text })
      // backend returns the created post object directly (not wrapped), so use res.data
      onCreated?.(res.data)
      setText('')
    }catch(e){
      console.error(e)
      alert(e?.response?.data?.error || 'Failed to create post')
    }finally{ setSaving(false) }
  }

  return (
    <div className="card composer">
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} />
      <div className="meta">
        <div className="char-count">{text.length}/280</div>
        <div>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>Post</button>
        </div>
      </div>
    </div>
  )
}
