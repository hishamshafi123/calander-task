import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest, requireAdmin } from "@/lib/api-helpers";
import { getAssignedProjects, logActivity } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getAssignedProjects(userId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const userId = getUserIdFromRequest(request)!;

  try {
    const body = await request.json();

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        color: body.color || "#3b82f6",
        order: body.order || 0,
      },
    });

    await logActivity(userId, "created", "project", project.id, project.name);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
