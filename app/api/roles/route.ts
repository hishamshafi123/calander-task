import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserIdFromRequest } from "@/lib/api-helpers";
import { logActivity } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(roles);
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const userId = getUserIdFromRequest(request)!;
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json(
      { error: "Role name is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.role.findUnique({
    where: { name: body.name },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Role name already exists" },
      { status: 409 }
    );
  }

  const role = await prisma.role.create({
    data: {
      name: body.name,
      description: body.description || null,
      color: body.color || "#3b82f6",
    },
  });

  await logActivity(userId, "created", "role", role.id, role.name);

  return NextResponse.json(role, { status: 201 });
}
