import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiDisclaimer, ReportIssueButton } from "@/components/ai/AiOutput";
import { Markdownish } from "./meeting-summarizer";
import { runAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "Chat Assistant — AI Productivity Assistant" },
      {
        name: "description",
        content: "Chat with your AI assistant, or jump into a task with one-tap quick actions.",
      },
      { property: "og:title", content: "Chat Assistant — AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Chat with your AI assistant, or jump into a task with one-tap quick actions.",
      },
    ],
  }),
  component: ChatAssistant,
});

const ACCENT = "#EC4899";

const QUICK_ACTIONS = [
  { label: "Generate email", prompt: "Help me write an email. Ask me what you need to know first." },
  { label: "Summarize notes", prompt: "I'll paste meeting notes for you to summarize. Ready?" },
  { label: "Plan my day", prompt: "Help me plan my day. Ask what's on my list." },
  { label: "Research topic", prompt: "I want to research a topic. Ask me which one." },
];

type Message = { role: "user" | "assistant"; content: string; generationId?: string | null };

function ChatAssistant() {
  const generate = useServerFn(runAi);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your productivity assistant. Ask me anything, or tap a quick action below to get going.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > 4000) return toast.error("That message is a bit too long.");

    const history = messages
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setTyping(true);

    try {
      const result = await generate({
        data: {
          kind: "chat",
          system:
            "You are a concise, friendly productivity assistant. You can draft emails, summarize notes, plan days and research topics. Ask a clarifying question when the request is vague. Use short markdown where it helps.",
          prompt: trimmed,
          history,
        },
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.text, generationId: result.generationId },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${message}` }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <header>
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Chat Assistant
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold">Ask anything</h1>
      </header>

      <div className="glass mt-6 flex min-h-[55vh] flex-col rounded-2xl p-5">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "text-white"
                    : "bg-background/70 text-foreground"
                }`}
                style={m.role === "user" ? { backgroundColor: ACCENT } : undefined}
              >
                {m.role === "user" ? m.content : <Markdownish text={m.content} />}
                {m.role === "assistant" && m.generationId && (
                  <div className="mt-1">
                    <ReportIssueButton generationId={m.generationId} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl bg-background/70 px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="size-2 animate-bounce rounded-full"
                    style={{ backgroundColor: ACCENT, animationDelay: `${d * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => send(a.prompt)}
              disabled={typing}
              className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-background disabled:opacity-50"
            >
              {a.label}
            </button>
          ))}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
          />
          <Button
            type="submit"
            disabled={typing}
            className="border-0 text-white"
            style={{ backgroundColor: ACCENT }}
          >
            <Send className="size-4" />
          </Button>
        </form>
        <AiDisclaimer className="mt-3" />
      </div>
    </div>
  );
}
