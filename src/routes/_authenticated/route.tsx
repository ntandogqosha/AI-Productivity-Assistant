import {
  createFileRoute,
  redirect,
  Outlet,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarCheck,
  Search,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/signin" });
    }
    return { userId: data.session.user.id };
  },
  component: AuthenticatedLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email-generator", label: "Email Generator", icon: Mail },
  { to: "/meeting-summarizer", label: "Meeting Summarizer", icon: FileText },
  { to: "/task-planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research-assistant", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function useProfileName() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;
      setEmail(data.user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!active) return;
      setName(
        profile?.full_name?.trim() ||
          (data.user.user_metadata?.["full_name"] as string | undefined) ||
          data.user.email?.split("@")[0] ||
          "There",
      );
    })();
    return () => {
      active = false;
    };
  }, []);

  return { name, email };
}

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { name, email } = useProfileName();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/signin", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const unsub = router.subscribe("onResolved", () => setOpen(false));
    return unsub;
  }, [router]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/signin", replace: true });
  }

  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AI";

  return (
    <div className="page-aurora min-h-screen lg:flex">
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass fixed left-4 top-4 z-50 grid size-10 place-items-center rounded-xl lg:hidden"
        aria-label="Toggle navigation"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <aside
        className={`glass fixed inset-y-0 left-0 z-40 flex w-72 flex-col rounded-none p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/dashboard" className="mt-10 flex items-center gap-2 lg:mt-0">
          <span className="gradient-brand grid size-9 place-items-center rounded-xl text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="font-display text-sm font-semibold leading-tight">
            AI Productivity
            <br />
            Assistant
          </span>
        </Link>

        <div className="mt-6 flex items-center gap-3 rounded-xl bg-background/50 p-3">
          <span className="gradient-brand grid size-10 place-items-center rounded-full text-sm font-semibold text-primary-foreground">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name || "Loading…"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-background/70 font-semibold" }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-background/60"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="min-w-0 flex-1 px-5 pb-10 pt-20 lg:px-8 lg:pt-8">
        <Outlet />
        <footer className="mt-12 border-t border-border/60 pt-5">
          <p className="text-xs text-muted-foreground">
            AI-generated content may contain errors. Please review before use.
          </p>
        </footer>
      </main>
    </div>
  );
}
