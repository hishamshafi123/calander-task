import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserIdFromRequest } from "@/lib/api-helpers";
import { logActivity } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");

  const where: Record<string, string> = {};
  if (userId) where.userId = userId;
  if (projectId) where.projectId = projectId;

  const assignments = await prisma.projectAssignment.findMany({
    where,
    include: {
      project: true,
      user: { select: { id: true, fullName: true, username: true } },
      categoryPermissions: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const currentUserId = getUserIdFromRequest(request)!;
  const body = await request.json();

  if (!body.projectId || !body.userId) {
    return NextResponse.json(
      { error: "projectId and userId are required" },
      { status: 400 }
    );
  }

  // Check for existing assignment
  const existing = await prisma.projectAssignment.findUnique({
    where: {
      projectId_userId: {
        projectId: body.projectId,
        userId: body.userId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User is already assigned to this project" },
      { status: 409 }
    );
  }

  const assignment = await prisma.projectAssignment.create({
    data: {
      projectId: body.projectId,
      userId: body.userId,
      categoryAccessMode: body.categoryAccessMode || "all",
    },
    include: {
      project: true,
      user: { select: { id: true, fullName: true, username: true } },
    },
  });

  // Create category permissions if provided
  if (body.categoryPermissions?.length > 0) {
    await prisma.categoryPermission.createMany({
      data: body.categoryPermissions.map(
        (cp: { categoryId: string; canAccess: boolean }) => ({
          projectAssignmentId: assignment.id,
          categoryId: cp.categoryId,
          canAccess: cp.canAccess,
        })
      ),
    });
  }

  await logActivity(
    currentUserId,
    "assigned",
    "project",
    assignment.projectId,
    assignment.project.name,
    { assignedUserId: assignment.userId, assignedUserName: assignment.user.fullName }
  );

  return NextResponse.json(assignment, { status: 201 });
}
