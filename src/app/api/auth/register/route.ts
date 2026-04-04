import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, members } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, specialty } = body as {
      name?: string;
      email?: string;
      password?: string;
      specialty?: string;
    };

    // 1. Validate all fields present
    if (!name || !email || !password || !specialty) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // 2. Check email not already taken
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 400 }
      );
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Insert into users table
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "member",
      })
      .returning({ id: users.id });

    // 5. Insert into members table
    const memberNumber = `GAPHTO-${Date.now().toString().slice(-6)}`;
    await db.insert(members).values({
      userId: newUser.id,
      memberNumber,
      specialty: specialty as "disease-control" | "health-information" | "nutrition",
      membershipStatus: "active",
      joinedDate: new Date(),
    });

    // 6. Return success
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
}
