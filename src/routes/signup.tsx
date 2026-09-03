import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — AI Productivity Assistant" },
      {
        name: "description",
        content: "Sign up free to generate emails, summarize meetings and plan your day with AI.",
      },
      { property: "og:title", content: "Create your account — AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Sign up free to generate emails, summarize meetings and plan your day with AI.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fullName.trim().length < 2) { toast.error("Please enter your full name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email address."); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName.trim() },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "We couldn't create your account. Please try again.");
      return;
    }
    if (data.session) {
      toast.success("Welcome aboard!");
      navigate({ to: "/dashboard" });
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Your AI workspace is ready in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          Check your email to confirm your address — once confirmed you can sign in and your
          dashboard will be waiting.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ada Lovelace"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="gradient-brand w-full border-0">
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="page-aurora flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <span className="gradient-brand grid size-9 place-items-center rounded-xl text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <span className="font-display text-lg font-semibold">AI Productivity Assistant</span>
      </Link>
      <div className="glass w-full max-w-md rounded-2xl p-7">
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
      <p className="mt-8 max-w-md text-center text-xs text-muted-foreground">
        AI-generated content may contain errors. Please review before use.
      </p>
    </div>
  );
}
