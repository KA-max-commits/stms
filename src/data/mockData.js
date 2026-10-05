import { fmtDate, pad, YEAR } from '../utils/helpers';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const maleNames = ['Jean Claude', 'Eric', 'Patrick', 'Emmanuel', 'Olivier', 'Didier', 'Innocent', 'Samuel', 'Claude', 'Aimable', 'Fabrice', 'David', 'Pacifique', 'Jean Bosco', 'Alexis', 'Théogène'];
const femaleNames = ['Aline', 'Diane', 'Grace', 'Chantal', 'Solange', 'Sandrine', 'Josiane', 'Marie Rose', 'Clarisse', 'Belyse', 'Phionah', 'Yvonne', 'Vestine', 'Jeanette', 'Divine', 'Laetitia'];
const surnames = ['Uwimana', 'Habimana', 'Mukamana', 'Niyonzima', 'Nsengiyumva', 'Ishimwe', 'Mugisha', 'Iradukunda', 'Uwase', 'Tuyishime', 'Nkurunziza', 'Bizimana', 'Munyaneza', 'Hakizimana', 'Umutoni', 'Kamanzi', 'Mutesi', 'Ndayisaba', 'Rukundo', 'Byiringiro'];

const routeDefs = [
  ['Kibuye Central', 18, 45, '06:00', '16:30', ['Kibuye Bus Park', 'Hospital Junction', 'Lake Kivu Beach', 'Catholic Church']],
  ['Rubengera Line', 24, 55, '05:50', '16:35', ['Rubengera Market', 'Kabuga Cell', 'Nyarusange Center', 'Bwishyura Roundabout']],
  ['Bwishyura Loop', 12, 35, '06:10', '16:30', ['Bwishyura Center', 'Kiniha Junction', 'Gasura Stop', 'Gitwa Hill']],
  ['Gitesi Road', 28, 60, '05:45', '16:40', ['Gitesi Market', 'Kivumu Stop', 'Nyabikenke Center', 'Mwendo Bridge']],
  ['Mubuga Route', 32, 65, '05:40', '16:45', ['Mubuga Center', 'Gasenyi Stop', 'Rukaragata Junction', 'Twumba Primary']],
  ['Rugabano Route', 36, 70, '05:35', '16:50', ['Rugabano Center', 'Kigeyo Market', 'Gakuta Stop', 'Ruganda Junction']],
  ['Mukura Express', 22, 50, '06:00', '16:30', ['Mukura Center', 'Nyagatare Stop', 'Kabaya Junction']],
  ['Murundi Route', 30, 58, '05:55', '16:40', ['Murundi Market', 'Rutsiro Border Stop', 'Gitabura Center']],
];

const busCaps = [28, 25, 14, 40, 15, 45, 50, 28, 30, 14, 45, 30];
const busTypes = ['School Bus', 'School Bus', 'Van', 'Coaster', 'Minibus', 'School Bus', 'Coaster', 'Minibus', 'School Bus', 'Van', 'Coaster', 'Minibus'];
const busModels = ['Toyota Coaster', 'Isuzu NPR', 'Toyota Hiace', 'Hyundai County', 'Nissan Civilian', 'Yutong ZK6', 'Mitsubishi Rosa', 'Toyota Coaster', 'Scania K250', 'Toyota Hiace', 'Hyundai Aero', 'Isuzu Journey'];
const busStatuses = ['In Service', 'In Service', 'In Service', 'Assigned', 'In Service', 'Assigned', 'In Service', 'In Service', 'Available', 'Maintenance', 'Out of Service', 'Available'];
const busLocations = ['On Route', 'On Route', 'Kibuye Bus Park', 'School Garage', 'On Route', 'School Garage', 'On Route', 'Rutsiro Border', 'School Garage', 'City Workshop', 'City Workshop', 'School Garage'];
const occupiedTargets = [25, 22, 14, 10, 12, 6, 7, 4];
const classes = [['Senior 4 A', 'S4'], ['Senior 4 B', 'S4'], ['Senior 5 MCB', 'S5'], ['Senior 5 PCB', 'S5'], ['Senior 6 MCB', 'S6'], ['Level 3 SOD', 'L3'], ['Level 4 SOD', 'L4'], ['Level 5 SWD', 'L5']];
const plates = ['RAE 412 B', 'RAD 218 K', 'RAF 905 C', 'RAE 771 M', 'RAD 330 A', 'RAG 156 T', 'RAE 088 D', 'RAF 642 H', 'RAG 274 P', 'RAD 501 N', 'RAE 933 L', 'RAF 117 S'];

