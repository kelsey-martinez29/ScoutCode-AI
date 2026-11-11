import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader, NavLink } from "@/components/AppHeader";
import { getMyRole } from "@/lib/session";
import { meQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/scout")({
  beforeLoad: async () => {
    const role = await getMyRole();
    if (role === "counselor") throw redirect({ to: "/counselor" });
    if (role !== "scout") throw redirect({ to: "/auth" });
  },
  head: () => ({ meta: [{ title: "My badge — ScoutCode AI" }, { name: "description", content: "Your Programming merit badge progress." }] }),
  component: ScoutLayout,
});

function ScoutLayout() {
  const { data } = useQuery(meQuery);
  const s = data?.scout;
  return (
    <div className="min-h-screen">
      <AppHeader
        home="/scout"
        who={s ? `${s.first_name} ${s.last_initial}.${s.is_demo ? " · FICTIONAL DEMO" : ""}` : ""}
        nav={<><NavLink to="/scout">My modules</NavLink><NavLink to="/scout/lab">Code Lab</NavLink></>}
      />
      <Outlet />
    </div>
  );
}

