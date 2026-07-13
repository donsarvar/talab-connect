import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  INITIAL_ALERTS,
  INITIAL_LOGS,
  MENTORS,
  ORGS,
  STUDENTS,
  type DailyLog,
  type FraudAlert,
  type Mentor,
  type Organization,
  type Role,
  type Student,
} from "@/lib/ims-data";

interface ImsState {
  role: Role;
  setRole: (r: Role) => void;
  currentStudentId: string;
  setCurrentStudentId: (id: string) => void;
  currentMentorId: string;
  setCurrentMentorId: (id: string) => void;
  students: Student[];
  mentors: Mentor[];
  orgs: Organization[];
  logs: DailyLog[];
  alerts: FraudAlert[];
  addStudents: (s: Student[]) => void;
  addLog: (log: DailyLog) => void;
  updateLog: (id: string, patch: Partial<DailyLog>) => void;
  setStudentEvaluation: (id: string, rating: number, feedback: string) => void;
  assignStudent: (studentId: string, orgId: string, mentorId: string) => void;
  dismissAlert: (id: string) => void;
  lang: "uz" | "ru" | "en";
  setLang: (lang: "uz" | "ru" | "en") => void;
}

const ImsCtx = createContext<ImsState | null>(null);

export function ImsProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("student");
  const [currentStudentId, setCurrentStudentId] = useState("s-1");
  const [currentMentorId, setCurrentMentorId] = useState("m-1");
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [mentors, setMentors] = useState<Mentor[]>(MENTORS);
  const [logs, setLogs] = useState<DailyLog[]>(INITIAL_LOGS);
  const [alerts, setAlerts] = useState<FraudAlert[]>(INITIAL_ALERTS);
  const [lang, setLang] = useState<"uz" | "ru" | "en">("uz");

  const addStudents = useCallback((s: Student[]) => {
    setStudents((prev) => [...prev, ...s]);
  }, []);
  const addLog = useCallback((log: DailyLog) => setLogs((p) => [log, ...p]), []);
  const updateLog = useCallback((id: string, patch: Partial<DailyLog>) => {
    setLogs((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);
  const setStudentEvaluation = useCallback((id: string, rating: number, feedback: string) => {
    setStudents((p) => p.map((s) => (s.id === id ? { ...s, rating, feedback } : s)));
  }, []);
  const assignStudent = useCallback((studentId: string, orgId: string, mentorId: string) => {
    setStudents((p) => p.map((s) => (s.id === studentId ? { ...s, organizationId: orgId, mentorId } : s)));
    setMentors((prev) =>
      prev.map((m) => ({
        ...m,
        studentIds: m.id === mentorId
          ? Array.from(new Set([...m.studentIds, studentId]))
          : m.studentIds.filter((id) => id !== studentId),
      })),
    );
  }, []);
  const dismissAlert = useCallback((id: string) => setAlerts((p) => p.filter((a) => a.id !== id)), []);

  const value = useMemo<ImsState>(
    () => ({
      role,
      setRole,
      currentStudentId,
      setCurrentStudentId,
      currentMentorId,
      setCurrentMentorId,
      students,
      mentors,
      orgs: ORGS,
      logs,
      alerts,
      addStudents,
      addLog,
      updateLog,
      setStudentEvaluation,
      assignStudent,
      dismissAlert,
      lang,
      setLang,
    }),
    [role, currentStudentId, currentMentorId, students, mentors, logs, alerts, addStudents, addLog, updateLog, setStudentEvaluation, assignStudent, dismissAlert, lang],
  );

  return <ImsCtx.Provider value={value}>{children}</ImsCtx.Provider>;
}

export function useIms() {
  const ctx = useContext(ImsCtx);
  if (!ctx) throw new Error("useIms must be used within ImsProvider");
  return ctx;
}