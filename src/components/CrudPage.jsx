import React, { useState } from 'react';
import { Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DataTable from './DataTable';
import FormDialog from './FormDialog';
import { ConfirmDialog, PageHeader, InfoRow } from './common';

/** Generic CRUD page: header + table + add/edit dialog + delete confirmation + details view. */
export default function CrudPage({ title, subtitle, icon, singular, rows, columns, fields, filters, searchFields, defaults, onSave, onDelete, viewPath, renderDetails, headerExtra, above, csvName, initialSort, onFieldChange, formFooter }) {
  const { t, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(null); // { initial, isEdit }
  const [del, setDel] = useState(null);
  const [delError, setDelError] = useState('');
  const [view, setView] = useState(null);

  const submit = (values) => {
    const payload = {};
    fields.forEach((f) => { payload[f.name] = values[f.name] ?? ''; });
    if (form.isEdit) payload.id = form.initial.id;
    const res = onSave(payload, form.isEdit);
    if (res.ok) { notify(`${t(singular)} ${form.isEdit ? 'updated' : 'added'} successfully.`); setForm(null); }
    return res;
  };
  const confirmDelete = () => {
    const res = onDelete(del);
    if (res.ok) { notify(`${t(singular)} deleted.`); setDel(null); setDelError(''); } else setDelError(res.error);
  };

  const actions = (row) => (
    <>
      <Tooltip title={t('View')}><IconButton size="small" color="info" onClick={() => (viewPath ? navigate(viewPath(row)) : setView(row))}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title={t('Edit')}><IconButton size="small" color="primary" onClick={() => setForm({ initial: { ...row }, isEdit: true })}><EditIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title={t('Delete')}><IconButton size="small" color="error" onClick={() => { setDel(row); setDelError(''); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    </>
  );

  return (
    <Box>
      <PageHeader title={title} subtitle={subtitle} icon={icon} actions={<>
        {headerExtra}
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ initial: defaults(), isEdit: false })}>{t('Add')} {t(singular)}</Button>
      </>} />
      {above}
      <DataTable rows={rows} columns={columns} filters={filters} searchFields={searchFields} actions={actions} csvName={csvName} initialSort={initialSort} />
      <FormDialog open={!!form} title={form ? `${t(form.isEdit ? 'Edit' : 'Add')} ${t(singular)}` : ''} fields={fields} initial={form?.initial} onClose={() => setForm(null)} onSubmit={submit} onFieldChange={onFieldChange} footer={formFooter} />
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete}
        extra={delError && <Alert severity="error" sx={{ mt: 2 }}>{delError}</Alert>} />
      <Dialog open={!!view} onClose={() => setView(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t(singular)} — {t('Details')}</DialogTitle>
        <DialogContent dividers>
          {view && (renderDetails ? renderDetails(view) : columns.map((c) => <InfoRow key={c.field} label={c.headerName} value={String(view[c.field] ?? '—')} />))}
        </DialogContent>
        <DialogActions><Button onClick={() => setView(null)}>{t('Close')}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
