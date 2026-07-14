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

const DICTIONARY = {
  uz: {
    welcome: "Xush kelibsiz",
    at_org: "korxonasida",
    home_tab: "Bosh sahifa",
    history_tab: "Amaliyot tarixi",
    today_attendance: "Bugungi davomat",
    checkin_time: "Kelgan vaqti",
    scan_qr: "QR-kodni skanerlash",
    click_to_mark: "Davomatni belgilash uchun bosing",
    scanning: "QR-kod skanerlanmoqda…",
    marked: "Davomat belgilandi",
    time: "Vaqt",
    via_camera: "Kamera orqali",
    ai_title: "Kunlik kundalik — AI Yordamchi",
    ai_desc: "Kalit so'zlar orqali AI sizga tez va aniq hisobot yozib beradi.",
    placeholder: "Masalan: kod yozdim, xatolarni to'g'riladim",
    write_ai: "AI yordamida yozish",
    generating: "Tayyorlanmoqda…",
    templates_label: "Mavzular bo'yicha shablonlar",
    send_report: "Kunlik hisobotni jo'natish",
    attendance_history: "Davomat tarixi",
    absent: "Kelmagan",
    approved: "Tasdiqlangan",
    rejected: "Rad etilgan",
    pending: "Kutilmoqda",
    logout: "Chiqish",
    toast_already: "Bugun davomatdan o'tgansiz",
    toast_success: "Kelgan vaqtingiz belgilandi",
    toast_warn_report: "Iltimos, avval hisobot yozing yoki AI orqali yarating",
    toast_submitted: "Kunlik hisobot topshirildi",
    toast_input_warn: "Iltimos, kalit so'zlarni kiriting yoki quyidagi chiplardan tanlang",
    suggestions: [
      "Kod yozish va xatolarni tuzatish",
      "Tizimni test qilish va tekshirish",
      "Hujjatlar va yo'riqnomalarni o'rganish",
      "Mentor topshiriqlarini bajarish",
      "Jamoaviy yig'ilishda qatnashish"
    ]
  },
  ru: {
    welcome: "Добро пожаловать",
    at_org: "в компании",
    home_tab: "Главная",
    history_tab: "История практики",
    today_attendance: "Сегодняшняя посещаемость",
    checkin_time: "Время прихода",
    scan_qr: "Сканировать QR-код",
    click_to_mark: "Нажмите, чтобы отметить посещаемость",
    scanning: "Сканирование QR-кода…",
    marked: "Посещаемость отмечена",
    time: "Время",
    via_camera: "Через камеру",
    ai_title: "Дневник практики — AI Помощник",
    ai_desc: "ИИ быстро и точно напишет отчет по ключевым словам.",
    placeholder: "Например: писал код, исправлял ошибки",
    write_ai: "Написать с помощью ИИ",
    generating: "Генерация…",
    templates_label: "Шаблоны по темам",
    send_report: "Отправить ежедневный отчет",
    attendance_history: "История посещаемости",
    absent: "Не пришел",
    approved: "Подтверждено",
    rejected: "Отклонено",
    pending: "В ожидании",
    logout: "Выйти",
    toast_already: "Вы уже отметились сегодня",
    toast_success: "Время прихода отмечено",
    toast_warn_report: "Пожалуйста, сначала напишите отчет или создайте его с помощью ИИ",
    toast_submitted: "Ежедневный отчет отправлен",
    toast_input_warn: "Пожалуйста, введите ключевые слова или выберите шаблоны ниже",
    suggestions: [
      "Написание кода и исправление ошибок",
      "Тестирование и проверка системы",
      "Изучение документации и инструкций",
      "Выполнение заданий ментора",
      "Участие в командных обсуждениях"
    ]
  },
  en: {
    welcome: "Welcome",
    at_org: "at company",
    home_tab: "Home",
    history_tab: "Internship History",
    today_attendance: "Today's Attendance",
    checkin_time: "Check-in time",
    scan_qr: "Scan QR Code",
    click_to_mark: "Click to mark attendance",
    scanning: "Scanning QR code…",
    marked: "Attendance marked",
    time: "Time",
    via_camera: "Via camera",
    ai_title: "Daily Diary — AI Assistant",
    ai_desc: "AI will write a fast and accurate report using keywords.",
    placeholder: "Example: wrote code, fixed bugs",
    write_ai: "Write with AI",
    generating: "Generating…",
    templates_label: "Templates by topics",
    send_report: "Send daily report",
    attendance_history: "Attendance history",
    absent: "Absent",
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    logout: "Logout",
    toast_already: "You have already checked in today",
    toast_success: "Your check-in time is marked",
    toast_warn_report: "Please write a report or generate it with AI first",
    toast_submitted: "Daily report submitted",
    toast_input_warn: "Please enter keywords or select chips below",
    suggestions: [
      "Coding and bug fixing",
      "System testing and verification",
      "Studying documentation and manuals",
      "Completing mentor tasks",
      "Participating in team meetings"
    ]
  }
};

