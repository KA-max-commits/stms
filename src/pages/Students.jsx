import React, { useMemo } from 'react';
import { Button } from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CrudPage from '../components/CrudPage';
import { statusCol, opts, strOpts } from '../components/columns';
import { uniq } from '../utils/helpers';

const STATUSES = ['Active', 'Inactive', 'Suspended'];
const LEVELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'L3', 'L4', 'L5'];

export default function Students() {
  const { studentRows, routes, buses, pickupPoints, saveStudent, deleteStudent, t } = useApp();
  const navigate = useNavigate();
  const classOpts = useMemo(() => strOpts(uniq(studentRows.map((s) => s.className)).sort()), [studentRows]);
  const columns = [
    { field: 'studentCode', headerName: 'Student ID', minWidth: 140 },
    { field: 'regNo', headerName: 'Registration Number', minWidth: 150 },
    { field: 'name', headerName: 'Full Name', minWidth: 180 },
    { field: 'gender', headerName: 'Gender', minWidth: 90 },
    { field: 'dob', headerName: 'Date of Birth', minWidth: 120 },
    { field: 'className', headerName: 'Class', minWidth: 130 },
    { field: 'level', headerName: 'Grade/Level', minWidth: 100 },
    { field: 'guardian', headerName: 'Parent/Guardian', minWidth: 170 },
    { field: 'parentPhone', headerName: 'Parent Phone', minWidth: 140 },
    { field: 'address', headerName: 'Address', minWidth: 150 },
    { field: 'pickupName', headerName: 'Pickup Point', minWidth: 160 },
    { field: 'routeName', headerName: 'Route', minWidth: 150 },
    { field: 'busNumber', headerName: 'Assigned Bus', minWidth: 120 },
    statusCol('status', 'Transport Status'),
  ];
  const fields = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'regNo', label: 'Registration Number', required: true },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: strOpts(['Male', 'Female']) },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true, validate: (v) => (new Date(v) > new Date() ? 'Date of birth cannot be in the future' : '') },
    { name: 'className', label: 'Class', required: true },
    { name: 'level', label: 'Grade/Level', type: 'select', required: true, options: strOpts(LEVELS) },
    { name: 'guardian', label: 'Parent/Guardian', required: true },
    { name: 'parentPhone', label: 'Parent Phone', type: 'tel', required: true },
    { name: 'address', label: 'Address', required: true },
    { name: 'status', label: 'Transport Status', type: 'select', required: true, options: strOpts(STATUSES), helper: 'Route, bus and pickup point are set on the Bus Assignments page' },
  ];
  return (
    <CrudPage title="Students" subtitle="Register students who use school transport" icon={<SchoolIcon />} singular="Student" rows={studentRows} columns={columns} fields={fields}
      filters={[
        { key: 'className', label: 'Class', options: classOpts },
        { key: 'routeId', label: 'Route', options: opts(routes, 'id', 'name') },
        { key: 'busId', label: 'Bus', options: opts(buses, 'id', 'busNumber') },
        { key: 'pickupPointId', label: 'Pickup Point', options: opts(pickupPoints, 'id', 'name') },
        { key: 'status', label: 'Transport Status', options: strOpts(STATUSES) },
      ]}
      searchFields={['studentCode', 'regNo', 'name', 'className', 'guardian', 'parentPhone', 'routeName', 'busNumber', 'pickupName']} csvName="students"
      headerExtra={<Button variant="outlined" startIcon={<AssignmentIndIcon />} onClick={() => navigate('/assignments')}>{t('New Assignment')}</Button>}
      defaults={() => ({ gender: 'Male', status: 'Active', level: 'S4' })} onSave={saveStudent} onDelete={deleteStudent} viewPath={(r) => `/students/${r.id}`} />
  );
}
