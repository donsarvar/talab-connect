import { useMemo, useState } from "react";
import {
  Bell,
  Calendar as CalendarIcon,
  Check,
  ClipboardList,
  QrCode,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { generateAIReport } from "@/lib/ims-data";
import { useIms } from "./store";

export function StudentView() {
  return <StudentApp />;
}


function StudentApp() {
  const { students, currentStudentId, logs, orgs, addLog } = useIms();
  const student = students.find((s) => s.id === currentStudentId)!;
  const org = orgs.find((o) => o.id === student.organizationId);
  const myLogs = useMemo(
    () => logs.filter((l) => l.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date)),
    [logs, student.id],
  );

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = myLogs.find((l) => l.date === todayISO);

  const [scanning, setScanning] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState<{ time: string } | null>(null);
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState("");

  const handleScan = () => {
    if (todayLog?.checkIn) {
      toast.info("Bugun davomatdan o'tgansiz");
      return;
    }
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      addLog({
        id: `l-${Date.now()}`,
        studentId: student.id,
        date: todayISO,
        checkIn: time,
        attendance: "present",
        status: "pending",
      });
      setJustCheckedIn({ time });
      toast.success(`Kelgan vaqtingiz belgilandi: ${time}`);
    }, 1800);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setReport(generateAIReport(keywords));
      setGenerating(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!report.trim()) {
      toast.error("Iltimos, avval hisobot yozing yoki AI orqali yarating");
      return;
    }
    if (todayLog) {
      // update log status
    }
    toast.success("Kunlik hisobot topshirildi");
    setKeywords("");
    setReport("");
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md gradient-surface pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 glass px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="gradient-primary grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white">
            {student.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">Assalomu alaykum</p>
            <h1 className="truncate text-lg font-bold">{student.name}</h1>
          </div>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <Bell className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Badge variant="secondary" className="rounded-full">{student.group}</Badge>
          <span className="text-muted-foreground">{org?.name} korxonasida</span>
        </div>
      </header>

      <Tabs defaultValue="home" className="px-4 pt-4">
        <TabsList className="glass grid h-11 w-full grid-cols-2 rounded-full p-1">
          <TabsTrigger value="home" className="rounded-full">Bosh sahifa</TabsTrigger>
          <TabsTrigger value="history" className="rounded-full">Amaliyot tarixi</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-4 pt-4">
          {/* Check-in card */}
          <section className="glass rounded-3xl p-5 shadow-lg shadow-primary/5 animate-fade-up">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Bugungi davomat</h2>
              {todayLog?.checkIn && (
                <Badge className="gradient-primary text-white">Kelgan vaqti: {todayLog.checkIn}</Badge>
              )}
            </div>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="group relative flex h-52 w-full flex-col items-center justify-center overflow-hidden rounded-2xl gradient-primary text-white shadow-lg shadow-primary/30 transition active:scale-[0.98]"
            >
              {scanning ? (
                <>
                  <div className="absolute inset-6 rounded-2xl border-2 border-white/40" />
                  <div className="absolute inset-6 overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 origin-center animate-radar">
                      <div className="mx-auto h-1/2 w-1 origin-bottom bg-gradient-to-t from-white to-transparent" />
                    </div>
                  </div>
                  <QrCode className="relative z-10 h-14 w-14 animate-pulse" />
                  <p className="relative z-10 mt-3 text-sm font-medium">QR-kod skanerlanmoqda…</p>
                </>
              ) : justCheckedIn ? (
                <>
                  <div className="animate-check-pop grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur">
                    <Check className="h-10 w-10" strokeWidth={3} />
                  </div>
                  <p className="mt-3 text-lg font-bold">Davomat belgilandi</p>
                  <p className="text-sm opacity-90">Vaqt: {justCheckedIn.time}</p>
                </>
              ) : (
                <>
                  <QrCode className="h-14 w-14 transition-transform group-hover:scale-110" />
                  <p className="mt-3 text-lg font-bold">QR-kodni skanerlash</p>
                  <p className="text-sm opacity-90">Davomatni belgilash uchun bosing</p>
                </>
              )}
            </button>
          </section>

          {/* AI Daily Log */}
          <section className="glass rounded-3xl p-5 shadow-lg shadow-primary/5 animate-fade-up">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Kunlik kundalik — AI Yordamchi</h2>
            </div>
            <Input
              placeholder="Kalit so'zlar: server sozlash, tarmoq tekshirish"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="mb-2 rounded-xl"
            />
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              variant="secondary"
              className="w-full rounded-xl"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? "Tayyorlanmoqda…" : "AI yordamida yozish"}
            </Button>

            {generating && (
              <div className="mt-3 space-y-2">
                <div className="shimmer h-3 w-full rounded-full bg-secondary" />
                <div className="shimmer h-3 w-11/12 rounded-full bg-secondary" />
                <div className="shimmer h-3 w-3/4 rounded-full bg-secondary" />
              </div>
            )}

            {!generating && report && (
              <div className="mt-3 animate-fade-up">
                <Textarea
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  className="min-h-[120px] rounded-xl"
                />
                <Button onClick={handleSubmit} className="gradient-primary mt-3 w-full rounded-xl text-white">
                  Kunlik hisobotni jo'natish
                </Button>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <section className="glass rounded-3xl p-4 animate-fade-up">
            <div className="mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Davomat tarixi</h2>
            </div>
            <div className="space-y-2">
              {myLogs.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                      l.attendance === "present"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {l.attendance === "present" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.date}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.checkIn ? `${l.checkIn} – ${l.checkOut ?? "…"}` : "Kelmagan"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      l.status === "approved"
                        ? "border-emerald-500/40 text-emerald-600 font-medium"
                        : l.status === "rejected"
                          ? "border-destructive/40 text-destructive font-medium"
                          : "border-amber-500/40 text-amber-600 font-medium"
                    }
                  >
                    {l.status === "approved" ? "Tasdiqlangan" : l.status === "rejected" ? "Rad etilgan" : "Kutilmoqda"}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}