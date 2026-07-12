import { useMemo, useState } from "react";
import { Check, Star, Users, X, ClipboardCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useIms } from "./store";

export function MentorView() {
  const { mentors, currentMentorId, students, logs, orgs, updateLog, setStudentEvaluation } = useIms();
  const mentor = mentors.find((m) => m.id === currentMentorId) ?? mentors[0];
  const org = orgs.find((o) => o.id === mentor.organizationId);
  const myStudents = students.filter((s) => mentor.studentIds.includes(s.id));
  const [selectedId, setSelectedId] = useState<string>(myStudents[0]?.id ?? "");
  const [rejectLog, setRejectLog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  return (
    <div className="min-h-screen gradient-surface">
      <header className="border-b border-border/60 bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <div className="gradient-primary grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white">
            {mentor.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Mentor · {org?.name}</p>
            <h1 className="truncate text-lg font-bold">{mentor.name}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stat cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Students" value={myStudents.length} Icon={Users} tint="primary" />
          <StatCard label="Present Today" value={presentToday} Icon={ClipboardCheck} tint="emerald" />
          <StatCard label="Pending Approvals" value={pending} Icon={Clock} tint="amber" />
        </section>

        {/* Content grid */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {/* Student list */}
          <div className="glass rounded-3xl p-4">
            <h2 className="mb-3 px-2 text-sm font-semibold text-muted-foreground">Assigned Students</h2>
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
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      active ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {s.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.group}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`h-2 w-2 rounded-full ${present ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                      {pendingCount > 0 && (
                        <Badge variant="outline" className="border-amber-500/40 px-1.5 py-0 text-[10px] text-amber-600">
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
                <div className="glass rounded-3xl p-6 animate-fade-up">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="gradient-primary grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white">
                        {selected.avatar}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">{selected.name}</h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {selected.group} · {selected.phone}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        selectedLogs
                          .filter((l) => l.status === "pending")
                          .forEach((l) => updateLog(l.id, { status: "approved" }));
                        toast.success("Weekly log approved");
                      }}
                      className="gradient-primary text-white"
                    >
                      <Check className="mr-1.5 h-4 w-4" /> Approve Weekly Log
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {selectedLogs.slice(0, 7).map((l) => (
                      <div key={l.id} className="rounded-2xl border border-border/60 bg-card/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{l.date}</Badge>
                            {l.checkIn ? (
                              <span className="text-xs text-muted-foreground">
                                {l.checkIn} – {l.checkOut ?? "…"}
                              </span>
                            ) : (
                              <Badge variant="outline" className="border-destructive/40 text-destructive">
                                Absent
                              </Badge>
                            )}
                          </div>
                          <Badge
                            className={
                              l.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15"
                                : l.status === "rejected"
                                  ? "bg-destructive/15 text-destructive hover:bg-destructive/15"
                                  : "bg-amber-500/15 text-amber-600 hover:bg-amber-500/15"
                            }
                          >
                            {l.status}
                          </Badge>
                        </div>
                        {l.report && <p className="mt-2 text-sm text-foreground/90">{l.report}</p>}
                        {l.rejectionReason && (
                          <p className="mt-1 text-xs text-destructive">Rejected: {l.rejectionReason}</p>
                        )}
                        {l.status === "pending" && l.report && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-500 text-white hover:bg-emerald-600"
                              onClick={() => {
                                updateLog(l.id, { status: "approved" });
                                toast.success("Log approved");
                              }}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setRejectLog(l.id);
                                setRejectReason("");
                              }}
                            >
                              <X className="mr-1 h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evaluation */}
                <div className="glass rounded-3xl p-6 animate-fade-up">
                  <h3 className="mb-4 text-base font-semibold">Final Evaluation</h3>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${
                              n <= rating[0] ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-bold">{rating[0]}/5</span>
                      </div>
                    </div>
                    <Slider min={1} max={5} step={1} value={rating} onValueChange={setRating} />
                  </div>
                  <Textarea
                    placeholder="Feedback for the student…"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[100px] rounded-xl"
                  />
                  <Button
                    className="gradient-primary mt-3 w-full text-white"
                    onClick={() => {
                      setStudentEvaluation(selected.id, rating[0], feedback);
                      toast.success("Evaluation saved");
                    }}
                  >
                    Save Evaluation
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Dialog open={!!rejectLog} onOpenChange={(o) => !o && setRejectLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject daily log</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectLog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rejectReason.trim()) return toast.error("Please provide a reason");
                updateLog(rejectLog!, { status: "rejected", rejectionReason: rejectReason });
                setRejectLog(null);
                toast.success("Log rejected");
              }}
            >
              Confirm Reject
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
      ? "bg-primary/15 text-primary"
      : tint === "emerald"
        ? "bg-emerald-500/15 text-emerald-600"
        : "bg-amber-500/15 text-amber-600";
  return (
    <div className="glass flex items-center gap-4 rounded-3xl p-5 animate-fade-up">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tintClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}