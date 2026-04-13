"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
import { db, users, members } from "@/lib/db";
import { eq, ilike, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendPasswordResetEmail } from "@/lib/email";
import { audit } from "@/lib/audit";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

export async function requestPasswordReset(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(ilike(users.email, email))
    .limit(1);

  // Always return same message to prevent email enumeration
  const genericResponse = {
    success: true,
    message:
      "If an account exists for this email, a reset link has been sent.",
  };
  if (!user) return genericResponse;

  // Generate secure token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store hashed token
  await db
    .update(users)
    .set({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: expiry,
    })
    .where(eq(users.id, user.id));

  void audit({ userId: user.id, action: 'auth.password_reset.requested', metadata: { email: user.email } })

  // Send email with raw token in URL
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;
  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch (err) {
    console.error("Failed to send reset email:", err);
    // Don't expose email failure to user
  }

  return genericResponse;
}

export async function resetPassword(rawToken: string, newPassword: string) {
  if (!rawToken) throw new Error("Invalid reset link");
  if (newPassword.length < 8)
    throw new Error("Password must be at least 8 characters");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const now = new Date();

  // Find user with valid token
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.passwordResetToken, hashedToken))
    .limit(1);

  if (
    !user ||
    !user.passwordResetTokenExpiry ||
    user.passwordResetTokenExpiry < now
  ) {
    throw new Error(
      "This reset link is invalid or has expired. Please request a new one."
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db
    .update(users)
    .set({
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
      updatedAt: new Date(),
      tokenVersion: sql`${users.tokenVersion} + 1`,
    })
    .where(eq(users.id, user.id));

  void audit({ userId: user.id, action: 'auth.password_reset.completed' })

  return { success: true };
}

export async function registerUser(data: {
  name: string
  email: string
  password: string
  specialty: string
}): Promise<{ success: true } | { success: false; error: string }> {
  if (!data.name || !data.email || !data.password || !data.specialty) {
    return { success: false, error: 'All fields are required.' }
  }
  if (data.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' }
  }

  try {
    const existing = await db.select({ id: users.id }).from(users)
      .where(eq(users.email, data.email.toLowerCase())).limit(1)
    if (existing.length > 0) {
      return { success: false, error: 'An account with that email already exists.' }
    }

    const passwordHash = await bcrypt.hash(data.password, 12)
    const [newUser] = await db.insert(users).values({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: 'member',
    }).returning({ id: users.id })

    await db.insert(members).values({
      userId: newUser.id,
      memberNumber: `GAPHTO-${Date.now().toString().slice(-6)}`,
      specialty: data.specialty as 'disease-control' | 'health-information' | 'nutrition',
      membershipStatus: 'active',
      joinedDate: new Date(),
    })

    return { success: true }
  } catch (err) {
    console.error('[register] error:', err)
    return { success: false, error: 'Registration failed. Please try again later.' }
  }
}

export async function updateUserProfile(
  data: { name: string }
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const name = data.name.trim()
  if (!name) return { error: 'Name cannot be empty.' }

  await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  revalidatePath('/member-centre/profile')
  return { success: true }
}

export async function changePassword(
  data: { currentPassword: string; newPassword: string }
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  if (data.newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters.' }
  }

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user?.passwordHash) {
    return { error: 'Unable to verify current password.' }
  }

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash)
  if (!valid) return { error: 'Current password is incorrect.' }

  const passwordHash = await bcrypt.hash(data.newPassword, 12)

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  return { success: true }
}
