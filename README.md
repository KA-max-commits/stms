# 🚌 School Transport Management System

Frontend-only React application for **RP Karongi College** (Module ITLDF601 – Frontend Development).
Manages buses, drivers, routes, students, pickup points, bus assignments and transport attendance.
No backend or database: all data is simulated with **mock data, React state and browser localStorage**.

## Technologies
React 18 · Vite · JavaScript ES6+ · React Router 6 · Material UI 5 · MUI X DataGrid · Recharts · HTML5/CSS3 (keyframe animations) · localStorage

## Installation & Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
```
**Login:** `admin@school.rw` / `admin123` (pre-filled on the login page).

## Extra features
- **Animations:** count-up stat cards, staggered fade-in, hover lift, animated capacity bars, moving bus banner, animated route diagram, pulsing FULL-bus warning.
- **Translation:** English 🇬🇧, Français 🇫🇷, Kinyarwanda 🇷🇼 (switch in the top bar or login page; saved in localStorage). Dictionary: `src/i18n.js`.
- **Dark / light mode**, responsive drawer (mobile/tablet/desktop), print-friendly reports.

## Pages
| Route | Description |
|---|---|
| `/login` | Authentication screen (demo account) |
| `/` | Dashboard: 12 summary cards, visual bus capacity cards, 6 charts, schedule, alerts, recent activity |
| `/buses`, `/buses/:busId` | Bus CRUD (cards ⇄ table view); details with 6 tabs (Overview, Students, Route, Pickup Points, Attendance, Activity) |
| `/drivers` | Driver CRUD, license-expiry warnings, bus assignment |
| `/routes`, `/routes/:routeId` | Route CRUD; details with visual sequence *School → Stop 1 → … → School* |
| `/students`, `/students/:studentId` | Student CRUD; details with bus/route/pickup info and attendance statistics |
| `/assignments` | Assignment list + 5-step wizard (Stepper) |
| `/pickup-points` | Pickup point CRUD, view assigned students |
| `/attendance` | Attendance dashboard (today) + CRUD |
| `/attendance/history` | Filterable history with line chart |
| `/reports` | Bus / Route / Student / Attendance reports, filters, Print, Export CSV |

## Business rules
**Bus capacity** (always calculated dynamically, never hard-coded)
```
Occupied   = number of ACTIVE assignments for the bus
Available  = Capacity − Occupied
Occupancy% = Occupied ÷ Capacity × 100
```
States: Available (<85%), Nearly Full (≥85%), Full (100%), Out of Service (Maintenance/Out of Service).
Example: capacity 50, 45 assigned → Available 5, Occupancy 90%; the 51st assignment is rejected with **BUS FULL — NO AVAILABLE SEATS**.

**Assignment workflow:** Select student → route → bus → pickup point → verify capacity → confirm. Blocks: full bus, bus in maintenance/out of service, duplicate active assignment, pickup point not on the chosen route. On confirmation seats update instantly and the record is saved to localStorage.

**Attendance:** `Attendance % = Present records ÷ Expected (recorded) records × 100`. Duplicates (same student + date + trip type) are rejected. Student's route/bus/pickup/driver are taken from the active assignment.

**Data relationships:** `Student → Pickup Point → Route → Bus → Driver`. The single source of truth: assignments link student/pickup/route/bus; `bus.routeId` and `bus.driverId` link buses to routes and drivers. A bus cannot have two drivers/routes, and an active bus cannot have two active drivers. Deleting a bus/route/pickup point that is in use is blocked with an explanation.

## LocalStorage
Keys: `stms_buses, stms_drivers, stms_routes, stms_students, stms_pickups, stms_assignments, stms_attendance, stms_prefs, stms_auth`. Seeded once from `src/data/mockData.js`; changes persist after refresh. Use **Reset demo data** in the sidebar to restore.

## Mock data (deterministic seed)
12 buses (capacities 14–50) · 12 drivers · 8 routes · 106 students · 30 pickup points · 104 assignments (100 active) · 420 attendance records.
Includes: a **full bus** (BUS-003, 14/14), nearly-full buses (BUS-001 89%, BUS-002 88%), buses with free seats, a bus in maintenance and one out of service, 6 unassigned students for testing the wizard, an expiring and an expired driver license, and all four attendance statuses.

## Project structure
```
src/
  components/  Layout, DataTable, CrudPage, FormDialog, BusCard, RouteSequence, common
  context/     AppContext.jsx (state, localStorage, business rules)
  data/        mockData.js
  pages/       Dashboard, Buses, BusDetails, Drivers, Routes, RouteDetails, Students,
               StudentDetails, Assignments, PickupPoints, Attendance, AttendanceHistory, Reports, Login
  utils/       helpers.js, aggregate.js
  i18n.js  theme.js  index.css
```

## Screenshots
Run the app and capture each page into a `screenshots/` folder for submission (Login, Dashboard, Buses cards, Bus details, Assignment wizard, Attendance, Reports).

## Future improvements
Real map integration, GPS live tracking, SMS/email parent notifications, role-based access, backend API and database, QR-code boarding check-in, PDF report export.
