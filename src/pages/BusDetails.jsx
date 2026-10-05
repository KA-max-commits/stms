import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link as RLink } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Tabs, Tab, Typography, Button, Avatar, Chip, Stack, Table, TableHead, TableRow, TableCell, TableBody, Link } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { PageHeader, InfoRow, StatusChip, StateChip, CapacityBar, FullBanner, EmptyState, SectionCard, StatCard } from '../components/common';
import DataTable from '../components/DataTable';
import NotFound from '../components/NotFound';
import RouteSequence from '../components/RouteSequence';
import { statusCol } from '../components/columns';
import { aggregateAttendance } from '../utils/aggregate';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import PercentIcon from '@mui/icons-material/Percent';
import GroupsIcon from '@mui/icons-material/Groups';

export default function BusDetails() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { t, busRows, assignmentRows, pickupPoints, attendanceRows, maps, routeRows } = useApp();
  const [tab, setTab] = useState(0);
  const bus = busRows.find((b) => b.id === busId);

  const students = useMemo(() => assignmentRows.filter((a) => a.busId === busId && a.status === 'Active'), [assignmentRows, busId]);
  const points = useMemo(() => pickupPoints.filter((p) => p.routeId === bus?.routeId), [pickupPoints, bus]);
  const att = useMemo(() => attendanceRows.filter((r) => r.busId === busId), [attendanceRows, busId]);
  const trend = useMemo(() => aggregateAttendance(att, (r) => r.date.slice(5)), [att]);
  const history = useMemo(() => assignmentRows.filter((a) => a.busId === busId).sort((a, b) => b.assignmentDate.localeCompare(a.assignmentDate)), [assignmentRows, busId]);

  if (!bus) return <NotFound what="Bus" to="/buses" />;
  const route = routeRows.find((r) => r.id === bus.routeId);
  const driver = maps.driver[bus.driverId];

  const studentCols = [
    { field: 'studentName', headerName: 'Student', minWidth: 180, renderCell: (p) => <Link component={RLink} to={`/students/${p.row.studentId}`} underline="hover">{p.value}</Link> },
    { field: 'studentCode', headerName: 'Student ID', minWidth: 140 }, { field: 'pickupName', headerName: 'Pickup Point', minWidth: 160 },
    { field: 'assignmentDate', headerName: 'Assignment Date', minWidth: 130 }, statusCol(),
  ];
  const attCols = [
    { field: 'date', headerName: 'Date', minWidth: 110 }, { field: 'studentName', headerName: 'Student', minWidth: 170 }, { field: 'tripType', headerName: 'Trip Type', minWidth: 160 },
    { field: 'checkIn', headerName: 'Check-in Time', minWidth: 110 }, statusCol(),
  ];

  return (
    <Box>
      <PageHeader title={bus.busNumber} subtitle={`${bus.regNo} · ${bus.type} · ${bus.model} ${bus.year}`} icon={<DirectionsBusIcon />}
        actions={<><StatusChip status={bus.status} size="medium" /><StateChip state={bus.state} size="medium" /><Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/buses')}>{t('Back')}</Button></>} />

      <Card className="anim-in" sx={{ mb: 3 }}><CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography fontWeight={700}>{t('Occupancy')}</Typography><Typography fontWeight={800}>{bus.occupied} / {bus.capacity} · {bus.percent}%</Typography>
        </Box>
        <CapacityBar percent={bus.percent} state={bus.state} height={16} />
        {bus.state === 'full' && <Box sx={{ mt: 2 }}><FullBanner /></Box>}
      </CardContent></Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><StatCard label="Capacity" value={bus.capacity} icon={<GroupsIcon />} index={0} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Occupied Seats" value={bus.occupied} icon={<AirlineSeatReclineNormalIcon />} color="warning" index={1} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Available Seats" value={bus.available} icon={<EventSeatIcon />} color="success" index={2} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Occupancy" value={bus.percent} suffix="%" icon={<PercentIcon />} color={bus.state === 'full' ? 'error' : 'info'} index={3} /></Grid>
      </Grid>

      <Card className="anim-in">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
          {['Overview', 'Assigned Students', 'Route', 'Pickup Points', 'Attendance', 'Activity History'].map((l) => <Tab key={l} label={t(l)} />)}
        </Tabs>
        <CardContent key={tab} className="page-enter">
          {tab === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <InfoRow label="Bus Number" value={bus.busNumber} /><InfoRow label="Registration Number" value={bus.regNo} /><InfoRow label="Bus Type" value={bus.type} />
                <InfoRow label="Model" value={`${bus.model} (${bus.year})`} /><InfoRow label="Capacity" value={bus.capacity} /><InfoRow label="Current Location" value={bus.location} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow label="Driver" value={driver ? `${driver.name} · ${driver.phone}` : '—'} /><InfoRow label="Route" value={route ? `${route.code} — ${route.name}` : '—'} />
                <InfoRow label="Occupied Seats" value={bus.occupied} /><InfoRow label="Available Seats" value={bus.available} /><InfoRow label="Occupancy" value={`${bus.percent}%`} />
                <InfoRow label="Description" value={bus.description} />
              </Grid>
            </Grid>
          )}
          {tab === 1 && <DataTable rows={students} columns={studentCols} searchFields={['studentName', 'studentCode', 'pickupName']} csvName={`${bus.busNumber}-students`} pageSize={10} />}
          {tab === 2 && (route ? <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap><Chip label={`${route.code} — ${route.name}`} color="primary" /><Chip label={`${route.distance} km`} variant="outlined" /><Chip label={`${route.duration} min`} variant="outlined" /><Chip label={`${route.departureTime} → ${route.returnTime}`} variant="outlined" /></Stack>
            <RouteSequence route={route} points={points} />
            <Button sx={{ mt: 2 }} component={RLink} to={`/routes/${route.id}`}>{t('Route Details')} →</Button></Box> : <EmptyState text="No route assigned" />)}
          {tab === 3 && (points.length ? <Table size="small"><TableHead><TableRow>{['Code', 'Name', 'Pickup Time', 'Return Time', 'Students'].map((h) => <TableCell key={h}><b>{t(h)}</b></TableCell>)}</TableRow></TableHead>
            <TableBody>{points.map((p) => <TableRow key={p.id} hover><TableCell>{p.code}</TableCell><TableCell>{p.name}</TableCell><TableCell>{p.pickupTime}</TableCell><TableCell>{p.returnTime}</TableCell><TableCell>{students.filter((s) => s.pickupPointId === p.id).length}</TableCell></TableRow>)}</TableBody></Table> : <EmptyState />)}
          {tab === 4 && (att.length ? <Box>
            <Box sx={{ height: 240, mb: 2 }}><ResponsiveContainer><LineChart data={trend} margin={{ left: -15 }}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend />
              <Line dataKey="Present" stroke="#16a34a" strokeWidth={3} dot={false} /><Line dataKey="Absent" stroke="#dc2626" strokeWidth={2} dot={false} /><Line dataKey="Late" stroke="#f59e0b" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></Box>
            <DataTable rows={att} columns={attCols} searchFields={['studentName', 'date', 'tripType']} initialSort={{ field: 'date', sort: 'desc' }} csvName={`${bus.busNumber}-attendance`} /></Box> : <EmptyState />)}
          {tab === 5 && (history.length ? <Box>{history.map((h) => (
            <Box key={h.id} sx={{ display: 'flex', gap: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Avatar sx={{ width: 12, height: 12, bgcolor: h.status === 'Active' ? 'success.main' : 'grey.500' }}>{' '}</Avatar><Box sx={{ flex: 1, width: 2, bgcolor: 'divider', mt: 0.5 }} /></Box>
              <Box><Typography variant="body2" fontWeight={700}>{h.studentName} — {h.status}</Typography><Typography variant="caption" color="text.secondary">{h.assignmentDate} · {h.code} · {h.pickupName}{h.remarks ? ` · ${h.remarks}` : ''}</Typography></Box>
            </Box>))}</Box> : <EmptyState />)}
        </CardContent>
      </Card>
    </Box>
  );
}
