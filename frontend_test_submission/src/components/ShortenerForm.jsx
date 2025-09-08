import React, { useState } from 'react'
import { TextField, Button, Alert, IconButton, InputAdornment, Snackbar, Stack, Box } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { apiJson, authHeaders } from '../api'

export default function ShortenerForm({ token }) {
  const [form, setForm] = useState({ url:'', validity:30, shortcode:'' })
  const [rows, setRows] = useState([{ url:'', validity:30, shortcode:'' }])
  const [result, setResult] = useState('')
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErr(''); setResult('')
    try {
      const data = await apiJson('/shorturls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ ...form, validity: Number(form.validity) || 30, shortcode: form.shortcode || undefined })
      })
      setResult(`${data.shortLink}`)
    } catch (e) { setErr(e.message) }
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        {rows.map((r, idx) => (
          <Box key={idx} sx={{ display:'grid', gridTemplateColumns: { xs:'1fr', sm:'1fr 1fr' }, gap: 2 }}>
            <TextField label={`URL #${idx+1}`} fullWidth size="small" value={r.url} onChange={e=>setRows(rows.map((x,i)=> i===idx?{...x,url:e.target.value}:x))} required />
            <TextField label="Validity (mins)" fullWidth size="small" value={r.validity} onChange={e=>setRows(rows.map((x,i)=> i===idx?{...x,validity:e.target.value}:x))} />
            <TextField label="Custom Shortcode (optional)" fullWidth size="small" value={r.shortcode} onChange={e=>setRows(rows.map((x,i)=> i===idx?{...x,shortcode:e.target.value}:x))} />
          </Box>
        ))}
        <div>
          <Button size="small" onClick={() => { if (rows.length < 5) setRows([...rows, { url:'', validity:30, shortcode:'' }]) }}>Add another</Button>
          <Button sx={{ ml: 1 }} variant="contained" type="submit" onClick={async (e)=>{
            e.preventDefault()
            setErr(''); setResult('')
            try {
              const created = []
              for (const r of rows) {
                if (!r.url) continue
                const data = await apiJson('/shorturls', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
                  body: JSON.stringify({ ...r, validity: Number(r.validity) || 30, shortcode: r.shortcode || undefined })
                })
                created.push(data.shortLink)
              }
              setResult(created.join('\n'))
            } catch (e) { setErr(e.message) }
          }}>Shorten</Button>
        </div>
        {result && (
          <Box>
            <TextField fullWidth size="small" value={result} InputProps={{ readOnly: true, endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="copy" onClick={() => { navigator.clipboard.writeText(result); setCopied(true) }}>
                  <ContentCopyIcon />
                </IconButton>
              </InputAdornment>
            ) }} />
            <Snackbar open={copied} autoHideDuration={2000} onClose={()=>setCopied(false)} message="Copied" />
          </Box>
        )}
        {err && <Alert severity="error">{err}</Alert>}
      </Stack>
    </form>
  )
}


