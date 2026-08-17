import type {
  Institution,
  Faculty,
  Department,
  User,
  UserRole,
  AcademicSession,
  Semester,
  CourseUnit,
  CourseEnrollment,
  ClassInstance,
  AttendanceRecord,
  AttendanceThresholdSummary,
  LecturerAttendanceSummary,
  CorrectionRecord,
  AdminActivityLogEntry,
  AttendanceMode,
  ScheduleApprovalStatus,
  ScheduledClassSubmission,
  NotificationCategory,
  NotificationItem,
} from '../types';

/* ════════════════════════════════════════════════════════════════
   Deterministic RNG + date helpers
   All "random" generation below is seeded, so the dataset is stable
   across reloads within a single day — a student's displayed % will
   always match attended/total from their own listed sessions, which
   matters for a live pitch where a sharp investor might do the
   arithmetic in their head. Dates are computed relative to the real
   "now" at module load, so there is always a live, in-window class
   to check into and a recent history behind it, regardless of what
   day the prototype is actually opened.
   ════════════════════════════════════════════════════════════════ */

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260812);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function choice<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

const NOW = new Date();

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function atTime(d: Date, h: number, m: number): Date {
  const r = new Date(d);
  r.setHours(h, m, 0, 0);
  return r;
}
/** Local-calendar-safe YYYY-MM-DD, deliberately not toISOString() (which is UTC and can shift near midnight). */
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function isoWeekday(d: Date): number {
  const day = d.getDay(); // 0=Sun..6=Sat
  return day === 0 ? 7 : day; // 1=Mon..7=Sun, matching the PRD's own convention
}
function todayStr(): string {
  return isoDate(NOW);
}

/* ════════════════════════════════════════════════════════════════
   Institution / Faculties / Departments
   ════════════════════════════════════════════════════════════════ */

export const institution: Institution = {
  id: 'inst-gou',
  name: 'Godfrey Okoye University',
  shortName: 'GOU',
  country: 'Nigeria',
  timezone: 'Africa/Lagos',
  defaultThresholdPct: 75,
  isPilotPartner: true,
};

export const faculties: Faculty[] = [
  { id: 'fac-nas', institutionId: institution.id, name: 'Faculty of Natural & Applied Sciences', shortName: 'FNAS', deanId: null },
  { id: 'fac-eng', institutionId: institution.id, name: 'Faculty of Engineering', shortName: 'FoE', deanId: null },
  { id: 'fac-mss', institutionId: institution.id, name: 'Faculty of Management & Social Sciences', shortName: 'FMSS', deanId: null },
];

export const departments: Department[] = [
  { id: 'dept-cs', institutionId: institution.id, facultyId: 'fac-nas', name: 'Computer Science', shortName: 'CSC', hodId: null },
  { id: 'dept-bch', institutionId: institution.id, facultyId: 'fac-nas', name: 'Biochemistry', shortName: 'BCH', hodId: null },
  { id: 'dept-eee', institutionId: institution.id, facultyId: 'fac-eng', name: 'Electrical & Electronic Engineering', shortName: 'EEE', hodId: null },
  { id: 'dept-mee', institutionId: institution.id, facultyId: 'fac-eng', name: 'Mechanical Engineering', shortName: 'MEE', hodId: null },
  { id: 'dept-acc', institutionId: institution.id, facultyId: 'fac-mss', name: 'Accounting', shortName: 'ACC', hodId: null },
  { id: 'dept-mac', institutionId: institution.id, facultyId: 'fac-mss', name: 'Mass Communication', shortName: 'MAC', hodId: null },
];

/* ════════════════════════════════════════════════════════════════
   Users
   ════════════════════════════════════════════════════════════════ */

