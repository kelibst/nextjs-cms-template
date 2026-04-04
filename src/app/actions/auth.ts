"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { signOut } from "@/auth";
import { db, users } from "@/lib/db";
import { eq, ilike } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";

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
    })
    .where(eq(users.id, user.id));

  return { success: true };
}
