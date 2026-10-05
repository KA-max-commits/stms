import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Alert, Box, CircularProgress, Typography } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { buildTheme } from './theme';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Buses from './pages/Buses';
import BusDetails from './pages/BusDetails';
import Drivers from './pages/Drivers';
import RoutesPage from './pages/Routes';
import RouteDetails from './pages/RouteDetails';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Assignments from './pages/Assignments';
import PickupPoints from './pages/PickupPoints';
import Attendance from './pages/Attendance';
import AttendanceHistory from './pages/AttendanceHistory';
import Reports from './pages/Reports';

function Splash() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: 'linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)', color: '#fff' }}>
      <Box sx={{ fontSize: 72, color: '#fbbf24' }} className="bus-bounce"><DirectionsBusIcon fontSize="inherit" /></Box>
      <Box className="road" sx={{ width: 220 }} />
      <Typography fontWeight={700}>School Transport Management System</Typography>
      <CircularProgress size={26} sx={{ color: '#fff' }} />
    </Box>
  );
}

function Protected() {
  const { auth } = useApp();
  return auth ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  const { prefs, loading, snack, setSnack } = useApp();
  const theme = useMemo(() => buildTheme(prefs.mode), [prefs.mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {loading ? <Splash /> : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Protected />}>
            <Route index element={<Dashboard />} />
            <Route path="buses" element={<Buses />} />
            <Route path="buses/:busId" element={<BusDetails />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="routes/:routeId" element={<RouteDetails />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:studentId" element={<StudentDetails />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="pickup-points" element={<PickupPoints />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="attendance/history" element={<AttendanceHistory />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      <Snackbar key={snack?.key} open={!!snack} autoHideDuration={4000} onClose={(_, r) => r !== 'clickaway' && setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snack ? <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(null)} sx={{ width: '100%' }}>{snack.message}</Alert> : undefined}
      </Snackbar>
    </ThemeProvider>
  );
}