const AVATAR_COLORS = ['#213264', '#8C6C1D', '#0F766E', '#7C3AED', '#B45309', '#0369A1', '#BE123C', '#4D7C0F'];
let avatarIdx = 0;
function nextAvatarColor(): string {
  return AVATAR_COLORS[avatarIdx++ % AVATAR_COLORS.length];
}
function initialsOf(name: string): string {
  const words = name.split(' ').filter((w) => !/^(Dr\.|Prof\.|Mr\.|Mrs\.|Miss|Rev\.)$/.test(w));
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
const DEVICE_MODELS = ['Infinix Hot 40', 'Infinix Note 30', 'Tecno Spark 20', 'Tecno Camon 30', 'Itel A70', 'Samsung Galaxy A15', 'Xiaomi Redmi 13C'];

export const users: User[] = [];
let userSeq = 0;

function makeUser(partial: {
  fullName: string;
  institutionalId: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
  facultyId: string | null;
  level: number | null;
  directSuperiorId: string | null;
  isDemoDefault?: boolean;
  deviceModel?: string | null;
}): User {
  userSeq++;
  const user: User = {
    id: `user-${String(userSeq).padStart(3, '0')}`,
    institutionId: institution.id,
    departmentId: partial.departmentId,
    facultyId: partial.facultyId,
    fullName: partial.fullName,
    institutionalId: partial.institutionalId,
    email: partial.email,
    phoneMasked: `080••••${String(randInt(1000, 9999)).slice(-4)}`,
    role: partial.role,
    level: partial.level,
    directSuperiorId: partial.directSuperiorId,
    isActive: true,
    faceIdEnrolled: partial.role === 'student',
    deviceModel: partial.deviceModel ?? (partial.role === 'student' || partial.role === 'lecturer' ? choice(DEVICE_MODELS) : null),
    isDemoDefault: partial.isDemoDefault ?? false,
    avatarColor: nextAvatarColor(),
    initials: initialsOf(partial.fullName),
  };
  users.push(user);
  return user;
}

// ── Vice-Chancellor ──
const vc = makeUser({
  fullName: 'Prof. Emmanuel Nnaji',
  institutionalId: 'GOU/STF/0001',
  email: 'e.nnaji@gou.edu.ng',
  role: 'vice_chancellor',
  departmentId: null,
  facultyId: null,
  level: null,
  directSuperiorId: null,
  isDemoDefault: true,
});

// ── Deans ──
const deanNAS = makeUser({ fullName: 'Prof. Chinyere Uzo', institutionalId: 'GOU/STF/0002', email: 'c.uzo@gou.edu.ng', role: 'dean', departmentId: null, facultyId: 'fac-nas', level: null, directSuperiorId: vc.id, isDemoDefault: true });
const deanEng = makeUser({ fullName: 'Prof. Anthony Igwe', institutionalId: 'GOU/STF/0003', email: 'a.igwe@gou.edu.ng', role: 'dean', departmentId: null, facultyId: 'fac-eng', level: null, directSuperiorId: vc.id });
const deanMSS = makeUser({ fullName: 'Prof. Blessing Mbah', institutionalId: 'GOU/STF/0004', email: 'b.mbah@gou.edu.ng', role: 'dean', departmentId: null, facultyId: 'fac-mss', level: null, directSuperiorId: vc.id });
faculties.find((f) => f.id === 'fac-nas')!.deanId = deanNAS.id;
faculties.find((f) => f.id === 'fac-eng')!.deanId = deanEng.id;
faculties.find((f) => f.id === 'fac-mss')!.deanId = deanMSS.id;

// ── HODs ──
const hodCS = makeUser({ fullName: 'Dr. Ngozi Eze', institutionalId: 'GOU/STF/0005', email: 'n.eze@gou.edu.ng', role: 'hod', departmentId: 'dept-cs', facultyId: 'fac-nas', level: null, directSuperiorId: deanNAS.id, isDemoDefault: true });
const hodBCH = makeUser({ fullName: 'Dr. Patrick Aneke', institutionalId: 'GOU/STF/0006', email: 'p.aneke@gou.edu.ng', role: 'hod', departmentId: 'dept-bch', facultyId: 'fac-nas', level: null, directSuperiorId: deanNAS.id });
const hodEEE = makeUser({ fullName: 'Dr. Chukwudi Okoro', institutionalId: 'GOU/STF/0007', email: 'c.okoro@gou.edu.ng', role: 'hod', departmentId: 'dept-eee', facultyId: 'fac-eng', level: null, directSuperiorId: deanEng.id });
const hodMEE = makeUser({ fullName: 'Dr. Grace Nwosu', institutionalId: 'GOU/STF/0008', email: 'g.nwosu@gou.edu.ng', role: 'hod', departmentId: 'dept-mee', facultyId: 'fac-eng', level: null, directSuperiorId: deanEng.id });
const hodACC = makeUser({ fullName: 'Dr. Felix Ogbonna', institutionalId: 'GOU/STF/0009', email: 'f.ogbonna@gou.edu.ng', role: 'hod', departmentId: 'dept-acc', facultyId: 'fac-mss', level: null, directSuperiorId: deanMSS.id });
const hodMAC = makeUser({ fullName: 'Dr. Uchenna Ezeh', institutionalId: 'GOU/STF/0010', email: 'u.ezeh@gou.edu.ng', role: 'hod', departmentId: 'dept-mac', facultyId: 'fac-mss', level: null, directSuperiorId: deanMSS.id });
departments.find((d) => d.id === 'dept-cs')!.hodId = hodCS.id;
departments.find((d) => d.id === 'dept-bch')!.hodId = hodBCH.id;
departments.find((d) => d.id === 'dept-eee')!.hodId = hodEEE.id;
departments.find((d) => d.id === 'dept-mee')!.hodId = hodMEE.id;
departments.find((d) => d.id === 'dept-acc')!.hodId = hodACC.id;
departments.find((d) => d.id === 'dept-mac')!.hodId = hodMAC.id;

// ── Administrators (registry_admin + system_admin merged per the prototype plan) ──
const admin1 = makeUser({ fullName: 'Mrs. Chidinma Okoye', institutionalId: 'GOU/STF/0030', email: 'c.okoye.admin@gou.edu.ng', role: 'system_admin', departmentId: null, facultyId: null, level: null, directSuperiorId: null, isDemoDefault: true });
const admin2 = makeUser({ fullName: 'Mr. Tochukwu Anyanwu', institutionalId: 'GOU/STF/0031', email: 't.anyanwu.admin@gou.edu.ng', role: 'system_admin', departmentId: null, facultyId: null, level: null, directSuperiorId: null });
void admin2; // registered in the roster for realism; no dedicated detail screen yet to link to

// ── Lecturers (named individually — small enough roster to give each a real identity) ──
function makeLecturer(fullName: string, staffNo: string, email: string, departmentId: string, facultyId: string, hodId: string, isDemoDefault = false): User {
  return makeUser({ fullName, institutionalId: staffNo, email, role: 'lecturer', departmentId, facultyId, level: null, directSuperiorId: hodId, isDemoDefault });
}
const lecObinna = makeLecturer('Mr. Obinna Nwachukwu', 'GOU/STF/0011', 'o.nwachukwu@gou.edu.ng', 'dept-cs', 'fac-nas', hodCS.id, true);
const lecChiamaka = makeLecturer('Mrs. Chiamaka Okafor', 'GOU/STF/0012', 'c.okafor@gou.edu.ng', 'dept-cs', 'fac-nas', hodCS.id);
const lecIfeanyi = makeLecturer('Dr. Ifeanyi Madu', 'GOU/STF/0013', 'i.madu@gou.edu.ng', 'dept-cs', 'fac-nas', hodCS.id);
const lecAdaeze = makeLecturer('Dr. Adaeze Ibe', 'GOU/STF/0014', 'a.ibe@gou.edu.ng', 'dept-bch', 'fac-nas', hodBCH.id);
const lecKelechi = makeLecturer('Mr. Kelechi Anyanwu', 'GOU/STF/0015', 'k.anyanwu@gou.edu.ng', 'dept-bch', 'fac-nas', hodBCH.id);
const lecChibuzor = makeLecturer('Dr. Chibuzor Uzo', 'GOU/STF/0016', 'c.uzo.lec@gou.edu.ng', 'dept-eee', 'fac-eng', hodEEE.id);
const lecNkechi = makeLecturer('Mrs. Nkechi Okonkwo', 'GOU/STF/0017', 'n.okonkwo@gou.edu.ng', 'dept-eee', 'fac-eng', hodEEE.id);
const lecEbuka = makeLecturer('Mr. Ebuka Igwe', 'GOU/STF/0018', 'e.igwe@gou.edu.ng', 'dept-mee', 'fac-eng', hodMEE.id);
const lecChinelo = makeLecturer('Dr. Chinelo Okafor', 'GOU/STF/0019', 'ch.okafor@gou.edu.ng', 'dept-mee', 'fac-eng', hodMEE.id);
const lecIfeoma = makeLecturer('Mrs. Ifeoma Okonkwo', 'GOU/STF/0020', 'if.okonkwo@gou.edu.ng', 'dept-acc', 'fac-mss', hodACC.id);
const lecKenechukwu = makeLecturer('Mr. Kenechukwu Mbah', 'GOU/STF/0021', 'k.mbah@gou.edu.ng', 'dept-acc', 'fac-mss', hodACC.id);
const lecNneka = makeLecturer('Dr. Nneka Anyanwu', 'GOU/STF/0022', 'nn.anyanwu@gou.edu.ng', 'dept-acc', 'fac-mss', hodACC.id);
const lecChike = makeLecturer('Mr. Chike Okoro', 'GOU/STF/0023', 'ch.okoro@gou.edu.ng', 'dept-mac', 'fac-mss', hodMAC.id);
const lecOnyinye = makeLecturer('Mrs. Onyinye Nwachukwu', 'GOU/STF/0024', 'o.nwachukwu2@gou.edu.ng', 'dept-mac', 'fac-mss', hodMAC.id);

/* ════════════════════════════════════════════════════════════════
   Academic session / semester
   ════════════════════════════════════════════════════════════════ */

const sessionStartYear = NOW.getMonth() >= 7 ? NOW.getFullYear() : NOW.getFullYear() - 1;
export const academicSession: AcademicSession = {
  id: 'session-current',
  institutionId: institution.id,
  name: `${sessionStartYear}/${sessionStartYear + 1}`,
  startDate: isoDate(new Date(sessionStartYear, 8, 1)),
  endDate: isoDate(new Date(sessionStartYear + 1, 6, 31)),
  isCurrent: true,
};
export const currentSemester: Semester = {
  id: 'sem-current',
  academicSessionId: academicSession.id,
  name: 'First Semester',
  startDate: isoDate(addDays(NOW, -70)),
  endDate: isoDate(addDays(NOW, 40)),
  isCurrent: true,
};

/* ════════════════════════════════════════════════════════════════
   Course units
   ════════════════════════════════════════════════════════════════ */

interface CourseSpec {
  code: string;
  title: string;
  departmentId: string;
  level: number;
  creditUnits: number;
  leadId: string;
  coId?: string;
  mode?: AttendanceMode;
  weekdays: number[]; // ISO: 1=Mon..7=Sun
  timeSlot: [number, number]; // [startHour, endHour)
}

const courseSpecs: CourseSpec[] = [
  { code: 'CSC101', title: 'Introduction to Computing', departmentId: 'dept-cs', level: 100, creditUnits: 3, leadId: lecIfeanyi.id, weekdays: [2, 4], timeSlot: [8, 10] },
  { code: 'CSC201', title: 'Data Structures and Algorithms', departmentId: 'dept-cs', level: 200, creditUnits: 3, leadId: lecObinna.id, weekdays: [1, 3], timeSlot: [10, 12] },
  { code: 'CSC301', title: 'Database Management Systems', departmentId: 'dept-cs', level: 300, creditUnits: 3, leadId: lecObinna.id, coId: lecChiamaka.id, weekdays: [1, 3], timeSlot: [8, 10] },
  { code: 'CSC305', title: 'Operating Systems', departmentId: 'dept-cs', level: 300, creditUnits: 3, leadId: lecIfeanyi.id, weekdays: [2, 4], timeSlot: [12, 14] },
  { code: 'CSC401', title: 'Compiler Construction', departmentId: 'dept-cs', level: 400, creditUnits: 3, leadId: lecChiamaka.id, weekdays: [3, 5], timeSlot: [10, 12] },
  { code: 'BCH201', title: 'General Biochemistry I', departmentId: 'dept-bch', level: 200, creditUnits: 3, leadId: lecAdaeze.id, weekdays: [2, 4], timeSlot: [8, 10] },
  { code: 'BCH301', title: 'Enzymology', departmentId: 'dept-bch', level: 300, creditUnits: 2, leadId: lecKelechi.id, weekdays: [1], timeSlot: [14, 17], mode: 'duration' },
  { code: 'EEE201', title: 'Circuit Theory', departmentId: 'dept-eee', level: 200, creditUnits: 3, leadId: lecChibuzor.id, weekdays: [1, 4], timeSlot: [10, 12] },
  { code: 'EEE301', title: 'Electromagnetic Fields', departmentId: 'dept-eee', level: 300, creditUnits: 3, leadId: lecNkechi.id, weekdays: [2, 5], timeSlot: [8, 10] },
  { code: 'MEE201', title: 'Engineering Thermodynamics', departmentId: 'dept-mee', level: 200, creditUnits: 3, leadId: lecEbuka.id, weekdays: [3, 5], timeSlot: [12, 14] },
  { code: 'MEE301', title: 'Fluid Mechanics', departmentId: 'dept-mee', level: 300, creditUnits: 3, leadId: lecChinelo.id, weekdays: [2], timeSlot: [14, 17], mode: 'duration' },
  { code: 'ACC201', title: 'Financial Accounting II', departmentId: 'dept-acc', level: 200, creditUnits: 3, leadId: lecIfeoma.id, coId: lecKenechukwu.id, weekdays: [1, 3], timeSlot: [8, 10] },
  { code: 'ACC301', title: 'Cost Accounting', departmentId: 'dept-acc', level: 300, creditUnits: 2, leadId: lecNneka.id, weekdays: [2, 4], timeSlot: [10, 12] },
  { code: 'ACC401', title: 'Advanced Financial Reporting', departmentId: 'dept-acc', level: 400, creditUnits: 3, leadId: lecIfeoma.id, weekdays: [4], timeSlot: [12, 14] },
  { code: 'MAC201', title: 'Introduction to Broadcasting', departmentId: 'dept-mac', level: 200, creditUnits: 2, leadId: lecChike.id, weekdays: [3], timeSlot: [10, 12] },
  { code: 'MAC301', title: 'Media Law and Ethics', departmentId: 'dept-mac', level: 300, creditUnits: 3, leadId: lecOnyinye.id, weekdays: [1, 4], timeSlot: [14, 16] },
];

export const courseUnits: CourseUnit[] = courseSpecs.map((spec) => ({
  id: `course-${spec.code.toLowerCase()}`,
  departmentId: spec.departmentId,
  semesterId: currentSemester.id,
  code: spec.code,
  title: spec.title,
  creditUnits: spec.creditUnits,
  level: spec.level,
  lecturerIds: spec.coId ? [spec.leadId, spec.coId] : [spec.leadId],
}));

/* ════════════════════════════════════════════════════════════════
   Students (bulk-generated, unevenly distributed — heaviest in the
   "hero" Computer Science / 300L cohort so the flagship demo screens
   never look sparse)
   ════════════════════════════════════════════════════════════════ */

const FEMALE_FIRST = ['Ngozi', 'Chiamaka', 'Adaeze', 'Ifeoma', 'Chinyere', 'Amarachi', 'Uzoamaka', 'Nkechi', 'Chidinma', 'Onyinye', 'Ebele', 'Chinelo', 'Adaobi', 'Amaka', 'Nneka', 'Oluchi', 'Chiugo', 'Somtochukwu'];
const MALE_FIRST = ['Chukwuemeka', 'Obinna', 'Ugochukwu', 'Emeka', 'Chidi', 'Kelechi', 'Ikenna', 'Chibuzor', 'Ifeanyi', 'Nnamdi', 'Uche', 'Tochukwu', 'Chinedu', 'Ebuka', 'Kenechukwu', 'Chike', 'Somadina', 'Arinze'];
const LAST_NAMES = ['Eze', 'Okafor', 'Nwosu', 'Okonkwo', 'Obi', 'Nwachukwu', 'Okoye', 'Anyanwu', 'Ibe', 'Uzo', 'Madu', 'Chukwu', 'Onyekwere', 'Nnaji', 'Aneke', 'Mbah', 'Ogbonna', 'Igwe', 'Ezeh', 'Okoro'];

const usedFullNames = new Set<string>(users.map((u) => u.fullName));
function randomFullName(): string {
  let name = '';
  let attempts = 0;
  do {
    const isFemale = rand() < 0.5;
    const first = choice(isFemale ? FEMALE_FIRST : MALE_FIRST);
    const last = choice(LAST_NAMES);
    name = `${first} ${last}`;
    attempts++;
  } while (usedFullNames.has(name) && attempts < 25);
  usedFullNames.add(name);
  return name;
}
function emailFromName(fullName: string, seq: number): string {
  const clean = fullName.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Miss)\s+/, '').toLowerCase().split(' ');
  return `${clean[0][0]}.${clean[clean.length - 1]}${seq}@stu.gou.edu.ng`;
}

