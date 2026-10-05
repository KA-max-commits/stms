import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import { useApp } from '../context/AppContext';
import CrudPage from '../components/CrudPage';
import { InfoRow, EmptyState } from '../components/common';
import { statusCol, opts, strOpts } from '../components/columns';

export default function PickupPoints() {
  const { pickupRows, routes, studentRows, savePickup, deletePickup } = useApp();
  const columns = [
    { field: 'code', headerName: 'Code', minWidth: 90 },
    { field: 'name', headerName: 'Name', minWidth: 170 },
    { field: 'location', headerName: 'Location', minWidth: 210 },
    { field: 'routeName', headerName: 'Route', minWidth: 150 },
    { field: 'pickupTime', headerName: 'Pickup Time', minWidth: 110 },
    { field: 'returnTime', headerName: 'Return Time', minWidth: 110 },
    { field: 'studentCount', headerName: 'Students', type: 'number', minWidth: 90 },
    statusCol(),
  ];
  const fields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'location', label: 'Location', required: true },
    { name: 'routeId', label: 'Route', type: 'select', required: true, options: opts(routes, 'id', (r) => `${r.code} — ${r.name}`) },
    { name: 'status', label: 'Status', type: 'select', required: true, options: strOpts(['Active', 'Inactive']) },
    { name: 'pickupTime', label: 'Pickup Time', type: 'time', required: true },
    { name: 'returnTime', label: 'Return Time', type: 'time', required: true },
    { name: 'description', label: 'Description', type: 'textarea', md: 12 },
  ];
  return (
    <CrudPage title="Pickup Points" subtitle="Stops along each route" icon={<PlaceIcon />} singular="Pickup Point" rows={pickupRows} columns={columns} fields={fields}
      filters={[{ key: 'routeId', label: 'Route', options: opts(routes, 'id', 'name') }, { key: 'status', label: 'Status', options: strOpts(['Active', 'Inactive']) }]}
      searchFields={['code', 'name', 'location', 'routeName']} csvName="pickup-points" initialSort={{ field: 'code', sort: 'asc' }}
      defaults={() => ({ status: 'Active', pickupTime: '06:00', returnTime: '16:45' })} onSave={savePickup} onDelete={deletePickup}
      renderDetails={(p) => {
        const list = studentRows.filter((s) => s.pickupPointId === p.id);
        return (
          <Box>
            {['code', 'name', 'location', 'routeName', 'pickupTime', 'returnTime'].map((k) => <InfoRow key={k} label={columns.find((c) => c.field === k).headerName} value={p[k]} />)}
            <Typography fontWeight={700} sx={{ mt: 2, mb: 1 }}>Assigned students ({list.length})</Typography>
            {list.length === 0 ? <EmptyState /> : <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{list.map((s) => <Chip key={s.id} label={s.name} size="small" />)}</Box>}
          </Box>
        );
      }} />
  );
}
