"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import MonthView from "@/components/calendar/month-view";

export default function Home() {
  const { setTasks, setCategories, setSettings, setIsLoading } = useStore();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch tasks
        const tasksRes = await fetch("/api/tasks");
        const tasks = await tasksRes.json();
        setTasks(tasks);

        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        const categories = await categoriesRes.json();
        setCategories(categories);

        // Fetch settings
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
      <MonthView />
    </div>
  );
}
