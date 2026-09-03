import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Productivity Assistant" },
      { name: "description", content: "Manage your profile and account details." },
      { property: "og:title", content: "Settings — AI Productivity Assistant" },
      { property: "og:description", content: "Manage your profile and account details." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .maybeSingle();
      setFullName(profile?.full_name ?? "");
    })();
  }, []);

  async function save() {
    if (fullName.trim().length < 2) return toast.error("Please enter your full name.");
    setSaving(true);
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setSaving(false);
      return toast.error("Your session expired. Please sign in again.");
    }
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: data.user.id, full_name: fullName.trim(), updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error("Could not save your profile. Please try again.");
    toast.success("Profile updated");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Update how you appear in the app.</p>

      <div className="glass mt-7 space-y-4 rounded-2xl p-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled />
        </div>
        <Button onClick={save} disabled={saving} className="gradient-brand border-0">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="glass mt-6 rounded-2xl p-5">
        <h2 className="font-display text-lg font-semibold">Responsible AI</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every generated result includes a Report issue button. Flagged outputs are stored with your
          account so they can be reviewed. AI-generated content may contain errors — always review
          before sending or acting on it.
        </p>
      </div>
    </div>
  );
}
