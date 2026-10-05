import React from 'react';
import { Box, Typography } from '@mui/material';
import { StatusChip, StateChip, CapacityBar } from './common';

export const statusCol = (field = 'status', headerName = 'Status') => ({ field, headerName, minWidth: 130, renderCell: (p) => <StatusChip status={p.value} /> });
export const stateCol = { field: 'state', headerName: 'Capacity', minWidth: 140, renderCell: (p) => <StateChip state={p.value} /> };
export const occupancyCol = { field: 'percent', headerName: 'Occupancy', minWidth: 170, renderCell: (p) => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="caption" fontWeight={700}>{p.value}%</Typography>
    <CapacityBar percent={p.value} state={p.row.state} height={7} />
  </Box>
) };
export const opts = (arr, value, label) => arr.map((x) => ({ value: typeof value === 'function' ? value(x) : x[value], label: typeof label === 'function' ? label(x) : x[label] }));
export const strOpts = (arr) => arr.map((x) => ({ value: x, label: x }));
