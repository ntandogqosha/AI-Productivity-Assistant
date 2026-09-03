import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AiDisclaimer,
  CopyButton,
  OutputPanel,
  RegenerateButton,
  ReportIssueButton,
} from "@/components/ai/AiOutput";
import { runAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/meeting-summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — AI Productivity Assistant" },
      {
        name: "description",
        content: "Turn raw meeting notes into key points, decisions, action items and deadlines.",
      },
      { property: "og:title", content: "Meeting Summarizer — AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Turn raw meeting notes into key points, decisions, action items and deadlines.",
      },
    ],
  }),
  component: MeetingSummarizer,
});

const ACCENT = "#10B981";

function MeetingSummarizer() {
  const generate = useServerFn(runAi);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);

  async function run() {
    if (notes.trim().length < 30) {
      return toast.error("Paste a bit more of your notes (at least 30 characters).");
    }
    setLoading(true);
    try {
      const result = await generate({
        data: {
          kind: "summary",
          system:
            "You summarize meeting notes. Always answer in markdown with exactly these headings: '## Key Points', '## Decisions', '## Action Items', '## Deadlines', '## Responsibilities'. Use concise bullets. If a section has nothing, write '- None mentioned'.",
          prompt: notes,
        },
      });
      setOutput(result.text);
      setGenerationId(result.generationId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Meeting Summarizer
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold">Notes in, clarity out</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste the messiest notes you have — we'll structure them.
        </p>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div className="glass space-y-4 rounded-2xl p-5">
          <div className="space-y-2">
            <Label htmlFor="notes">Meeting notes</Label>
            <Textarea
              id="notes"
              rows={14}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your raw meeting notes or transcript here…"
            />
          </div>
          <Button
            onClick={run}
            disabled={loading}
            className="w-full border-0 text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? "Summarizing…" : "Summarize"}
          </Button>
          <AiDisclaimer />
        </div>

        <OutputPanel title="Summary" accent={ACCENT}>
          {output ? (
            <>
              <Markdownish text={output} />
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyButton text={output} />
                <RegenerateButton onClick={run} loading={loading} />
                <ReportIssueButton generationId={generationId} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading ? "Reading your notes…" : "Key points, decisions, action items, deadlines and responsibilities appear here."}
            </p>
          )}
        </OutputPanel>
      </div>
    </div>
  );
}

export function Markdownish({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (trimmed.startsWith("###"))
          return (
            <h4 key={i} className="font-display text-sm font-semibold">
              {trimmed.replace(/^#+\s*/, "")}
            </h4>
          );
        if (trimmed.startsWith("#"))
          return (
            <h3 key={i} className="mt-3 font-display text-base font-semibold">
              {trimmed.replace(/^#+\s*/, "")}
            </h3>
          );
        if (/^[-*]\s/.test(trimmed))
          return (
            <p key={i} className="flex gap-2 pl-1">
              <span className="text-muted-foreground">•</span>
              <span>{stripBold(trimmed.replace(/^[-*]\s/, ""))}</span>
            </p>
          );
        return <p key={i}>{stripBold(trimmed)}</p>;
      })}
    </div>
  );
}

function stripBold(value: string) {
  return value.replace(/\*\*/g, "");
}
