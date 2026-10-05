import React, { useMemo, useState } from 'react';
import { Box, Card, Grid, Tabs, Tab, TextField, MenuItem, Autocomplete, Button, Chip, Stack, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { PageHeader, SectionCard, StatCard } from '../components/common';
import { statusCol, stateCol, occupancyCol, opts, strOpts } from '../components/columns';
import { aggregateAttendance, countBy } from '../utils/aggregate';
import { exportCSV, uniq } from '../utils/helpers';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BlockIcon from '@mui/icons-material/Block';
import BuildIcon from '@mui/icons-material/Build';
import EventSeatIcon from '@mui/icons-material/EventSeat';

const COLORS = ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6', '#84cc16', '#f97316'];
const EMPTY = { from: '', to: '', busId: '', routeId: '', driverId: '', studentId: '', className: '', pickupPointId: '', status: '' };

const Sel = ({ label, value, onChange, options, t }) => (
  <TextField fullWidth size="small" select label={t(label)} value={value} onChange={(e) => onChange(e.target.value)}>
    <MenuItem value=""><em>{t('All')}</em></MenuItem>
    {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
  </TextField>
);

const Chart = ({ data, type = 'bar', color = '#2563eb' }) => (
  <Box sx={{ height: 300 }}>
    <ResponsiveContainer>
      {type === 'pie' ? (
        <PieChart><Pie data={data} dataKey="value" nameKey="label" outerRadius={105} innerRadius={45} paddingAngle={2} label={(e) => e.value} animationDuration={1000}>{data.map((d, i) => <Cell key={d.label} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
      ) : (
        <BarChart data={data} margin={{ left: -15 }}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="label" fontSize={11} interval={0} angle={data.length > 6 ? -25 : 0} textAnchor={data.length > 6 ? 'end' : 'middle'} height={data.length > 6 ? 60 : 30} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} animationDuration={1000} /></BarChart>
      )}
    </ResponsiveContainer>
  </Box>
);

export default function Reports() {
  const { t, busRows, routeRows, studentRows, driverRows, pickupRows, attendanceRows } = useApp();
  const [tab, setTab] = useState(0);
  const [f, setF] = useState(EMPTY);
  const [group, setGroup] = useState('bus');
  const [attGroup, setAttGroup] = useState('daily');
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const classes = useMemo(() => uniq(studentRows.map((s) => s.className)).sort(), [studentRows]);

  // ---- filtered datasets ----
  const buses = useMemo(() => busRows.filter((b) => (!f.busId || b.id === f.busId) && (!f.routeId || b.routeId === f.routeId) && (!f.driverId || b.driverId === f.driverId) && (!f.status || b.status === f.status)), [busRows, f]);
  const routes = useMemo(() => routeRows.filter((r) => (!f.routeId || r.id === f.routeId) && (!f.busId || r.busId === f.busId) && (!f.driverId || r.driverId === f.driverId)), [routeRows, f]);
  const students = useMemo(() => studentRows.filter((s) => (!f.studentId || s.id === f.studentId) && (!f.busId || s.busId === f.busId) && (!f.routeId || s.routeId === f.routeId) && (!f.driverId || s.driverId === f.driverId) &&
    (!f.className || s.className === f.className) && (!f.pickupPointId || s.pickupPointId === f.pickupPointId) && (!f.status || s.status === f.status)), [studentRows, f]);
  const att = useMemo(() => attendanceRows.filter((r) => (!f.from || r.date >= f.from) && (!f.to || r.date <= f.to) && (!f.busId || r.busId === f.busId) && (!f.routeId || r.routeId === f.routeId) && (!f.driverId || r.driverId === f.driverId) &&
    (!f.studentId || r.studentId === f.studentId) && (!f.className || r.className === f.className) && (!f.pickupPointId || r.pickupPointId === f.pickupPointId) && (!f.status || r.status === f.status)), [attendanceRows, f]);

  // ---- bus report ----
  const busCols = [
    { field: 'busNumber', headerName: 'Bus Number', minWidth: 110 }, { field: 'regNo', headerName: 'Registration Number', minWidth: 140 }, { field: 'type', headerName: 'Bus Type', minWidth: 110 },
    { field: 'capacity', headerName: 'Capacity', type: 'number', minWidth: 90 }, { field: 'occupied', headerName: 'Occupied', type: 'number', minWidth: 90 }, { field: 'available', headerName: 'Available', type: 'number', minWidth: 90 },
    occupancyCol, stateCol, { field: 'routeName', headerName: 'Route', minWidth: 150 }, { field: 'driverName', headerName: 'Driver', minWidth: 160 }, statusCol(),
  ];
  // ---- route report ----
  const routeCols = [
    { field: 'code', headerName: 'Route Code', minWidth: 100 }, { field: 'name', headerName: 'Route Name', minWidth: 160 }, { field: 'busNumber', headerName: 'Assigned Bus', minWidth: 120 },
    { field: 'driverName', headerName: 'Driver', minWidth: 160 }, { field: 'capacity', headerName: 'Capacity', type: 'number', minWidth: 90 }, { field: 'studentCount', headerName: 'Students', type: 'number', minWidth: 90 },
    { field: 'available', headerName: 'Available', type: 'number', minWidth: 90 }, { field: 'pickupCount', headerName: 'Pickup Points', type: 'number', minWidth: 110 }, statusCol(),
  ];
  // ---- student report ----
  const studentCols = [
    { field: 'studentCode', headerName: 'Student ID', minWidth: 140 }, { field: 'name', headerName: 'Full Name', minWidth: 180 }, { field: 'className', headerName: 'Class', minWidth: 130 },
    { field: 'routeName', headerName: 'Route', minWidth: 150 }, { field: 'busNumber', headerName: 'Bus', minWidth: 100 }, { field: 'pickupName', headerName: 'Pickup Point', minWidth: 160 }, statusCol('status', 'Transport Status'),
  ];
  const groupKeys = { bus: (s) => s.busNumber, route: (s) => s.routeName, pickup: (s) => s.pickupName, class: (s) => s.className };
  const grouped = useMemo(() => countBy(students.filter((s) => s.assignmentId || group === 'class'), groupKeys[group]), [students, group]); // eslint-disable-line
  // ---- attendance report ----
  const attKeys = {
    daily: (r) => r.date, monthly: (r) => r.date.slice(0, 7), bus: (r) => r.busNumber, route: (r) => r.routeName, student: (r) => r.studentName,
    status: (r) => r.status,
  };
  const attAgg = useMemo(() => aggregateAttendance(att, attKeys[attGroup]), [att, attGroup]); // eslint-disable-line
  const attCols = [
    { field: 'label', headerName: attGroup === 'daily' ? 'Date' : attGroup === 'monthly' ? 'Month' : attGroup === 'student' ? 'Student' : attGroup === 'status' ? 'Status' : attGroup === 'bus' ? 'Bus' : 'Route', minWidth: 170 },
    { field: 'total', headerName: 'Total', type: 'number', minWidth: 90 }, { field: 'Present', headerName: 'Present', type: 'number', minWidth: 90 }, { field: 'Absent', headerName: 'Absent', type: 'number', minWidth: 90 },
    { field: 'Late', headerName: 'Late', type: 'number', minWidth: 80 }, { field: 'Excused', headerName: 'Excused', type: 'number', minWidth: 90 }, { field: 'percent', headerName: 'Attendance Percentage', minWidth: 160, renderCell: (p) => `${p.value}%` },
  ];
  const detailAtt = [
    { field: 'date', headerName: 'Date', minWidth: 110 }, { field: 'studentName', headerName: 'Student', minWidth: 170 }, { field: 'routeName', headerName: 'Route', minWidth: 140 }, { field: 'busNumber', headerName: 'Bus', minWidth: 100 },
    { field: 'tripType', headerName: 'Trip Type', minWidth: 160 }, statusCol(),
  ];
  const pvsa = ['Present', 'Absent', 'Late', 'Excused'].map((s) => ({ label: s, value: att.filter((r) => r.status === s).length }));

  const doCSV = () => {
    const map = [[busCols, buses], [routeCols, routes], [studentCols, students], [attCols, attAgg]][tab];
    exportCSV(['bus-report', 'route-report', 'student-report', 'attendance-report'][tab], map[0].map((c) => ({ key: c.field, label: c.headerName })), map[1]);
  };

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Bus, route, student and attendance reports" icon={<AssessmentIcon />}
        actions={<><Button variant="outlined" startIcon={<DownloadIcon />} onClick={doCSV}>{t('Export CSV')}</Button><Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>{t('Print')}</Button></>} />

      <Card className="anim-in no-print" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>{t('Filters')}</Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={6} md={2}><TextField fullWidth size="small" type="date" label={t('From')} InputLabelProps={{ shrink: true }} value={f.from} onChange={(e) => set('from')(e.target.value)} /></Grid>
          <Grid item xs={6} md={2}><TextField fullWidth size="small" type="date" label={t('To')} InputLabelProps={{ shrink: true }} value={f.to} onChange={(e) => set('to')(e.target.value)} /></Grid>
          <Grid item xs={6} md={2}><Sel t={t} label="Bus" value={f.busId} onChange={set('busId')} options={opts(busRows, 'id', 'busNumber')} /></Grid>
          <Grid item xs={6} md={2}><Sel t={t} label="Route" value={f.routeId} onChange={set('routeId')} options={opts(routeRows, 'id', 'name')} /></Grid>
          <Grid item xs={6} md={2}><Sel t={t} label="Driver" value={f.driverId} onChange={set('driverId')} options={opts(driverRows, 'id', 'name')} /></Grid>
          <Grid item xs={6} md={2}><Sel t={t} label="Class" value={f.className} onChange={set('className')} options={strOpts(classes)} /></Grid>
          <Grid item xs={12} md={4}><Autocomplete size="small" options={opts(studentRows, 'id', 'name')} getOptionLabel={(o) => o.label} isOptionEqualToValue={(a, b) => a.value === b.value}
            value={opts(studentRows, 'id', 'name').find((o) => o.value === f.studentId) || null} onChange={(_, o) => set('studentId')(o?.value || '')} renderInput={(p) => <TextField {...p} label={t('Student')} />} /></Grid>
          <Grid item xs={6} md={3}><Sel t={t} label="Pickup Point" value={f.pickupPointId} onChange={set('pickupPointId')} options={opts(pickupRows, 'id', 'name')} /></Grid>
          <Grid item xs={6} md={3}><Sel t={t} label="Status" value={f.status} onChange={set('status')} options={strOpts(tab === 0 ? ['Available', 'Assigned', 'In Service', 'Maintenance', 'Out of Service'] : tab === 3 ? ['Present', 'Absent', 'Late', 'Excused'] : ['Active', 'Inactive', 'Suspended']).map((o) => ({ ...o, label: t(o.label) }))} /></Grid>
          <Grid item xs={12}><Button size="small" startIcon={<RestartAltIcon />} onClick={() => setF(EMPTY)}>{t('Reset')}</Button></Grid>
        </Grid>
      </Card>

      <Card className="anim-in">
        <Tabs value={tab} onChange={(_, v) => { setTab(v); set('status')(''); }} variant="scrollable" scrollButtons="auto" className="no-print" sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
          {['Bus Reports', 'Route Reports', 'Student Reports', 'Attendance Reports'].map((l) => <Tab key={l} label={t(l)} />)}
        </Tabs>
        <Box key={tab} className="page-enter" sx={{ p: { xs: 1.5, md: 2.5 } }}>
          {tab === 0 && <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}><StatCard label="Total Buses" value={buses.length} icon={<DirectionsBusIcon />} index={0} /></Grid>
              <Grid item xs={6} md={3}><StatCard label="Buses at Full Capacity" value={buses.filter((b) => b.state === 'full').length} icon={<BlockIcon />} color="error" index={1} /></Grid>
              <Grid item xs={6} md={3}><StatCard label="Maintenance" value={buses.filter((b) => b.status === 'Maintenance').length} icon={<BuildIcon />} color="warning" index={2} /></Grid>
              <Grid item xs={6} md={3}><StatCard label="Available Seats" value={buses.filter((b) => b.state !== 'out').reduce((s, b) => s + b.available, 0)} icon={<EventSeatIcon />} color="success" index={3} /></Grid>
            </Grid>
            <SectionCard title="Bus Occupancy" sx={{ mb: 3 }}><Chart data={buses.map((b) => ({ label: b.busNumber, value: b.occupied }))} /></SectionCard>
            <DataTable rows={buses} columns={busCols} searchFields={['busNumber', 'regNo', 'routeName', 'driverName']} />
          </>}
          {tab === 1 && <>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}><SectionCard title="Students by Route"><Chart type="pie" data={routes.map((r) => ({ label: r.name, value: r.studentCount }))} /></SectionCard></Grid>
              <Grid item xs={12} md={6}><SectionCard title="Pickup Point Summary"><Chart data={routes.map((r) => ({ label: r.code, value: r.pickupCount }))} color="#f59e0b" /></SectionCard></Grid>
            </Grid>
            <DataTable rows={routes} columns={routeCols} searchFields={['code', 'name', 'busNumber', 'driverName']} />
          </>}
          {tab === 2 && <>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap className="no-print">
              <Typography variant="body2">{t('Group by')}:</Typography>
              <ToggleButtonGroup size="small" exclusive value={group} onChange={(_, v) => v && setGroup(v)}>
                {[['bus', 'Bus'], ['route', 'Route'], ['pickup', 'Pickup Point'], ['class', 'Class']].map(([v, l]) => <ToggleButton key={v} value={v}>{t(l)}</ToggleButton>)}
              </ToggleButtonGroup>
              <Chip label={`${t('Total')}: ${students.length}`} color="primary" />
            </Stack>
            <SectionCard title="Students" sx={{ mb: 3 }}><Chart data={grouped} type={group === 'class' ? 'pie' : 'bar'} color="#8b5cf6" /></SectionCard>
            <DataTable rows={students} columns={studentCols} searchFields={['studentCode', 'name', 'className', 'routeName', 'busNumber', 'pickupName']} />
          </>}
          {tab === 3 && <>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap className="no-print">
              <ToggleButtonGroup size="small" exclusive value={attGroup} onChange={(_, v) => v && setAttGroup(v)} sx={{ flexWrap: 'wrap' }}>
                {[['daily', 'Daily Attendance'], ['monthly', 'Monthly Attendance Trend'], ['bus', 'Bus'], ['route', 'Route'], ['student', 'Student'], ['status', 'Present vs Absent']].map(([v, l]) => <ToggleButton key={v} value={v}>{t(l)}</ToggleButton>)}
              </ToggleButtonGroup>
              <Chip label={`${att.length} records`} />
            </Stack>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}><SectionCard title={['daily', 'monthly'].includes(attGroup) ? 'Daily Attendance' : 'Attendance'}>
                <Box sx={{ height: 300 }}><ResponsiveContainer>
                  {['daily', 'monthly'].includes(attGroup) ? (
                    <LineChart data={attAgg} margin={{ left: -15 }}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="label" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend />
                      <Line dataKey="Present" stroke="#16a34a" strokeWidth={3} animationDuration={1000} /><Line dataKey="Absent" stroke="#dc2626" strokeWidth={2} animationDuration={1000} /><Line dataKey="Late" stroke="#f59e0b" strokeWidth={2} animationDuration={1000} /></LineChart>
                  ) : (
                    <BarChart data={attAgg.slice(0, 20)} margin={{ left: -15 }}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="label" fontSize={10} interval={0} angle={-25} textAnchor="end" height={70} /><YAxis fontSize={11} /><Tooltip /><Legend />
                      <Bar dataKey="Present" stackId="a" fill="#16a34a" animationDuration={1000} /><Bar dataKey="Absent" stackId="a" fill="#dc2626" animationDuration={1000} /><Bar dataKey="Late" stackId="a" fill="#f59e0b" animationDuration={1000} /><Bar dataKey="Excused" stackId="a" fill="#0ea5e9" animationDuration={1000} /></BarChart>
                  )}
                </ResponsiveContainer></Box>
              </SectionCard></Grid>
              <Grid item xs={12} md={4}><SectionCard title="Present vs Absent"><Chart type="pie" data={pvsa} /></SectionCard></Grid>
            </Grid>
            <SectionCard title="Summary" sx={{ mb: 3 }}><DataTable rows={attAgg.map((r) => ({ ...r, id: r.label }))} columns={attCols} searchFields={['label']} csvName={`attendance-${attGroup}`} /></SectionCard>
            <SectionCard title="Attendance"><DataTable rows={att} columns={detailAtt} searchFields={['studentName', 'routeName', 'busNumber', 'date']} initialSort={{ field: 'date', sort: 'desc' }} pageSize={10} /></SectionCard>
          </>}
        </Box>
      </Card>
    </Box>
  );
}