interface StudentSpec {
  departmentId: string;
  level: number;
  heroName?: string;
  isDemoDefault?: boolean;
}
function repeat(departmentId: string, level: number, count: number): StudentSpec[] {
  return Array.from({ length: count }, () => ({ departmentId, level }));
}

const studentSpecs: StudentSpec[] = [
  ...repeat('dept-cs', 100, 4),
  ...repeat('dept-cs', 200, 5),
  { departmentId: 'dept-cs', level: 300, heroName: 'Amara Chukwu', isDemoDefault: true },
  ...repeat('dept-cs', 300, 8),
  ...repeat('dept-cs', 400, 3),
  ...repeat('dept-bch', 200, 4),
  ...repeat('dept-bch', 300, 4),
  ...repeat('dept-eee', 200, 4),
  ...repeat('dept-eee', 300, 4),
  ...repeat('dept-mee', 200, 4),
  ...repeat('dept-mee', 300, 3),
  ...repeat('dept-acc', 200, 4),
  ...repeat('dept-acc', 300, 3),
  ...repeat('dept-acc', 400, 2),
  ...repeat('dept-mac', 200, 4),
  ...repeat('dept-mac', 300, 3),
];

const students: User[] = studentSpecs.map((spec, i) => {
  const dept = departments.find((d) => d.id === spec.departmentId)!;
  const fullName = spec.heroName ?? randomFullName();
  const matric = `GOU/${dept.shortName}/${sessionStartYear + Math.floor(spec.level / 100) - 4}/${String(i + 1).padStart(3, '0')}`;
  return makeUser({
    fullName,
    institutionalId: matric,
    email: spec.heroName ? 'a.chukwu@stu.gou.edu.ng' : emailFromName(fullName, i),
    role: 'student',
    departmentId: dept.id,
    facultyId: dept.facultyId,
    level: spec.level,
    directSuperiorId: dept.hodId,
    isDemoDefault: spec.isDemoDefault ?? false,
  });
});
const heroStudent = students.find((s) => s.isDemoDefault)!;

