import React, { useMemo } from 'react';
import { Grid, Box, Typography, LinearProgress, Alert } from '@mui/material';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useApp } from '../context/AppContext';
import CrudPage from '../components/CrudPage';
import { StatCard, SectionCard, InfoRow } from '../components/common';
import { statusCol, opts, strOpts } from '../components/columns';
import { todayStr, pct } from '../utils/helpers';

const STATUSES = ['Present', 'Absent', 'Late', 'Excused'];
const TRIPS = ['Morning Pickup', 'Afternoon Drop-off'];

export default function Attendance() {
  const { attendanceRows, studentRows, routes, buses, saveAttendance, deleteAttendance, t } = useApp();
  const today = todayStr();

  const stats = useMemo(() => {
    const rows = attendanceRows.filter((r) => r.date === today);
    const c = (s, list = rows) => list.filter((r) => r.status === s).length;
    const trip = (name) => { const l = rows.filter((r) => r.tripType === name); return { total: l.length, present: c('Present', l), percent: pct(c('Present', l), l.length) }; };
    return { total: rows.length, present: c('Present'), absent: c('Absent'), late: c('Late'), excused: c('Excused'), percent: pct(c('Present'), rows.length), morning: trip(TRIPS[0]), afternoon: trip(TRIPS[1]) };
  }, [attendanceRows, today]);

  const assigned = studentRows.filter((s) => s.assignmentId);
  const columns = [
    { field: 'code', headerName: 'Attendance ID', minWidth: 140 },
    { field: 'date', headerName: 'Date', minWidth: 110 },
    { field: 'studentName', headerName: 'Student', minWidth: 180 },
    { field: 'routeName', headerName: 'Route', minWidth: 140 },
    { field: 'busNumber', headerName: 'Bus', minWidth: 100 },
    { field: 'pickupName', headerName: 'Pickup Point', minWidth: 150 },
    { field: 'driverName', headerName: 'Driver', minWidth: 160 },
    { field: 'tripType', headerName: 'Trip Type', minWidth: 160 },
    { field: 'checkIn', headerName: 'Check-in Time', minWidth: 110 },
    { field: 'checkOut', headerName: 'Check-out Time', minWidth: 120 },
    statusCol(),
    { field: 'remarks', headerName: 'Remarks', minWidth: 180 },
  ];
  const fields = [
    { name: 'studentId', label: 'Student', type: 'autocomplete', required: true, md: 12, options: opts(assigned, 'id', (s) => `${s.name} — ${s.studentCode} · ${s.busNumber}`) },
    { name: 'date', label: 'Date', type: 'date', required: true, validate: (v) => (v > today ? 'Date cannot be in the future' : '') },
    { name: 'tripType', label: 'Trip Type', type: 'select', required: true, options: strOpts(TRIPS) },
    { name: 'status', label: 'Status', type: 'select', required: true, options: strOpts(STATUSES) },
    { name: 'checkIn', label: 'Check-in Time', type: 'time' },
    { name: 'checkOut', label: 'Check-out Time', type: 'time' },
    { name: 'remarks', label: 'Remarks', type: 'textarea', md: 12 },
  ];

  const above = (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}><StatCard label="Present Today" value={stats.present} icon={<CheckCircleIcon />} color="success" index={0} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Absent Today" value={stats.absent} icon={<CancelIcon />} color="error" index={1} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Late Today" value={stats.late} icon={<ScheduleIcon />} color="warning" index={2} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Excused Today" value={stats.excused} icon={<EventAvailableIcon />} color="info" index={3} /></Grid>
      </Grid>
      <Grid container spacing={2}>
        {[['Attendance Percentage', stats.percent, `${stats.present} / ${stats.total}`, 'success'], ['Morning Attendance', stats.morning.percent, `${stats.morning.present} / ${stats.morning.total}`, 'primary'], ['Afternoon Attendance', stats.afternoon.percent, `${stats.afternoon.present} / ${stats.afternoon.total}`, 'secondary']].map(([l, v, sub, c], i) => (
          <Grid item xs={12} md={4} key={l}>
            <SectionCard title={l} index={i + 4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="h4">{v}%</Typography><Typography variant="caption" color="text.secondary">{sub}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={v} color={c} sx={{ height: 10, mt: 1 }} />
            </SectionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <CrudPage title="Transport Attendance" subtitle="Record morning pickups and afternoon drop-offs" icon={<FactCheckIcon />} singular="Attendance" rows={attendanceRows} columns={columns} fields={fields} above={above}
      filters={[
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'studentId', label: 'Student', type: 'autocomplete', options: opts(studentRows, 'id', 'name') },
        { key: 'routeId', label: 'Route', options: opts(routes, 'id', 'name') },
        { key: 'busId', label: 'Bus', options: opts(buses, 'id', 'busNumber') },
        { key: 'status', label: 'Status', options: strOpts(STATUSES) },
        { key: 'tripType', label: 'Trip Type', options: strOpts(TRIPS) },
      ]}
      searchFields={['code', 'studentName', 'routeName', 'busNumber', 'pickupName', 'driverName', 'remarks']} csvName="attendance" initialSort={{ field: 'date', sort: 'desc' }}
      defaults={() => ({ date: today, tripType: TRIPS[0], status: 'Present', checkIn: '', checkOut: '' })}
      onSave={saveAttendance} onDelete={deleteAttendance}
      formFooter={(v) => {
        const s = studentRows.find((x) => x.id === v.studentId);
        if (!s) return null;
        return s.assignmentId ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            <InfoRow label="Route" value={s.routeName} /><InfoRow label="Bus" value={s.busNumber} /><InfoRow label="Pickup Point" value={s.pickupName} /><InfoRow label="Driver" value={s.driverName} />
          </Alert>
        ) : <Alert severity="warning" sx={{ mt: 2 }}>This student has no active bus assignment.</Alert>;
      }} />
  );
}
