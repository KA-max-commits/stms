export const pad = (n, len = 3) => String(n).padStart(len, '0');
const p2 = (n) => String(n).padStart(2, '0');
export const fmtDate = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const todayStr = () => fmtDate(new Date());
export const YEAR = new Date().getFullYear();
export const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
export const uid = (prefix = 'X') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function nextCode(prefix, items, field, len = 3) {
  const max = items.reduce((m, it) => {
    const v = String(it[field] || '');
    if (v.startsWith(prefix)) {
      const n = parseInt(v.slice(prefix.length), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }
    return m;
  }, 0);
  return prefix + pad(max + 1, len);
}

export const NEAR_FULL = 85;
export const ASSIGNABLE_BUS_STATUSES = ['Available', 'Assigned', 'In Service'];

export function capacityState(bus, occupied) {
  if (['Out of Service', 'Maintenance'].includes(bus.status)) return 'out';
  if (occupied >= bus.capacity) return 'full';
  if (pct(occupied, bus.capacity) >= NEAR_FULL) return 'near';
  return 'available';
}

export const STATE_META = {
  available: { color: 'success', label: 'Available Capacity' },
  near: { color: 'warning', label: 'Nearly Full' },
  full: { color: 'error', label: 'Full' },
  out: { color: 'inherit', label: 'Out of Service' },
};

export const STATUS_COLORS = {
  Active: 'success', Available: 'success', Present: 'success', Completed: 'info',
  'In Service': 'info', Assigned: 'primary', Late: 'warning', Excused: 'info',
  'On Leave': 'warning', Maintenance: 'warning', Suspended: 'error', Absent: 'error',
  Cancelled: 'default', Inactive: 'default', 'Out of Service': 'error',
};

export function exportCSV(filename, columns, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = columns.map((c) => esc(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => esc(r[c.key])).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + head + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
export const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - new Date(todayStr())) / 86400000);
export const uniq = (arr) => [...new Set(arr)];