/* ════════════════════════════════════════════════════════════════
   Course enrollments
   ════════════════════════════════════════════════════════════════ */

export const courseEnrollments: CourseEnrollment[] = [];
let enrollSeq = 0;
function enroll(courseUnitId: string, studentId: string) {
  if (courseEnrollments.some((e) => e.courseUnitId === courseUnitId && e.studentId === studentId)) return;
  enrollSeq++;
  courseEnrollments.push({ id: `enr-${enrollSeq}`, courseUnitId, studentId, isActive: true });
}

for (const student of students) {
  let matches = courseUnits.filter((c) => c.departmentId === student.departmentId && c.level === student.level);
  if (matches.length === 0) {
    matches = courseUnits.filter((c) => c.departmentId === student.departmentId && c.level === student.level! - 100);
  }
  matches.forEach((c) => enroll(c.id, student.id));
}
// Hero student carries two lower-level courses forward — a realistic reason
// for her to have a richer, more varied course load for the demo.
enroll('course-csc101', heroStudent.id);
enroll('course-csc201', heroStudent.id);

/* ════════════════════════════════════════════════════════════════
   Class instances — 7 weeks of history plus guaranteed-live "today"
   instances for the two hero courses (CSC201, CSC301), so the
   interactive check-in/broadcast flows always have something
   actionable regardless of what day this prototype is opened.
   ════════════════════════════════════════════════════════════════ */

const VENUES: Record<string, { building: string; venue: string }[]> = {
  'dept-cs': [{ building: 'Natural & Applied Sciences Complex', venue: 'CS Lecture Theatre 1' }, { building: 'Natural & Applied Sciences Complex', venue: 'CS Lab 2' }],
  'dept-bch': [{ building: 'Natural & Applied Sciences Complex', venue: 'Biochemistry Lab A' }],
  'dept-eee': [{ building: 'Engineering Complex', venue: 'EEE Lecture Hall' }],
  'dept-mee': [{ building: 'Engineering Complex', venue: 'Mechanical Workshop Annex' }],
  'dept-acc': [{ building: 'Management Sciences Block', venue: 'Accounting Lecture Hall' }],
  'dept-mac': [{ building: 'Management Sciences Block', venue: 'Mass Comm Studio' }],
};
function venueFor(departmentId: string) {
  return choice(VENUES[departmentId]);
}

export const classInstances: ClassInstance[] = [];
let ciSeq = 0;
const WEEKS_BACK = 7;

for (const spec of courseSpecs) {
  const course = courseUnits.find((c) => c.code === spec.code)!;
  const { building, venue } = venueFor(spec.departmentId);
  const mode: AttendanceMode = spec.mode ?? 'window';
  const [startH, endH] = spec.timeSlot;

  for (let offset = WEEKS_BACK * 7; offset >= 0; offset--) {
    const dayDate = addDays(NOW, -offset);
    if (!spec.weekdays.includes(isoWeekday(dayDate))) continue;
    const classStart = atTime(dayDate, startH, 0);
    const classEnd = atTime(dayDate, endH, 0);
    if (classStart > NOW) continue;
    const windowOpen = new Date(classStart.getTime() - 15 * 60000);
    const windowClose = mode === 'duration' ? classEnd : new Date(classStart.getTime() + 20 * 60000);
    ciSeq++;
    classInstances.push({
      id: `ci-${ciSeq}`,
      courseUnitId: course.id,
      lecturerId: spec.coId && rand() < 0.5 ? spec.coId : spec.leadId,
      venueName: venue,
      buildingName: building,
      instanceDate: isoDate(dayDate),
      windowOpenAt: windowOpen.toISOString(),
      windowCloseAt: windowClose.toISOString(),
      classStartAt: classStart.toISOString(),
      classEndAt: classEnd.toISOString(),
      attendanceMode: mode,
      status: 'completed',
    });
  }
}

function injectLiveInstance(courseCode: string, minutesAgoStart: number, hoursWindow: number): ClassInstance {
  const course = courseUnits.find((c) => c.code === courseCode)!;
  const spec = courseSpecs.find((s) => s.code === courseCode)!;
  const { building, venue } = venueFor(spec.departmentId);
  const classStart = new Date(NOW.getTime() - minutesAgoStart * 60000);
  ciSeq++;
  const instance: ClassInstance = {
    id: `ci-${ciSeq}`,
    courseUnitId: course.id,
    lecturerId: spec.leadId,
    venueName: venue,
    buildingName: building,
    instanceDate: todayStr(),
    windowOpenAt: classStart.toISOString(),
    windowCloseAt: new Date(NOW.getTime() + hoursWindow * 3600000).toISOString(),
    classStartAt: classStart.toISOString(),
    classEndAt: new Date(classStart.getTime() + (spec.timeSlot[1] - spec.timeSlot[0]) * 3600000).toISOString(),
    attendanceMode: spec.mode ?? 'window',
    status: 'active',
  };
  classInstances.push(instance);
  return instance;
}
injectLiveInstance('CSC301', 12, 5);
injectLiveInstance('CSC201', 40, 5);

function injectUpcomingInstance(courseCode: string, daysAhead: number, hour: number) {
  const course = courseUnits.find((c) => c.code === courseCode)!;
  const spec = courseSpecs.find((s) => s.code === courseCode)!;
  const { building, venue } = venueFor(spec.departmentId);
  const day = addDays(NOW, daysAhead);
  const classStart = atTime(day, hour, 0);
  const classEnd = atTime(day, hour + (spec.timeSlot[1] - spec.timeSlot[0]), 0);
  ciSeq++;
  classInstances.push({
    id: `ci-${ciSeq}`,
    courseUnitId: course.id,
    lecturerId: spec.leadId,
    venueName: venue,
    buildingName: building,
    instanceDate: isoDate(day),
    windowOpenAt: new Date(classStart.getTime() - 15 * 60000).toISOString(),
    windowCloseAt: new Date(classStart.getTime() + 20 * 60000).toISOString(),
    classStartAt: classStart.toISOString(),
    classEndAt: classEnd.toISOString(),
    attendanceMode: spec.mode ?? 'window',
    status: 'scheduled',
  });
}
injectUpcomingInstance('CSC305', 1, 12);

const completedInstances = classInstances.filter((ci) => ci.status === 'completed');
const liveInstances = classInstances.filter((ci) => ci.status === 'active');

/* ════════════════════════════════════════════════════════════════
   Attendance records
   Absence is represented by the *absence* of a record for a given
   (student, class_instance) pair — matching the real schema, which
   has no "absent" presence_method or verification_status value.
   ════════════════════════════════════════════════════════════════ */

export const attendanceRecords: AttendanceRecord[] = [];
let arSeq = 0;

