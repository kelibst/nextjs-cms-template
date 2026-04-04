"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/app/actions/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (emailValue: string) => requestPasswordReset(emailValue),
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(email);
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We sent a reset link to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            type="button"
            className="font-medium text-primary hover:text-primary/80 hover:underline"
            onClick={() => mutate(email)}
          >
            resend
          </button>
          .
        </p>
        <Link
          href="/login"
          className="block text-sm font-medium text-primary hover:text-primary/80 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-foreground/80">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          className="h-10"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
