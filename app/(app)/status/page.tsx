"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import StatusBoard from "@/components/status/status-board";

export default function StatusPage() {
  const { setTasks, setCategories, setSettings, setIsLoading } = useStore();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const tasksRes = await fetch("/api/tasks");
        const tasks = await tasksRes.json();
        setTasks(tasks);

        const categoriesRes = await fetch("/api/categories");
        const categories = await categoriesRes.json();
        setCategories(categories);

        const settingsRes = await fetch("/api/settings");
        const settings = await settingsRes.json();
        setSettings(settings);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [setTasks, setCategories, setSettings, setIsLoading]);

  return (
    <div className="p-6">
      <StatusBoard />
    </div>
  );
}
