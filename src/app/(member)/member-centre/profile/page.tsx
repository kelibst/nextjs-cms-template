import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, members } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  BookOpen,
  CalendarDays,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { handleSignOut } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/member-centre/profile");
  }

  const userId = session.user.id;
  const role = (session.user as { role?: string }).role ?? "member";

  // Fetch full user record from DB
  let userRecord: typeof users.$inferSelect | null = null;
  let memberRecord: typeof members.$inferSelect | null = null;

  try {
    const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    userRecord = u ?? null;

    if (u) {
      const [m] = await db.select().from(members).where(eq(members.userId, userId)).limit(1);
      memberRecord = m ?? null;
    }
  } catch {
    // DB might not be up yet — use session data as fallback
    userRecord = null;
    memberRecord = null;
  }

  const name = userRecord?.name ?? session.user.name ?? "Member";
  const email = userRecord?.email ?? session.user.email ?? "";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Top bar */}
      <div className="border-b border-primary/30 bg-primary-deep px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-wide text-primary-foreground">
            GAPHTO
          </Link>
          <span className="text-sm text-primary-foreground/70">Member Portal</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-0">
        {/* Sidebar */}
        <aside className="sticky top-0 h-[calc(100vh-49px)] w-52 shrink-0 border-r border-border bg-card pt-6">
          <nav className="flex flex-col gap-1 px-3">
            <Link
              href="/member-centre"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Dashboard
            </Link>

            <Link
              href="/member-centre/profile"
              className="flex items-center gap-3 rounded-lg bg-primary-subtle px-3 py-2.5 text-sm font-medium text-primary"
            >
              <User className="h-4 w-4 shrink-0" />
              My Profile
            </Link>

            <Link
              href="/member-centre/publications"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Publications
            </Link>

            <Link
              href="/events"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              Events
            </Link>

            <div className="mt-4 border-t border-border/50 pt-4">
              <form
                action={async () => {
                  "use server";
                  await handleSignOut();
                }}
              >
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign Out
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 py-8">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/member-centre"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm text-foreground">My Profile</span>
          </div>

          <div className="max-w-2xl">
            <div className="rounded-xl border border-border bg-card shadow-sm">
              {/* Profile header */}
              <div className="flex items-center gap-6 border-b border-border/50 px-6 py-6">
                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {initials}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{name}</h1>
                  <p className="text-sm text-muted-foreground">{email}</p>
                  <Badge className="mt-2 capitalize border-primary-muted bg-primary-subtle text-primary">
                    {role.replace("_", " ")}
                  </Badge>
                </div>
                <div className="ml-auto">
                  <div className="relative">
                    <Button
                      disabled
                      className="cursor-not-allowed border border-border bg-muted text-muted-foreground"
                      title="Coming in Phase 3"
                    >
                      Edit Profile
                    </Button>
                    <span className="absolute -bottom-6 right-0 whitespace-nowrap text-xs text-muted-foreground">
                      Coming in Phase 3
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile details */}
              <div className="divide-y divide-border/50">
                <ProfileRow label="Full Name" value={name} />
                <ProfileRow label="Email Address" value={email} />
                <ProfileRow
                  label="Role"
                  value={
                    <Badge className="capitalize border-transparent bg-muted text-muted-foreground">
                      {role.replace("_", " ")}
                    </Badge>
                  }
                />
                <ProfileRow
                  label="Member Number"
                  value={memberRecord?.memberNumber ?? "—"}
                />
                <ProfileRow
                  label="Specialty"
                  value={
                    memberRecord?.specialty
                      ? memberRecord.specialty
                          .replace("-", " ")
                          .replace(/\b\w/g, (c: string) => c.toUpperCase())
                      : "—"
                  }
                />
                <ProfileRow
                  label="Region"
                  value={memberRecord?.region ?? "—"}
                />
                <ProfileRow
                  label="Facility"
                  value={memberRecord?.facility ?? "—"}
                />
                <ProfileRow
                  label="Membership Status"
                  value={
                    memberRecord?.membershipStatus ? (
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium capitalize ${
                          memberRecord.membershipStatus === "active"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {memberRecord.membershipStatus === "active" && (
                          <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                        )}
                        {memberRecord.membershipStatus}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <ProfileRow
                  label="Dues Paid Until"
                  value={
                    memberRecord?.duesPaidUntil
                      ? new Date(memberRecord.duesPaidUntil).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "long", year: "numeric" }
                        )
                      : "—"
                  }
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <span className="w-40 shrink-0 text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
