import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { runAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/email-generator")({
  head: () => ({
    meta: [
      { title: "Email Generator — AI Productivity Assistant" },
      {
        name: "description",
        content: "Turn key points into a polished email with the right tone and audience.",
      },
      { property: "og:title", content: "Email Generator — AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Turn key points into a polished email with the right tone and audience.",
      },
    ],
  }),
  component: EmailGenerator;
});

const ACCENT = "#2563EB";

function EmailGenerator() {
  const generate = useServerFn(runAi);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [points, setPoints] = useState("");
  const [tone, setTone] = useState("Formal");
  const [audience, setAudience] = useState("Client");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);

  async function run() {
    if (!recipient.trim()) return toast.error("Who is this email for?");
    if (!subject.trim()) return toast.error("Add a subject line.");
    if (points.trim().length < 10) return toast.error("Add a few key points (at least 10 characters).");

    setLoading(true);
    try {
      const result = await generate({
        data: {
          kind: "email",
          system:
            "You are an expert business writer. Write ready-to-send emails. Output plain text starting with 'Subject:' then a blank line, then the body with a greeting and sign-off. No commentary, no markdown fences.",
          prompt: `Recipient: ${recipient}\nSubject: ${subject}\nTone: ${tone}\nAudience: ${audience}\nKey points:\n${points}`,
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
          Email Generator
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold">Draft the perfect email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Give the essentials — we'll handle the wording.
        </p>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div className="glass space-y-4 rounded-2xl p-5">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Sarah at Northwind"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Project kickoff next week"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Key Points</Label>
            <Textarea
              id="points"
              rows={6}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="- Confirm Tuesday 10am&#10;- Share the scope doc&#10;- Ask about budget sign-off"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Formal", "Informal", "Persuasive"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Client", "Manager", "Team"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={run}
            disabled={loading}
            className="w-full border-0 text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? "Generating…" : "Generate"}
          </Button>
          <AiDisclaimer />
        </div>

        <OutputPanel title="Email preview" accent={ACCENT}>
          {output ? (
            <>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{output}</pre>
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyButton text={output} />
                <RegenerateButton onClick={run} loading={loading} />
                <ReportIssueButton generationId={generationId} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading ? "Writing your email…" : "Your generated email will appear here."}
            </p>
          )}
        </OutputPanel>
      </div>
    </div>
  );
}
