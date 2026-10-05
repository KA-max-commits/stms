import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Chip, Typography, Avatar, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InboxIcon from '@mui/icons-material/Inbox';
import { useApp } from '../context/AppContext';
import { STATUS_COLORS, STATE_META } from '../utils/helpers';

export function StatusChip({ status, size = 'small' }) {
  const { t } = useApp();
  if (!status) return null;
  return <Chip size={size} label={t(status)} color={STATUS_COLORS[status] || 'default'} variant={status === 'Inactive' || status === 'Cancelled' ? 'outlined' : 'filled'} />;
}

export function StateChip({ state, size = 'small' }) {
  const { t } = useApp();
  const m = STATE_META[state];
  return <Chip size={size} label={t(m.label)} color={m.color === 'inherit' ? 'default' : m.color} variant="outlined" sx={state === 'out' ? { color: 'text.secondary' } : undefined} />;
}

export function useCountUp(target, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function StatCard({ label, value, icon, color = 'primary', suffix = '', index = 0, hint, onClick }) {
  const theme = useTheme();
  const { t } = useApp();
  const shown = useCountUp(Number(value) || 0);
  const main = theme.palette[color]?.main || theme.palette.primary.main;
  return (
    <Card className="anim-in hover-lift" style={{ '--i': index }} onClick={onClick} sx={{ height: '100%', cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', right: -24, top: -24, width: 100, height: 100, borderRadius: '50%', bgcolor: alpha(main, 0.1) }} />
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar variant="rounded" sx={{ bgcolor: alpha(main, 0.14), color: main, width: 52, height: 52 }}>{icon}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ lineHeight: 1.1 }}>{Number.isInteger(Number(value)) ? Math.round(shown) : shown.toFixed(1)}{suffix}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{t(label)}</Typography>
          {hint && <Typography variant="caption" color="text.disabled">{hint}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

export function PageHeader({ title, subtitle, icon, actions }) {
  const { t } = useApp();
  return (
    <Box className="anim-left" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        {icon && <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', color: '#fff', width: 48, height: 48, boxShadow: 3 }}>{icon}</Avatar>}
        <Box>
          <Typography variant="h5">{t(title)}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{t(subtitle)}</Typography>}
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap className="no-print">{actions}</Stack>
    </Box>
  );
}

export function SectionCard({ title, action, children, index = 0, sx, id }) {
  const { t } = useApp();
  return (
    <Card id={id} className="anim-in" style={{ '--i': index }} sx={{ height: '100%', ...sx }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontSize: 16 }}>{t(title)}</Typography>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ text = 'Nothing found', icon }) {
  const { t } = useApp();
  return (
    <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
      <Box className="float" sx={{ display: 'inline-flex', fontSize: 48, opacity: 0.5 }}>{icon || <InboxIcon fontSize="inherit" />}</Box>
      <Typography variant="body2">{t(text)}</Typography>
    </Box>
  );
}

export function CapacityBar({ percent, state, height = 10 }) {
  const color = STATE_META[state]?.color || 'primary';
  return (
    <LinearProgress variant="determinate" value={Math.min(percent, 100)} color={color === 'inherit' ? 'inherit' : color}
      sx={{ height, bgcolor: 'action.hover', ...(color === 'inherit' ? { color: 'text.disabled' } : {}) }} />
  );
}

export function FullBanner() {
  const { t } = useApp();
  return (
    <Box className="pulse-danger" sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'error.main', color: '#fff', px: 1.5, py: 0.75, borderRadius: 2, fontWeight: 700, fontSize: 12.5 }}>
      <WarningAmberIcon fontSize="small" /> {t('BUS FULL — NO AVAILABLE SEATS')}
    </Box>
  );
}

export function ConfirmDialog({ open, title = 'Delete this record?', message = 'This action cannot be undone.', confirmLabel = 'Delete', color = 'error', onConfirm, onClose, extra }) {
  const { t } = useApp();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarningAmberIcon color={color} /> {t(title)}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{t(message)}</Typography>
        {extra}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button variant="contained" color={color} onClick={onConfirm}>{t(confirmLabel)}</Button>
      </DialogActions>
    </Dialog>
  );
}

export function InfoRow({ label, value }) {
  const { t } = useApp();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">{t(label)}</Typography>
      <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'right' }}>{value ?? '—'}</Typography>
    </Box>
  );
}
