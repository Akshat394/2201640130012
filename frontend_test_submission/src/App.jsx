import React, { useMemo, useState } from 'react'
import RegistrationForm from './components/RegistrationForm.jsx'
import AuthForm from './components/AuthForm.jsx'
import ShortenerForm from './components/ShortenerForm.jsx'
import Dashboard from './components/Dashboard.jsx'
import { CssBaseline, AppBar, Toolbar, Typography, Container, Tabs, Tab, Box, createTheme, ThemeProvider } from '@mui/material'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('shortener_token') || '')
  const [tab, setTab] = useState(0)
  const theme = useMemo(() => createTheme({ palette: { mode: 'light', primary: { main: '#1976d2' } } }), [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>URL Shortener</Typography>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="secondary">
            <Tab label="Register" />
            <Tab label="Authenticate" />
            <Tab label="Shorten" />
            <Tab label="Dashboard" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box hidden={tab !== 0}><RegistrationForm /></Box>
        <Box hidden={tab !== 1}><AuthForm onAuthed={t => { setToken(t); localStorage.setItem('shortener_token', t); }} /></Box>
        <Box hidden={tab !== 2}><ShortenerForm token={token} /></Box>
        <Box hidden={tab !== 3}><Dashboard token={token} /></Box>
      </Container>
    </ThemeProvider>
  )
}


