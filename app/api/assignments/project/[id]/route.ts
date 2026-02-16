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

  const currentUserId = getUserIdFromRequest(request)!;
  const { id } = await params;
  const body = await request.json();

  // Update the assignment
  const assignment = await prisma.projectAssignment.update({
    where: { id },
    data: {
      categoryAccessMode: body.categoryAccessMode,
    },
    include: { project: true, user: { select: { id: true, fullName: true } } },
  });

  // Replace category permissions if provided
  if (body.categoryPermissions !== undefined) {
    await prisma.categoryPermission.deleteMany({
      where: { projectAssignmentId: id },
    });

    if (body.categoryPermissions?.length > 0) {
      await prisma.categoryPermission.createMany({
        data: body.categoryPermissions.map(
          (cp: { categoryId: string; canAccess: boolean }) => ({
            projectAssignmentId: id,
            categoryId: cp.categoryId,
            canAccess: cp.canAccess,
          })
        ),
      });
    }
  }

  await logActivity(
    currentUserId,
    "updated",
    "project_assignment",
    id,
    assignment.project.name,
    { userId: assignment.userId }
  );

  return NextResponse.json(assignment);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const currentUserId = getUserIdFromRequest(request)!;
  const { id } = await params;

  const assignment = await prisma.projectAssignment.findUnique({
    where: { id },
    include: { project: true, user: { select: { id: true, fullName: true } } },
  });

  if (!assignment) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 }
    );
  }

  await prisma.projectAssignment.delete({ where: { id } });

  await logActivity(
    currentUserId,
    "unassigned",
    "project",
    assignment.projectId,
    assignment.project.name,
    { removedUserId: assignment.userId, removedUserName: assignment.user.fullName }
  );

  return NextResponse.json({ success: true });
}
