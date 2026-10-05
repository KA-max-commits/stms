import React, { useMemo } from 'react';
import { useParams, useNavigate, Link as RLink } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Stack, Link } from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PlaceIcon from '@mui/icons-material/Place';
import { useApp } from '../context/AppContext';
import { PageHeader, InfoRow, StatusChip, CapacityBar, StatCard, SectionCard, FullBanner } from '../components/common';
import DataTable from '../components/DataTable';
import NotFound from '../components/NotFound';
import RouteSequence from '../components/RouteSequence';
import { statusCol } from '../components/columns';
import { capacityState } from '../utils/helpers';

export default function RouteDetails() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { t, routeRows, pickupRows, studentRows, busRows } = useApp();
  const route = routeRows.find((r) => r.id === routeId);
  const points = useMemo(() => pickupRows.filter((p) => p.routeId === routeId), [pickupRows, routeId]);
  const students = useMemo(() => studentRows.filter((s) => s.routeId === routeId), [studentRows, routeId]);
  const counts = useMemo(() => Object.fromEntries(points.map((p) => [p.id, p.studentCount])), [points]);
  if (!route) return <NotFound what="Route" to="/routes" />;
  const bus = busRows.find((b) => b.id === route.busId);

  const cols = [
    { field: 'name', headerName: 'Student', minWidth: 180, renderCell: (p) => <Link component={RLink} to={`/students/${p.row.id}`} underline="hover">{p.value}</Link> },
    { field: 'studentCode', headerName: 'Student ID', minWidth: 140 }, { field: 'className', headerName: 'Class', minWidth: 130 }, { field: 'pickupName', headerName: 'Pickup Point', minWidth: 170 }, statusCol('status', 'Status'),
  ];
  const pcols = [
    { field: 'code', headerName: 'Code', minWidth: 90 }, { field: 'name', headerName: 'Name', minWidth: 170 }, { field: 'pickupTime', headerName: 'Pickup Time', minWidth: 110 },
    { field: 'returnTime', headerName: 'Return Time', minWidth: 110 }, { field: 'studentCount', headerName: 'Students', type: 'number', minWidth: 90 }, statusCol(),
  ];

  return (
    <Box>
      <PageHeader title={`${route.code} — ${route.name}`} subtitle={`${route.startPoint} → ${route.destination}`} icon={<AltRouteIcon />}
        actions={<><StatusChip status={route.status} size="medium" /><Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/routes')}>{t('Back')}</Button></>} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><StatCard label="Students" value={route.studentCount} icon={<GroupsIcon />} index={0} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Capacity" value={route.capacity} icon={<AirlineSeatReclineNormalIcon />} color="info" index={1} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Available Seats" value={route.available} icon={<EventSeatIcon />} color="success" index={2} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Pickup Points" value={route.pickupCount} icon={<PlaceIcon />} color="warning" index={3} /></Grid>
      </Grid>

      <SectionCard title="Route Details" sx={{ mb: 3 }} index={1}>
        <RouteSequence route={route} points={points} studentCounts={counts} />
      </SectionCard>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}><SectionCard title="Overview" index={2}>
          <InfoRow label="Route Code" value={route.code} /><InfoRow label="Route Name" value={route.name} /><InfoRow label="Starting Point" value={route.startPoint} /><InfoRow label="Destination" value={route.destination} />
          <InfoRow label="Distance (km)" value={`${route.distance} km`} /><InfoRow label="Duration (min)" value={`${route.duration} min`} />
          <InfoRow label="Departure Time" value={route.departureTime} /><InfoRow label="Return Time" value={route.returnTime} /><InfoRow label="Description" value={route.description} />
        </SectionCard></Grid>
        <Grid item xs={12} md={6}><SectionCard title="Bus" index={3}>
          <InfoRow label="Bus" value={bus ? `${bus.busNumber} (${bus.regNo})` : '—'} /><InfoRow label="Driver" value={route.driverName} />
          <InfoRow label="Occupied Seats" value={route.occupied} /><InfoRow label="Available Seats" value={route.available} />
          {bus && <Box sx={{ mt: 2 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="caption">{t('Occupancy')}</Typography><Typography variant="caption" fontWeight={800}>{route.percent}%</Typography></Box>
            <CapacityBar percent={route.percent} state={capacityState(bus, route.occupied)} height={12} />
            {bus.state === 'full' && <Box sx={{ mt: 2 }}><FullBanner /></Box>}
            <Button sx={{ mt: 1.5 }} component={RLink} to={`/buses/${bus.id}`}>{t('Bus Details')} →</Button></Box>}
        </SectionCard></Grid>
      </Grid>

      <Stack spacing={3}>
        <SectionCard title="Pickup Points" index={4}><DataTable rows={points} columns={pcols} searchFields={['name', 'code']} pageSize={5} /></SectionCard>
        <SectionCard title="Students" index={5}><DataTable rows={students} columns={cols} searchFields={['name', 'studentCode', 'className', 'pickupName']} csvName={`${route.code}-students`} pageSize={10} /></SectionCard>
      </Stack>
    </Box>
  );
}
