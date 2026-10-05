import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel, Autocomplete, TextField, Box, Typography, Alert, Card, CardActionArea, Grid, Chip, Divider } from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import { PageHeader, ConfirmDialog, StatusChip, CapacityBar, FullBanner, InfoRow } from '../components/common';
import { statusCol, opts, strOpts } from '../components/columns';
import { capacityState, pct, ASSIGNABLE_BUS_STATUSES, todayStr } from '../utils/helpers';

const STATUSES = ['Active', 'Suspended', 'Completed', 'Cancelled'];
const STEPS = ['Select student', 'Select route', 'Select bus', 'Select pickup point', 'Confirm Assignment'];

function AssignmentWizard({ open, onClose, presetStudent }) {
  const { t, studentRows, routeRows, busRows, pickupPoints, assignStudent, notify } = useApp();
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ studentId: '', routeId: '', busId: '', pickupPointId: '', startDate: todayStr(), remarks: '' });
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setStep(0); setError(''); setD({ studentId: presetStudent || '', routeId: '', busId: '', pickupPointId: '', startDate: todayStr(), remarks: '' }); } }, [open, presetStudent]);

  const students = studentRows.filter((s) => !s.assignmentId && s.status === 'Active');
  const bus = busRows.find((b) => b.id === d.busId);
  const student = studentRows.find((s) => s.id === d.studentId);
  const route = routeRows.find((r) => r.id === d.routeId);
  const pickup = pickupPoints.find((p) => p.id === d.pickupPointId);
  const routePoints = pickupPoints.filter((p) => p.routeId === d.routeId && p.status === 'Active');
  const busBlocked = bus && (bus.state === 'full' || bus.state === 'out');
  const busMsg = bus ? (bus.state === 'full' ? 'BUS FULL — NO AVAILABLE SEATS' : !ASSIGNABLE_BUS_STATUSES.includes(bus.status) ? `${bus.busNumber} is ${bus.status} and cannot take students.` : '') : '';

  const canNext = [!!d.studentId, !!d.routeId, !!d.busId && !busBlocked, !!d.pickupPointId, true][step];

  const pickRoute = (routeId) => {
    const r = routeRows.find((x) => x.id === routeId);
    setD({ ...d, routeId, busId: r?.busId || '', pickupPointId: '' });
  };

  const confirm = () => {
    const res = assignStudent(d);
    if (!res.ok) { setError(res.error); return; }
    notify(`${student.name} assigned to ${bus.busNumber}. Seats updated.`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('New Assignment')}</DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 3, '& .MuiStepLabel-label': { fontSize: 12 } }}>
          {STEPS.map((s) => <Step key={s}><StepLabel>{t(s)}</StepLabel></Step>)}
        </Stepper>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}

        {step === 0 && (
          <Box className="page-enter">
            <Autocomplete options={students} value={student && !student.assignmentId ? student : null} getOptionLabel={(s) => `${s.name} — ${s.studentCode} (${s.className})`}
              onChange={(_, s) => setD({ ...d, studentId: s?.id || '' })} renderInput={(p) => <TextField {...p} label={t('Student')} helperText={`${students.length} students without an active assignment`} />} />
            {student && student.assignmentId && <Alert severity="warning" sx={{ mt: 2 }}>Duplicate assignment warning: this student is already assigned.</Alert>}
          </Box>
        )}

        {step === 1 && (
          <Grid container spacing={2} className="page-enter">
            {routeRows.filter((r) => r.status === 'Active').map((r) => (
              <Grid item xs={12} sm={6} key={r.id}>
                <Card variant="outlined" sx={{ borderColor: d.routeId === r.id ? 'primary.main' : undefined, borderWidth: d.routeId === r.id ? 2 : 1 }}>
                  <CardActionArea onClick={() => pickRoute(r.id)} sx={{ p: 1.5 }}>
                    <Typography fontWeight={700}>{r.code} — {r.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.startPoint} → {r.destination} · {r.departureTime}</Typography>
                    <Box sx={{ mt: 0.5 }}><Chip size="small" label={`${r.busNumber}`} /> <Chip size="small" variant="outlined" label={`${r.pickupCount} stops`} /></Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {step === 2 && (
          <Box className="page-enter">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{t('Verify capacity')}</Typography>
            <Grid container spacing={2}>
              {busRows.filter((b) => ASSIGNABLE_BUS_STATUSES.includes(b.status)).map((b) => (
                <Grid item xs={12} sm={6} key={b.id}>
                  <Card variant="outlined" sx={{ borderColor: d.busId === b.id ? 'primary.main' : undefined, borderWidth: d.busId === b.id ? 2 : 1, opacity: b.state === 'full' ? 0.7 : 1 }}>
                    <CardActionArea onClick={() => setD({ ...d, busId: b.id })} sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight={700}>{b.busNumber} <Typography component="span" variant="caption" color="text.secondary">{b.regNo}{b.routeId === d.routeId ? ' · route bus' : ''}</Typography></Typography>
                        <Typography variant="body2" fontWeight={700}>{b.occupied}/{b.capacity}</Typography>
                      </Box>
                      <CapacityBar percent={b.percent} state={b.state} />
                      <Typography variant="caption" color={b.state === 'full' ? 'error' : 'text.secondary'} fontWeight={b.state === 'full' ? 700 : 400}>
                        {b.state === 'full' ? t('BUS FULL — NO AVAILABLE SEATS') : `${b.available} ${t('Available Seats').toLowerCase()} · ${b.percent}%`}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {busMsg && <Box sx={{ mt: 2 }}><FullBanner /></Box>}
            {bus && bus.state === 'near' && <Alert severity="warning" sx={{ mt: 2 }}>Capacity warning: {bus.busNumber} is {bus.percent}% full — only {bus.available} seats left.</Alert>}
          </Box>
        )}

        {step === 3 && (
          <Box className="page-enter">
            {routePoints.length === 0 ? <Alert severity="warning">This route has no active pickup points. Add pickup points first.</Alert> : (
              <TextField select fullWidth label={t('Pickup Point')} value={d.pickupPointId} onChange={(e) => setD({ ...d, pickupPointId: e.target.value })} SelectProps={{ native: true }} InputLabelProps={{ shrink: true }}>
                <option value="">—</option>
                {routePoints.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name} ({p.pickupTime})</option>)}
              </TextField>
            )}
            <TextField fullWidth label="Remarks" sx={{ mt: 2 }} value={d.remarks} onChange={(e) => setD({ ...d, remarks: e.target.value })} />
          </Box>
        )}

        {step === 4 && student && bus && route && pickup && (
          <Box className="page-enter">
            <Alert severity="info" sx={{ mb: 2 }}>Student → Pickup Point → Route → Bus → Driver</Alert>
            <InfoRow label="Student" value={`${student.name} (${student.studentCode})`} />
            <InfoRow label="Pickup Point" value={`${pickup.name} — ${pickup.pickupTime}`} />
            <InfoRow label="Route" value={`${route.code} ${route.name}`} />
            <InfoRow label="Bus" value={`${bus.busNumber} (${bus.regNo})`} />
            <InfoRow label="Driver" value={bus.driverName} />
            <Divider sx={{ my: 2 }} />
            <Typography fontWeight={700} gutterBottom>Seat update</Typography>
            <Typography variant="body2">Occupied: {bus.occupied} → <b>{bus.occupied + 1}</b> · Available: {bus.available} → <b>{bus.available - 1}</b> · Occupancy: {bus.percent}% → <b>{pct(bus.occupied + 1, bus.capacity)}%</b></Typography>
            <Box sx={{ mt: 1 }}><CapacityBar percent={pct(bus.occupied + 1, bus.capacity)} state={capacityState(bus, bus.occupied + 1)} height={12} /></Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Box sx={{ flex: 1 }} />
        <Button disabled={step === 0} onClick={() => { setStep(step - 1); setError(''); }}>{t('Back')}</Button>
        {step < 4 ? <Button variant="contained" disabled={!canNext} onClick={() => setStep(step + 1)}>{t('Next')}</Button>
          : <Button variant="contained" color="success" onClick={confirm}>{t('Confirm Assignment')}</Button>}
      </DialogActions>
    </Dialog>
  );
}

export default function Assignments() {
  const { assignmentRows, routes, buses, updateAssignment, deleteAssignment, notify, t } = useApp();
  const [params, setParams] = useSearchParams();
  const [wizard, setWizard] = useState(!!params.get('student'));
  const [preset] = useState(params.get('student') || '');
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);

  useEffect(() => { if (params.get('student')) setParams({}, { replace: true }); }, []); // eslint-disable-line

  const columns = useMemo(() => [
    { field: 'code', headerName: 'Assignment ID', minWidth: 160 },
    { field: 'studentName', headerName: 'Student', minWidth: 180 },
    { field: 'routeName', headerName: 'Route', minWidth: 150 },
    { field: 'busNumber', headerName: 'Bus', minWidth: 100 },
    { field: 'driverName', headerName: 'Driver', minWidth: 170 },
    { field: 'pickupName', headerName: 'Pickup Point', minWidth: 160 },
    { field: 'assignmentDate', headerName: 'Assignment Date', minWidth: 130 },
    { field: 'startDate', headerName: 'Start Date', minWidth: 110 },
    { field: 'endDate', headerName: 'End Date', minWidth: 110 },
    statusCol(),
    { field: 'remarks', headerName: 'Remarks', minWidth: 170 },
  ], []);

  const fields = [
    { name: 'status', label: 'Status', type: 'select', required: true, options: strOpts(STATUSES) },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date', validate: (v, all) => (v && all.startDate && v < all.startDate ? 'End date must be after start date' : '') },
    { name: 'remarks', label: 'Remarks', type: 'textarea', md: 12 },
  ];

  const actions = (row) => (
    <>
      <Tooltip title={t('Edit')}><IconButton size="small" color="primary" onClick={() => setEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title={t('Delete')}><IconButton size="small" color="error" onClick={() => setDel(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    </>
  );

  return (
    <Box>
      <PageHeader title="Bus Assignments" subtitle="Student → Pickup Point → Route → Bus → Driver" icon={<AssignmentIndIcon />}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setWizard(true)}>{t('New Assignment')}</Button>} />
      <DataTable rows={assignmentRows} columns={columns} actions={actions} actionsWidth={110} csvName="assignments" initialSort={{ field: 'code', sort: 'desc' }}
        searchFields={['code', 'studentName', 'routeName', 'busNumber', 'driverName', 'pickupName', 'remarks']}
        filters={[{ key: 'status', label: 'Status', options: strOpts(STATUSES) }, { key: 'routeId', label: 'Route', options: opts(routes, 'id', 'name') }, { key: 'busId', label: 'Bus', options: opts(buses, 'id', 'busNumber') }]} />
      <AssignmentWizard open={wizard} onClose={() => setWizard(false)} presetStudent={preset} />
      <FormDialog open={!!edit} title="Edit Assignment" fields={fields} initial={edit ? { id: edit.id, status: edit.status, startDate: edit.startDate, endDate: edit.endDate, remarks: edit.remarks } : {}} maxWidth="sm"
        onClose={() => setEdit(null)} onSubmit={(v) => { const r = updateAssignment(v); if (r.ok) { notify('Assignment updated. Seat counts recalculated.'); setEdit(null); } return r; }} />
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { deleteAssignment(del); notify('Assignment deleted.'); setDel(null); }}
        message="Deleting an active assignment frees one seat on the bus." />
    </Box>
  );
}
