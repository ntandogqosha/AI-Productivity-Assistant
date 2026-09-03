import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MODEL = "google/gemini-3.7-flash";

const AiInput = z.object({
  kind: z.enum(["email", "summary", "plan", "research", "chat"]),
  system: z.string().min(1).max(4000),
  prompt: z.string().min(1).max(12000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .max(30)
    .optional(),
  save: z.boolean().optional(),
});

export type AiResult = { text: string; generationId: string | null };

export const runAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AiInput.parse(input))
  .handler(async ({ data, context }): Promise<AiResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      throw new Error("AI is not configured for this app yet. Please try again later.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: data.system },
          ...(data.history ?? []),
          { role: "user", content: data.prompt },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      if (response.status === 429) {
        throw new Error("Too many requests right now. Please wait a moment and try again.");
      }
      if (response.status === 402) {
        throw new Error(
          "The AI workspace is out of credits. Please top up to keep generating content.",
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error("AI access is currently blocked for this app. Please contact the owner.");
      }
      throw new Error(
        `The AI service could not complete this request (${response.status}). ${body.slice(0, 160)}`,
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      throw new Error("The AI returned an empty response. Please try again.");
    }

    let generationId: string | null = null;
    if (data.save !== false) {
      const { data: row } = await context.supabase
        .from("generations")
        .insert({
          user_id: context.userId,
          kind: data.kind,
          input: data.prompt.slice(0, 4000),
          output: text.slice(0, 8000),
        })
        .select("id")
        .single();
      generationId = row?.id ?? null;
    }

    return { text, generationId };
  });
