import React, { useEffect, useState } from 'react'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Collapse, IconButton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { API_BASE, authHeaders } from '../api'

export default function Dashboard({ token }) {
  const [links, setLinks] = useState([])
  const [err, setErr] = useState('')
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    if (!token) { setLinks([]); return }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/shorturls`, { headers: { ...authHeaders(token) } })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        setLinks(data.links || [])
      } catch (e) { setErr(e.message) }
    })()
  }, [token])

  if (!token) return <Alert severity="info">Authenticate to view your links.</Alert>

  return (
    <>
      {err && <Alert severity="error">{err}</Alert>}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Shortcode</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Redirects</TableCell>
              <TableCell>Clicks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map(l => (
              <React.Fragment key={l.shortcode}>
                <TableRow>
                  <TableCell>{l.shortcode}</TableCell>
                  <TableCell>{l.url}</TableCell>
                  <TableCell>{new Date(l.expiry).toLocaleString()}</TableCell>
                  <TableCell>{l.redirects}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={async ()=>{
                      const stats = await (await fetch(`${API_BASE}/shorturls/${l.shortcode}/stats`)).json()
                      setExpanded(prev => ({...prev, [l.shortcode]: stats}))
                    }}>
                      <ExpandMoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5}>
                    <Collapse in={!!expanded[l.shortcode]}>
                      {expanded[l.shortcode] && (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Time</TableCell>
                              <TableCell>Referrer</TableCell>
                              <TableCell>User Agent</TableCell>
                              <TableCell>IP</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(expanded[l.shortcode].clicks || []).map((c, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{c.ts ? new Date(c.ts).toLocaleString() : ''}</TableCell>
                                <TableCell>{c.referrer || ''}</TableCell>
                                <TableCell>{c.userAgent || ''}</TableCell>
                                <TableCell>{c.ip || ''}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}


