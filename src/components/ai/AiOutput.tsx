import { useState } from "react";
import { Copy, Flag, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      AI-generated content may contain errors. Please review before use.
    </p>
  );
}

export function ReportIssueButton({ generationId }: { generationId: string | null }) {
  const [reported, setReported] = useState(false);

  async function report() {
    if (!generationId) {
      toast.error("Nothing to report yet.");
      return;
    }
    const { error } = await supabase
      .from("generations")
      .update({ reported: true })
      .eq("id", generationId);
    if (error) {
      toast.error("Could not send the report. Please try again.");
      return;
    }
    setReported(true);
    toast.success("Thanks — this output was flagged for review.");
  }

  return (
    <Button variant="ghost" size="sm" onClick={report} disabled={reported}>
      <Flag className="mr-2 size-4" />
      {reported ? "Reported" : "Report issue"}
    </Button>
  );
}

export function CopyButton({ text }: { text: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast.success("Copied to clipboard");
        } catch {
          toast.error("Copy failed — please select the text manually.");
        }
      }}
    >
      <Copy className="mr-2 size-4" />
      Copy
    </Button>
  );
}

export function RegenerateButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
      Regenerate
    </Button>
  );
}

export function OutputPanel({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
