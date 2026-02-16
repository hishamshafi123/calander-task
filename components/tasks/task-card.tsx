"use client";

import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onClick?: () => void;
}

export default function TaskCard({
  task,
  compact = false,
  onClick,
}: TaskCardProps) {
  const statusColors = {
    "not-started":
      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    waiting:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    "in-progress":
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  const priorityBorders = {
    low: "border-l-4 border-gray-400",
    medium: "border-l-4 border-yellow-500",
    high: "border-l-4 border-red-500",
  };

  if (compact) {
    return (
      <div
        className={cn(
          "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
          statusColors[task.status],
          priorityBorders[task.priority],
        )}
        onClick={onClick}
      >
        <div className="flex items-center space-x-1">
          <span className={cn(task.status === "completed" && "line-through")}>
            {task.title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow",
        statusColors[task.status],
        priorityBorders[task.priority],
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3
              className={cn(
                "font-medium",
                task.status === "completed" && "line-through",
              )}
            >
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="mt-1 text-sm opacity-75">{task.description}</p>
          )}
          {task.startTime && task.endTime && (
            <div className="mt-2 text-xs">
              {task.startTime} - {task.endTime}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
