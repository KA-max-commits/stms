import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Card, Typography, TextField, Button, Alert, InputAdornment, IconButton, Chip, Stack, Avatar } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useApp } from '../context/AppContext';
import { LANGS } from '../i18n';

export default function Login() {
  const { auth, login, register, t, prefs, setLang } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@school.rw');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const isSignup = mode === 'signup';

  if (auth) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (isSignup && !name.trim()) return setError('Name is required.');
    if (!normalizedEmail || !password) return setError('Email and password are required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return setError('Enter a valid email address.');
    if (isSignup) {
      if (password.length < 8) return setError('Password must be at least 8 characters.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
      if (register(name, normalizedEmail, password)) navigate('/');
      else setError('An account with this email already exists.');
      return;
    }
    if (login(normalizedEmail, password)) navigate('/');
    else setError('Invalid email or password.');
  };

  const toggleMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <Box className="grad-anim" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb,#0ea5e9)' }}>
      {[...Array(6)].map((_, i) => (
        <Box key={i} className="float" sx={{ position: 'absolute', width: 60 + i * 30, height: 60 + i * 30, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.06)', left: `${8 + i * 16}%`, top: `${(i * 37) % 80}%`, animationDelay: `${i * 0.6}s` }} />
      ))}
      <Box sx={{ position: 'absolute', bottom: 40, left: 0, right: 0, height: 50, overflow: 'hidden', display: { xs: 'none', sm: 'block' } }}>
        <Box sx={{ position: 'absolute', bottom: 8, color: '#fbbf24', fontSize: 44, animation: 'busDrive 14s linear infinite' }}><DirectionsBusIcon fontSize="inherit" /></Box>
        <Box className="road" sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      </Box>

      <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 16, right: 16 }}>
        {LANGS.map((l) => <Chip key={l.code} label={`${l.flag} ${l.code.toUpperCase()}`} onClick={() => setLang(l.code)} color={prefs.lang === l.code ? 'secondary' : 'default'} sx={{ bgcolor: prefs.lang === l.code ? undefined : 'rgba(255,255,255,.85)' }} />)}
      </Stack>

      <Card className="anim-in" sx={{ width: '100%', maxWidth: 430, p: { xs: 3, sm: 4 }, borderRadius: 4, backdropFilter: 'blur(12px)', bgcolor: 'rgba(255,255,255,.96)', color: '#0f172a' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar className="float" variant="rounded" sx={{ bgcolor: '#fbbf24', color: '#1e3a8a', width: 68, height: 68, mx: 'auto', mb: 2, boxShadow: 4 }}><DirectionsBusIcon sx={{ fontSize: 42 }} /></Avatar>
          <Typography variant="h5" fontWeight={800} color="#1e3a8a">{t('School Transport')} {t('Management System')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{t(isSignup ? 'Create your staff account' : 'Sign in to continue')}</Typography>
        </Box>
        <form onSubmit={submit} noValidate>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}
          {isSignup && <TextField fullWidth label={t('Full name')} value={name} onChange={(e) => { setName(e.target.value); setError(''); }} sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon fontSize="small" /></InputAdornment> }} />}
          <TextField fullWidth label={t('Email')} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }} />
          <TextField fullWidth label={t('Password')} type={show ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow(!show)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
          {isSignup && <TextField fullWidth label={t('Confirm password')} type={show ? 'text' : 'password'} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} sx={{ mt: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment> }} />}
          <Button type="submit" fullWidth size="large" variant="contained" sx={{ mt: 2, py: 1.4, fontSize: 16, background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}>{t(isSignup ? 'Create account' : 'Sign in')}</Button>
        </form>
        <Button fullWidth onClick={toggleMode} sx={{ mt: 1 }}>
          {t(isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up")}
        </Button>
        <Alert severity="info" sx={{ mt: 2 }}>
          {isSignup ? t('Accounts are saved only in this browser. This demo has no database or secure authentication.') : <><strong>{t('Demo account')}:</strong> admin@school.rw / admin123<br />{t('Accounts are saved only in this browser.')}</>}
        </Alert>
      </Card>
    </Box>
  );
}
