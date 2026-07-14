import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  Download,
  FileSpreadsheet,
  GaugeCircle,
  ShieldAlert,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIms } from "./store";
import type { Student } from "@/lib/ims-data";

export function AdminView({ onLogout }: { onLogout?: () => void }) {
  const { students, orgs, mentors, logs, alerts, addStudents, assignStudent, dismissAlert, lang } = useIms();

  const todayISO = new Date().toISOString().slice(0, 10);
  const presentToday = logs.filter((l) => l.date === todayISO && l.attendance === "present").length;
  const rate = students.length ? Math.round((presentToday / students.length) * 100) : 0;

  const orgData = orgs.map((o) => ({
    name: o.name.split(" ")[0],
    performance: o.performance,
    students: students.filter((s) => s.organizationId === o.id).length,
  }));

  const attendanceData = useMemo(() => {
    const days: { day: string; present: number; absent: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayLogs = logs.filter((l) => l.date === iso);
      days.push({
        day: d.toLocaleDateString("en", { weekday: "short" }),
        present: dayLogs.filter((l) => l.attendance === "present").length,
        absent: dayLogs.filter((l) => l.attendance === "absent").length,
      });
    }
    return days;
  }, [logs]);

  const pieData = orgs.map((o) => ({
    name: o.name,
    value: students.filter((s) => s.organizationId === o.id).length,
  }));
  const pieColors = ["oklch(0.55 0.19 275)", "oklch(0.62 0.17 305)", "oklch(0.68 0.15 200)"];

  const [profileOpen, setProfileOpen] = useState(false);

  const getRoleLabel = () => {
    if (lang === "ru") return "Администратор";
    if (lang === "en") return "Administrator";
    return "Koordinator (Admin)";
  };

  return (
    <div className="relative min-h-screen w-full bg-white text-foreground overflow-x-hidden pb-8">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.1),transparent_70%)] blur-[70px]" />
        <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06),transparent_70%)] blur-[70px]" />
      </div>

      <div className="relative z-10 w-full px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        {/* Header Card Frame */}
        <header className="bg-white/80 border border-slate-150/60 rounded-3xl p-4 shadow-xl shadow-slate-100/50 backdrop-blur-md flex items-center justify-between w-full mb-6 overflow-visible z-20">
          {/* Left Side: Brand & Welcome */}
          <div className="flex items-center gap-3">
            <div className="gradient-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-md shadow-primary/25">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                {lang === "uz" ? "Platforma koordinatori" : lang === "ru" ? "Координатор платформы" : "Platform Coordinator"}
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-slate-500">
                <span>{lang === "uz" ? "Talabalar Amaliyoti Platformasi" : lang === "ru" ? "Платформа практики студентов" : "Student Internship Platform"}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Bell & Profile Dropdown Frame */}
          <div className="flex items-center gap-3">
            {/* Bell Notification */}
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-500 shadow-xs hover:bg-slate-50 active:scale-95 transition-all">
              <Bell className="h-4 w-4 text-slate-500" />
            </button>

            {/* Separate Profile Frame Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 border border-slate-150 bg-white rounded-xl shadow-xs hover:border-slate-200 transition-all cursor-pointer select-none"
              >
                <div className="h-6.5 w-6.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-xs">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-extrabold text-slate-800 leading-none">Admin</p>
                  <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{getRoleLabel()}</p>
                </div>
                <span className="text-slate-400 text-[8px] ml-0.5">▼</span>
              </div>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-slate-150/80 bg-white p-1.5 shadow-xl shadow-slate-200/50 z-30 animate-fade-in">
                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      toast.success(lang === "uz" ? "Tizimdan chiqdingiz" : lang === "ru" ? "Вы вышли из системы" : "Logged out successfully");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50/50 active:scale-95 transition-all"
                  >
                    <IconsaxLogout className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{lang === "uz" ? "Chiqish" : lang === "ru" ? "Выйти" : "Logout"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="w-full">
          <Tabs defaultValue="overview">
            <div className="flex justify-start mb-6">
              <TabsList className="bg-slate-50/80 p-1 rounded-xl border border-slate-100/50 flex gap-1 w-full max-w-3xl overflow-x-auto no-scrollbar">
                <TabsTrigger value="overview" className="rounded-lg py-2 px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all">{lang === "uz" ? "Umumiy ma'lumotlar" : lang === "ru" ? "Общая информация" : "Overview"}</TabsTrigger>
                <TabsTrigger value="import" className="rounded-lg py-2 px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all">{lang === "uz" ? "Ommaviy yuklash" : lang === "ru" ? "Массовый импорт" : "Bulk Upload"}</TabsTrigger>
                <TabsTrigger value="assign" className="rounded-lg py-2 px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all">{lang === "uz" ? "Biriktirish" : lang === "ru" ? "Распределение" : "Assign"}</TabsTrigger>
                <TabsTrigger value="fraud" className="rounded-lg py-2 px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all">{lang === "uz" ? "Shubhali holatlar" : lang === "ru" ? "Подозрительные ситуации" : "Fraud Alerts"}</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-lg py-2 px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all">{lang === "uz" ? "Hisobotlar" : lang === "ru" ? "Отчеты" : "Reports"}</TabsTrigger>
              </TabsList>
            </div>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Davomat ko'rsatkichi" value={`${rate}%`} Icon={GaugeCircle} tint="primary" progress={rate} />
              <MetricCard label="Faol talabalar" value={students.length} Icon={Users} tint="emerald" />
              <MetricCard label="Hamkor tashkilotlar" value={orgs.length} Icon={Building2} tint="amber" />
              <MetricCard label="Shubhali vaziyatlar" value={alerts.length} Icon={AlertTriangle} tint="rose" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="glass rounded-3xl p-6 lg:col-span-2 animate-fade-up">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Davomat — oxirgi 7 kun</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                      <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="present" fill="oklch(0.55 0.19 275)" name="Kelgan" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="absent" fill="oklch(0.7 0.2 25)" name="Kelmagan" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass rounded-3xl p-6 animate-fade-up">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Tashkilotlar bo'yicha talabalar</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1">
                  {pieData.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: pieColors[i] }} />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="font-semibold">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 animate-fade-up">
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Eng yaxshi ko'rsatkichga ega tashkilotlar</h3>
              <div className="space-y-3">
                {orgData
                  .sort((a, b) => b.performance - a.performance)
                  .map((o) => (
                    <div key={o.name} className="flex items-center gap-4">
                      <div className="w-32 shrink-0 truncate text-sm font-medium">{o.name}</div>
                      <div className="min-w-0 flex-1">
                        <Progress value={o.performance} />
                      </div>
                      <div className="w-14 shrink-0 text-right text-sm font-bold">{o.performance}%</div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* IMPORT */}
          <TabsContent value="import">
            <ImportTab
              onImport={(newOnes) => {
                addStudents(newOnes);
                toast.success(`${newOnes.length} students imported`);
              }}
              students={students}
            />
          </TabsContent>

          {/* ASSIGNMENTS */}
          <TabsContent value="assign">
            <div className="glass rounded-3xl p-6">
              <h3 className="mb-4 text-base font-semibold">Talabalarni tashkilot va mentorlarga biriktirish</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Talaba</TableHead>
                      <TableHead>Guruh</TableHead>
                      <TableHead>Amaliyot joyi (Tashkilot)</TableHead>
                      <TableHead>Tashkilot mentori (Rahbar)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-bold">
                              {s.avatar}
                            </div>
                            {s.name}
                          </div>
                        </TableCell>
                        <TableCell>{s.group}</TableCell>
                        <TableCell>
                          <Select
                            value={s.organizationId}
                            onValueChange={(orgId) => {
                              const firstMentor = mentors.find((m) => m.organizationId === orgId);
                              assignStudent(s.id, orgId, firstMentor?.id ?? s.mentorId);
                              toast.success(`${s.name} yangi tashkilotga o'tkazildi`);
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {orgs.map((o) => (
                                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={s.mentorId}
                            onValueChange={(mid) => {
                              assignStudent(s.id, s.organizationId, mid);
                              toast.success("Mentor yangilandi");
                            }}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {mentors
                                .filter((m) => m.organizationId === s.organizationId)
                                .map((m) => (
                                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* FRAUD */}
          <TabsContent value="fraud">
            <div className="space-y-3">
              {alerts.length === 0 && (
                <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
                  Hozircha hech qanday shubhali holat aniqlanmadi.
                </div>
              )}
              {alerts.map((a) => {
                const severityStyle =
                  a.severity === "high"
                    ? "border-destructive/40 bg-destructive/5"
                    : a.severity === "medium"
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-primary/30 bg-primary/5";
                return (
                  <div key={a.id} className={`glass flex flex-wrap items-start gap-4 rounded-3xl border p-5 ${severityStyle}`}>
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card">
                      <AlertTriangle
                        className={
                          a.severity === "high"
                            ? "h-5 w-5 text-destructive"
                            : a.severity === "medium"
                              ? "h-5 w-5 text-amber-600"
                              : "h-5 w-5 text-primary"
                        }
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold">{a.title}</h4>
                        <Badge variant="outline" className="uppercase">{a.severity}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        dismissAlert(a.id);
                        toast.success("Ogohlantirish yopildi");
                      }}
                    >
                      Yopish
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* REPORTS */}
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  Icon,
  tint,
  progress,
}: {
  label: string;
  value: string | number;
  Icon: typeof Users;
  tint: "primary" | "emerald" | "amber" | "rose";
  progress?: number;
}) {
  const tintClass =
    tint === "primary"
      ? "bg-primary/5 text-primary border border-primary/10"
      : tint === "emerald"
        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
        : tint === "amber"
          ? "bg-amber-50 text-amber-600 border border-amber-100"
          : "bg-rose-50 text-rose-600 border border-rose-100";
  return (
    <div className="bg-white/80 border border-slate-150/60 rounded-3xl p-5 shadow-xl shadow-slate-100/50 backdrop-blur-md animate-fade-up">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tintClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{value}</p>
        </div>
      </div>
      {progress !== undefined && <Progress className="mt-3" value={progress} />}
    </div>
  );
}

const DUMMY_IMPORT: Omit<Student, "id">[] = [
  { name: "Nodira Umarova", phone: "+998 90 445 12 33", dob: "14082003", group: "IT-21A", organizationId: "org-1", mentorId: "m-1", avatar: "NU" },
  { name: "Sherzod Karimov", phone: "+998 93 776 54 21", dob: "02052003", group: "IT-21B", organizationId: "org-1", mentorId: "m-1", avatar: "SK" },
  { name: "Zilola Ismoilova", phone: "+998 97 332 90 11", dob: "27102003", group: "MED-21", organizationId: "org-2", mentorId: "m-2", avatar: "ZI" },
  { name: "Otabek Yuldashev", phone: "+998 94 118 22 77", dob: "09062003", group: "LOG-21", organizationId: "org-3", mentorId: "m-1", avatar: "OY" },
];

function ImportTab({
  onImport,
  students,
}: {
  onImport: (s: Student[]) => void;
  students: Student[];
}) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imported, setImported] = useState<Student[]>([]);
  const [dragging, setDragging] = useState(false);

  const startUpload = () => {
    if (uploading) return;
    setUploading(true);
    setProgress(0);
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      const p = Math.min(100, Math.round((elapsed / 1600) * 100));
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        const newStudents: Student[] = DUMMY_IMPORT.map((s, i) => ({
          ...s,
          id: `s-imp-${Date.now()}-${i}`,
        }));
        setImported(newStudents);
        onImport(newStudents);
        setUploading(false);
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          startUpload();
        }}
        onClick={startUpload}
        className={`glass flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-12 text-center transition ${
          dragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50"
        }`}
      >
        <div className="gradient-primary grid h-14 w-14 place-items-center rounded-2xl shadow-lg shadow-primary/30">
          <Upload className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold">Excel yoki CSV formatidagi talabalar ro'yxatini shu yerga yuklang</p>
          <p className="text-sm text-muted-foreground">yoki kompyuterdan tanlash uchun bosing (simulyatsiya qilish uchun)</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" /> Qo'llab-quvvatlanadi: .xlsx, .csv
        </div>
      </div>

      {(uploading || progress > 0) && (
        <div className="glass rounded-3xl p-5 animate-fade-up">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{uploading ? "Talabalar ro'yxati yuklanmoqda (students.xlsx)…" : "Muvaffaqiyatli yuklandi"}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {imported.length > 0 && (
        <div className="glass rounded-3xl p-6 animate-fade-up">
          <div className="mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Yuklangan talabalar ro'yxati ({imported.length})</h3>
            <Badge variant="outline" className="ml-auto">Jami talabalar soni: {students.length}</Badge>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Boshlang'ich hisob ma'lumotlari: <strong>Login</strong> = telefon raqami, <strong>Parol</strong> = tug'ilgan kuni (KUNOYIL formatida)
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ism-familiya</TableHead>
                  <TableHead>Guruh</TableHead>
                  <TableHead>Login (Telefon)</TableHead>
                  <TableHead>Boshlang'ich parol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imported.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.group}</TableCell>
                    <TableCell className="font-mono text-xs">{s.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{s.dob}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  const { students, orgs } = useIms();
  const [group, setGroup] = useState<string>("all");
  const [org, setOrg] = useState<string>("all");
  const groups = Array.from(new Set(students.map((s) => s.group)));
  const filtered = students.filter(
    (s) => (group === "all" || s.group === group) && (org === "all" || s.organizationId === org),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="glass rounded-3xl p-6">
        <h3 className="mb-4 text-base font-semibold">Filtrlar</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Guruh</label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha guruhlar</SelectItem>
                {groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Tashkilot</label>
            <Select value={org} onValueChange={setOrg}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha tashkilotlar</SelectItem>
                {orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="gradient-primary mt-2 w-full text-white"
            onClick={() => toast.success(`Hisobot eksport qilindi (${filtered.length} talaba)`)}
          >
            <Download className="mr-2 h-4 w-4" /> Hisobotni yuklab olish
          </Button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Hisobot ko'rinishi</h3>
          <Badge variant="outline">PDF / XLSX</Badge>
        </div>
        <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-inner">
          <div className="mb-4 border-b pb-3">
            <p className="text-xs uppercase tracking-widest text-slate-500">Talabalar amaliyoti monitoring tizimi</p>
            <h2 className="text-xl font-bold">Davomat va natijalar hisoboti</h2>
            <p className="text-xs text-slate-500">Yaratilgan vaqti: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-2">Talaba</th>
                  <th className="pb-2">Guruh</th>
                  <th className="pb-2">Tashkilot</th>
                  <th className="pb-2">Baho (Reyting)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{s.name}</td>
                    <td className="py-2">{s.group}</td>
                    <td className="py-2">{orgs.find((o) => o.id === s.organizationId)?.name}</td>
                    <td className="py-2">{s.rating ? `${s.rating}/5` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Filtrga mos keladigan ma'lumot topilmadi.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function IconsaxLogout({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17.44 15.37C17.25 15.37 17.06 15.3 16.91 15.15C16.62 14.86 16.62 14.38 16.91 14.09L18.75 12.25H9.75C9.34 12.25 9 11.91 9 11.5C9 11.09 9.34 10.75 9.75 10.75H18.75L16.91 8.91C16.62 8.62 16.62 8.14 16.91 7.85C17.2 7.56 17.68 7.56 17.97 7.85L20.81 10.69C21.26 11.14 21.26 11.86 20.81 12.31L17.97 15.15C17.82 15.3 17.63 15.37 17.44 15.37Z"
        fill="currentColor"
      />
      <path
        d="M12 21.75H6.75C4.68 21.75 3 20.07 3 18V6C3 3.93 4.68 2.25 6.75 2.25H12C12.41 2.25 12.75 2.59 12.75 3C12.75 3.41 12.41 3.75 12 3.75H6.75C5.51 3.75 4.5 4.76 4.5 6V18C4.5 19.24 5.51 20.25 6.75 20.25H12C12.41 20.25 12.75 20.59 12.75 21C12.75 21.41 12.41 21.75 12 21.75Z"
        fill="currentColor"
      />
    </svg>
  );
}