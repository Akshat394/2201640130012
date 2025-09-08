import React, { useState } from 'react'
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert, Stack, Box } from '@mui/material'
import { apiJson } from '../api'

export default function RegistrationForm() {
  const [form, setForm] = useState({ email: '', name: '', mobileNo: '', githubUsername: '', rollNo: '', accessCode: '' })
  const [err, setErr] = useState('')
  const [creds, setCreds] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      const data = await apiJson('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setCreds(data)
      const blob = new Blob([`clientID:${data.clientID}\nclientSecret:${data.clientSecret}`], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${form.rollNo}_credentials.txt`; a.click()
    } catch (e) { setErr(e.message) }
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        <Box sx={{ display:'grid', gridTemplateColumns: { xs:'1fr', sm:'1fr 1fr' }, gap: 2 }}>
          {['email','name','mobileNo','githubUsername','rollNo','accessCode'].map(k => (
            <TextField key={k} label={k} name={k} fullWidth size="small" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required />
          ))}
        </Box>
        <Button variant="contained" type="submit">Register</Button>
        {err && <Alert severity="error">{err}</Alert>}
      </Stack>
      <Dialog open={!!creds} onClose={()=>setCreds(null)}>
        <DialogTitle>Save your credentials now</DialogTitle>
        <DialogContent>
          <DialogContentText>
            These are shown once. Store them securely.
          </DialogContentText>
          {creds && <pre style={{ whiteSpace:'pre-wrap' }}>clientID: {creds.clientID}{'\n'}clientSecret: {creds.clientSecret}</pre>}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setCreds(null)} autoFocus>Done</Button>
        </DialogActions>
      </Dialog>
    </form>
  )
}


