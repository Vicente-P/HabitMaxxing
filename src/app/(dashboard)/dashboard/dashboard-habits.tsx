"use client";

import { useState } from "react";
import HabitAgenda from "./habit-agenda";
import HabitCatalog from "./habit-catalog";

/** Links the catalog and the agenda: a saved edit bumps the key so the agenda refetches. */
export default function DashboardHabits({ ownerId }: { ownerId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <HabitAgenda ownerId={ownerId} refreshKey={refreshKey} />
      <HabitCatalog ownerId={ownerId} onHabitsChanged={() => setRefreshKey((key) => key + 1)} />
    </>
  );
}
