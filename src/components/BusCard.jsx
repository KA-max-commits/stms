import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, Avatar, AvatarGroup, Button, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemAvatar, ListItemText, Grid } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusChip, StateChip, CapacityBar, FullBanner, EmptyState } from './common';
import { initials, STATE_META } from '../utils/helpers';
import { alpha, useTheme } from '@mui/material/styles';

export function BusCard({ bus, index = 0 }) {
  const { t, assignmentRows } = useApp();
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const students = assignmentRows.filter((a) => a.busId === bus.id && a.status === 'Active');
  const meta = STATE_META[bus.state];
  const accent = meta.color === 'inherit' ? theme.palette.text.disabled : theme.palette[meta.color].main;

  return (
    <>
      <Card className="anim-in hover-lift" style={{ '--i': index }} onClick={() => setOpen(true)}
        sx={{ cursor: 'pointer', height: '100%', borderTop: `4px solid ${accent}`, opacity: bus.state === 'out' ? 0.78 : 1 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar variant="rounded" sx={{ bgcolor: alpha(accent, 0.15), color: accent, width: 46, height: 46 }}><DirectionsBusIcon /></Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={800}>{bus.busNumber}</Typography>
              <Typography variant="caption" color="text.secondary">{bus.regNo} · {bus.type}</Typography>
            </Box>
            <StatusChip status={bus.status} />
          </Box>

          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><AltRouteIcon fontSize="inherit" color="action" /> {bus.routeName}</Typography>
            <Typography variant="body2" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><PersonIcon fontSize="inherit" color="action" /> {bus.driverName}</Typography>
          </Stack>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{t('Occupancy')}</Typography>
              <Typography variant="caption" fontWeight={800} sx={{ color: accent }}>{bus.percent}%</Typography>
            </Box>
            <CapacityBar percent={bus.percent} state={bus.state} />
          </Box>

          <Grid container spacing={1} textAlign="center">
            {[['Capacity', bus.capacity], ['Occupied', bus.occupied], ['Available', bus.available]].map(([l, v]) => (
              <Grid item xs={4} key={l}>
                <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, py: 0.75 }}>
                  <Typography fontWeight={800}>{v}</Typography>
                  <Typography variant="caption" color="text.secondary">{t(l)}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
            <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 11 } }}>
              {students.map((s) => <Avatar key={s.id}>{initials(s.studentName)}</Avatar>)}
            </AvatarGroup>
            <StateChip state={bus.state} />
          </Box>
          {bus.state === 'full' && <FullBanner />}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DirectionsBusIcon color="primary" /> {bus.busNumber} — {t('Assigned Students')} ({students.length}/{bus.capacity})
        </DialogTitle>
        <DialogContent dividers>
          <CapacityBar percent={bus.percent} state={bus.state} height={12} />
          {bus.state === 'full' && <Box sx={{ mt: 2 }}><FullBanner /></Box>}
          {students.length === 0 ? <EmptyState /> : (
            <List dense sx={{ maxHeight: 340, overflow: 'auto' }}>
              {students.map((s) => (
                <ListItem key={s.id} secondaryAction={<Chip size="small" label={s.pickupName} />}>
                  <ListItemAvatar><Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>{initials(s.studentName)}</Avatar></ListItemAvatar>
                  <ListItemText primary={s.studentName} secondary={s.studentCode} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('Close')}</Button>
          <Button variant="contained" startIcon={<EventSeatIcon />} onClick={() => navigate(`/buses/${bus.id}`)}>{t('Details')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function BusCardGrid({ buses }) {
  return (
    <Grid container spacing={2.5}>
      {buses.map((b, i) => <Grid item xs={12} sm={6} lg={4} xl={3} key={b.id}><BusCard bus={b} index={i} /></Grid>)}
    </Grid>
  );
}
