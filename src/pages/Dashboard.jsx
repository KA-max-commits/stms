import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Chip, List, ListItem, ListItemAvatar, ListItemText, Avatar, Alert, LinearProgress, Button, Table, TableBody, TableRow, TableCell, TableHead, Stack } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import PlaceIcon from '@mui/icons-material/Place';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import BlockIcon from '@mui/icons-material/Block';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { StatCard, SectionCard, StatusChip, CapacityBar, EmptyState } from '../components/common';
import { BusCardGrid } from '../components/BusCard';
import { aggregateAttendance } from '../utils/aggregate';
import { todayStr, daysUntil, initials, pct } from '../utils/helpers';

const COLORS = ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];
const STATE_COLOR = { available: '#16a34a', near: '#f59e0b', full: '#dc2626', out: '#94a3b8' };

export default function Dashboard() {
  const { t, auth, busRows, driverRows, routeRows, pickupRows, studentRows, assignmentRows, attendanceRows, drivers } = useApp();
  const navigate = useNavigate();
  const today = todayStr();

  const d = useMemo(() => {
    const active = assignmentRows.filter((a) => a.status === 'Active');
    const todayRows = attendanceRows.filter((r) => r.date === today);
    const inOps = busRows.filter((b) => b.state !== 'out');
    const totalCap = inOps.reduce((s, b) => s + b.capacity, 0);
    const occupied = busRows.reduce((s, b) => s + b.occupied, 0);
    return {
      active,
      totalBuses: busRows.length,
      activeBuses: busRows.filter((b) => ['In Service', 'Assigned', 'Available'].includes(b.status)).length,
      drivers: drivers.length, students: studentRows.filter((s) => s.assignmentId && s.status === 'Active').length,
      routes: routeRows.length, pickups: pickupRows.length, assigned: active.length,
      available: inOps.reduce((s, b) => s + b.available, 0), occupied,
      present: todayRows.filter((r) => r.status === 'Present').length, absent: todayRows.filter((r) => r.status === 'Absent').length,
      full: busRows.filter((b) => b.state === 'full').length,
      totalCap, fleetPct: pct(occupied, totalCap),
      recent: [...active].sort((a, b) => (b.assignmentDate + b.code).localeCompare(a.assignmentDate + a.code)).slice(0, 6),
      nearFull: busRows.filter((b) => b.state === 'near' || b.state === 'full').sort((a, b) => b.percent - a.percent),
      topRoutes: [...routeRows].sort((a, b) => b.studentCount - a.studentCount).slice(0, 8),
      recentAtt: [...attendanceRows].sort((a, b) => (b.date + b.code).localeCompare(a.date + a.code)).slice(0, 7),
      trend: aggregateAttendance(attendanceRows, (r) => r.date.slice(5)).slice(-14),
      presentVsAbsent: ['Present', 'Absent', 'Late', 'Excused'].map((s) => ({ name: s, value: attendanceRows.filter((r) => r.status === s).length })),
    };
  }, [busRows, driverRows, routeRows, pickupRows, studentRows, assignmentRows, attendanceRows, drivers, today]);

  const alerts = useMemo(() => {
    const a = [];
    busRows.filter((b) => b.state === 'full').forEach((b) => a.push({ sev: 'error', text: `${b.busNumber} — BUS FULL — NO AVAILABLE SEATS (${b.occupied}/${b.capacity})` }));
    busRows.filter((b) => b.state === 'near').forEach((b) => a.push({ sev: 'warning', text: `${b.busNumber} is nearly full: ${b.percent}% occupied, ${b.available} seats left` }));
    busRows.filter((b) => b.status === 'Maintenance' || b.status === 'Out of Service').forEach((b) => a.push({ sev: 'info', text: `${b.busNumber} is ${b.status}` }));
    drivers.forEach((dr) => { const n = daysUntil(dr.licenseExpiry); if (n < 0) a.push({ sev: 'error', text: `${dr.name}: driving license expired ${-n} days ago` }); else if (n <= 60) a.push({ sev: 'warning', text: `${dr.name}: license expires in ${n} days` }); });
    const unassigned = studentRows.filter((s) => !s.assignmentId && s.status === 'Active').length;
    if (unassigned) a.push({ sev: 'info', text: `${unassigned} active students have no bus assignment yet` });
    return a;
  }, [busRows, drivers, studentRows]);

  const cards = [
    ['Total Buses', d.totalBuses, <DirectionsBusIcon />, 'primary'], ['Active Buses', d.activeBuses, <CheckCircleIcon />, 'success'],
    ['Total Drivers', d.drivers, <BadgeIcon />, 'info'], ['Students Using Transport', d.students, <SchoolIcon />, 'secondary'],
    ['Total Routes', d.routes, <AltRouteIcon />, 'primary'], ['Pickup Points', d.pickups, <PlaceIcon />, 'info'],
    ['Assigned Students', d.assigned, <AssignmentTurnedInIcon />, 'success'], ['Available Seats', d.available, <EventSeatIcon />, 'success'],
    ['Occupied Seats', d.occupied, <AirlineSeatReclineNormalIcon />, 'warning'], ['Present Today', d.present, <HowToRegIcon />, 'success'],
    ['Absent Today', d.absent, <PersonOffIcon />, 'error'], ['Buses at Full Capacity', d.full, <BlockIcon />, 'error'],
  ];

  return (
    <Box>
      <Box className="grad-anim anim-in" sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4, p: { xs: 2.5, md: 4 }, mb: 3, color: '#fff', background: 'linear-gradient(120deg,#1e3a8a,#2563eb,#0ea5e9)' }}>
        <Typography variant="h4">{t('Welcome back')}, {auth?.name?.split(' ')[0]} 👋</Typography>
        <Typography sx={{ opacity: 0.9, mt: 0.5 }}>{t('School Transport')} · RP Karongi College · {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
        <Box sx={{ mt: 2, maxWidth: 420 }}>
          <Typography variant="caption">{t('Occupancy')}: {d.occupied}/{d.totalCap} · {d.fleetPct}%</Typography>
          <LinearProgress variant="determinate" value={d.fleetPct} sx={{ height: 10, bgcolor: 'rgba(255,255,255,.25)', '& .MuiLinearProgress-bar': { bgcolor: '#fbbf24' } }} />
        </Box>
        <Box sx={{ position: 'absolute', right: 0, bottom: 14, left: 0, height: 44, overflow: 'hidden', display: { xs: 'none', md: 'block' }, pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', bottom: 6, color: '#fbbf24', fontSize: 38, animation: 'busDrive 16s linear infinite' }}><DirectionsBusIcon fontSize="inherit" /></Box>
          <Box className="road" sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4 }} />
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {cards.map(([label, value, icon, color], i) => <Grid item xs={6} md={4} lg={3} key={label}><StatCard label={label} value={value} icon={icon} color={color} index={i} /></Grid>)}
      </Grid>

      <SectionCard title="Visual Bus Dashboard" action={<Button size="small" onClick={() => navigate('/buses')}>{t('Buses')} →</Button>} sx={{ mb: 3 }} index={2}>
        <BusCardGrid buses={busRows} />
      </SectionCard>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}><SectionCard title="Bus Occupancy" index={3}>
          <Box sx={{ height: 300 }}><ResponsiveContainer><BarChart data={busRows.map((b) => ({ name: b.busNumber.replace('BUS-', 'B'), Occupied: b.occupied, Available: b.available, state: b.state }))} margin={{ left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend />
            <Bar dataKey="Occupied" stackId="a" animationDuration={1200}>{busRows.map((b) => <Cell key={b.id} fill={STATE_COLOR[b.state]} />)}</Bar>
            <Bar dataKey="Available" stackId="a" fill="#cbd5e1" radius={[6, 6, 0, 0]} animationDuration={1200} />
          </BarChart></ResponsiveContainer></Box>
        </SectionCard></Grid>
        <Grid item xs={12} lg={6}><SectionCard title="Students by Route" index={4}>
          <Box sx={{ height: 300 }}><ResponsiveContainer><PieChart><Pie data={routeRows.map((r) => ({ name: r.name, value: r.studentCount }))} dataKey="value" nameKey="name" innerRadius={55} outerRadius={105} paddingAngle={3} animationDuration={1200} label={(e) => e.value}>
            {routeRows.map((r, i) => <Cell key={r.id} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Box>
        </SectionCard></Grid>
        <Grid item xs={12} lg={6}><SectionCard title="Monthly Attendance Trend" index={5}>
          <Box sx={{ height: 280 }}><ResponsiveContainer><LineChart data={d.trend} margin={{ left: -15 }}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend />
            <Line dataKey="Present" stroke="#16a34a" strokeWidth={3} dot={false} animationDuration={1400} /><Line dataKey="Absent" stroke="#dc2626" strokeWidth={2} dot={false} animationDuration={1400} /><Line dataKey="Late" stroke="#f59e0b" strokeWidth={2} dot={false} animationDuration={1400} /></LineChart></ResponsiveContainer></Box>
        </SectionCard></Grid>
        <Grid item xs={12} lg={6}><SectionCard title="Present vs Absent" index={6}>
          <Box sx={{ height: 280 }}><ResponsiveContainer><PieChart><Pie data={d.presentVsAbsent} dataKey="value" nameKey="name" outerRadius={100} animationDuration={1200} label>
            {d.presentVsAbsent.map((s) => <Cell key={s.name} fill={{ Present: '#16a34a', Absent: '#dc2626', Late: '#f59e0b', Excused: '#0ea5e9' }[s.name]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Box>
        </SectionCard></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}><SectionCard title="Today's Bus Schedule" index={7}>
          <Box sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>{['Route', 'Bus', 'Driver', 'Departure Time', 'Return Time', 'Status'].map((h) => <TableCell key={h}><b>{t(h)}</b></TableCell>)}</TableRow></TableHead>
            <TableBody>{[...routeRows].sort((a, b) => a.departureTime.localeCompare(b.departureTime)).map((r) => (
              <TableRow key={r.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/routes/${r.id}`)}><TableCell>{r.name}</TableCell><TableCell>{r.busNumber}</TableCell><TableCell>{r.driverName}</TableCell><TableCell>{r.departureTime}</TableCell><TableCell>{r.returnTime}</TableCell><TableCell><StatusChip status={r.status} /></TableCell></TableRow>))}</TableBody></Table></Box>
        </SectionCard></Grid>
        <Grid item xs={12} lg={5}><SectionCard title="Transport Alerts" id="alerts" index={8}>
          <Stack spacing={1} sx={{ maxHeight: 330, overflow: 'auto' }}>
            {alerts.length === 0 ? <EmptyState text="No alerts" /> : alerts.map((a, i) => <Alert key={i} severity={a.sev} sx={{ py: 0 }} className={a.sev === 'error' ? 'anim-left' : ''}>{a.text}</Alert>)}
          </Stack>
        </SectionCard></Grid>
        <Grid item xs={12} md={6} lg={4}><SectionCard title="Buses Approaching Full Capacity" index={9}>
          {d.nearFull.length === 0 ? <EmptyState /> : d.nearFull.map((b) => (
            <Box key={b.id} sx={{ mb: 1.5, cursor: 'pointer' }} onClick={() => navigate(`/buses/${b.id}`)}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" fontWeight={700}>{b.busNumber} · {b.routeName}</Typography><Typography variant="body2">{b.occupied}/{b.capacity}</Typography></Box>
              <CapacityBar percent={b.percent} state={b.state} />
            </Box>))}
        </SectionCard></Grid>
        <Grid item xs={12} md={6} lg={4}><SectionCard title="Routes with Most Students" index={10}>
          {d.topRoutes.slice(0, 6).map((r, i) => (
            <Box key={r.id} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">{i + 1}. {r.name}</Typography><Typography variant="body2" fontWeight={700}>{r.studentCount}</Typography></Box>
              <LinearProgress variant="determinate" value={pct(r.studentCount, d.topRoutes[0].studentCount || 1)} />
            </Box>))}
        </SectionCard></Grid>
        <Grid item xs={12} lg={4}><SectionCard title="Recently Assigned Students" index={11}>
          <List dense disablePadding>{d.recent.map((a) => (
            <ListItem key={a.id} disableGutters><ListItemAvatar><Avatar sx={{ width: 34, height: 34, fontSize: 12, bgcolor: 'primary.main' }}>{initials(a.studentName)}</Avatar></ListItemAvatar>
              <ListItemText primary={a.studentName} secondary={`${a.busNumber} · ${a.pickupName} · ${a.assignmentDate}`} /></ListItem>))}</List>
        </SectionCard></Grid>
        <Grid item xs={12} md={6} lg={4}><SectionCard title="Recent Transport Attendance" index={12}>
          <List dense disablePadding>{d.recentAtt.map((r) => (
            <ListItem key={r.id} disableGutters secondaryAction={<StatusChip status={r.status} />}><ListItemText primary={r.studentName} secondary={`${r.date} · ${r.tripType} · ${r.busNumber}`} /></ListItem>))}</List>
        </SectionCard></Grid>
        <Grid item xs={12} md={6} lg={4}><SectionCard title="Drivers and Assigned Buses" index={13}>
          <List dense disablePadding sx={{ maxHeight: 320, overflow: 'auto' }}>{driverRows.map((dr) => (
            <ListItem key={dr.id} disableGutters secondaryAction={<Chip size="small" label={dr.busNumber} />}><ListItemAvatar><Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>{initials(dr.name)}</Avatar></ListItemAvatar>
              <ListItemText primary={dr.name} secondary={dr.status} /></ListItem>))}</List>
        </SectionCard></Grid>
        <Grid item xs={12} lg={4}><SectionCard title="Pickup Point Summary" index={14}>
          <Box sx={{ height: 280 }}><ResponsiveContainer><BarChart layout="vertical" data={routeRows.map((r) => ({ name: r.code, Points: r.pickupCount, Students: r.studentCount }))} margin={{ left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" fontSize={11} width={54} /><Tooltip /><Legend />
            <Bar dataKey="Points" fill="#f59e0b" radius={[0, 6, 6, 0]} animationDuration={1200} /><Bar dataKey="Students" fill="#2563eb" radius={[0, 6, 6, 0]} animationDuration={1200} /></BarChart></ResponsiveContainer></Box>
        </SectionCard></Grid>
      </Grid>
    </Box>
  );
}
