import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserIdFromRequest } from "@/lib/api-helpers";
import { logActivity } from "@/lib/permissions";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const userId = getUserIdFromRequest(request)!;
  const { id } = await params;
  const body = await request.json();

  const role = await prisma.role.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      color: body.color,
    },
  });

  await logActivity(userId, "updated", "role", role.id, role.name);

  return NextResponse.json(role);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const userId = getUserIdFromRequest(request)!;
  const { id } = await params;

  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  if (role._count.users > 0) {
    return NextResponse.json(
      { error: "Cannot delete role with assigned users" },
      { status: 400 }
    );
  }

  await prisma.role.delete({ where: { id } });

  await logActivity(userId, "deleted", "role", role.id, role.name);

  return NextResponse.json({ success: true });
}
