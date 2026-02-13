"use client";

import { Task, TaskStatus } from "@/lib/types";
import { useStore } from "@/lib/store";
import TaskCard from "@/components/tasks/task-card";

interface StatusColumnProps {
  status: TaskStatus;
  label: string;
  icon: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function StatusColumn({
  status,
  label,
  icon,
  tasks,
  onTaskClick,
}: StatusColumnProps) {
  const { updateTask } = useStore();

  const statusColors = {
    "not-started": "bg-gray-100 dark:bg-gray-700",
    waiting: "bg-yellow-100 dark:bg-yellow-900/30",
    "in-progress": "bg-blue-100 dark:bg-blue-900/30",
    completed: "bg-green-100 dark:bg-green-900/30",
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`${statusColors[status]} px-4 py-3 rounded-t-lg border-b-4 border-gray-300 dark:border-gray-600`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {label}
            </h3>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow space-y-3 min-h-96">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              <TaskCard task={task} onClick={() => onTaskClick?.(task)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
