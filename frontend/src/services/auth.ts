import api from './api'

export async function login(username:string, password:string){
  const u = username?.trim()
  const p = password?.trim()
  const res = await api.post('/api/auth/login', { username: u, password: p })
  const token = res.data.token
  if(!token) throw new Error('missing_token')
  localStorage.setItem('token', token)
  return res.data
}

export async function signup(username:string, password:string, displayName?:string){
  const u = username?.trim()
  const p = password?.trim()
  const d = displayName?.trim()
  const body: any = { username: u, password: p }
  if(d) body.display_name = d
  const res = await api.post('/api/auth/signup', body)
  const token = res.data.token
  if(!token) throw new Error('missing_token')
  localStorage.setItem('token', token)
  return res.data
}

export function logout(){ localStorage.removeItem('token') }
export function getToken(){ return localStorage.getItem('token') }
export function isAuthenticated(){ return !!getToken() }
