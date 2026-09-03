import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarCheck, Search, MessageCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Productivity Assistant — Do a day's work in minutes" },
      {
        name: "description",
        content:
          "One AI workspace for emails, meeting summaries, daily plans, research briefs and chat. Sign up free and get started in seconds.",
      },
      { property: "og:title", content: "AI Productivity Assistant" },
      {
        property: "og:description",
        content:
          "One AI workspace for emails, meeting summaries, daily plans, research briefs and chat.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Mail,
    title: "Email Generator",
    body: "Turn a few bullet points into a polished email with the right tone for any audience.",
    color: "#2563EB",
  },
  {
    icon: FileText,
    title: "Meeting Summarizer",
    body: "Paste messy notes and get key points, decisions, action items and deadlines.",
    color: "#10B981",
  },
  {
    icon: CalendarCheck,
    title: "Task Planner",
    body: "Capture tasks by priority and generate a realistic time-blocked daily plan.",
    color: "#F59E0B",
  },
  {
    icon: Search,
    title: "Research Assistant",
    body: "Get a summary, key insights, recommendations and sources for any topic.",
    color: "#8B5CF6",
  },
  {
    icon: MessageCircle,
    title: "Chat Assistant",
    body: "Ask anything, or jump straight into a task with one-tap quick actions.",
    color: "#EC4899",
  },
];

function Home() {
  return (
    <div className="page-aurora min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="gradient-brand grid size-9 place-items-center rounded-xl text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">AI Productivity Assistant</span>
        </div>
        <Link
          to="/signin"
          className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent sm:inline-flex"
        >
          Sign In
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-5 pb-16 pt-10 text-center sm:pt-20">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <Sparkles className="size-3.5" /> Five AI workflows, one workspace
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-6xl">
            <span className="gradient-text">Do a day's work</span>
            <br />
            in a handful of minutes
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Draft emails, summarize meetings, plan your day, research anything and chat with an
            assistant that keeps up — all from a single dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="gradient-brand inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
            >
              Get Started
            </Link>
            <Link
              to="/signin"
              className="glass inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="glass rounded-2xl p-6">
              <span
                className="grid size-11 place-items-center rounded-xl text-white"
                style={{ backgroundColor: f.color }}
              >
                <f.icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
          <article className="glass flex flex-col justify-center rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold">Ready when you are</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a free account and your dashboard is set up instantly.
            </p>
            <Link
              to="/signup"
              className="gradient-brand mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Create account
            </Link>
          </article>
        </section>
      </main>

      <footer className="border-t border-border/60 px-5 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          AI-generated content may contain errors. Please review before use.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AI Productivity Assistant
        </p>
      </footer>
    </div>
  );
}
