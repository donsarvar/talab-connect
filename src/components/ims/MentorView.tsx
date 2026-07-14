import { useMemo, useState } from "react";
import { Check, Star, Users, X, ClipboardCheck, Clock, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useIms } from "./store";

export function MentorView({ onLogout }: { onLogout?: () => void }) {
  const { mentors, currentMentorId, students, logs, orgs, updateLog, setStudentEvaluation, lang } = useIms();
  const mentor = mentors.find((m) => m.id === currentMentorId) ?? mentors[0];
  const org = orgs.find((o) => o.id === mentor.organizationId);
  const myStudents = students.filter((s) => mentor.studentIds.includes(s.id));
  const [selectedId, setSelectedId] = useState<string>(myStudents[0]?.id ?? "");
  const [rejectLog, setRejectLog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const selected = myStudents.find((s) => s.id === selectedId);
  const selectedLogs = useMemo(
    () => logs.filter((l) => l.studentId === selectedId).sort((a, b) => b.date.localeCompare(a.date)),
    [logs, selectedId],
  );

  const todayISO = new Date().toISOString().slice(0, 10);
  const presentToday = myStudents.filter((s) =>
    logs.some((l) => l.studentId === s.id && l.date === todayISO && l.attendance === "present"),
  ).length;
  const pending = logs.filter((l) => mentor.studentIds.includes(l.studentId) && l.status === "pending").length;

  const [rating, setRating] = useState<number[]>([selected?.rating ?? 4]);
  const [feedback, setFeedback] = useState<string>(selected?.feedback ?? "");

  const selectStudent = (id: string) => {
    setSelectedId(id);
    const s = myStudents.find((x) => x.id === id);
    setRating([s?.rating ?? 4]);
    setFeedback(s?.feedback ?? "");
  };

  const getRoleLabel = () => {
    if (lang === "ru") return "Руководитель";
    if (lang === "en") return "Mentor";
    return "Rahbar (Mentor)";
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
              {mentor.avatar}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                {mentor.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-slate-500">
                <span>{lang === "uz" ? "Tashkilot rahbari" : lang === "ru" ? "Руководитель организации" : "Organization Mentor"} · {org?.name}</span>
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
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop" 
                  alt={mentor.name}
                  className="h-6.5 w-6.5 rounded-full object-cover border border-slate-100 shadow-xs"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-extrabold text-slate-800 leading-none">{mentor.name}</p>
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

        {/* Stat cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label={lang === "uz" ? "Jami talabalar" : lang === "ru" ? "Всего студентов" : "Total Students"} value={myStudents.length} Icon={Users} tint="primary" />
          <StatCard label={lang === "uz" ? "Bugun kelganlar" : lang === "ru" ? "Пришли сегодня" : "Present Today"} value={presentToday} Icon={ClipboardCheck} tint="emerald" />
          <StatCard label={lang === "uz" ? "Tasdiqlash kutilmoqda" : lang === "ru" ? "Ожидают подтверждения" : "Pending Approval"} value={pending} Icon={Clock} tint="amber" />
        </section>

        {/* Content grid */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {/* Student list */}
          <div className="bg-white/80 border border-slate-150/60 rounded-[28px] p-4 shadow-xl shadow-slate-100/50 backdrop-blur-md">
            <h2 className="mb-3 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "uz" ? "Biriktirilgan talabalar" : lang === "ru" ? "Прикрепленные студенты" : "Assigned Students"}</h2>
            <div className="space-y-1.5">
              {myStudents.map((s) => {
                const present = logs.some(
                  (l) => l.studentId === s.id && l.date === todayISO && l.attendance === "present",
                );
                const pendingCount = logs.filter((l) => l.studentId === s.id && l.status === "pending").length;
                const active = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    onClick={() => selectStudent(s.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 ${
                      active ? "bg-primary/10 border border-primary/15 shadow-sm" : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600">
                      {s.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{s.name}</p>
                      <p className="truncate text-xs font-semibold text-slate-500 mt-0.5">{s.group}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`h-2 w-2 rounded-full ${present ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                      {pendingCount > 0 && (
                        <Badge variant="outline" className="bg-amber-50 border-amber-200 px-1.5 py-0 text-[10px] text-amber-700 font-bold rounded-full">
                          {pendingCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div className="space-y-6">
            {selected && (
              <>
                <div className="bg-white/80 border border-slate-150/60 rounded-[28px] p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md animate-fade-up">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="gradient-primary grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white shadow-md shadow-primary/20">
                        {selected.avatar}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold text-slate-800 leading-tight">{selected.name}</h3>
                        <p className="truncate text-xs font-semibold text-slate-500 mt-1">
                          {selected.group} · {selected.phone}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        selectedLogs
                          .filter((l) => l.status === "pending")
                          .forEach((l) => updateLog(l.id, { status: "approved" }));
                        toast.success(lang === "uz" ? "Haftalik hisobot tasdiqlandi" : lang === "ru" ? "Еженедельный отчет подтвержден" : "Weekly report approved");
                      }}
                      className="gradient-primary text-white text-xs font-bold rounded-[14px] h-10 shadow-md shadow-primary/20 hover:shadow-lg active:scale-95 transition-all"
                    >
                      <Check className="mr-1.5 h-4 w-4" /> {lang === "uz" ? "Haftalik hisobotni tasdiqlash" : lang === "ru" ? "Подтвердить еженедельный отчет" : "Approve Weekly Report"}
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {selectedLogs.slice(0, 7).map((l) => (
                      <div key={l.id} className="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-xs transition-all hover:bg-white hover:shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg px-2 py-0.5">{l.date}</Badge>
                            {l.checkIn ? (
                              <span className="text-xs font-semibold text-slate-500">
                                {l.checkIn} – {l.checkOut ?? "…"}
                              </span>
                            ) : (
                              <Badge variant="outline" className="bg-rose-50 border-rose-100 text-rose-700 font-bold text-[10px] rounded-lg px-2 py-0.5">
                                {lang === "uz" ? "Kelmagan" : lang === "ru" ? "Не пришел" : "Absent"}
                              </Badge>
                            )}
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
                            {l.status === "approved"
                              ? (lang === "uz" ? "Tasdiqlangan" : lang === "ru" ? "Подтверждено" : "Approved")
                              : l.status === "rejected"
                                ? (lang === "uz" ? "Rad etilgan" : lang === "ru" ? "Отклонено" : "Rejected")
                                : (lang === "uz" ? "Kutilmoqda" : lang === "ru" ? "В ожидании" : "Pending")}
                          </Badge>
                        </div>
                        {l.report && <p className="mt-2 text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">{l.report}</p>}
                        {l.rejectionReason && (
                          <p className="mt-2 text-[11px] font-bold text-rose-600 bg-rose-50/30 p-2 rounded-lg border border-rose-100/40">
                            {lang === "uz" ? "Rad etilganlik sababi" : lang === "ru" ? "Причина отклонения" : "Rejection reason"}: {l.rejectionReason}
                          </p>
                        )}
                        {l.status === "pending" && l.report && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl px-3 py-1.5 shadow-sm active:scale-95 transition-all"
                              onClick={() => {
                                updateLog(l.id, { status: "approved" });
                                toast.success(lang === "uz" ? "Kunlik hisobot tasdiqlandi" : lang === "ru" ? "Отчет подтвержден" : "Daily report approved");
                              }}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" /> {lang === "uz" ? "Tasdiqlash" : lang === "ru" ? "Подтвердить" : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl px-3 py-1.5 shadow-sm active:scale-95 transition-all"
                              onClick={() => {
                                setRejectLog(l.id);
                                setRejectReason("");
                              }}
                            >
                              <X className="mr-1 h-3.5 w-3.5" /> {lang === "uz" ? "Rad etish" : lang === "ru" ? "Отклонить" : "Reject"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evaluation */}
                <div className="bg-white/80 border border-slate-150/60 rounded-[28px] p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md animate-fade-up">
                  <h3 className="mb-4 text-sm font-bold text-slate-800 tracking-tight">{lang === "uz" ? "Yakuniy baholash" : lang === "ru" ? "Итоговая оценка" : "Final Evaluation"}</h3>
                  <div className="mb-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "uz" ? "Baho (Reyting)" : lang === "ru" ? "Оценка (Рейтинг)" : "Rating"}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${
                              n <= rating[0] ? "fill-amber-400 text-amber-400" : "text-slate-350"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-bold text-slate-700">{rating[0]}/5</span>
                      </div>
                    </div>
                    <Slider min={1} max={5} step={1} value={rating} onValueChange={setRating} className="py-2" />
                  </div>
                  <Textarea
                    placeholder={lang === "uz" ? "Talaba haqida taqriz/fikr-mulohaza yozing…" : lang === "ru" ? "Напишите отзыв о студенте…" : "Write feedback about the student..."}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[100px] rounded-2xl border-slate-200 text-xs font-semibold focus-visible:ring-primary focus-visible:border-primary p-4"
                  />
                  <Button
                    className="gradient-primary mt-3 h-11 w-full text-white text-xs font-bold rounded-[14px] shadow-md shadow-primary/20 hover:shadow-lg active:scale-95 transition-all"
                    onClick={() => {
                      setStudentEvaluation(selected.id, rating[0], feedback);
                      toast.success(lang === "uz" ? "Baholash muvaffaqiyatli saqlandi" : lang === "ru" ? "Оценка успешно сохранена" : "Evaluation saved successfully");
                    }}
                  >
                    {lang === "uz" ? "Bahoni saqlash" : lang === "ru" ? "Сохранить оценку" : "Save Evaluation"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <Dialog open={!!rejectLog} onOpenChange={(o) => !o && setRejectLog(null)}>
        <DialogContent className="rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">{lang === "uz" ? "Kunlik hisobotni rad etish" : lang === "ru" ? "Отклонение отчета" : "Reject Daily Report"}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={lang === "uz" ? "Rad etish sababini kiriting…" : lang === "ru" ? "Введите причину отклонения…" : "Enter rejection reason..."}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[120px] rounded-2xl border-slate-200 text-xs font-semibold focus-visible:ring-primary p-4"
          />
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setRejectLog(null)} className="rounded-xl font-bold text-xs">
              {lang === "uz" ? "Bekor qilish" : lang === "ru" ? "Отмена" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm"
              onClick={() => {
                if (!rejectReason.trim()) return toast.error(lang === "uz" ? "Iltimos, rad etish sababini kiriting" : lang === "ru" ? "Пожалуйста, введите причину" : "Please enter reason");
                updateLog(rejectLog!, { status: "rejected", rejectionReason: rejectReason });
                setRejectLog(null);
                toast.success(lang === "uz" ? "Hisobot rad etildi" : lang === "ru" ? "Отчет отклонен" : "Report rejected");
              }}
            >
              {lang === "uz" ? "Rad etishni tasdiqlash" : lang === "ru" ? "Подтвердить отклонение" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  tint,
}: {
  label: string;
  value: number;
  Icon: typeof Users;
  tint: "primary" | "emerald" | "amber";
}) {
  const tintClass =
    tint === "primary"
      ? "bg-primary/5 text-primary border border-primary/10"
      : tint === "emerald"
        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
        : "bg-amber-50 text-amber-600 border border-amber-100";
  return (
    <div className="bg-white/80 border border-slate-150/60 flex items-center gap-4 rounded-3xl p-5 shadow-xl shadow-slate-100/50 backdrop-blur-md animate-fade-up">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tintClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800 mt-1">{value}</p>
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