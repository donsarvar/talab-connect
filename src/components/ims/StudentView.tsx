import { useMemo, useState } from "react";
import {
  Bell,
  Calendar as CalendarIcon,
  Check,
  ClipboardList,
  QrCode,
  Sparkles,
  X,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { generateAIReport } from "@/lib/ims-data";
import { useIms } from "./store";

const SUGGESTIONS = [
  "Kod yozish va xatolarni tuzatish",
  "Tizimni test qilish va tekshirish",
  "Hujjatlar va yo'riqnomalarni o'rganish",
  "Mentor topshiriqlarini bajarish",
  "Jamoaviy yig'ilishda qatnashish"
];

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
    if (!keywords.trim()) {
      toast.error("Iltimos, kalit so'zlarni kiriting yoki quyidagi chiplardan tanlang");
      return;
    }
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
    toast.success("Kunlik hisobot topshirildi");
    setKeywords("");
    setReport("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setKeywords((prev) => {
      if (!prev.trim()) return suggestion;
      const list = prev.split(",").map(k => k.trim());
      if (list.includes(suggestion.toLowerCase()) || list.includes(suggestion)) return prev;
      return `${prev}, ${suggestion.toLowerCase()}`;
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-white text-foreground overflow-x-hidden pb-8">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 z-0 opacity-35 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.1),transparent_70%)] blur-[70px]" />
        <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06),transparent_70%)] blur-[70px]" />
      </div>

      <div className="relative z-10 w-full px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        {/* Header Card Frame */}
        <header className="bg-white/80 border border-slate-150/60 rounded-3xl p-4 shadow-xl shadow-slate-100/50 backdrop-blur-md flex items-center justify-between w-full mb-6">
          {/* Left Side: Brand & Welcome */}
          <div className="flex items-center gap-3">
            <div className="gradient-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-md shadow-primary/25">
              {student.avatar}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                Xush kelibsiz, {student.name}!
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-slate-500">
                <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/5 font-bold px-1.5 py-0 rounded text-[9px] border border-primary/10">
                  {student.group}
                </Badge>
                <span>{org?.name} korxonasida</span>
              </div>
            </div>
          </div>

          {/* Right Side: Bell & Profile Dropdown Frame */}
          <div className="flex items-center gap-3">
            {/* Bell Notification */}
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-500 shadow-xs hover:bg-slate-50 active:scale-95 transition-all">
              <Bell className="h-4 w-4" />
            </button>

            {/* Separate Profile Frame */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 border border-slate-150 bg-white rounded-xl shadow-xs hover:border-slate-200 transition-all cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop" 
                alt={student.name}
                className="h-6.5 w-6.5 rounded-full object-cover border border-slate-100 shadow-xs"
              />
              <div className="hidden sm:block text-left">
                <p className="text-[11px] font-extrabold text-slate-800 leading-none">{student.name}</p>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Talaba</p>
              </div>
              <span className="text-slate-400 text-[8px] ml-0.5">▼</span>
            </div>
          </div>
        </header>

        {/* Navigation and Content Container */}
        <Tabs defaultValue="home" className="w-full pt-6">
          <div className="flex justify-start mb-6">
            <TabsList className="bg-slate-50/80 p-1 rounded-xl border border-slate-100/50 grid grid-cols-2 w-full max-w-[320px]">
              <TabsTrigger
                value="home"
                className="rounded-lg py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all"
              >
                Bosh sahifa
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-lg py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all"
              >
                Amaliyot tarixi
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="home" className="space-y-6 pt-2 outline-none w-full">
            {/* Top Card: QR Attendance */}
            <section className="bg-white/80 border border-slate-150/60 rounded-[28px] p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md animate-fade-up w-full">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Bugungi davomat</h2>
                {todayLog?.checkIn && (
                  <Badge className="gradient-primary text-white border-0 font-bold px-2.5 py-0.5 rounded-full text-xs">
                    Kelgan vaqti: {todayLog.checkIn}
                  </Badge>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="group relative flex h-56 w-full flex-col items-center justify-center overflow-hidden rounded-2xl gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.99] transition-all duration-300"
                >
                  {scanning ? (
                    <>
                      <div className="absolute inset-5 rounded-xl border-2 border-white/20" />
                      <div className="absolute inset-5 overflow-hidden rounded-xl">
                        <div className="absolute inset-0 origin-center animate-radar">
                          <div className="mx-auto h-1/2 w-0.5 origin-bottom bg-gradient-to-t from-white to-transparent" />
                        </div>
                      </div>
                      <QrCode className="relative z-10 h-16 w-16 animate-pulse" />
                      <p className="relative z-10 mt-4 text-xs font-semibold tracking-wide">QR-kod skanerlanmoqda…</p>
                    </>
                  ) : justCheckedIn ? (
                    <>
                      <div className="animate-check-pop grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                        <Check className="h-9 w-9 text-white" strokeWidth={3} />
                      </div>
                      <p className="mt-4 text-lg font-extrabold tracking-tight">Davomat belgilandi</p>
                      <p className="text-xs font-semibold opacity-90 mt-1">Vaqt: {justCheckedIn.time}</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-16 w-16 transition-transform duration-300 group-hover:scale-105" />
                      <p className="mt-4 text-lg font-extrabold tracking-tight">QR-kodni skanerlash</p>
                      <p className="text-xs font-semibold opacity-90 mt-1">Davomatni belgilash uchun bosing</p>
                    </>
                  )}
                </button>

                {!scanning && !justCheckedIn && !todayLog?.checkIn && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScan();
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/25 active:scale-95 transition-all shadow-sm"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Kamera orqali</span>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Bottom Card: AI Log Helper */}
            <section className="bg-white/80 border border-slate-150/60 rounded-[28px] p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md animate-fade-up w-full">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Kunlik kundalik — AI Yordamchi</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kalit so'zlar orqali AI sizga tez va aniq hisobot yozib beradi.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-3">
                {/* Input and generate row */}
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex h-11 items-center rounded-[14px] border border-slate-200 bg-white px-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 w-full">
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="Masalan: kod yozdim, xatolarni to'g'riladim"
                        className="h-full w-full text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none bg-transparent min-w-0"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="gradient-primary h-11 px-5 rounded-[14px] text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.99] transition-all shrink-0"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {generating ? "Tayyorlanmoqda…" : "AI yordamida yozish"}
                  </Button>
                </div>

                {/* Suggestion Chips */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mavzular bo'yicha shablonlar</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-[11px] px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/80 text-slate-600 hover:bg-primary/5 hover:border-primary/20 hover:text-primary active:scale-95 transition-all font-semibold"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {generating && (
                  <div className="mt-3 space-y-2 pt-2 animate-pulse">
                    <div className="h-3 w-full rounded-full bg-slate-100" />
                    <div className="h-3 w-11/12 rounded-full bg-slate-100" />
                    <div className="h-3 w-3/4 rounded-full bg-slate-100" />
                  </div>
                )}

                {!generating && report && (
                  <div className="pt-2 space-y-3 animate-fade-up">
                    <Textarea
                      value={report}
                      onChange={(e) => setReport(e.target.value)}
                      placeholder="AI yaratgan hisobot bu yerda ko'rinadi..."
                      className="min-h-[140px] rounded-2xl border-slate-200 text-xs font-semibold leading-relaxed focus-visible:ring-primary focus-visible:border-primary p-4"
                    />
                    <Button 
                      onClick={handleSubmit} 
                      className="gradient-primary h-11 w-full rounded-[14px] text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.99] transition-all"
                    >
                      Kunlik hisobotni jo'natish
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="pt-2 outline-none">
            <section className="bg-white/80 border border-slate-150/60 rounded-[28px] p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md animate-fade-up w-full">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <CalendarIcon className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Davomat tarixi</h2>
              </div>

              <div className="space-y-2.5">
                {myLogs.map((l) => (
                  <div key={l.id} className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-xs transition-all hover:bg-white hover:shadow-md hover:shadow-slate-100/80">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                        l.attendance === "present"
                          ? "bg-emerald-50/50 border-emerald-100 text-emerald-600"
                          : "bg-rose-50/50 border-rose-100 text-rose-600"
                      }`}
                    >
                      {l.attendance === "present" ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <X className="h-5 w-5" strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800">{l.date}</p>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        {l.checkIn ? `${l.checkIn} – ${l.checkOut ?? "…"}` : "Kelmagan"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                        l.status === "approved"
                          ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                          : l.status === "rejected"
                            ? "bg-rose-50 border-rose-150 text-rose-700"
                            : "bg-amber-50 border-amber-150 text-amber-700"
                      }`}
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
    </div>
  );
}