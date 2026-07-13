import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ImsProvider, useIms } from "@/components/ims/store";
import { RoleSwitcher } from "@/components/ims/RoleSwitcher";
import { StudentView } from "@/components/ims/StudentView";
import { MentorView } from "@/components/ims/MentorView";
import { AdminView } from "@/components/ims/AdminView";
import { RedesignedLogin } from "@/components/ims/RedesignedLogin";

export const Route = createFileRoute("/")({
  component: Index,
});

function ActiveView({ onLogout }: { onLogout: () => void }) {
  const { role } = useIms();
  if (role === "student") return <StudentView onLogout={onLogout} />;
  if (role === "mentor") return <MentorView onLogout={onLogout} />;
  return <AdminView onLogout={onLogout} />;
}

function Index() {
  const [authed, setAuthed] = useState(false);

  return (
    <ImsProvider>
      {authed ? (
        <ActiveView onLogout={() => setAuthed(false)} />
      ) : (
        <RedesignedLogin onLogin={() => setAuthed(true)} />
      )}
      <Toaster position="top-center" richColors />
    </ImsProvider>
  );
}