const atRiskStudents = new Set(sample(students.filter((s) => s.id !== heroStudent.id), 4).map((s) => s.id));
function studentBaseRate(studentId: string): number {
  if (studentId === heroStudent.id) return 0.9; // strong overall, her one at-risk course is handled separately below
  return atRiskStudents.has(studentId) ? 0.5 + rand() * 0.15 : 0.8 + rand() * 0.17;
}
const studentRates = new Map(students.map((s) => [s.id, studentBaseRate(s.id)] as const));
// Hero student's carried-forward CSC101 is deliberately slipping — gives the
// At-Risk Courses screen real content on the flagship persona without needing
// to switch personas away from her to see the feature in action.
const heroAtRiskCourseId = 'course-csc101';

const atRiskLecturers = new Set([lecIfeanyi.id]);
function lecturerBaseRate(lecturerId: string): number {
  return atRiskLecturers.has(lecturerId) ? 0.55 + rand() * 0.1 : 0.9 + rand() * 0.09;
}

function pickLineage(presentSoFar: string[]): { depth: number; via: string | null } {
  const r = rand();
  if (presentSoFar.length === 0 || r < 0.4) return { depth: 0, via: null };
  const via = choice(presentSoFar);
  return r < 0.75 ? { depth: 1, via } : { depth: 2, via };
}

for (const ci of completedInstances) {
  const enrolledIds = shuffle(courseEnrollments.filter((e) => e.courseUnitId === ci.courseUnitId).map((e) => e.studentId));
  const presentIds: string[] = [];

  for (const studentId of enrolledIds) {
    let rate = studentRates.get(studentId)!;
    if (studentId === heroStudent.id && ci.courseUnitId === heroAtRiskCourseId) rate = 0.58;
    if (rand() >= rate) continue; // absent — no record

    const outcome = rand();
    if (outcome < 0.9) {
      const { depth, via } = pickLineage(presentIds);
      arSeq++;
      attendanceRecords.push({
        id: `ar-${arSeq}`, clientEventId: `evt-${arSeq}`, classInstanceId: ci.id, userId: studentId,
        userRoleAtEvent: 'student', institutionId: institution.id,
        presenceMethod: 'qr_chain_verified', verificationStatus: 'verified',
        scanDepth: depth, scannedViaUserId: via, faceLivenessConfirmed: true,
        eventTimestamp: ci.classStartAt,
      });
      presentIds.push(studentId);
    } else if (outcome < 0.97) {
      arSeq++;
      attendanceRecords.push({
        id: `ar-${arSeq}`, clientEventId: `evt-${arSeq}`, classInstanceId: ci.id, userId: studentId,
        userRoleAtEvent: 'student', institutionId: institution.id,
        presenceMethod: 'manual_student', verificationStatus: 'unverified',
        scanDepth: null, scannedViaUserId: null, faceLivenessConfirmed: false,
        eventTimestamp: ci.windowCloseAt,
      });
    } else {
      arSeq++;
      attendanceRecords.push({
        id: `ar-${arSeq}`, clientEventId: `evt-${arSeq}`, classInstanceId: ci.id, userId: studentId,
        userRoleAtEvent: 'student', institutionId: institution.id,
        presenceMethod: 'manual_student', verificationStatus: 'disputed',
        scanDepth: null, scannedViaUserId: null, faceLivenessConfirmed: false,
        eventTimestamp: ci.windowCloseAt,
      });
    }
  }

  if (rand() < lecturerBaseRate(ci.lecturerId)) {
    arSeq++;
    attendanceRecords.push({
      id: `ar-${arSeq}`, clientEventId: `evt-${arSeq}`, classInstanceId: ci.id, userId: ci.lecturerId,
      userRoleAtEvent: 'lecturer', institutionId: institution.id,
      presenceMethod: 'qr_chain_verified', verificationStatus: 'verified',
      scanDepth: 0, scannedViaUserId: null, faceLivenessConfirmed: true,
      eventTimestamp: ci.classStartAt,
    });
  }
}

// Pre-populate a partial live roster on today's in-progress instances so the
// Broadcast/Roster screens already look alive the moment they're opened.
for (const ci of liveInstances) {
  const enrolledIds = shuffle(courseEnrollments.filter((e) => e.courseUnitId === ci.courseUnitId).map((e) => e.studentId));
  const checkedInCount = Math.round(enrolledIds.length * (0.45 + rand() * 0.2));
  const presentIds: string[] = [];
  enrolledIds.slice(0, checkedInCount).forEach((studentId) => {
    const { depth, via } = pickLineage(presentIds);
    arSeq++;
    attendanceRecords.push({
      id: `ar-${arSeq}`, clientEventId: `evt-${arSeq}`, classInstanceId: ci.id, userId: studentId,
      userRoleAtEvent: 'student', institutionId: institution.id,
      presenceMethod: 'qr_chain_verified', verificationStatus: 'verified',
      scanDepth: depth, scannedViaUserId: via, faceLivenessConfirmed: true,
      eventTimestamp: new Date(NOW.getTime() - randInt(10, 600) * 1000).toISOString(),
    });
    presentIds.push(studentId);
  });
  arSeq++;
  attendanceRecords.push({
    id: `ar-${arSeq}`, clientEventId: `evt-${arSeq}`, classInstanceId: ci.id, userId: ci.lecturerId,
    userRoleAtEvent: 'lecturer', institutionId: institution.id,
    presenceMethod: 'qr_chain_verified', verificationStatus: 'verified',
    scanDepth: 0, scannedViaUserId: null, faceLivenessConfirmed: true,
    eventTimestamp: ci.windowOpenAt,
  });
}

/* ════════════════════════════════════════════════════════════════
   Threshold summaries (student + lecturer)
   ════════════════════════════════════════════════════════════════ */

export const attendanceThresholdSummaries: AttendanceThresholdSummary[] = [];
let atsSeq = 0;
for (const student of students) {
  for (const enr of courseEnrollments.filter((e) => e.studentId === student.id)) {
    const instancesForCourse = completedInstances.filter((ci) => ci.courseUnitId === enr.courseUnitId);
    const totalClasses = instancesForCourse.length;
    const attendedClasses = attendanceRecords.filter(
      (ar) => ar.userId === student.id && (ar.verificationStatus === 'verified' || ar.verificationStatus === 'confirmed') && instancesForCourse.some((ci) => ci.id === ar.classInstanceId)
    ).length;
    const attendancePct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 1000) / 10 : 0;
    atsSeq++;
    attendanceThresholdSummaries.push({
      id: `ats-${atsSeq}`, studentId: student.id, courseUnitId: enr.courseUnitId, semesterId: currentSemester.id,
      totalClasses, attendedClasses, attendancePct, thresholdPct: institution.defaultThresholdPct,
      isEligible: totalClasses > 0 && attendancePct >= institution.defaultThresholdPct,
    });
  }
}

export const lecturerAttendanceSummaries: LecturerAttendanceSummary[] = [];
let lasSeq = 0;
for (const course of courseUnits) {
  for (const lecturerId of course.lecturerIds) {
    const instancesForCourse = completedInstances.filter((ci) => ci.courseUnitId === course.id);
    const totalClasses = instancesForCourse.length;
    const attendedClasses = attendanceRecords.filter(
      (ar) => ar.userId === lecturerId && ar.userRoleAtEvent === 'lecturer' && (ar.verificationStatus === 'verified' || ar.verificationStatus === 'confirmed') && instancesForCourse.some((ci) => ci.id === ar.classInstanceId)
    ).length;
    const attendancePct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 1000) / 10 : 0;
    lasSeq++;
    lecturerAttendanceSummaries.push({
      id: `las-${lasSeq}`, lecturerId, courseUnitId: course.id, semesterId: currentSemester.id,
      totalClasses, attendedClasses, attendancePct, thresholdPct: institution.defaultThresholdPct,
      meetsThreshold: totalClasses > 0 && attendancePct >= institution.defaultThresholdPct,
    });
  }
}

