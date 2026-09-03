import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AiDisclaimer,
  CopyButton,
  OutputPanel,
  RegenerateButton,
  ReportIssueButton,
} from "@/components/ai/AiOutput";
import { Markdownish } from "./meeting-summarizer";
import { runAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/research-assistant")({
  head: () => ({
    meta: [
      { title: "Research Assistant — AI Productivity Assistant" },
      {
        name: "description",
        content: "Get a summary, key insights, recommendations and sources for any topic or link.",
      },
      { property: "og:title", content: "Research Assistant — AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Get a summary, key insights, recommendations and sources for any topic or link.",
      },
    ],
  }),
  component: ResearchAssistant,
});

const ACCENT = "#8B5CF6";

function ResearchAssistant() {
  const generate = useServerFn(runAi);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [output, setOutput] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);

  async function run() {
    if (topic.trim().length < 3) { toast.error("Enter a topic or link to research."); return; }
    setLoading(true);
    try {
      const result = await generate({
        data: {
          kind: "research",
          system:
            "You are a research analyst. Answer in markdown with exactly these headings: '## Summary', '## Key Insights', '## Recommendations', '## Sources'. Under Sources list credible publications, organisations or authors to consult, and note that links should be verified. Be specific and avoid filler.",
          prompt: `Research this topic or link: ${topic}`,
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

  async function simplify() {
    if (!output) { toast.error("Run a research brief first."); return; }
    setSimplifying(true);
    try {
      const result = await generate({
        data: {
          kind: "research",
          system:
            "Rewrite the given research brief in plain language a curious 12-year-old could follow. Keep the same markdown headings. Short sentences, no jargon.",
          prompt: output,
        },
      });
      setOutput(result.text);
      setGenerationId(result.generationId);
      toast.success("Simplified");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSimplifying(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Research Assistant
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold">Get up to speed fast</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop in a topic or a link and get a structured brief.
        </p>
      </header>

      <div className="glass mt-7 space-y-4 rounded-2xl p-5">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic or URL</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="EU AI Act compliance for small SaaS teams"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={run}
            disabled={loading}
            className="border-0 text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? "Researching…" : "Research"}
          </Button>
          <Button variant="outline" onClick={simplify} disabled={simplifying || !output}>
            {simplifying ? "Simplifying…" : "Simplify"}
          </Button>
        </div>
        <AiDisclaimer />
      </div>

      <div className="mt-6">
        <OutputPanel title="Research brief" accent={ACCENT}>
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
              {loading
                ? "Gathering insights…"
                : "Summary, key insights, recommendations and sources appear here."}
            </p>
          )}
        </OutputPanel>
      </div>
    </div>
  );
}
