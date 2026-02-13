"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/tasks/task-card";
import TaskFormModal from "@/components/tasks/task-form-modal";
import { Plus } from "lucide-react";

interface DayTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  tasks: Task[];
}

export default function DayTasksModal({
  open,
  onOpenChange,
  date,
  tasks,
}: DayTasksModalProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleNewTask = () => {
    setShowNewTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  if (!date) return null;

  // Group tasks by status
  const tasksByStatus = {
    "not-started": tasks.filter((t) => t.status === "not-started"),
    waiting: tasks.filter((t) => t.status === "waiting"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const statusLabels = {
    "not-started": "Not Started",
    waiting: "Waiting",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-3xl max-h-[80vh] overflow-y-auto"
          onClose={() => onOpenChange(false)}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{format(date, "EEEE, MMMM d, yyyy")}</DialogTitle>
              <Button size="sm" onClick={handleNewTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No tasks for this day
                </p>
                <Button onClick={handleNewTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              </div>
            ) : (
              Object.entries(tasksByStatus).map(([status, statusTasks]) => {
                if (statusTasks.length === 0) return null;

                return (
                  <div key={status}>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      {statusLabels[status as keyof typeof statusLabels]}
                      <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {statusTasks.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {statusTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => handleTaskClick(task)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TaskFormModal
        open={showTaskModal}
        onOpenChange={(open) => {
          if (!open) handleCloseTaskModal();
          else setShowTaskModal(open);
        }}
        task={selectedTask}
      />

      <TaskFormModal
        open={showNewTaskModal}
        onOpenChange={setShowNewTaskModal}
        defaultDate={date}
      />
    </>
  );
}