export function StudentView({ onLogout }: { onLogout?: () => void }) {
  return <StudentApp onLogout={onLogout} />;
}

function StudentApp({ onLogout }: { onLogout?: () => void }) {
  const { students, currentStudentId, logs, orgs, addLog, lang } = useIms();
  const student = students.find((s) => s.id === currentStudentId)!;
  const org = orgs.find((o) => o.id === student.organizationId);
  const myLogs = useMemo(
    () => logs.filter((l) => l.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date)),
    [logs, student.id],
  );

  const t = DICTIONARY[lang];

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = myLogs.find((l) => l.date === todayISO);

  const [scanning, setScanning] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState<{ time: string } | null>(null);
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const handleScan = () => {
    if (todayLog?.checkIn) {
      toast.info(t.toast_already);
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
      toast.success(`${t.toast_success}: ${time}`);
    }, 1800);
  };

  const handleGenerate = () => {
    if (!keywords.trim()) {
      toast.error(t.toast_input_warn);
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setReport(generateAIReport(keywords, lang));
      setGenerating(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!report.trim()) {
      toast.error(t.toast_warn_report);
      return;
    }
    toast.success(t.toast_submitted);
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
              {student.avatar}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                {t.welcome}, {student.name}!
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-slate-500">
                <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/5 font-bold px-1.5 py-0 rounded text-[9px] border border-primary/10">
                  {student.group}
                </Badge>
                <span>{org?.name} {t.at_org}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Bell & Profile Dropdown Frame */}
          <div className="flex items-center gap-3">
            {/* Bell Notification */}
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-150 bg-white text-slate-500 shadow-xs hover:bg-slate-50 active:scale-95 transition-all">
              <Bell className="h-4 w-4" />
            </button>

            {/* Separate Profile Frame Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 border border-slate-150 bg-white rounded-xl shadow-xs hover:border-slate-200 transition-all cursor-pointer select-none"
              >
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop" 
                  alt={student.name}
                  className="h-6.5 w-6.5 rounded-full object-cover border border-slate-100 shadow-xs"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-extrabold text-slate-800 leading-none">{student.name}</p>
                  <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{lang === "uz" ? "Talaba" : lang === "ru" ? "Студент" : "Student"}</p>
                </div>
                <span className="text-slate-400 text-[8px] ml-0.5">▼</span>
              </div>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-slate-150/80 bg-white p-1.5 shadow-xl shadow-slate-200/50 z-30 animate-fade-in">
                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      toast.success("Tizimdan chiqdingiz");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50/50 active:scale-95 transition-all"
                  >
                    <span className="text-sm">🚪</span>
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
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
                {t.home_tab}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-lg py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all"
              >
                {t.history_tab}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="home" className="space-y-6 pt-2 outline-none w-full">
            {/* Top Card: QR Attendance */}
            <section className="bg-white/80 border border-slate-150/60 rounded-[28px] p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md animate-fade-up w-full">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.today_attendance}</h2>
                {todayLog?.checkIn && (
                  <Badge className="gradient-primary text-white border-0 font-bold px-2.5 py-0.5 rounded-full text-xs">
                    {t.checkin_time}: {todayLog.checkIn}
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
                      <p className="relative z-10 mt-4 text-xs font-semibold tracking-wide">{t.scanning}</p>
                    </>
                  ) : justCheckedIn ? (
                    <>
                      <div className="animate-check-pop grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                        <Check className="h-9 w-9 text-white" strokeWidth={3} />
                      </div>
                      <p className="mt-4 text-lg font-extrabold tracking-tight">{t.marked}</p>
                      <p className="text-xs font-semibold opacity-90 mt-1">{t.time}: {justCheckedIn.time}</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-16 w-16 transition-transform duration-300 group-hover:scale-105" />
                      <p className="mt-4 text-lg font-extrabold tracking-tight">{t.scan_qr}</p>
                      <p className="text-xs font-semibold opacity-90 mt-1">{t.click_to_mark}</p>
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
                      <span>{t.via_camera}</span>
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
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.ai_title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.ai_desc}
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
                        placeholder={t.placeholder}
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
                    {generating ? t.generating : t.write_ai}
                  </Button>
                </div>

                {/* Suggestion Chips */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{t.templates_label}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {t.suggestions.map((suggestion) => (
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
                      placeholder="AI report..."
                      className="min-h-[140px] rounded-2xl border-slate-200 text-xs font-semibold leading-relaxed focus-visible:ring-primary focus-visible:border-primary p-4"
                    />
                    <Button 
                      onClick={handleSubmit} 
                      className="gradient-primary h-11 w-full rounded-[14px] text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.99] transition-all"
                    >
                      {t.send_report}
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
                <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.attendance_history}</h2>
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
                        {l.checkIn ? `${l.checkIn} – ${l.checkOut ?? "…"}` : t.absent}
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
                      {l.status === "approved" ? t.approved : l.status === "rejected" ? t.rejected : t.pending}
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