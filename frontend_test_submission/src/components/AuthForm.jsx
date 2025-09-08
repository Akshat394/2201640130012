import React, { useState } from 'react'
import { TextField, Button, Alert, Stack, Box } from '@mui/material'
import { apiJson } from '../api'

export default function AuthForm({ onAuthed }) {
  const [form, setForm] = useState({ email:'', name:'', rollNo:'', accessCode:'', clientID:'', clientSecret:'' })
  const [err, setErr] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      const data = await apiJson('/auth/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      onAuthed && onAuthed(data.token)
    } catch (e) { setErr(e.message) }
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        <Box sx={{ display:'grid', gridTemplateColumns: { xs:'1fr', sm:'1fr 1fr' }, gap: 2 }}>
          {['email','name','rollNo','accessCode','clientID','clientSecret'].map(k => (
            <TextField key={k} label={k} name={k} fullWidth size="small" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required />
          ))}
        </Box>
        <Button variant="contained" type="submit">Get Token</Button>
        {err && <Alert severity="error">{err}</Alert>}
      </Stack>
    </form>
  )
}


