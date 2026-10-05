import React from 'react';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import { useApp } from '../context/AppContext';
import CrudPage from '../components/CrudPage';
import { statusCol, opts, strOpts } from '../components/columns';

const STATUSES = ['Active', 'Inactive', 'Suspended'];

export default function RoutesPage() {
  const { routeRows, buses, saveRoute, deleteRoute } = useApp();
  const busOpts = opts(buses, 'id', (b) => `${b.busNumber} (${b.regNo})`);
  const columns = [
    { field: 'code', headerName: 'Route Code', minWidth: 100 },
    { field: 'name', headerName: 'Route Name', minWidth: 160 },
    { field: 'startPoint', headerName: 'Starting Point', minWidth: 160 },
    { field: 'destination', headerName: 'Destination', minWidth: 160 },
    { field: 'distance', headerName: 'Distance (km)', type: 'number', minWidth: 110 },
    { field: 'duration', headerName: 'Duration (min)', type: 'number', minWidth: 120 },
    { field: 'busNumber', headerName: 'Assigned Bus', minWidth: 120 },
    { field: 'driverName', headerName: 'Driver', minWidth: 170 },
    { field: 'studentCount', headerName: 'Students', type: 'number', minWidth: 90 },
    { field: 'pickupCount', headerName: 'Pickup Points', type: 'number', minWidth: 110 },
    { field: 'departureTime', headerName: 'Departure Time', minWidth: 120 },
    { field: 'returnTime', headerName: 'Return Time', minWidth: 110 },
    statusCol(),
  ];
  const fields = [
    { name: 'name', label: 'Route Name', required: true },
    { name: 'busId', label: 'Assigned Bus', type: 'select', options: busOpts },
    { name: 'startPoint', label: 'Starting Point', required: true },
    { name: 'destination', label: 'Destination', required: true },
    { name: 'distance', label: 'Distance (km)', type: 'number', required: true, min: 1 },
    { name: 'duration', label: 'Duration (min)', type: 'number', required: true, min: 1 },
    { name: 'departureTime', label: 'Departure Time', type: 'time', required: true },
    { name: 'returnTime', label: 'Return Time', type: 'time', required: true, validate: (v, all) => (all.departureTime && v <= all.departureTime ? 'Return time must be after departure time' : '') },
    { name: 'status', label: 'Status', type: 'select', required: true, options: strOpts(STATUSES) },
    { name: 'description', label: 'Description', type: 'textarea', md: 12 },
  ];
  return (
    <CrudPage title="Routes" subtitle="Create routes and connect them to buses" icon={<AltRouteIcon />} singular="Route" rows={routeRows} columns={columns} fields={fields}
      filters={[{ key: 'status', label: 'Status', options: strOpts(STATUSES) }, { key: 'busId', label: 'Assigned Bus', options: busOpts }]}
      searchFields={['code', 'name', 'startPoint', 'destination', 'busNumber', 'driverName']} csvName="routes"
      defaults={() => ({ status: 'Active', destination: 'RP Karongi College', departureTime: '06:00', returnTime: '16:30', distance: 10, duration: 30 })}
      onSave={saveRoute} onDelete={deleteRoute} viewPath={(r) => `/routes/${r.id}`} />
  );
}
