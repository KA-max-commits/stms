import React, { useMemo, useState } from 'react';
import { Card, Box, TextField, InputAdornment, MenuItem, Button, Autocomplete, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useApp } from '../context/AppContext';
import { EmptyState } from './common';
import { exportCSV } from '../utils/helpers';

/**
 * Searchable / filterable / sortable / paginated grid.
 * filters: [{ key, label, type: 'select'|'date'|'autocomplete', options: [{value,label}] }]
 */
export default function DataTable({ rows, columns, filters = [], searchFields, actions, actionsWidth = 150, csvName, initialSort, onRowClick, pageSize = 10 }) {
  const { t } = useApp();
  const [q, setQ] = useState('');
  const [fv, setFv] = useState({});

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      for (const f of filters) if (fv[f.key] && r[f.key] !== fv[f.key]) return false;
      if (!needle) return true;
      const hay = (searchFields || Object.keys(r)).map((k) => r[k]).join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, fv, filters, searchFields]);

  const cols = useMemo(() => {
    const base = columns.map((c) => ({ flex: 1, minWidth: 130, ...c, headerName: t(c.headerName) }));
    if (actions) base.push({ field: '__actions', headerName: t('Actions'), width: actionsWidth, sortable: false, filterable: false, disableColumnMenu: true, renderCell: (p) => <Stack direction="row" spacing={0.25}>{actions(p.row)}</Stack> });
    return base;
  }, [columns, actions, actionsWidth, t]);

  const hasFilter = q || Object.values(fv).some(Boolean);

  return (
    <Card className="anim-in" sx={{ overflow: 'hidden' }}>
      <Box className="no-print" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <TextField size="small" placeholder={t('Search')} value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 220, flex: '1 1 220px' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
        {filters.map((f) => {
          if (f.type === 'date') return <TextField key={f.key} size="small" type="date" label={t(f.label)} InputLabelProps={{ shrink: true }} value={fv[f.key] || ''} onChange={(e) => setFv({ ...fv, [f.key]: e.target.value })} sx={{ width: 160 }} />;
          if (f.type === 'autocomplete') return (
            <Autocomplete key={f.key} size="small" sx={{ width: 200 }} options={f.options} value={f.options.find((o) => o.value === fv[f.key]) || null}
              getOptionLabel={(o) => o.label} isOptionEqualToValue={(a, b) => a.value === b.value}
              onChange={(_, o) => setFv({ ...fv, [f.key]: o ? o.value : '' })} renderInput={(p) => <TextField {...p} label={t(f.label)} />} />
          );
          return (
            <TextField key={f.key} size="small" select label={t(f.label)} value={fv[f.key] || ''} onChange={(e) => setFv({ ...fv, [f.key]: e.target.value })} sx={{ width: 160 }}>
              <MenuItem value=""><em>{t('All')}</em></MenuItem>
              {f.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
          );
        })}
        {hasFilter && <Button size="small" startIcon={<RestartAltIcon />} onClick={() => { setQ(''); setFv({}); }}>{t('Reset')}</Button>}
        {csvName && <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportCSV(csvName, columns.map((c) => ({ key: c.field, label: c.headerName })), filtered)}>{t('Export CSV')}</Button>}
      </Box>
      <DataGrid rows={filtered} columns={cols} autoHeight disableRowSelectionOnClick rowHeight={54}
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize } }, sorting: initialSort ? { sortModel: [initialSort] } : undefined }}
        onRowClick={onRowClick ? (p) => onRowClick(p.row) : undefined}
        slots={{ noRowsOverlay: () => <EmptyState /> }}
        sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover', fontWeight: 700 }, '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' }, '& .MuiDataGrid-cell:focus': { outline: 'none' }, ...(onRowClick ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : {}) }} />
    </Card>
  );
}
