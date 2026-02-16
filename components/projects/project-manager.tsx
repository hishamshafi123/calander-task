"use client";

import { SubmitEvent, useState } from "react";
import { useStore } from "@/lib/store";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
import { ConfirmDialog, AlertDialog } from "@/components/ui/confirm-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ProjectManager() {
  const { projects, addProject, updateProject, deleteProject } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#3b82f6");
    setEditingProject(null);
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setName(project.name);
      setDescription(project.description || "");
      setColor(project.color);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      if (editingProject) {
        // Update existing project
        const response = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, color }),
        });

        if (response.ok) {
          const updated = await response.json();
          updateProject(editingProject.id, updated);
        }
      } else {
        // Create new project
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            color,
            order: projects.length,
          }),
        });

        if (response.ok) {
          const newProject = await response.json();
          addProject(newProject);
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving project:", error);
      setAlertMessage("Failed to save project");
    }
  };

  const handleDeleteClick = (project: Project) => {
    setDeletingProject(project);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    try {
      const response = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteProject(deletingProject.id);
      } else {
        const error = await response.json();
        setAlertMessage(error.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setAlertMessage("Failed to delete project");
    } finally {
      setDeletingProject(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Projects
        </h3>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No projects yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Create your first project to organize your categories
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {project.name}
                  </div>
                  {project.categories && project.categories.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {project.categories.length}{" "}
                      {project.categories.length === 1
                        ? "category"
                        : "categories"}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {project.description}
                  </p>
                )}
                <div
                  className="w-16 h-2 rounded mt-2"
                  style={{ backgroundColor: project.color }}
                />
              </div>
              <div className="flex space-x-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleOpenModal(project)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteClick(project)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onOpenChange={setShowModal}>
        <ModalContent onClose={() => setShowModal(false)}>
          <ModalHeader>
            <ModalTitle>
              {editingProject ? "Edit Project" : "Add New Project"}
            </ModalTitle>
          </ModalHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Personal, Work"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label htmlFor="color">Color *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                  required
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProject ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={!!deletingProject}
        onOpenChange={(open) => {
          if (!open) setDeletingProject(null);
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? You can only delete projects with no categories.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />

      <AlertDialog
        open={!!alertMessage}
        onOpenChange={() => setAlertMessage(null)}
        title="Error"
        message={alertMessage ?? ""}
        variant="destructive"
      />
    </div>
  );
}
