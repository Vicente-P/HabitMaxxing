import type { CreateHabitInput } from "@/lib/validations";
import type { Habit } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";

export async function createHabit(input: CreateHabitInput, ownerId: string, repository: Pick<HabitRepository, "create">): Promise<Habit> {
  return repository.create({
    name: input.name,
    type: input.type,
    unit: input.type === "NUMERIC" ? input.unit : null,
    frequency: input.frequency,
    ownerId,
  });
}
