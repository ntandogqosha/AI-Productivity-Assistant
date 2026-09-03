import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, FileText, CalendarCheck, Search, MessageCircle, ListTodo } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useProfileName } from "./route";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Productivity Assistant" },
      { name: "description", content: "Your AI workspace overview and quick actions." },
      { property: "og:title", content: "Dashboard — AI Productivity Assistant" },
      { property: "og:description", content: "Your AI workspace overview and quick actions." },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/email-generator", label: "Generate Email", icon: Mail, color: "#2563EB" },
  { to: "/meeting-summarizer", label: "Summarize Notes", icon: FileText, color: "#10B981" },
  { to: "/task-planner", label: "Plan My Day", icon: CalendarCheck, color: "#F59E0B" },
  { to: "/research-assistant", label: "Research Topic", icon: Search, color: "#8B5CF6" },
  { to: "/chat", label: "Chat Assistant", icon: MessageCircle, color: "#EC4899" },
] as const;

function Dashboard() {
  const { name } = useProfileName();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [tasks, generations] = await Promise.all([
        supabase.from("tasks").select("id", { count: "exact", head: true }),
        supabase.from("generations").select("kind"),
      ]);
      const rows = generations.data ?? [];
      const count = (kind: string) => rows.filter((r) => r.kind === kind).length;
      return {
        tasks: tasks.count ?? 0,
        emails: count("email"),
        meetings: count("summary"),
        research: count("research"),
      };
    },
  });

  const cards = [
    { label: "Total Tasks", value: stats?.tasks ?? 0, icon: ListTodo, color: "#F59E0B" },
    { label: "Emails Generated", value: stats?.emails ?? 0, icon: Mail, color: "#2563EB" },
    { label: "Meetings Summarized", value: stats?.meetings ?? 0, icon: FileText, color: "#10B981" },
    { label: "Research Topics", value: stats?.research ?? 0, icon: Search, color: "#8B5CF6" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-semibold">
        Hi {name ? name.split(" ")[0] : "there"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Here's your workspace at a glance. Pick a quick action to get moving.
      </p>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <span
                className="grid size-9 place-items-center rounded-xl text-white"
                style={{ backgroundColor: c.color }}
              >
                <c.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </section>

      <h2 className="mt-10 font-display text-xl font-semibold">Quick actions</h2>
      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group relative overflow-hidden rounded-2xl p-6 text-white transition-transform hover:-translate-y-1"
            style={{ backgroundColor: a.color }}
          >
            <span className="absolute -right-8 -top-8 size-28 rounded-full bg-white/15" />
            <a.icon className="size-7" />
            <p className="mt-6 font-display text-lg font-semibold">{a.label}</p>
            <p className="mt-1 text-sm text-white/80">Open feature →</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
