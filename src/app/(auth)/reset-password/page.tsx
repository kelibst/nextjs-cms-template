import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      {/* Back to site */}
      <div className="w-full max-w-sm mb-4 flex">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          <ArrowLeft className="size-3.5" />
          Back to site
        </Link>
      </div>

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
            <h1 className="text-2xl font-bold tracking-wide text-primary-foreground">{process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS'}</h1>
            <p className="mt-1 text-sm text-primary-foreground/70">Member Portal</p>
          </Link>
        </div>

        {/* Form area */}
        <div className="px-8 py-8">
          {!token ? (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-semibold text-foreground">Invalid Reset Link</h2>
              <p className="text-sm text-muted-foreground">
                This reset link is missing a token. Please request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="block text-sm font-medium text-primary hover:text-primary/80 hover:underline"
              >
                Request new reset link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Reset Password</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Enter your new password below.
              </p>
              <ResetPasswordForm token={token} />
            </>
          )}
        </div>
      </div>

      <p
        className="mt-8 text-xs text-white/80"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS'}. All rights reserved.
      </p>
    </div>
  );
}
