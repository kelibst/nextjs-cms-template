import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; registered?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

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
            <h1 className="text-2xl font-bold tracking-wide text-primary-foreground">{process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS'}</h1>
            <p className="mt-1 text-sm text-primary-foreground/70">Member Portal</p>
          </Link>
        </div>

        {/* Form area */}
        <div className="px-8 py-8">
          {/* Success banner */}
          {params.registered === "true" && (
            <div className="mb-6 rounded-lg border border-primary-muted bg-primary-subtle px-4 py-3 text-sm text-primary/80">
              Account created! Please sign in.
            </div>
          )}

          {/* Error banner */}
          {params.error && params.error !== "CredentialsSignin" && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {params.error === "OAuthAccountNotLinked"
                ? "Email already used with a different provider."
                : "An error occurred. Please try again."}
            </div>
          )}

          <h2 className="mb-6 text-xl font-semibold text-foreground">Sign in to your account</h2>

          <LoginForm
            error={params.error}
            callbackUrl={params.callbackUrl}
          />

          {/* Demo credentials */}
          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/30">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Demo Accounts
            </p>
            <div className="space-y-1 font-mono text-xs text-blue-800 dark:text-blue-400">
              <p>member@example.com / Demo1234!</p>
              <p>admin@example.com / Demo1234!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-sm text-muted-foreground/60">
        &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS'}. All rights reserved.
      </p>
    </div>
  );
}
