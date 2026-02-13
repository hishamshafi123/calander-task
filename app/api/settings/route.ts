import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst({
      where: { id: "default" },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.settings.create({
        data: {
          id: "default",
          weekStartsOn: 1,
          defaultView: "month",
          darkMode: false,
          showCompleted: true,
          defaultStatus: "not-started",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {
        weekStartsOn: body.weekStartsOn,
        defaultView: body.defaultView,
        darkMode: body.darkMode,
        showCompleted: body.showCompleted,
        defaultStatus: body.defaultStatus,
      },
      create: {
        id: "default",
        weekStartsOn: body.weekStartsOn || 1,
        defaultView: body.defaultView || "month",
        darkMode: body.darkMode || false,
        showCompleted:
          body.showCompleted !== undefined ? body.showCompleted : true,
        defaultStatus: body.defaultStatus || "not-started",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
