import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserIdFromRequest } from "@/lib/api-helpers";
import { logActivity } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  // Strip password hashes
  const safeUsers = users.map(({ passwordHash, ...user }) => user);

  return NextResponse.json(safeUsers);
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const userId = getUserIdFromRequest(request)!;
  const body = await request.json();

  if (!body.fullName || !body.username || !body.password) {
    return NextResponse.json(
      { error: "Full name, username, and password are required" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9_]{3,30}$/.test(body.username)) {
    return NextResponse.json(
      {
        error:
          "Username must be 3-30 characters, lowercase letters, numbers, or underscores",
      },
      { status: 400 }
    );
  }

  // Check for duplicate username
  const existing = await prisma.user.findUnique({
    where: { username: body.username },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      fullName: body.fullName,
      username: body.username,
      email: body.email || null,
      passwordHash,
      roleId: body.roleId || null,
      timezone: body.timezone || "UTC",
      isAdmin: body.isAdmin || false,
    },
    include: { role: true },
  });

  await logActivity(userId, "created", "user", user.id, user.fullName);

  const { passwordHash: _, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 201 });
}
