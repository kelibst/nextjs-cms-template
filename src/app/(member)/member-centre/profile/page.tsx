import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, members, emailPreferences } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { EmailPreferencesForm } from "@/components/member/email-preferences-form";
import { EditProfileForm } from "@/components/member/edit-profile-form";
import { ChangePasswordForm } from "@/components/member/change-password-form";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id;
  const role = (session!.user as { role?: string }).role ?? "member";

  // Fetch full user record from DB
  let userRecord: typeof users.$inferSelect | null = null;
  let memberRecord: typeof members.$inferSelect | null = null;
  let emailPrefsRecord: typeof emailPreferences.$inferSelect | null = null;

  try {
    const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    userRecord = u ?? null;

    if (u) {
      const [m] = await db.select().from(members).where(eq(members.userId, userId)).limit(1);
      memberRecord = m ?? null;
    }

    const [ep] = await db.select().from(emailPreferences).where(eq(emailPreferences.userId, userId)).limit(1);
    emailPrefsRecord = ep ?? null;
  } catch {
    // DB might not be up yet — use session data as fallback
    userRecord = null;
    memberRecord = null;
    emailPrefsRecord = null;
  }

  const name = userRecord?.name ?? session!.user!.name ?? "Member";
  const email = userRecord?.email ?? session!.user!.email ?? "";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
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
              <EditProfileForm currentName={name} />
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

        {/* Email Preferences */}
        <div id="email-preferences" className="mt-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="text-base font-semibold text-foreground">Email Preferences</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Control which emails you receive
            </p>
          </div>
          <div className="px-6 py-5">
            <EmailPreferencesForm
              initialNewsletter={emailPrefsRecord?.receiveNewsletter ?? true}
              initialEventAlerts={emailPrefsRecord?.receiveEventAlerts ?? true}
            />
          </div>
        </div>

        {/* Change Password */}
        <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="text-base font-semibold text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update your account password
            </p>
          </div>
          <div className="px-6 py-5">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </main>
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
