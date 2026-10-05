import React, { useState, useMemo } from 'react';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { useApp } from '../context/AppContext';
import CrudPage from '../components/CrudPage';
import DataTable from '../components/DataTable';
import { BusCardGrid } from '../components/BusCard';
import { PageHeader } from '../components/common';
import { statusCol, stateCol, occupancyCol, opts, strOpts } from '../components/columns';

const TYPES = ['School Bus', 'Minibus', 'Van', 'Coaster'];
const STATUSES = ['Available', 'Assigned', 'In Service', 'Maintenance', 'Out of Service'];

export default function Buses() {
  const { busRows, routes, drivers, saveBus, deleteBus, t } = useApp();
  const [view, setView] = useState('table');

  const toggle = (
    <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)}>
      <ToggleButton value="cards"><ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} />{t('Cards')}</ToggleButton>
      <ToggleButton value="table"><TableRowsIcon fontSize="small" sx={{ mr: 0.5 }} />{t('Table')}</ToggleButton>
    </ToggleButtonGroup>
  );

  const routeOpts = opts(routes, 'id', (r) => `${r.code} — ${r.name}`);
  const driverOpts = opts(drivers, 'id', 'name');
  const columns = useMemo(() => [
    { field: 'busNumber', headerName: 'Bus Number', minWidth: 110 },
    { field: 'regNo', headerName: 'Registration Number', minWidth: 140 },
    { field: 'type', headerName: 'Bus Type', minWidth: 110 },
    { field: 'capacity', headerName: 'Capacity', type: 'number', minWidth: 90 },
    { field: 'occupied', headerName: 'Occupied', type: 'number', minWidth: 90 },
    { field: 'available', headerName: 'Available', type: 'number', minWidth: 90 },
    occupancyCol, stateCol,
    { field: 'routeName', headerName: 'Route', minWidth: 150 },
    { field: 'driverName', headerName: 'Driver', minWidth: 160 },
    { field: 'model', headerName: 'Model', minWidth: 140 },
    { field: 'year', headerName: 'Year', type: 'number', minWidth: 80 },
    { field: 'location', headerName: 'Current Location', minWidth: 140 },
    statusCol(),
  ], []);

  const fields = [
    { name: 'regNo', label: 'Registration Number', required: true },
    { name: 'type', label: 'Bus Type', type: 'select', required: true, options: strOpts(TYPES) },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true, min: 1, max: 100 },
    { name: 'model', label: 'Model', required: true },
    { name: 'year', label: 'Year', type: 'number', required: true, min: 1990, max: new Date().getFullYear() + 1 },
    { name: 'status', label: 'Status', type: 'select', required: true, options: strOpts(STATUSES) },
    { name: 'routeId', label: 'Route', type: 'select', options: routeOpts },
    { name: 'driverId', label: 'Driver', type: 'select', options: driverOpts },
    { name: 'location', label: 'Current Location' },
    { name: 'description', label: 'Description', type: 'textarea', md: 12 },
  ];

  const filters = [
    { key: 'status', label: 'Status', options: strOpts(STATUSES) },
    { key: 'routeId', label: 'Route', options: routeOpts },
    { key: 'driverId', label: 'Driver', options: driverOpts },
  ];

  if (view === 'cards') {
    return (
      <Box>
        <PageHeader title="Buses" subtitle="Visual Bus Dashboard" icon={<DirectionsBusIcon />} actions={toggle} />
        <BusCardGrid buses={busRows} />
      </Box>
    );
  }
  return (
    <CrudPage title="Buses" subtitle="Manage the school bus fleet" icon={<DirectionsBusIcon />} singular="Bus" rows={busRows} columns={columns} fields={fields}
      filters={filters} searchFields={['busNumber', 'regNo', 'type', 'model', 'routeName', 'driverName', 'location']} csvName="buses" headerExtra={toggle}
      defaults={() => ({ type: 'School Bus', status: 'Available', year: new Date().getFullYear(), capacity: 30, location: 'School Garage' })}
      onSave={saveBus} onDelete={deleteBus} viewPath={(r) => `/buses/${r.id}`} />
  );
}
