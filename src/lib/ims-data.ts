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
  { id: "org-1", name: "Nova Systems", industry: "AKT va Tarmoqlar", performance: 94 },
  { id: "org-2", name: "Meridian Health", industry: "Tibbiyot va Sog'liqni saqlash", performance: 88 },
  { id: "org-3", name: "Atlas Logistics", industry: "Logistika va Yuk tashish", performance: 79 },
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
  { id: "l-1", studentId: "s-1", date: daysAgo(1), checkIn: "09:02", checkOut: "17:15", attendance: "present", report: "Rahbar ko'rsatmasi ostida lokal server sozlandi va tarmoqdagi nosozliklar bartaraf etildi.", status: "approved" },
  { id: "l-2", studentId: "s-1", date: daysAgo(2), checkIn: "09:10", checkOut: "17:05", attendance: "present", report: "Router dasturiy ta'minotini yangilashda jamoaga yordam berildi va natijalar qayd etildi.", status: "approved" },
  { id: "l-3", studentId: "s-1", date: daysAgo(3), attendance: "absent", status: "pending" },
  { id: "l-4", studentId: "s-1", date: daysAgo(4), checkIn: "09:00", checkOut: "17:00", attendance: "present", report: "Kabel liniyalari sinovdan o'tkazildi va tarmoq ulanish sxemalari chizildi.", status: "pending" },
  { id: "l-5", studentId: "s-2", date: daysAgo(1), checkIn: "08:58", checkOut: "17:20", attendance: "present", report: "Tashkilot ichki chat xizmatini ishga tushirish jarayonida ko'maklashildi.", status: "pending" },
  { id: "l-6", studentId: "s-3", date: daysAgo(1), checkIn: "09:15", checkOut: "17:00", attendance: "present", report: "Xavfsizlik jurnallari tahlil qilindi va yuz bergan hodisalar bo'yicha hisobot tayyorlandi.", status: "approved" },
  { id: "l-7", studentId: "s-4", date: daysAgo(1), checkIn: "08:45", checkOut: "16:40", attendance: "present", report: "Ertalabki tibbiy ko'rikda shifokorga hamrohlik qilindi va elektron yozuvlar tizimi o'rganildi.", status: "pending" },
  { id: "l-8", studentId: "s-5", date: daysAgo(1), attendance: "absent", status: "pending" },
];

export const INITIAL_ALERTS: FraudAlert[] = [
  { id: "a-1", severity: "high", title: "Qurilma imzosi mos kelishi", detail: "Aziz Yusupov va Malika Tashkentova uchun bitta qurilmadan check-in amalga oshirilganligi aniqlandi." },
  { id: "a-2", severity: "medium", title: "Hisobotlarning 90% o'xshashligi", detail: "Shu haftada Rustam Ergashev va Jasur Alimovning hisobotlari o'rtasida juda yuqori matnli o'xshashlik aniqlandi." },
  { id: "a-3", severity: "low", title: "GPS mos kelmasligi", detail: "Sitora Nazarova belgilangan amaliyot binosidan 1.4 km uzoqlikda turib check-in qildi." },
];

export function generateAIReport(keywords: string, lang: "uz" | "ru" | "en" = "uz"): string {
  const kw = keywords.trim().toLowerCase();
  const parts = kw.split(/[,\n]+/).map((k) => k.trim()).filter(Boolean);
  
  if (lang === "en") {
    if (!kw) return "Today, daily internship tasks were completed under the guidance of the mentor.";
    const first = parts[0] ?? "assigned tasks";
    const rest = parts.slice(1).join(", ") || "other practical duties";
    return `Today, under the guidance of my mentor, I worked on ${first} and completed tasks related to ${rest}. I finalized the results and prepared the report.`;
  }
  
  if (lang === "ru") {
    if (!kw) return "Сегодня были выполнены ежедневные задачи практики под руководством наставника.";
    const first = parts[0] ?? "порученные задания";
    const rest = parts.slice(1).join(", ") || "другие практические обязанности";
    return `Сегодня под руководством наставника я работал над ${first} и выполнил задачи по ${rest}. Оформил результаты и подготовил отчет.`;
  }
  
  // Default: Uzbek
  if (!kw) return "Bugungi kunda kunlik topshiriqlar bajarildi va rahbar ko'rsatmalari amalga oshirildi.";
  const first = parts[0] ?? "berilgan topshiriqlar";
  const rest = parts.slice(1).join(", ") || "boshqa amaliy vazifalar";
  return `Bugun men rahbar ko'rsatmalari asosida ${first} ishi ustida ishladim va ${rest} bo'yicha berilgan vazifalarni bajardim. Natijalarni rasmiylashtirib, hisobot tayyorladim.`;
}