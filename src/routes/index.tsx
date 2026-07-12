import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ImsProvider, useIms } from "@/components/ims/store";
import { RoleSwitcher } from "@/components/ims/RoleSwitcher";
import { StudentView } from "@/components/ims/StudentView";
import { MentorView } from "@/components/ims/MentorView";
import { AdminView } from "@/components/ims/AdminView";

export const Route = createFileRoute("/")({
  component: Index,
});

function ActiveView() {
  const { role } = useIms();
  if (role === "student") return <StudentView />;
  if (role === "mentor") return <MentorView />;
  return <AdminView />;
}

function Index() {
  return (
    <ImsProvider>
      <ActiveView />
      <RoleSwitcher />
      <Toaster position="top-center" richColors />
    </ImsProvider>
  );
}
