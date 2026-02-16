import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserIdFromRequest } from "@/lib/api-helpers";
import { logActivity } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  const userId = searchParams.get("userId");

  const where: Record<string, string> = {};
  if (taskId) where.taskId = taskId;
  if (userId) where.userId = userId;

  const assignments = await prisma.taskAssignment.findMany({
    where,
    include: {
      task: true,
      user: { select: { id: true, fullName: true, username: true } },
    },
  });

  return NextResponse.json(assignments);
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const currentUserId = getUserIdFromRequest(request)!;
  const body = await request.json();

  if (!body.taskId || !body.userId) {
    return NextResponse.json(
      { error: "taskId and userId are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.taskAssignment.findUnique({
    where: {
      taskId_userId: { taskId: body.taskId, userId: body.userId },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User is already assigned to this task" },
      { status: 409 }
    );
  }

  const assignment = await prisma.taskAssignment.create({
    data: {
      taskId: body.taskId,
      userId: body.userId,
    },
    include: {
      task: true,
      user: { select: { id: true, fullName: true, username: true } },
    },
  });

  await logActivity(
    currentUserId,
    "assigned",
    "task",
    assignment.taskId,
    assignment.task.title,
    { assignedUserId: assignment.userId }
  );

  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const currentUserId = getUserIdFromRequest(request)!;
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  const userId = searchParams.get("userId");

  if (!taskId || !userId) {
    return NextResponse.json(
      { error: "taskId and userId are required" },
      { status: 400 }
    );
  }

  const assignment = await prisma.taskAssignment.findUnique({
    where: { taskId_userId: { taskId, userId } },
    include: { task: true },
  });

  if (!assignment) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 }
    );
  }

  await prisma.taskAssignment.delete({
    where: { taskId_userId: { taskId, userId } },
  });

  await logActivity(
    currentUserId,
    "unassigned",
    "task",
    taskId,
    assignment.task.title,
    { removedUserId: userId }
  );

  return NextResponse.json({ success: true });
}
