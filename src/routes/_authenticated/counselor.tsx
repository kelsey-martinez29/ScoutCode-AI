import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppHeader, NavLink } from "@/components/AppHeader";
import { getMyRole } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/counselor")({
  beforeLoad: async () => {
    const role = await getMyRole();
    if (role === "scout") throw redirect({ to: "/scout" });
    if (role !== "counselor") throw redirect({ to: "/counselor-login" });
  },
  head: () => ({ meta: [{ title: "Counselor — ScoutCode AI" }, { name: "description", content: "Counselor portal." }] }),
  component: () => (
    <div className="min-h-screen">
      <AppHeader home="/counselor" who="Counselor" nav={<NavLink to="/counselor">Roster</NavLink>} />
      <Outlet />
    </div>
  ),
});

