import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, Alert, Autocomplete } from '@mui/material';
import { useApp } from '../context/AppContext';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reusable controlled form dialog with validation.
 * fields: [{ name, label, type, required, options | (values)=>options, min, max, validate, md, helper, disabled }]
 */
export default function FormDialog({ open, title, fields, initial, onClose, onSubmit, footer, submitLabel = 'Save', onFieldChange, maxWidth = 'md' }) {
  const { t } = useApp();
  const [values, setValues] = useState(initial || {});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => { if (open) { setValues(initial || {}); setErrors({}); setFormError(''); } }, [open, initial]);

  const set = (name, value) => {
    setValues((v) => {
      const next = { ...v, [name]: value };
      return onFieldChange ? onFieldChange(next, name, value) : next;
    });
    setErrors((e) => ({ ...e, [name]: '' }));
    setFormError('');
  };

  const validate = () => {
    const errs = {};
    fields.forEach((f) => {
      const val = values[f.name];
      const empty = val === undefined || val === null || String(val).trim() === '';
      if (f.required && empty) { errs[f.name] = `${t(f.label)} is required`; return; }
      if (empty) return;
      if (f.type === 'email' && !EMAIL.test(val)) errs[f.name] = 'Enter a valid email address';
      if (f.type === 'number') {
        if (Number.isNaN(Number(val))) errs[f.name] = 'Enter a valid number';
        else if (f.min !== undefined && Number(val) < f.min) errs[f.name] = `Minimum value is ${f.min}`;
        else if (f.max !== undefined && Number(val) > f.max) errs[f.name] = `Maximum value is ${f.max}`;
      }
      if (f.type === 'tel' && !/^\+?[0-9\s-]{8,15}$/.test(val)) errs[f.name] = 'Enter a valid phone number';
      if (f.validate) { const m = f.validate(val, values); if (m) errs[f.name] = m; }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!validate()) return;
    const res = onSubmit(values);
    if (res && res.ok === false) setFormError(res.error);
  };

  const renderField = (f) => {
    const opts = typeof f.options === 'function' ? f.options(values) : f.options || [];
    const common = { fullWidth: true, size: 'small', label: t(f.label), required: f.required, error: !!errors[f.name], helperText: errors[f.name] ? t(errors[f.name]) : f.helper, disabled: f.disabled };
    if (f.type === 'autocomplete') {
      return (
        <Autocomplete size="small" options={opts} value={opts.find((o) => o.value === values[f.name]) || null} disabled={f.disabled}
          getOptionLabel={(o) => o.label} isOptionEqualToValue={(a, b) => a.value === b.value}
          onChange={(_, o) => set(f.name, o ? o.value : '')}
          renderInput={(p) => <TextField {...p} label={t(f.label)} required={f.required} error={!!errors[f.name]} helperText={errors[f.name] ? t(errors[f.name]) : f.helper} />} />
      );
    }
    if (f.type === 'select') {
      return (
        <TextField {...common} select value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}>
          {!f.required && <MenuItem value=""><em>—</em></MenuItem>}
          {opts.map((o) => <MenuItem key={o.value} value={o.value} disabled={o.disabled}>{o.label}</MenuItem>)}
        </TextField>
      );
    }
    const isDate = f.type === 'date' || f.type === 'time';
    return (
      <TextField {...common} type={f.type || 'text'} value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}
        multiline={f.type === 'textarea'} minRows={f.type === 'textarea' ? 2 : undefined}
        InputLabelProps={isDate ? { shrink: true } : undefined} inputProps={f.type === 'number' ? { min: f.min, max: f.max } : undefined} />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <form onSubmit={submit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>{t(title)}</DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{t(formError)}</Alert>}
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            {fields.map((f) => (
              <Grid item xs={12} md={f.md || 6} key={f.name}>{renderField(f)}</Grid>
            ))}
          </Grid>
          {footer && footer(values)}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button type="submit" variant="contained">{t(submitLabel)}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
