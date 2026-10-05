import React, { useState, useMemo } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Badge, Avatar, Menu, MenuItem, Divider, Tooltip, useMediaQuery, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BadgeIcon from '@mui/icons-material/Badge';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PlaceIcon from '@mui/icons-material/Place';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import TranslateIcon from '@mui/icons-material/Translate';
import RestoreIcon from '@mui/icons-material/Restore';
import { useApp } from '../context/AppContext';
import { LANGS } from '../i18n';
import { daysUntil } from '../utils/helpers';

const W = 268;
export const NAV = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { to: '/buses', label: 'Buses', icon: <DirectionsBusIcon /> },
  { to: '/drivers', label: 'Drivers', icon: <BadgeIcon /> },
  { to: '/routes', label: 'Routes', icon: <AltRouteIcon /> },
  { to: '/students', label: 'Students', icon: <SchoolIcon /> },
  { to: '/assignments', label: 'Bus Assignments', icon: <AssignmentIndIcon /> },
  { to: '/pickup-points', label: 'Pickup Points', icon: <PlaceIcon /> },
  { to: '/attendance', label: 'Transport Attendance', icon: <FactCheckIcon /> },
  { to: '/attendance/history', label: 'Attendance History', icon: <HistoryIcon /> },
  { to: '/reports', label: 'Reports', icon: <AssessmentIcon /> },
];

function pageTitle(path) {
  if (path.startsWith('/buses/')) return 'Bus Details';
  if (path.startsWith('/routes/')) return 'Route Details';
  if (path.startsWith('/students/')) return 'Student Details';
  return (NAV.find((n) => (n.end ? path === n.to : path.startsWith(n.to) && !(n.to === '/attendance' && path.startsWith('/attendance/history')))) || NAV[0]).label;
}

export default function Layout() {
  const { t, prefs, setLang, toggleMode, auth, logout, busRows, drivers, resetData } = useApp();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langAnchor, setLangAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);
  const loc = useLocation();
  const navigate = useNavigate();

  const alertCount = useMemo(() => busRows.filter((b) => b.state === 'full' || b.state === 'near').length +
    drivers.filter((d) => daysUntil(d.licenseExpiry) <= 60).length, [busRows, drivers]);
  const current = LANGS.find((l) => l.code === prefs.lang);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box className="grad-anim" sx={{ p: 2.5, color: '#fff', background: 'linear-gradient(135deg,#1e3a8a,#2563eb,#0ea5e9)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar variant="rounded" sx={{ bgcolor: '#fbbf24', color: '#1e3a8a', width: 44, height: 44 }}><span className="bus-bounce"><DirectionsBusIcon /></span></Avatar>
        <Box>
          <Typography fontWeight={800} lineHeight={1.15}>{t('School Transport')}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>{t('Management System')}</Typography>
        </Box>
      </Box>
      <List sx={{ px: 1.5, py: 2, flex: 1, overflow: 'auto' }}>
        {NAV.map((n, i) => (
          <ListItemButton key={n.to} component={NavLink} to={n.to} end={n.end || n.to === '/attendance'} onClick={() => setMobileOpen(false)}
            className="anim-left" style={{ '--i': i }}
            sx={{ borderRadius: 2.5, mb: 0.5, transition: 'all .2s', '&:hover': { transform: 'translateX(4px)' }, '&.active': { bgcolor: 'primary.main', color: '#fff', boxShadow: 3, '& .MuiListItemIcon-root': { color: '#fff' } } }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{n.icon}</ListItemIcon>
            <ListItemText primary={t(n.label)} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 1.5 }}>
        <ListItemButton sx={{ borderRadius: 2.5 }} onClick={resetData}>
          <ListItemIcon sx={{ minWidth: 40 }}><RestoreIcon /></ListItemIcon>
          <ListItemText primary="Reset demo data" primaryTypographyProps={{ fontSize: 13 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" elevation={0} color="inherit" className="no-print"
        sx={{ width: { md: `calc(100% - ${W}px)` }, ml: { md: `${W}px` }, backdropFilter: 'blur(10px)', bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(19,28,46,.85)' : 'rgba(255,255,255,.85)'), borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && <IconButton edge="start" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>}
          <Typography variant="h6" sx={{ flex: 1 }} noWrap>{t(pageTitle(loc.pathname))}</Typography>
          <Tooltip title={t('Language')}>
            <Chip icon={<TranslateIcon />} label={`${current.flag} ${current.code.toUpperCase()}`} onClick={(e) => setLangAnchor(e.currentTarget)} variant="outlined" />
          </Tooltip>
          <Menu anchorEl={langAnchor} open={!!langAnchor} onClose={() => setLangAnchor(null)}>
            {LANGS.map((l) => <MenuItem key={l.code} selected={l.code === prefs.lang} onClick={() => { setLang(l.code); setLangAnchor(null); }}>{l.flag}&nbsp; {l.label}</MenuItem>)}
          </Menu>
          <Tooltip title={t('Dark mode')}><IconButton onClick={toggleMode}>{prefs.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</IconButton></Tooltip>
          <Tooltip title={t('Transport Alerts')}>
            <IconButton onClick={() => { navigate('/'); setTimeout(() => document.getElementById('alerts')?.scrollIntoView({ behavior: 'smooth' }), 400); }}>
              <Badge badgeContent={alertCount} color="error" className={alertCount ? 'blink' : ''}><NotificationsIcon /></Badge>
            </IconButton>
          </Tooltip>
          <IconButton onClick={(e) => setUserAnchor(e.currentTarget)}><Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 14 }}>{auth?.name?.[0] || 'A'}</Avatar></IconButton>
          <Menu anchorEl={userAnchor} open={!!userAnchor} onClose={() => setUserAnchor(null)}>
            <Box sx={{ px: 2, py: 1 }}><Typography fontWeight={700}>{auth?.name}</Typography><Typography variant="caption" color="text.secondary">{auth?.email}</Typography></Box>
            <Divider />
            <MenuItem onClick={() => { setUserAnchor(null); logout(); }}><LogoutIcon fontSize="small" sx={{ mr: 1 }} /> {t('Sign out')}</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" className="no-print" sx={{ width: { md: W }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: W } }}>{drawer}</Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: W, borderRight: 1, borderColor: 'divider' } }}>{drawer}</Drawer>
      </Box>

      <Box component="main" className="print-main" sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${W}px)` }, mt: 8, p: { xs: 2, sm: 3 } }}>
        <Box key={loc.pathname} className="page-enter"><Outlet /></Box>
      </Box>
    </Box>
  );
}