/* ════════════════════════════════════════════════════════════════
   Correction records + admin activity log
   ════════════════════════════════════════════════════════════════ */

function getUserByIdRaw(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export const correctionRecords: CorrectionRecord[] = [];
let crSeq = 0;
function addCorrection(record: AttendanceRecord, type: CorrectionRecord['correctionType'], reason: string) {
  const student = getUserByIdRaw(record.userId)!;
  const hod = getUserByIdRaw(student.directSuperiorId!)!;
  crSeq++;
  correctionRecords.push({
    id: `cr-${crSeq}`,
    originalRecordId: record.id,
    correctedRecordId: null,
    correctedBy: hod.id,
    correctingRole: hod.role,
    correctionType: type,
    documentedReason: reason,
    createdAt: new Date(NOW.getTime() - randInt(1, 10) * 86400000).toISOString(),
  });
}
sample(attendanceRecords.filter((a) => a.verificationStatus === 'unverified'), 3).forEach((r) =>
  addCorrection(r, 'verify_unverified', 'Student presented a signed lecturer sign-in sheet for this session during office hours; confirming the manual submission.')
);
const disputedOne = attendanceRecords.find((a) => a.verificationStatus === 'disputed');
if (disputedOne) addCorrection(disputedOne, 'reject_unverified', 'Reviewed with the course lecturer; no corroborating record of attendance found for this session.');

export const adminActivityLog: AdminActivityLogEntry[] = [];
let logSeq = 0;
function addLog(actionType: string, actorId: string | null, targetId: string | null, targetType: string | null, metadata: Record<string, unknown>, daysAgo: number) {
  logSeq++;
  adminActivityLog.push({
    id: `log-${logSeq}`, actorId, actionType, targetId, targetType, metadata,
    createdAt: new Date(NOW.getTime() - daysAgo * 86400000 - randInt(0, 80000) * 1000).toISOString(),
  });
}
addLog('institution_provisioned', admin1.id, institution.id, 'institution', { name: institution.name }, 400);
addLog('hierarchy_updated', admin1.id, institution.id, 'institution', {}, 60);
correctionRecords.forEach((cr) => addLog('correction_applied', cr.correctedBy, cr.originalRecordId, 'attendance_record', { correctionType: cr.correctionType }, 3));
sample(attendanceRecords.filter((a) => a.presenceMethod === 'qr_chain_verified'), 30).forEach((r) => {
  addLog('qr_checkin_validated', r.userId, r.classInstanceId, 'class_instance', {}, randInt(0, 14));
  addLog('face_liveness_confirmed', r.userId, r.classInstanceId, 'class_instance', {}, randInt(0, 14));
});
sample(attendanceRecords.filter((a) => a.verificationStatus === 'unverified'), 6).forEach((r) => addLog('qr_checkin_rejected', r.userId, r.classInstanceId, 'class_instance', {}, randInt(0, 10)));
completedInstances
  .filter((ci) => atRiskLecturers.has(ci.lecturerId) && !attendanceRecords.some((a) => a.classInstanceId === ci.id && a.userId === ci.lecturerId))
  .slice(0, 5)
  .forEach((ci) => addLog('lecturer_absent', null, ci.id, 'class_instance', { lecturerId: ci.lecturerId, courseUnitId: ci.courseUnitId }, randInt(1, 20)));
adminActivityLog.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

/* ════════════════════════════════════════════════════════════════
   Typed accessors
   ════════════════════════════════════════════════════════════════ */

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}
export function getUsersByRole(role: UserRole): User[] {
  return users.filter((u) => u.role === role);
}
export function getDemoDefaultUser(role: UserRole): User {
  return users.find((u) => u.role === role && u.isDemoDefault) ?? users.find((u) => u.role === role)!;
}
export function getDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}
export function getFacultyById(id: string): Faculty | undefined {
  return faculties.find((f) => f.id === id);
}
export function getDepartmentsForFaculty(facultyId: string): Department[] {
  return departments.filter((d) => d.facultyId === facultyId);
}
export function getDirectReports(userId: string): User[] {
  return users.filter((u) => u.directSuperiorId === userId);
}
export function getAllSubordinateIds(userId: string): string[] {
  const result: string[] = [];
  const queue = [userId];
  while (queue.length) {
    const current = queue.shift()!;
    for (const r of getDirectReports(current)) {
      result.push(r.id);
      queue.push(r.id);
    }
  }
  return result;
}
export function getCourseUnitById(id: string): CourseUnit | undefined {
  return courseUnits.find((c) => c.id === id);
}
export function getCourseUnitsForDepartment(departmentId: string): CourseUnit[] {
  return courseUnits.filter((c) => c.departmentId === departmentId);
}
export function getCourseUnitsForLecturer(lecturerId: string): CourseUnit[] {
  return courseUnits.filter((c) => c.lecturerIds.includes(lecturerId));
}
export function getEnrolledStudents(courseUnitId: string): User[] {
  const ids = new Set(courseEnrollments.filter((e) => e.courseUnitId === courseUnitId).map((e) => e.studentId));
  return users.filter((u) => ids.has(u.id));
}
export function getCourseUnitsForStudent(studentId: string): CourseUnit[] {
  const ids = new Set(courseEnrollments.filter((e) => e.studentId === studentId).map((e) => e.courseUnitId));
  return courseUnits.filter((c) => ids.has(c.id));
}
export function getClassInstancesForCourse(courseUnitId: string): ClassInstance[] {
  return classInstances.filter((ci) => ci.courseUnitId === courseUnitId);
}
export function getClassInstanceById(id: string): ClassInstance | undefined {
  return classInstances.find((ci) => ci.id === id);
}
export function getAttendanceRecordsForClassInstance(classInstanceId: string): AttendanceRecord[] {
  return attendanceRecords.filter((ar) => ar.classInstanceId === classInstanceId);
}
export function getAttendanceRecordsForStudent(studentId: string): AttendanceRecord[] {
  return attendanceRecords.filter((ar) => ar.userId === studentId).sort((a, b) => new Date(b.eventTimestamp).getTime() - new Date(a.eventTimestamp).getTime());
}
export function getThresholdSummariesForStudent(studentId: string): AttendanceThresholdSummary[] {
  return attendanceThresholdSummaries.filter((s) => s.studentId === studentId);
}
export function getAtRiskSummariesForStudent(studentId: string): AttendanceThresholdSummary[] {
  // At-risk means strictly below the NUC threshold — not merely "close to it".
  // isEligible is already `totalClasses > 0 && attendancePct >= thresholdPct`,
  // so a course only counts as at-risk when it has classes recorded and sits
  // under the threshold. This mirrors coursesAtRisk / atRiskCount / studentsAtRisk
  // elsewhere in this file, which all key off `!s.isEligible`.
  return attendanceThresholdSummaries.filter((s) => s.studentId === studentId && s.totalClasses > 0 && !s.isEligible);
}
export function getLecturerSummariesForLecturer(lecturerId: string): LecturerAttendanceSummary[] {
  return lecturerAttendanceSummaries.filter((s) => s.lecturerId === lecturerId);
}
export function getCourseComplianceSnapshot(courseUnitId: string): { avgAttendancePct: number; atRiskCount: number; enrolledCount: number } {
  const summaries = attendanceThresholdSummaries.filter((s) => s.courseUnitId === courseUnitId);
  const avgAttendancePct = summaries.length ? Math.round((summaries.reduce((sum, s) => sum + s.attendancePct, 0) / summaries.length) * 10) / 10 : 0;
  return { avgAttendancePct, atRiskCount: summaries.filter((s) => !s.isEligible).length, enrolledCount: summaries.length };
}
export function getTodayClassInstancesForStudent(studentId: string): ClassInstance[] {
  const courseIds = new Set(getCourseUnitsForStudent(studentId).map((c) => c.id));
  return classInstances.filter((ci) => courseIds.has(ci.courseUnitId) && ci.instanceDate === todayStr()).sort((a, b) => new Date(a.classStartAt).getTime() - new Date(b.classStartAt).getTime());
}
export function getTodayClassInstancesForLecturer(lecturerId: string): ClassInstance[] {
  return classInstances.filter((ci) => ci.lecturerId === lecturerId && ci.instanceDate === todayStr()).sort((a, b) => new Date(a.classStartAt).getTime() - new Date(b.classStartAt).getTime());
}

