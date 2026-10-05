import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import { useApp } from '../context/AppContext';
import CrudPage from '../components/CrudPage';
import { InfoRow } from '../components/common';
import { statusCol, opts, strOpts } from '../components/columns';
import { daysUntil } from '../utils/helpers';

const STATUSES = ['Active', 'Inactive', 'On Leave', 'Suspended'];

export default function Drivers() {
  const { driverRows, buses, saveDriver, deleteDriver } = useApp();
  const busOpts = opts(buses, 'id', (b) => `${b.busNumber} (${b.regNo})`);

  const columns = [
    { field: 'staffNo', headerName: 'Staff Number', minWidth: 110 },
    { field: 'name', headerName: 'Full Name', minWidth: 180 },
    { field: 'gender', headerName: 'Gender', minWidth: 90 },
    { field: 'phone', headerName: 'Phone', minWidth: 140 },
    { field: 'email', headerName: 'Email', minWidth: 210 },
    { field: 'licenseNo', headerName: 'License Number', minWidth: 140 },
    { field: 'licenseExpiry', headerName: 'License Expiry', minWidth: 130,
      renderCell: (p) => { const d = daysUntil(p.value); return <Typography variant="body2" color={d < 0 ? 'error' : d <= 60 ? 'warning.main' : 'text.primary'} fontWeight={d <= 60 ? 700 : 400}>{p.value}{d < 0 ? ' (expired)' : d <= 60 ? ` (${d}d)` : ''}</Typography>; } },
    { field: 'busNumber', headerName: 'Assigned Bus', minWidth: 120 },
    { field: 'routeName', headerName: 'Assigned Route', minWidth: 150 },
    { field: 'experience', headerName: 'Experience (yrs)', type: 'number', minWidth: 120 },
    statusCol(),
  ];
  const fields = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: strOpts(['Male', 'Female']) },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'licenseNo', label: 'License Number', required: true },
    { name: 'licenseExpiry', label: 'License Expiry', type: 'date', required: true },
    { name: 'busId', label: 'Assigned Bus', type: 'select', options: busOpts, helper: 'Only one active driver per bus' },
    { name: 'experience', label: 'Experience (yrs)', type: 'number', required: true, min: 0, max: 50 },
    { name: 'status', label: 'Status', type: 'select', required: true, options: strOpts(STATUSES) },
  ];

  return (
    <CrudPage title="Drivers" subtitle="Register and manage drivers" icon={<BadgeIcon />} singular="Driver" rows={driverRows} columns={columns} fields={fields}
      filters={[{ key: 'status', label: 'Status', options: strOpts(STATUSES) }, { key: 'busId', label: 'Assigned Bus', options: busOpts }, { key: 'gender', label: 'Gender', options: strOpts(['Male', 'Female']) }]}
      searchFields={['staffNo', 'name', 'phone', 'email', 'licenseNo', 'busNumber', 'routeName']} csvName="drivers"
      defaults={() => ({ gender: 'Male', status: 'Active', experience: 1 })} onSave={saveDriver} onDelete={deleteDriver}
      renderDetails={(d) => (
        <Box>
          {daysUntil(d.licenseExpiry) <= 60 && <Alert severity={daysUntil(d.licenseExpiry) < 0 ? 'error' : 'warning'} sx={{ mb: 2 }}>Driving license {daysUntil(d.licenseExpiry) < 0 ? 'has expired' : `expires in ${daysUntil(d.licenseExpiry)} days`}.</Alert>}
          {columns.map((c) => <InfoRow key={c.field} label={c.headerName} value={String(d[c.field] ?? '—')} />)}
        </Box>
      )} />
  );
}
