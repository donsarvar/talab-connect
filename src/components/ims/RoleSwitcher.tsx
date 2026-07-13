import { GraduationCap, ShieldCheck, UserCog } from "lucide-react";
import { useIms } from "./store";
import type { Role } from "@/lib/ims-data";

const ROLES: { id: Role; label: string; Icon: typeof GraduationCap }[] = [
  { id: "student", label: "Talaba", Icon: GraduationCap },
  { id: "mentor", label: "Rahbar (Mentor)", Icon: UserCog },
  { id: "admin", label: "Koordinator", Icon: ShieldCheck },
];

export function RoleSwitcher() {
  const { role, setRole } = useIms();
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
      <div className="bg-white/80 backdrop-blur-md border border-slate-150/50 flex items-center gap-1 rounded-2xl p-1.5 shadow-2xl shadow-slate-200/50">
        {ROLES.map(({ id, label, Icon }) => {
          const active = role === id;
          return (
            <button
              key={id}
              onClick={() => setRole(id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                active
                  ? "bg-white text-primary shadow-xs font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-50/50"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}