import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-card shadow-2xl border border-border">
        {/* Header */}
        <div className="rounded-t-2xl bg-primary-hover px-8 py-8 text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-primary-foreground">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-wide text-primary-foreground">GAPHTO</h1>
            <p className="mt-1 text-sm text-primary-foreground/70">Member Portal</p>
          </Link>
        </div>

        {/* Form area */}
        <div className="px-8 py-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">Forgot Password</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <ForgotPasswordForm />
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-sm text-muted-foreground/60">
        &copy; {new Date().getFullYear()} GAPHTO. All rights reserved.
      </p>
    </div>
  );
}