interface Snapshot {
  avgAttendancePct: number;
  studentsAtRisk: number;
  lecturerCompliancePct: number;
  lecturersBelowThreshold: number;
  classesToday: number;
  totalStudents: number;
  totalLecturers: number;
}
function computeSnapshot(courseIds: Set<string>, studentIds: Set<string>, lecturerIds: Set<string>): Snapshot {
  const summaries = attendanceThresholdSummaries.filter((s) => courseIds.has(s.courseUnitId));
  const avgAttendancePct = summaries.length ? Math.round((summaries.reduce((sum, s) => sum + s.attendancePct, 0) / summaries.length) * 10) / 10 : 0;
  const lecSummaries = lecturerAttendanceSummaries.filter((s) => courseIds.has(s.courseUnitId));
  const lecturerCompliancePct = lecSummaries.length ? Math.round((lecSummaries.reduce((sum, s) => sum + s.attendancePct, 0) / lecSummaries.length) * 10) / 10 : 0;
  return {
    avgAttendancePct,
    studentsAtRisk: new Set(summaries.filter((s) => !s.isEligible).map((s) => s.studentId)).size,
    lecturerCompliancePct,
    lecturersBelowThreshold: new Set(lecSummaries.filter((s) => !s.meetsThreshold).map((s) => s.lecturerId)).size,
    classesToday: classInstances.filter((ci) => courseIds.has(ci.courseUnitId) && ci.instanceDate === todayStr()).length,
    totalStudents: studentIds.size,
    totalLecturers: lecturerIds.size,
  };
}
export function getInstitutionSnapshot(): Snapshot {
  return computeSnapshot(new Set(courseUnits.map((c) => c.id)), new Set(getUsersByRole('student').map((u) => u.id)), new Set(getUsersByRole('lecturer').map((u) => u.id)));
}
export function getDepartmentSnapshot(departmentId: string): Snapshot {
  return computeSnapshot(
    new Set(courseUnits.filter((c) => c.departmentId === departmentId).map((c) => c.id)),
    new Set(users.filter((u) => u.role === 'student' && u.departmentId === departmentId).map((u) => u.id)),
    new Set(users.filter((u) => u.role === 'lecturer' && u.departmentId === departmentId).map((u) => u.id))
  );
}
export function getFacultySnapshot(facultyId: string): Snapshot {
  const deptIds = new Set(departments.filter((d) => d.facultyId === facultyId).map((d) => d.id));
  return computeSnapshot(
    new Set(courseUnits.filter((c) => deptIds.has(c.departmentId)).map((c) => c.id)),
    new Set(users.filter((u) => u.role === 'student' && u.facultyId === facultyId).map((u) => u.id)),
    new Set(users.filter((u) => u.role === 'lecturer' && u.facultyId === facultyId).map((u) => u.id))
  );
}

export interface ComparisonDatum {
  id: string;
  name: string;
  value: number;
}
export function getFacultyComparison(): ComparisonDatum[] {
  return faculties.map((f) => ({ id: f.id, name: f.shortName, value: getFacultySnapshot(f.id).avgAttendancePct }));
}
export function getDepartmentComparison(facultyId: string): ComparisonDatum[] {
  return getDepartmentsForFaculty(facultyId).map((d) => ({ id: d.id, name: d.shortName, value: getDepartmentSnapshot(d.id).avgAttendancePct }));
}

/* ════════════════════════════════════════════════════════════════
   HOD roster + per-person overview selectors
   Added for the Students / Lecturers list-and-detail screens (P0.1,
   P0.2) — the department-scoped "who" behind the at-risk counts
   already surfaced on the dashboards above.
   ════════════════════════════════════════════════════════════════ */

export function getStudentsForDepartment(departmentId: string): User[] {
  return users.filter((u) => u.role === 'student' && u.departmentId === departmentId);
}
export function getLecturersForDepartment(departmentId: string): User[] {
  return users.filter((u) => u.role === 'lecturer' && u.departmentId === departmentId);
}

export interface StudentOverview {
  overallAttendancePct: number;
  coursesEnrolled: number;
  coursesAtRisk: number;
}
/** Aggregates a student's per-course threshold summaries into one overall figure — attended/total across every enrolled course, not an average of percentages, so it matches the arithmetic a sharp investor would check by hand. */
export function getStudentOverview(studentId: string): StudentOverview {
  const summaries = getThresholdSummariesForStudent(studentId);
  const totalAttended = summaries.reduce((sum, s) => sum + s.attendedClasses, 0);
  const totalClasses = summaries.reduce((sum, s) => sum + s.totalClasses, 0);
  const overallAttendancePct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0;
  return {
    overallAttendancePct,
    coursesEnrolled: summaries.length,
    coursesAtRisk: summaries.filter((s) => !s.isEligible).length,
  };
}

export interface LecturerOverview {
  overallAttendancePct: number;
  coursesTaught: number;
  classesHeld: number;
  meetsThreshold: boolean;
}
export function getLecturerOverview(lecturerId: string): LecturerOverview {
  const summaries = getLecturerSummariesForLecturer(lecturerId);
  const totalAttended = summaries.reduce((sum, s) => sum + s.attendedClasses, 0);
  const totalClasses = summaries.reduce((sum, s) => sum + s.totalClasses, 0);
  const overallAttendancePct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0;
  return {
    overallAttendancePct,
    coursesTaught: summaries.length,
    classesHeld: totalClasses,
    meetsThreshold: totalClasses > 0 && overallAttendancePct >= institution.defaultThresholdPct,
  };
}

export interface LecturerAbsence {
  classInstanceId: string;
  courseCode: string;
  courseTitle: string;
  instanceDate: string;
  venueName: string;
}
/** Completed sessions for this lecturer with no lecturer attendance record — the same condition the seed data's own 'lecturer_absent' activity-log entries are generated from. */
export function getLecturerAbsences(lecturerId: string): LecturerAbsence[] {
  return classInstances
    .filter((ci) => ci.lecturerId === lecturerId && ci.status === 'completed')
    .filter((ci) => !attendanceRecords.some((ar) => ar.classInstanceId === ci.id && ar.userId === lecturerId))
    .map((ci) => {
      const course = getCourseUnitById(ci.courseUnitId)!;
      return { classInstanceId: ci.id, courseCode: course.code, courseTitle: course.title, instanceDate: ci.instanceDate, venueName: ci.venueName };
    })
    .sort((a, b) => new Date(b.instanceDate).getTime() - new Date(a.instanceDate).getTime());
}

