import React, { useMemo } from 'react';
import { useParams, useNavigate, Link as RLink } from 'react-router-dom';
import { Box, Grid, Typography, Button, Avatar, Chip, LinearProgress, Alert } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { PageHeader, InfoRow, StatusChip, CapacityBar, SectionCard, StatCard } from '../components/common';
import DataTable from '../components/DataTable';
import NotFound from '../components/NotFound';
import { statusCol } from '../components/columns';
import { pct, initials } from '../utils/helpers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export default function StudentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { t, studentRows, attendanceRows, busRows, routeRows, maps } = useApp();
  const s = studentRows.find((x) => x.id === studentId);
  const att = useMemo(() => attendanceRows.filter((r) => r.studentId === studentId), [attendanceRows, studentId]);
  if (!s) return <NotFound what="Student" to="/students" />;

  const bus = busRows.find((b) => b.id === s.busId);
  const route = routeRows.find((r) => r.id === s.routeId);
  const pp = maps.pickup[s.pickupPointId];
  const driver = maps.driver[s.driverId];
  const c = (st) => att.filter((r) => r.status === st).length;
  const stats = { Present: c('Present'), Absent: c('Absent'), Late: c('Late'), Excused: c('Excused') };
  const rate = pct(stats.Present, att.length);
  const cols = [
    { field: 'date', headerName: 'Date', minWidth: 110 }, { field: 'tripType', headerName: 'Trip Type', minWidth: 160 }, { field: 'busNumber', headerName: 'Bus', minWidth: 100 },
    { field: 'checkIn', headerName: 'Check-in Time', minWidth: 110 }, { field: 'checkOut', headerName: 'Check-out Time', minWidth: 120 }, statusCol(), { field: 'remarks', headerName: 'Remarks', minWidth: 170 },
  ];

  return (
    <Box>
      <PageHeader title={s.name} subtitle={`${s.studentCode} · ${s.className}`} icon={<SchoolIcon />}
        actions={<>
          <StatusChip status={s.status} size="medium" />
          {!s.assignmentId && <Button variant="contained" startIcon={<AssignmentIndIcon />} onClick={() => navigate(`/assignments?student=${s.id}`)}>{t('New Assignment')}</Button>}
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/students')}>{t('Back')}</Button></>} />
      {!s.assignmentId && <Alert severity="warning" sx={{ mb: 3 }}>This student has no active bus assignment.</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><SectionCard title="Student Details" index={0}>
          <Box sx={{ textAlign: 'center', mb: 2 }}><Avatar sx={{ width: 76, height: 76, mx: 'auto', bgcolor: 'primary.main', fontSize: 28 }}>{initials(s.name)}</Avatar></Box>
          <InfoRow label="Student ID" value={s.studentCode} /><InfoRow label="Registration Number" value={s.regNo} /><InfoRow label="Gender" value={t(s.gender)} /><InfoRow label="Date of Birth" value={s.dob} />
          <InfoRow label="Class" value={s.className} /><InfoRow label="Grade/Level" value={s.level} /><InfoRow label="Address" value={s.address} />
        </SectionCard></Grid>
        <Grid item xs={12} md={4}><SectionCard title="Guardian" index={1}>
          <InfoRow label="Parent/Guardian" value={s.guardian} /><InfoRow label="Parent Phone" value={s.parentPhone} />
          <Box sx={{ mt: 3 }}><Typography variant="subtitle2" gutterBottom>Pickup Point</Typography>
            <InfoRow label="Pickup Point" value={pp?.name} /><InfoRow label="Pickup Time" value={pp?.pickupTime} /><InfoRow label="Return Time" value={pp?.returnTime} /><InfoRow label="Location" value={pp?.location} /></Box>
        </SectionCard></Grid>
        <Grid item xs={12} md={4}><SectionCard title="Bus" index={2}>
          <InfoRow label="Bus" value={bus ? `${bus.busNumber} (${bus.regNo})` : '—'} /><InfoRow label="Driver" value={driver ? `${driver.name} · ${driver.phone}` : '—'} />
          <InfoRow label="Route" value={route ? `${route.code} — ${route.name}` : '—'} /><InfoRow label="Departure Time" value={route?.departureTime} />
          {bus && <Box sx={{ mt: 2 }}><Typography variant="caption">{t('Occupancy')}: {bus.occupied}/{bus.capacity}</Typography><CapacityBar percent={bus.percent} state={bus.state} />
            <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}><Button size="small" component={RLink} to={`/buses/${bus.id}`}>{t('Bus Details')}</Button><Button size="small" component={RLink} to={`/routes/${route?.id}`}>{t('Route Details')}</Button></Box></Box>}
        </SectionCard></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><StatCard label="Present" value={stats.Present} icon={<CheckCircleIcon />} color="success" index={0} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Absent" value={stats.Absent} icon={<CancelIcon />} color="error" index={1} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Late" value={stats.Late} icon={<ScheduleIcon />} color="warning" index={2} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Excused" value={stats.Excused} icon={<EventAvailableIcon />} color="info" index={3} /></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}><SectionCard title="Attendance Percentage" index={4}>
          <Typography variant="h3" color="success.main" fontWeight={800}>{rate}%</Typography>
          <LinearProgress variant="determinate" value={rate} color="success" sx={{ height: 12, my: 1 }} />
          <Typography variant="caption" color="text.secondary">{stats.Present} / {att.length}</Typography>
          <Box sx={{ height: 220 }}><ResponsiveContainer><PieChart><Pie data={Object.entries(stats).map(([name, value]) => ({ name, value }))} dataKey="value" innerRadius={45} outerRadius={80} animationDuration={1200}>
            {Object.keys(stats).map((k) => <Cell key={k} fill={{ Present: '#16a34a', Absent: '#dc2626', Late: '#f59e0b', Excused: '#0ea5e9' }[k]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Box>
        </SectionCard></Grid>
        <Grid item xs={12} md={8}><SectionCard title="Attendance History" index={5}>
          <DataTable rows={att} columns={cols} initialSort={{ field: 'date', sort: 'desc' }} searchFields={['date', 'tripType', 'status']} pageSize={10} />
        </SectionCard></Grid>
      </Grid>
    </Box>
  );
}