export function generateMock() {
  const rnd = mulberry32(2026);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const now = new Date();
  const daysAgo = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return fmtDate(d); };
  const addMin = (hhmm, m) => { const [h, mi] = hhmm.split(':').map(Number); const t = h * 60 + mi + m; return `${pad(Math.floor(t / 60) % 24, 2)}:${pad(t % 60, 2)}`; };

  const driverStatus = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'On Leave', 'Inactive', 'Suspended'];
  const drivers = Array.from({ length: 12 }, (_, i) => {
    const male = rnd() > 0.2;
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + (i === 2 ? 25 : i === 7 ? -12 : 120 + Math.floor(rnd() * 700)));
    return {
      id: `D${i + 1}`, staffNo: `STF-${pad(i + 1, 3)}`,
      name: `${pick(male ? maleNames : femaleNames)} ${pick(surnames)}`,
      gender: male ? 'Male' : 'Female',
      phone: `+25078${pad(Math.floor(rnd() * 9999999), 7)}`,
      email: `driver${i + 1}@rpkarongi.ac.rw`,
      licenseNo: `DL-${YEAR - 8}-${pad(1000 + i * 37, 5)}`,
      licenseExpiry: fmtDate(expiry),
      experience: 3 + Math.floor(rnd() * 15),
      status: driverStatus[i],
    };
  });

  const routes = routeDefs.map((r, i) => ({
    id: `R${i + 1}`, code: `RT-${pad(i + 1, 3)}`, name: r[0],
    startPoint: r[5][0], destination: 'RP Karongi College',
    distance: r[1], duration: r[2], departureTime: r[3], returnTime: r[4],
    status: 'Active', description: `Daily school transport service covering ${r[5].length} pickup points along the ${r[0]} corridor.`,
  }));

  // driverId & routeId on the bus are the single source of truth for those links
  const buses = busCaps.map((cap, i) => ({
    id: `B${i + 1}`, busNumber: `BUS-${pad(i + 1, 3)}`, regNo: plates[i], type: busTypes[i],
    capacity: cap, routeId: i < 8 ? `R${i + 1}` : '', driverId: i < 9 ? `D${i + 1}` : '',
    model: busModels[i], year: 2015 + (i % 10), location: busLocations[i], status: busStatuses[i],
    description: `${busTypes[i]} with ${cap} passenger seats.`,
  }));

  const pickupPoints = [];
  routeDefs.forEach((r, ri) => {
    r[5].forEach((name, k) => {
      const n = pickupPoints.length + 1;
      pickupPoints.push({
        id: `P${n}`, code: `PP-${pad(n, 3)}`, name, location: `${name}, Karongi District`,
        routeId: `R${ri + 1}`, pickupTime: addMin(r[3], k * 8), returnTime: addMin(r[4], 20 + (r[5].length - k) * 7),
        status: 'Active', description: `Stop ${k + 1} on ${r[0]}.`,
      });
    });
  });

  const students = [];
  const assignments = [];
  let asgCount = 0;
  const total = 106;
  const busPlan = [];
  occupiedTargets.forEach((c, bi) => { for (let k = 0; k < c; k++) busPlan.push(bi); });
  for (let i = 0; i < total; i++) {
    const male = rnd() > 0.48;
    const cls = classes[i % classes.length];
    const birthYear = 2007 + (i % 5);
    const surname = pick(surnames);
    const n = i + 1;
    students.push({
      id: `S${n}`, studentCode: `STU-${YEAR}-${pad(n, 4)}`, regNo: `RPK/${YEAR}/${pad(n, 4)}`,
      name: `${pick(male ? maleNames : femaleNames)} ${surname}`, gender: male ? 'Male' : 'Female',
      dob: `${birthYear}-${pad(1 + Math.floor(rnd() * 12), 2)}-${pad(1 + Math.floor(rnd() * 28), 2)}`,
      className: cls[0], level: cls[1],
      guardian: `${pick(rnd() > 0.5 ? maleNames : femaleNames)} ${surname}`,
      parentPhone: `+25078${pad(Math.floor(rnd() * 9999999), 7)}`,
      address: `${pick(['Kibuye', 'Rubengera', 'Bwishyura', 'Gitesi', 'Mubuga', 'Rugabano', 'Mukura', 'Murundi'])}, Karongi`,
      status: 'Active',
    });
    if (i < 100) {
      const bi = busPlan[i];
      const pts = pickupPoints.filter((p) => p.routeId === `R${bi + 1}`);
      const pp = pts[i % pts.length];
      asgCount++;
      const ad = daysAgo(2 + Math.floor(rnd() * 60));
      assignments.push({
        id: `A${asgCount}`, code: `ASSIGN-${YEAR}-${pad(asgCount, 4)}`, studentId: `S${n}`,
        routeId: `R${bi + 1}`, busId: `B${bi + 1}`, driverId: `D${bi + 1}`, pickupPointId: pp.id,
        assignmentDate: ad, startDate: ad, endDate: '', status: 'Active', remarks: 'Regular daily transport',
      });
    }
  }
  [['Completed', 0], ['Cancelled', 1], ['Cancelled', 2], ['Completed', 3]].forEach(([st, k]) => {
    asgCount++;
    const bi = k % 3;
    const pp = pickupPoints.find((p) => p.routeId === `R${bi + 1}`);
    assignments.push({
      id: `A${asgCount}`, code: `ASSIGN-${YEAR}-${pad(asgCount, 4)}`, studentId: `S${101 + k}`,
      routeId: `R${bi + 1}`, busId: `B${bi + 1}`, driverId: `D${bi + 1}`, pickupPointId: pp.id,
      assignmentDate: daysAgo(150), startDate: daysAgo(150), endDate: daysAgo(40), status: st,
      remarks: st === 'Completed' ? 'Term ended' : 'Parent request',
    });
  });

  const attendance = [];
  const active = assignments.filter((a) => a.status === 'Active');
  const seen = new Set();
  const statusPick = () => { const r = rnd(); return r < 0.8 ? 'Present' : r < 0.88 ? 'Absent' : r < 0.95 ? 'Late' : 'Excused'; };
  const addRec = (a, date, trip) => {
    const key = `${a.studentId}|${date}|${trip}`;
    if (seen.has(key)) return false;
    seen.add(key);
    const pp = pickupPoints.find((p) => p.id === a.pickupPointId);
    const status = statusPick();
    const morning = trip === 'Morning Pickup';
    const base = morning ? pp.pickupTime : pp.returnTime;
    const late = status === 'Late' ? 6 + Math.floor(rnd() * 10) : Math.floor(rnd() * 3);
    const n = attendance.length + 1;
    const none = status === 'Absent' || status === 'Excused';
    attendance.push({
      id: `T${n}`, code: `ATT-${YEAR}-${pad(n, 4)}`, date, studentId: a.studentId, routeId: a.routeId, busId: a.busId,
      pickupPointId: a.pickupPointId, driverId: a.driverId, tripType: trip,
      checkIn: none ? '' : addMin(base, late),
      checkOut: none ? '' : morning ? addMin('07:15', late) : addMin(base, 25),
      status, remarks: status === 'Late' ? 'Arrived after departure time' : status === 'Excused' ? 'Approved by guardian' : '',
    });
    return true;
  };
  const todayDate = daysAgo(0);
  active.forEach((a) => addRec(a, todayDate, 'Morning Pickup'));
  active.slice(0, 60).forEach((a) => addRec(a, todayDate, 'Afternoon Drop-off'));
  for (let d = 1; d <= 13; d++) {
    let c = 0;
    while (c < 20) {
      if (addRec(pick(active), daysAgo(d), rnd() > 0.5 ? 'Morning Pickup' : 'Afternoon Drop-off')) c++;
    }
  }
  return { buses, drivers, routes, students, pickupPoints, assignments, attendance };
}

let cache;
export const getMock = () => cache || (cache = generateMock());
