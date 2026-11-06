import type { Habit } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";

export function listHabitCatalog(ownerId: string, repository: Pick<HabitRepository, "listByOwner">): Promise<Habit[]> {
  return repository.listByOwner(ownerId);
}
