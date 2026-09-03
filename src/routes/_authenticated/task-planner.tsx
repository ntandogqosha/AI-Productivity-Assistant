import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AiDisclaimer,
  CopyButton,
  OutputPanel,
  RegenerateButton,
  ReportIssueButton,
} from "@/components/ai/AiOutput";
import { Markdownish } from "./meeting-summarizer";
import { supabase } from "@/integrations/supabase/client";
import { runAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/task-planner")({
  head: () => ({
    meta: [
      { title: "Task Planner — AI Productivity Assistant" },
      {
        name: "description",
        content: "Capture tasks by priority and generate a time-blocked daily plan with AI.",
      },
      { property: "og:title", content: "Task Planner — AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Capture tasks by priority and generate a time-blocked daily plan with AI.",
      },
    ],
  }),
  component: TaskPlanner,
});

const ACCENT = "#F59E0B";
const PRIORITIES = ["High", "Medium", "Low"] as const;
const PRIORITY_COLORS: Record<string, string> = {
  High: "#EF4444",
  Medium: "#F59E0B",
  Low: "#10B981",
};

function TaskPlanner() {
  const generate = useServerFn(runAi);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<string>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Work");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function addTask() {
    if (name.trim().length < 2) { toast.error("Give your task a name."); return; }
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { toast.error("Your session expired. Please sign in again."); return; }
    const { error } = await supabase.from("tasks").insert({
      user_id: user.user.id,
      name: name.trim(),
      priority,
      category,
      due_date: dueDate || null,
    });
    if (error) { toast.error("Could not add the task. Please try again."); return; }
    setName("");
    setDueDate("");
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    toast.success("Task added");
  }

  async function toggle(id: string, completed: boolean) {
    await supabase.from("tasks").update({ completed: !completed }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function remove(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  }

  async function makePlan() {
    const open = tasks.filter((t) => !t.completed);
    if (open.length === 0) { toast.error("Add at least one open task first."); return; }
    setLoading(true);
    try {
      const result = await generate({
        data: {
          kind: "plan",
          system:
            "You are a productivity coach. Build a realistic time-blocked daily schedule from a task list. Answer in markdown: '## Daily Plan' with time blocks like '- 09:00–10:30 — Task (Priority)', then '## Focus Notes' with 2-4 short bullets. Assume a workday of 09:00–17:00 with a lunch break.",
          prompt: open
            .map(
              (t) =>
                `- ${t.name} | priority: ${t.priority} | category: ${t.category} | due: ${t.due_date ?? "no date"}`,
            )
            .join("\n"),
        },
      });
      setPlan(result.text);
      setGenerationId(result.generationId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Task Planner
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold">Plan your day</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture what matters, then let AI block out your time.
        </p>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="glass space-y-4 rounded-2xl p-5">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task name</Label>
              <Input
                id="taskName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Draft Q3 report"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due">Due date</Label>
                <Input
                  id="due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Work", "Personal", "Urgent"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={addTask}
              className="w-full border-0 text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Add task
            </Button>
          </div>

          {PRIORITIES.map((p) => {
            const group = tasks.filter((t) => t.priority === p);
            if (group.length === 0) return null;
            return (
              <div key={p} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLORS[p] }}
                  />
                  <h2 className="font-display text-base font-semibold">{p} priority</h2>
                  <span className="text-xs text-muted-foreground">({group.length})</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {group.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-3 rounded-xl bg-background/50 px-3 py-2.5"
                    >
                      <button
                        onClick={() => toggle(t.id, t.completed)}
                        className={`grid size-5 shrink-0 place-items-center rounded-md border ${
                          t.completed ? "gradient-brand border-transparent text-white" : "border-border"
                        }`}
                        aria-label="Toggle complete"
                      >
                        {t.completed && <Check className="size-3.5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm ${t.completed ? "text-muted-foreground line-through" : ""}`}
                        >
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.category}
                          {t.due_date ? ` · due ${t.due_date}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(t.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Delete task"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <Button
            onClick={makePlan}
            disabled={loading}
            className="w-full border-0 text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? "Building your plan…" : "Generate Daily Plan"}
          </Button>
          <OutputPanel title="Your daily plan" accent={ACCENT}>
            {plan ? (
              <>
                <Markdownish text={plan} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton text={plan} />
                  <RegenerateButton onClick={makePlan} loading={loading} />
                  <ReportIssueButton generationId={generationId} />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Scheduling your tasks…"
                  : "Add tasks, then generate a time-blocked schedule."}
              </p>
            )}
          </OutputPanel>
          <AiDisclaimer />
        </div>
      </div>
    </div>
  );
}
