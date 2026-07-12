import { useMemo, useState } from "react";
import {
  AlertTriangle,
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

export function AdminView() {
  const { students, orgs, mentors, logs, alerts, addStudents, assignStudent, dismissAlert } = useIms();

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

  return (
    <div className="min-h-screen gradient-surface">
      <header className="border-b border-border/60 bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <div className="gradient-primary grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Coordinator Dashboard</p>
            <h1 className="truncate text-lg font-bold">Internship Management System</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview">
          <TabsList className="glass mb-6 h-11 rounded-full p-1">
            <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
            <TabsTrigger value="import" className="rounded-full">Import</TabsTrigger>
            <TabsTrigger value="assign" className="rounded-full">Assignments</TabsTrigger>
            <TabsTrigger value="fraud" className="rounded-full">Alerts</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full">Reports</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Attendance Rate" value={`${rate}%`} Icon={GaugeCircle} tint="primary" progress={rate} />
              <MetricCard label="Active Interns" value={students.length} Icon={Users} tint="emerald" />
              <MetricCard label="Host Organizations" value={orgs.length} Icon={Building2} tint="amber" />
              <MetricCard label="Fraud Alerts" value={alerts.length} Icon={AlertTriangle} tint="rose" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="glass rounded-3xl p-6 lg:col-span-2 animate-fade-up">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Attendance — last 7 days</h3>
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
                      <Bar dataKey="present" fill="oklch(0.55 0.19 275)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="absent" fill="oklch(0.7 0.2 25)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass rounded-3xl p-6 animate-fade-up">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Students per Organization</h3>
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
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Top performing organizations</h3>
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
              <h3 className="mb-4 text-base font-semibold">Assign students to organization & mentor</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Mentor</TableHead>
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
                              toast.success(`${s.name} moved`);
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
                              toast.success("Mentor updated");
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
                  No active alerts. Everything looks clean.
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
                        toast.success("Alert dismissed");
                      }}
                    >
                      Dismiss
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
      ? "bg-primary/15 text-primary"
      : tint === "emerald"
        ? "bg-emerald-500/15 text-emerald-600"
        : tint === "amber"
          ? "bg-amber-500/15 text-amber-600"
          : "bg-rose-500/15 text-rose-600";
  return (
    <div className="glass rounded-3xl p-5 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tintClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
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
          <p className="text-base font-semibold">Drop Excel or CSV file here</p>
          <p className="text-sm text-muted-foreground">or click to browse — click again to simulate an upload</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" /> Supported: .xlsx, .csv
        </div>
      </div>

      {(uploading || progress > 0) && (
        <div className="glass rounded-3xl p-5 animate-fade-up">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{uploading ? "Uploading students.xlsx…" : "Upload complete"}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {imported.length > 0 && (
        <div className="glass rounded-3xl p-6 animate-fade-up">
          <div className="mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Imported students ({imported.length})</h3>
            <Badge variant="outline" className="ml-auto">Total now: {students.length}</Badge>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Credentials: <strong>Login</strong> = phone number, <strong>Password</strong> = date of birth (DDMMYYYY)
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Login (Phone)</TableHead>
                  <TableHead>Default Password</TableHead>
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
        <h3 className="mb-4 text-base font-semibold">Filters</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Group</label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Organization</label>
            <Select value={org} onValueChange={setOrg}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All organizations</SelectItem>
                {orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="gradient-primary mt-2 w-full text-white"
            onClick={() => toast.success(`Report exported (${filtered.length} students)`)}
          >
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Report preview</h3>
          <Badge variant="outline">PDF / XLSX</Badge>
        </div>
        <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-inner">
          <div className="mb-4 border-b pb-3">
            <p className="text-xs uppercase tracking-widest text-slate-500">Internship Management System</p>
            <h2 className="text-xl font-bold">Attendance & Performance Report</h2>
            <p className="text-xs text-slate-500">Generated {new Date().toLocaleDateString()}</p>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-2">Student</th>
                <th className="pb-2">Group</th>
                <th className="pb-2">Organization</th>
                <th className="pb-2">Rating</th>
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
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No results match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}