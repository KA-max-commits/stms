import React, { useMemo, useState } from 'react';
import { Box, Card, Grid, TextField, MenuItem, Autocomplete, Button, Chip, Stack } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { PageHeader, SectionCard } from '../components/common';
import { statusCol, opts, strOpts } from '../components/columns';
import { aggregateAttendance } from '../utils/aggregate';

const STATUSES = ['Present', 'Absent', 'Late', 'Excused'];

export default function AttendanceHistory() {
  const { attendanceRows, studentRows, buses, routes, t } = useApp();
  const [f, setF] = useState({ studentId: '', busId: '', routeId: '', from: '', to: '', status: '' });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const rows = useMemo(() => attendanceRows.filter((r) =>
    (!f.studentId || r.studentId === f.studentId) && (!f.busId || r.busId === f.busId) && (!f.routeId || r.routeId === f.routeId) &&
    (!f.status || r.status === f.status) && (!f.from || r.date >= f.from) && (!f.to || r.date <= f.to)), [attendanceRows, f]);

  const trend = useMemo(() => aggregateAttendance(rows, (r) => r.date), [rows]);
  const columns = [
    { field: 'date', headerName: 'Date', minWidth: 110 },
    { field: 'studentName', headerName: 'Student', minWidth: 180 },
    { field: 'tripType', headerName: 'Trip Type', minWidth: 160 },
    { field: 'routeName', headerName: 'Route', minWidth: 140 },
    { field: 'busNumber', headerName: 'Bus', minWidth: 100 },
    { field: 'pickupName', headerName: 'Pickup Point', minWidth: 150 },
    { field: 'checkIn', headerName: 'Check-in Time', minWidth: 110 },
    { field: 'checkOut', headerName: 'Check-out Time', minWidth: 120 },
    statusCol(),
  ];

  return (
    <Box>
      <PageHeader title="Attendance History" subtitle="Browse and analyse past transport attendance" icon={<HistoryIcon />} />
      <Card className="anim-in" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={3}><Autocomplete size="small" options={opts(studentRows, 'id', 'name')} getOptionLabel={(o) => o.label} isOptionEqualToValue={(a, b) => a.value === b.value}
            value={opts(studentRows, 'id', 'name').find((o) => o.value === f.studentId) || null} onChange={(_, o) => set('studentId', o?.value || '')} renderInput={(p) => <TextField {...p} label={t('Student')} />} /></Grid>
          <Grid item xs={6} md={2}><TextField fullWidth size="small" select label={t('Bus')} value={f.busId} onChange={(e) => set('busId', e.target.value)}><MenuItem value=""><em>{t('All')}</em></MenuItem>{opts(buses, 'id', 'busNumber').map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</TextField></Grid>
          <Grid item xs={6} md={2}><TextField fullWidth size="small" select label={t('Route')} value={f.routeId} onChange={(e) => set('routeId', e.target.value)}><MenuItem value=""><em>{t('All')}</em></MenuItem>{opts(routes, 'id', 'name').map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</TextField></Grid>
          <Grid item xs={6} md={1.5}><TextField fullWidth size="small" type="date" label={t('From')} InputLabelProps={{ shrink: true }} value={f.from} onChange={(e) => set('from', e.target.value)} /></Grid>
          <Grid item xs={6} md={1.5}><TextField fullWidth size="small" type="date" label={t('To')} InputLabelProps={{ shrink: true }} value={f.to} onChange={(e) => set('to', e.target.value)} /></Grid>
          <Grid item xs={8} md={1.5}><TextField fullWidth size="small" select label={t('Status')} value={f.status} onChange={(e) => set('status', e.target.value)}><MenuItem value=""><em>{t('All')}</em></MenuItem>{strOpts(STATUSES).map((o) => <MenuItem key={o.value} value={o.value}>{t(o.label)}</MenuItem>)}</TextField></Grid>
          <Grid item xs={4} md={0.5}><Button onClick={() => setF({ studentId: '', busId: '', routeId: '', from: '', to: '', status: '' })}><RestartAltIcon /></Button></Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`${rows.length} records`} />
          {STATUSES.map((s) => <Chip key={s} variant="outlined" color={{ Present: 'success', Absent: 'error', Late: 'warning', Excused: 'info' }[s]} label={`${t(s)}: ${rows.filter((r) => r.status === s).length}`} />)}
        </Stack>
      </Card>
      <Box sx={{ mb: 3 }}>
        <SectionCard title="Daily Attendance" index={1}>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend />
                <Line type="monotone" dataKey="Present" stroke="#16a34a" strokeWidth={3} dot={false} animationDuration={1200} />
                <Line type="monotone" dataKey="Absent" stroke="#dc2626" strokeWidth={2} dot={false} animationDuration={1200} />
                <Line type="monotone" dataKey="Late" stroke="#f59e0b" strokeWidth={2} dot={false} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </Box>
      <DataTable rows={rows} columns={columns} csvName="attendance-history" searchFields={['studentName', 'routeName', 'busNumber', 'pickupName']} initialSort={{ field: 'date', sort: 'desc' }} />
    </Box>
  );
}
