import { pct } from './helpers';

/** Group attendance rows by keyFn and count statuses. Attendance % = Present / recorded (expected) records × 100 */
export function aggregateAttendance(rows, keyFn, sortFn) {
  const map = {};
  rows.forEach((r) => {
    const k = keyFn(r);
    if (!map[k]) map[k] = { label: k, Present: 0, Absent: 0, Late: 0, Excused: 0, total: 0 };
    map[k][r.status] += 1;
    map[k].total += 1;
  });
  const out = Object.values(map).map((g) => ({ ...g, percent: pct(g.Present, g.total) }));
  return out.sort(sortFn || ((a, b) => String(a.label).localeCompare(String(b.label))));
}

export const countBy = (arr, keyFn) => {
  const m = {};
  arr.forEach((x) => { const k = keyFn(x); m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};
