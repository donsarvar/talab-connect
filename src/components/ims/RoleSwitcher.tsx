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
      <div className="glass flex items-center gap-1 rounded-full p-1 shadow-2xl shadow-primary/10">
        {ROLES.map(({ id, label, Icon }) => {
          const active = role === id;
          return (
            <button
              key={id}
              onClick={() => setRole(id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                active
                  ? "gradient-primary text-white shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}