/* ════════════════════════════════════════════════════════════════
   Scheduled class submissions — the timetable-authoring layer above
   class_instances (P1.8). One 'approved' submission per live course,
   mirroring the weekday/time-slot already baked into class_instances
   via courseSpecs, so the grid and the actual materialised classes
   never disagree — plus a few pending/rejected submissions so the
   HOD approval queue has real content rather than an empty state.
   ════════════════════════════════════════════════════════════════ */

export const scheduledClassSubmissions: ScheduledClassSubmission[] = [];
let scsSeq = 0;

function addScheduleSubmission(input: {
  courseCode: string;
  lecturerId: string;
  dayOfWeek: number[];
  startHour: number;
  endHour: number;
  mode?: AttendanceMode;
  approvalStatus: ScheduleApprovalStatus;
  submittedBy: string;
  submittedDaysAgo: number;
  approvedBy?: string;
  approvedDaysAgo?: number;
  rejectionReason?: string;
}) {
  const course = courseUnits.find((c) => c.code === input.courseCode)!;
  const spec = courseSpecs.find((s) => s.code === input.courseCode)!;
  const { building, venue } = venueFor(spec.departmentId);
  scsSeq++;
  scheduledClassSubmissions.push({
    id: `scs-${scsSeq}`,
    courseUnitId: course.id,
    lecturerId: input.lecturerId,
    venueName: venue,
    buildingName: building,
    dayOfWeek: input.dayOfWeek,
    startHour: input.startHour,
    endHour: input.endHour,
    attendanceMode: input.mode ?? 'window',
    approvalStatus: input.approvalStatus,
    submittedBy: input.submittedBy,
    submittedAt: new Date(NOW.getTime() - input.submittedDaysAgo * 86_400_000).toISOString(),
    approvedBy: input.approvedBy ?? null,
    approvedAt: input.approvedDaysAgo !== undefined ? new Date(NOW.getTime() - input.approvedDaysAgo * 86_400_000).toISOString() : null,
    rejectionReason: input.rejectionReason ?? null,
  });
}

for (const spec of courseSpecs) {
  const dept = departments.find((d) => d.id === spec.departmentId)!;
  addScheduleSubmission({
    courseCode: spec.code,
    lecturerId: spec.leadId,
    dayOfWeek: spec.weekdays,
    startHour: spec.timeSlot[0],
    endHour: spec.timeSlot[1],
    mode: spec.mode,
    approvalStatus: 'approved',
    submittedBy: spec.leadId,
    submittedDaysAgo: 95,
    approvedBy: dept.hodId ?? undefined,
    approvedDaysAgo: 92,
  });
}

// A couple of pending proposals and one rejection, so the approval
// queue and its colour-coded states have real content to demo.
addScheduleSubmission({
  courseCode: 'CSC305',
  lecturerId: lecIfeanyi.id,
  dayOfWeek: [2, 4],
  startHour: 14,
  endHour: 16,
  approvalStatus: 'pending',
  submittedBy: lecIfeanyi.id,
  submittedDaysAgo: 2,
});
addScheduleSubmission({
  courseCode: 'ACC301',
  lecturerId: lecNneka.id,
  dayOfWeek: [3, 5],
  startHour: 8,
  endHour: 10,
  approvalStatus: 'pending',
  submittedBy: lecNneka.id,
  submittedDaysAgo: 1,
});
addScheduleSubmission({
  courseCode: 'MAC201',
  lecturerId: lecChike.id,
  dayOfWeek: [3, 5],
  startHour: 10,
  endHour: 12,
  approvalStatus: 'rejected',
  submittedBy: lecChike.id,
  submittedDaysAgo: 6,
  approvedBy: departments.find((d) => d.id === 'dept-mac')?.hodId ?? undefined,
  approvedDaysAgo: 5,
  rejectionReason: 'Conflicts with MAC301 in the same venue on Wednesdays — please resubmit with an alternate slot.',
});

export function getScheduledSubmissionsForDepartment(departmentId: string): ScheduledClassSubmission[] {
  const courseIds = new Set(courseUnits.filter((c) => c.departmentId === departmentId).map((c) => c.id));
  return scheduledClassSubmissions.filter((s) => courseIds.has(s.courseUnitId));
}

/* ════════════════════════════════════════════════════════════════
   Notifications (P2 Part 1) — illustrative copy, but every item is
   derived from a real record already computed above (at-risk
   summaries, unverified check-ins, schedule submissions, lecturer
   absences), so a notification's text never disagrees with what the
   rest of the demo already shows that user.
   ════════════════════════════════════════════════════════════════ */

export const notifications: NotificationItem[] = [];
let notifSeq = 0;

function addNotification(input: {
  userId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  daysAgo: number;
  read?: boolean;
}) {
  notifSeq++;
  notifications.push({
    id: `notif-${notifSeq}`,
    userId: input.userId,
    title: input.title,
    body: input.body,
    category: input.category,
    createdAt: new Date(NOW.getTime() - input.daysAgo * 86_400_000 - notifSeq * 60_000).toISOString(),
    read: input.read ?? false,
  });
}

// Student notifications — real at-risk courses and real unverified check-ins.
for (const student of getUsersByRole('student')) {
  for (const s of getAtRiskSummariesForStudent(student.id).slice(0, 2)) {
    const course = getCourseUnitById(s.courseUnitId);
    if (!course) continue;
    addNotification({
      userId: student.id,
      title: `You're now at risk in ${course.code}`,
      body: `Your attendance in ${course.title} is ${s.attendancePct}%, below the ${s.thresholdPct}% threshold.`,
      category: 'attendance',
      daysAgo: 1,
    });
  }
  const unverified = getAttendanceRecordsForStudent(student.id).filter((r) => r.verificationStatus === 'unverified').slice(0, 1);
  for (const record of unverified) {
    const instance = getClassInstanceById(record.classInstanceId);
    const course = instance ? getCourseUnitById(instance.courseUnitId) : undefined;
    addNotification({
      userId: student.id,
      title: 'Check-in needs confirmation',
      body: `Your check-in for ${course?.code ?? 'a course'} needs lecturer confirmation.`,
      category: 'attendance',
      daysAgo: 0,
    });
  }
}
addNotification({
  userId: heroStudent.id,
  title: 'Timetable update',
  body: `${getCourseUnitById('course-csc301')?.code ?? 'CSC301'} moved venue — check your updated timetable.`,
  category: 'timetable',
  daysAgo: 3,
  read: true,
});

// Lecturer notifications — real schedule-submission outcomes and real absence flags.
for (const lecturer of getUsersByRole('lecturer')) {
  const ownSubmissions = scheduledClassSubmissions.filter((s) => s.submittedBy === lecturer.id);
  for (const s of ownSubmissions) {
    const course = getCourseUnitById(s.courseUnitId);
    if (!course) continue;
    if (s.approvalStatus === 'pending') {
      addNotification({
        userId: lecturer.id,
        title: 'Schedule submission pending',
        body: `Your proposed slot for ${course.code} is awaiting HOD approval.`,
        category: 'timetable',
        daysAgo: 1,
      });
    } else if (s.approvalStatus === 'rejected') {
      addNotification({
        userId: lecturer.id,
        title: 'Schedule submission rejected',
        body: `${course.code}: ${s.rejectionReason ?? 'No reason provided.'}`,
        category: 'timetable',
        daysAgo: 4,
      });
    }
  }
  for (const a of getLecturerAbsences(lecturer.id).slice(0, 1)) {
    addNotification({
      userId: lecturer.id,
      title: 'Missing attendance record',
      body: `No attendance record was detected for ${a.courseCode} on ${a.instanceDate}.`,
      category: 'attendance',
      daysAgo: 2,
    });
  }
}

export function getNotificationsForUser(userId: string): NotificationItem[] {
  return notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
