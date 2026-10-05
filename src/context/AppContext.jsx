import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getMock } from '../data/mockData';
import { translate } from '../i18n';
import { uid, nextCode, todayStr, capacityState, pct, YEAR, ASSIGNABLE_BUS_STATUSES } from '../utils/helpers';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

function useLS(key, init) {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) return JSON.parse(s);
    } catch { /* ignore corrupted storage */ }
    return typeof init === 'function' ? init() : init;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full */ }
  }, [key, v]);
  return [v, setV];
}

const upsert = (setter, item, prepend = true) =>
  setter((list) => (list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : prepend ? [item, ...list] : [...list, item]));

export function AppProvider({ children }) {
  const [buses, setBuses] = useLS('stms_buses', () => getMock().buses);
  const [drivers, setDrivers] = useLS('stms_drivers', () => getMock().drivers);
  const [routes, setRoutes] = useLS('stms_routes', () => getMock().routes);
  const [students, setStudents] = useLS('stms_students', () => getMock().students);
  const [pickupPoints, setPickupPoints] = useLS('stms_pickups', () => getMock().pickupPoints);
  const [assignments, setAssignments] = useLS('stms_assignments', () => getMock().assignments);
  const [attendance, setAttendance] = useLS('stms_attendance', () => getMock().attendance);
  const [prefs, setPrefs] = useLS('stms_prefs', { lang: 'en', mode: 'light' });
  const [auth, setAuth] = useLS('stms_auth', null);
  const [users, setUsers] = useLS('stms_users', []);
  const [snack, setSnack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const id = setTimeout(() => setLoading(false), 900); return () => clearTimeout(id); }, []);

  const notify = useCallback((message, severity = 'success') => setSnack({ message, severity, key: Date.now() }), []);
  const t = useCallback((k) => translate(prefs.lang, k), [prefs.lang]);
  const setLang = (lang) => setPrefs((p) => ({ ...p, lang }));
  const toggleMode = () => setPrefs((p) => ({ ...p, mode: p.mode === 'dark' ? 'light' : 'dark' }));

  const login = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'admin@school.rw' && password === 'admin123') {
      setAuth({ name: 'Transport Admin', email: normalizedEmail, role: 'Administrator' });
      return true;
    }
    const user = Array.isArray(users) ? users.find((entry) => entry.email === normalizedEmail && entry.password === password) : null;
    if (user) {
      const { password: storedPassword, ...profile } = user;
      setAuth(profile);
      return true;
    }
    return false;
  };
  const register = (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'admin@school.rw' || (Array.isArray(users) && users.some((user) => user.email === normalizedEmail))) return false;
    const user = { id: uid(), name: name.trim(), email: normalizedEmail, role: 'Staff', password };
    setUsers((current) => [...(Array.isArray(current) ? current : []), user]);
    const { password: storedPassword, ...profile } = user;
    setAuth(profile);
    return true;
  };
  const logout = () => setAuth(null);

  /* ---------- lookup maps ---------- */
  const maps = useMemo(() => {
    const m = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
    return { bus: m(buses), driver: m(drivers), route: m(routes), student: m(students), pickup: m(pickupPoints) };
  }, [buses, drivers, routes, students, pickupPoints]);

  const occupancy = useMemo(() => {
    const o = {};
    assignments.filter((a) => a.status === 'Active').forEach((a) => { o[a.busId] = (o[a.busId] || 0) + 1; });
    return o;
  }, [assignments]);

  const busStats = useCallback((bus) => {
    const occupied = occupancy[bus.id] || 0;
    return { occupied, available: Math.max(bus.capacity - occupied, 0), percent: pct(occupied, bus.capacity), state: capacityState(bus, occupied) };
  }, [occupancy]);

  /* ---------- enriched rows (derived state) ---------- */
  const busRows = useMemo(() => buses.map((b) => ({
    ...b, ...busStats(b),
    routeName: maps.route[b.routeId]?.name || '—', routeCode: maps.route[b.routeId]?.code || '',
    driverName: maps.driver[b.driverId]?.name || '—',
  })), [buses, busStats, maps]);

  const busByDriver = useMemo(() => Object.fromEntries(buses.filter((b) => b.driverId).map((b) => [b.driverId, b])), [buses]);
  const busByRoute = useMemo(() => Object.fromEntries(buses.filter((b) => b.routeId).map((b) => [b.routeId, b])), [buses]);

  const driverRows = useMemo(() => drivers.map((d) => {
    const b = busByDriver[d.id];
    return { ...d, busId: b?.id || '', busNumber: b?.busNumber || '—', routeId: b?.routeId || '', routeName: maps.route[b?.routeId]?.name || '—' };
  }), [drivers, busByDriver, maps]);

  const routeRows = useMemo(() => routes.map((r) => {
    const b = busByRoute[r.id];
    const studentCount = assignments.filter((a) => a.status === 'Active' && a.routeId === r.id).length;
    const stats = b ? busStats(b) : { occupied: 0, available: 0, percent: 0 };
    return {
      ...r, busId: b?.id || '', busNumber: b?.busNumber || '—', driverId: b?.driverId || '', driverName: maps.driver[b?.driverId]?.name || '—',
      studentCount, pickupCount: pickupPoints.filter((p) => p.routeId === r.id).length,
      capacity: b?.capacity || 0, occupied: stats.occupied, available: stats.available, percent: stats.percent,
    };
  }), [routes, busByRoute, assignments, pickupPoints, busStats, maps]);

  const pickupRows = useMemo(() => pickupPoints.map((p) => ({
    ...p, routeName: maps.route[p.routeId]?.name || '—',
    studentCount: assignments.filter((a) => a.status === 'Active' && a.pickupPointId === p.id).length,
  })), [pickupPoints, assignments, maps]);

  const studentRows = useMemo(() => students.map((s) => {
    const a = assignments.find((x) => x.studentId === s.id && x.status === 'Active');
    const bus = maps.bus[a?.busId];
    return {
      ...s, assignmentId: a?.id || '', routeId: a?.routeId || '', routeName: maps.route[a?.routeId]?.name || 'Not assigned',
      busId: a?.busId || '', busNumber: bus?.busNumber || '—', driverId: bus?.driverId || '', driverName: maps.driver[bus?.driverId]?.name || '—',
      pickupPointId: a?.pickupPointId || '', pickupName: maps.pickup[a?.pickupPointId]?.name || '—',
    };
  }), [students, assignments, maps]);

  const assignmentRows = useMemo(() => assignments.map((a) => ({
    ...a, studentName: maps.student[a.studentId]?.name || 'Unknown', studentCode: maps.student[a.studentId]?.studentCode || '',
    routeName: maps.route[a.routeId]?.name || '—', busNumber: maps.bus[a.busId]?.busNumber || '—',
    driverName: maps.driver[a.driverId]?.name || '—', pickupName: maps.pickup[a.pickupPointId]?.name || '—',
  })), [assignments, maps]);

  const attendanceRows = useMemo(() => attendance.map((r) => ({
    ...r, studentName: maps.student[r.studentId]?.name || 'Unknown', className: maps.student[r.studentId]?.className || '',
    routeName: maps.route[r.routeId]?.name || '—', busNumber: maps.bus[r.busId]?.busNumber || '—',
    driverName: maps.driver[r.driverId]?.name || '—', pickupName: maps.pickup[r.pickupPointId]?.name || '—',
  })), [attendance, maps]);

  /* ---------- CRUD with business rules ---------- */
  const fail = (error) => ({ ok: false, error });
  const OK = { ok: true };

  const saveBus = (v) => {
    const existing = buses.find((b) => b.id === v.id);
    const capacity = Number(v.capacity);
    if (buses.some((b) => b.id !== v.id && b.regNo.toLowerCase() === v.regNo.trim().toLowerCase())) return fail('A bus with this registration number already exists.');
    if (v.driverId && buses.some((b) => b.id !== v.id && b.driverId === v.driverId)) return fail('This driver is already assigned to another bus.');
    if (v.routeId && buses.some((b) => b.id !== v.id && b.routeId === v.routeId)) return fail('This route already has a bus assigned.');
    if (existing && capacity < (occupancy[existing.id] || 0)) return fail(`Capacity cannot be lower than the ${occupancy[existing.id]} students currently assigned.`);
    const item = {
      ...(existing || {}), ...v, regNo: v.regNo.trim(), capacity, year: Number(v.year),
      id: existing?.id || uid('B'), busNumber: existing?.busNumber || nextCode('BUS-', buses, 'busNumber', 3),
    };
    upsert(setBuses, item);
    return OK;
  };
  const deleteBus = (row) => {
    if ((occupancy[row.id] || 0) > 0) return fail(`Cannot delete ${row.busNumber}: ${occupancy[row.id]} students are actively assigned.`);
    setBuses((l) => l.filter((b) => b.id !== row.id));
    return OK;
  };

  const saveDriver = (v) => {
    const existing = drivers.find((d) => d.id === v.id);
    const { busId, ...rest } = v;
    const id = existing?.id || uid('D');
    if (busId) {
      const bus = buses.find((b) => b.id === busId);
      const other = bus?.driverId && bus.driverId !== id ? drivers.find((d) => d.id === bus.driverId) : null;
      if (other && other.status === 'Active' && v.status === 'Active') return fail(`${bus.busNumber} is already assigned to active driver ${other.name}.`);
    }
    const item = { ...(existing || {}), ...rest, id, experience: Number(v.experience), staffNo: existing?.staffNo || nextCode('STF-', drivers, 'staffNo', 3) };
    upsert(setDrivers, item);
    setBuses((l) => l.map((b) => (b.id === busId ? { ...b, driverId: id } : b.driverId === id ? { ...b, driverId: '' } : b)));
    return OK;
  };
  const deleteDriver = (row) => {
    setDrivers((l) => l.filter((d) => d.id !== row.id));
    setBuses((l) => l.map((b) => (b.driverId === row.id ? { ...b, driverId: '' } : b)));
    return OK;
  };

  const saveRoute = (v) => {
    const existing = routes.find((r) => r.id === v.id);
    const { busId, ...rest } = v;
    const id = existing?.id || uid('R');
    if (busId) {
      const bus = buses.find((b) => b.id === busId);
      if (bus?.routeId && bus.routeId !== id) return fail(`${bus.busNumber} already serves another route.`);
    }
    const item = { ...(existing || {}), ...rest, id, distance: Number(v.distance), duration: Number(v.duration), code: existing?.code || nextCode('RT-', routes, 'code', 3) };
    upsert(setRoutes, item);
    setBuses((l) => l.map((b) => (b.id === busId ? { ...b, routeId: id } : b.routeId === id ? { ...b, routeId: '' } : b)));
    return OK;
  };
  const deleteRoute = (row) => {
    if (row.studentCount > 0) return fail(`Cannot delete: ${row.studentCount} students use this route.`);
    if (row.pickupCount > 0) return fail(`Remove the ${row.pickupCount} pickup points of this route first.`);
    setRoutes((l) => l.filter((r) => r.id !== row.id));
    setBuses((l) => l.map((b) => (b.routeId === row.id ? { ...b, routeId: '' } : b)));
    return OK;
  };

  const savePickup = (v) => {
    const existing = pickupPoints.find((p) => p.id === v.id);
    const item = { ...(existing || {}), ...v, id: existing?.id || uid('P'), code: existing?.code || nextCode('PP-', pickupPoints, 'code', 3) };
    upsert(setPickupPoints, item);
    return OK;
  };
  const deletePickup = (row) => {
    if (row.studentCount > 0) return fail(`Cannot delete: ${row.studentCount} students are assigned to this pickup point.`);
    setPickupPoints((l) => l.filter((p) => p.id !== row.id));
    return OK;
  };

  const saveStudent = (v) => {
    const existing = students.find((s) => s.id === v.id);
    const item = {
      ...(existing || {}), ...v, id: existing?.id || uid('S'),
      studentCode: existing?.studentCode || nextCode(`STU-${YEAR}-`, students, 'studentCode', 4),
    };
    upsert(setStudents, item);
    return OK;
  };
  const deleteStudent = (row) => {
    setStudents((l) => l.filter((s) => s.id !== row.id));
    setAssignments((l) => l.filter((a) => a.studentId !== row.id));
    setAttendance((l) => l.filter((a) => a.studentId !== row.id));
    return OK;
  };

  /* ---------- assignment workflow ---------- */
  const checkAssignable = (busId, ignoreAssignmentId) => {
    const bus = maps.bus[busId];
    if (!bus) return 'Bus not found.';
    if (!ASSIGNABLE_BUS_STATUSES.includes(bus.status)) return `${bus.busNumber} is ${bus.status} and cannot take students.`;
    const occ = assignments.filter((a) => a.status === 'Active' && a.busId === busId && a.id !== ignoreAssignmentId).length;
    if (occ >= bus.capacity) return 'BUS FULL — NO AVAILABLE SEATS';
    return null;
  };

  const assignStudent = (v) => {
    if (assignments.some((a) => a.studentId === v.studentId && a.status === 'Active')) return fail('Duplicate assignment: this student already has an active bus assignment.');
    const capErr = checkAssignable(v.busId);
    if (capErr) return fail(capErr);
    const pp = maps.pickup[v.pickupPointId];
    if (!pp || pp.routeId !== v.routeId) return fail('The selected pickup point does not belong to the selected route.');
    const item = {
      id: uid('A'), code: nextCode(`ASSIGN-${YEAR}-`, assignments, 'code', 4), studentId: v.studentId, routeId: v.routeId,
      busId: v.busId, driverId: maps.bus[v.busId].driverId || '', pickupPointId: v.pickupPointId,
      assignmentDate: todayStr(), startDate: v.startDate || todayStr(), endDate: v.endDate || '', status: 'Active', remarks: v.remarks || '',
    };
    setAssignments((l) => [item, ...l]);
    return { ok: true, item };
  };
  const updateAssignment = (v) => {
    const existing = assignments.find((a) => a.id === v.id);
    if (v.status === 'Active' && existing.status !== 'Active') {
      if (assignments.some((a) => a.id !== v.id && a.studentId === existing.studentId && a.status === 'Active')) return fail('Duplicate assignment: this student already has another active assignment.');
      const capErr = checkAssignable(existing.busId, v.id);
      if (capErr) return fail(capErr);
    }
    setAssignments((l) => l.map((a) => (a.id === v.id ? { ...a, status: v.status, endDate: v.endDate, remarks: v.remarks, startDate: v.startDate } : a)));
    return OK;
  };
  const deleteAssignment = (row) => { setAssignments((l) => l.filter((a) => a.id !== row.id)); return OK; };

  /* ---------- attendance ---------- */
  const saveAttendance = (v) => {
    const st = studentRows.find((s) => s.id === v.studentId);
    if (!st || !st.assignmentId) return fail('This student has no active bus assignment.');
    if (attendance.some((r) => r.id !== v.id && r.studentId === v.studentId && r.date === v.date && r.tripType === v.tripType))
      return fail('Duplicate attendance: a record already exists for this student, date and trip type.');
    const existing = attendance.find((r) => r.id === v.id);
    const item = {
      ...(existing || {}), ...v, id: existing?.id || uid('T'), code: existing?.code || nextCode(`ATT-${YEAR}-`, attendance, 'code', 4),
      routeId: st.routeId, busId: st.busId, driverId: st.driverId, pickupPointId: st.pickupPointId,
    };
    upsert(setAttendance, item);
    return OK;
  };
  const deleteAttendance = (row) => { setAttendance((l) => l.filter((r) => r.id !== row.id)); return OK; };

  const resetData = () => {
    const m = getMock();
    setBuses(m.buses); setDrivers(m.drivers); setRoutes(m.routes); setStudents(m.students);
    setPickupPoints(m.pickupPoints); setAssignments(m.assignments); setAttendance(m.attendance);
    notify('Demo data restored.', 'info');
  };

  const value = {
    loading, auth, login, register, logout, prefs, t, setLang, toggleMode, snack, setSnack, notify,
    buses, drivers, routes, students, pickupPoints, assignments, attendance, maps, busStats,
    busRows, driverRows, routeRows, pickupRows, studentRows, assignmentRows, attendanceRows,
    saveBus, deleteBus, saveDriver, deleteDriver, saveRoute, deleteRoute, savePickup, deletePickup,
    saveStudent, deleteStudent, assignStudent, updateAssignment, deleteAssignment, checkAssignable,
    saveAttendance, deleteAttendance, resetData,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
