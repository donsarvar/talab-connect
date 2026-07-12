export type Role = "student" | "mentor" | "admin";

export type AttendanceStatus = "present" | "absent" | "pending";
export type LogStatus = "pending" | "approved" | "rejected";

export interface Organization {
  id: string;
  name: string;
  industry: string;
  performance: number;
}

export interface Mentor {
  id: string;
  name: string;
  organizationId: string;
  studentIds: string[];
  avatar: string;
}

export interface DailyLog {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string;
  checkOut?: string;
  attendance: AttendanceStatus;
  keywords?: string;
  report?: string;
  status: LogStatus;
  rejectionReason?: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  dob: string; // DDMMYYYY password
  group: string;
  organizationId: string;
  mentorId: string;
  avatar: string;
  rating?: number;
  feedback?: string;
}

export interface FraudAlert {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export const ORGS: Organization[] = [
  { id: "org-1", name: "Nova Systems", industry: "IT & Networking", performance: 94 },
  { id: "org-2", name: "Meridian Health", industry: "Healthcare", performance: 88 },
  { id: "org-3", name: "Atlas Logistics", industry: "Logistics", performance: 79 },
];

export const MENTORS: Mentor[] = [
  {
    id: "m-1",
    name: "Dilnoza Karimova",
    organizationId: "org-1",
    studentIds: ["s-1", "s-2", "s-3"],
    avatar: "DK",
  },
  {
    id: "m-2",
    name: "Bekzod Rakhimov",
    organizationId: "org-2",
    studentIds: ["s-4", "s-5"],
    avatar: "BR",
  },
];

export const STUDENTS: Student[] = [
  { id: "s-1", name: "Aziz Yusupov", phone: "+998 90 123 45 67", dob: "12042003", group: "IT-21A", organizationId: "org-1", mentorId: "m-1", avatar: "AY" },
  { id: "s-2", name: "Malika Tashkentova", phone: "+998 91 222 33 44", dob: "05092003", group: "IT-21A", organizationId: "org-1", mentorId: "m-1", avatar: "MT" },
  { id: "s-3", name: "Rustam Ergashev", phone: "+998 93 555 66 77", dob: "22112002", group: "IT-21B", organizationId: "org-1", mentorId: "m-1", avatar: "RE" },
  { id: "s-4", name: "Sitora Nazarova", phone: "+998 97 888 99 00", dob: "18072003", group: "MED-21", organizationId: "org-2", mentorId: "m-2", avatar: "SN" },
  { id: "s-5", name: "Jasur Alimov", phone: "+998 94 111 22 33", dob: "30012003", group: "MED-21", organizationId: "org-2", mentorId: "m-2", avatar: "JA" },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const INITIAL_LOGS: DailyLog[] = [
  { id: "l-1", studentId: "s-1", date: daysAgo(1), checkIn: "09:02", checkOut: "17:15", attendance: "present", report: "Configured the local server and completed network troubleshooting under supervisor guidance.", status: "approved" },
  { id: "l-2", studentId: "s-1", date: daysAgo(2), checkIn: "09:10", checkOut: "17:05", attendance: "present", report: "Assisted the team with router firmware upgrade and documented findings.", status: "approved" },
  { id: "l-3", studentId: "s-1", date: daysAgo(3), attendance: "absent", status: "pending" },
  { id: "l-4", studentId: "s-1", date: daysAgo(4), checkIn: "09:00", checkOut: "17:00", attendance: "present", report: "Performed cable testing and structured wiring diagrams.", status: "pending" },
  { id: "l-5", studentId: "s-2", date: daysAgo(1), checkIn: "08:58", checkOut: "17:20", attendance: "present", report: "Supported deployment of internal chat service.", status: "pending" },
  { id: "l-6", studentId: "s-3", date: daysAgo(1), checkIn: "09:15", checkOut: "17:00", attendance: "present", report: "Reviewed security logs and prepared incident summary.", status: "approved" },
  { id: "l-7", studentId: "s-4", date: daysAgo(1), checkIn: "08:45", checkOut: "16:40", attendance: "present", report: "Shadowed physician during morning rounds and reviewed EMR workflow.", status: "pending" },
  { id: "l-8", studentId: "s-5", date: daysAgo(1), attendance: "absent", status: "pending" },
];

export const INITIAL_ALERTS: FraudAlert[] = [
  { id: "a-1", severity: "high", title: "Device signature collision", detail: "Multiple check-ins from the same device signature for Aziz Yusupov and Malika Tashkentova." },
  { id: "a-2", severity: "medium", title: "Log similarity 90%", detail: "High textual similarity detected between reports of Rustam Ergashev and Jasur Alimov this week." },
  { id: "a-3", severity: "low", title: "GPS mismatch", detail: "Sitora Nazarova checked in 1.4 km outside the assigned facility." },
];

export function generateAIReport(keywords: string): string {
  const kw = keywords.trim().toLowerCase();
  if (!kw) return "Today I contributed to daily operations and completed tasks assigned by my supervisor.";
  const parts = kw.split(/[,\n]+/).map((k) => k.trim()).filter(Boolean);
  const first = parts[0] ?? "assigned tasks";
  const rest = parts.slice(1).join(", ") || "additional operational duties";
  return `Today, I worked on ${first} and completed ${rest} under supervisor guidance. I documented outcomes, applied best practices, and prepared to continue the workflow tomorrow.`;
}