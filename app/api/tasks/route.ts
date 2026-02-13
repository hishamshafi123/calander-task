import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : null,
        startTime: body.startTime,
        endTime: body.endTime,
        status: body.status || "not-started",
        priority: body.priority || "medium",
        categoryId: body.categoryId,
        show: body.show !== undefined ? body.show : true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
