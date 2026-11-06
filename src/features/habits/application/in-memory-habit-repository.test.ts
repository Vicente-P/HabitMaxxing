import { describeHabitRepositoryContract } from "./habit-repository.contract";
import { InMemoryHabitRepository } from "./in-memory-habit-repository";

describeHabitRepositoryContract("InMemoryHabitRepository", () => {
  const repository = new InMemoryHabitRepository();
  let owners = 0;
  return {
    repository,
    async createOwner() {
      owners += 1;
      return `owner-${owners}`;
    },
    async seedHabit(input) {
      const habit = {
        id: input.id, name: input.name ?? "Habit", type: input.type ?? "BINARY", unit: input.unit ?? null,
        frequency: input.frequency, userId: input.ownerId, createdAt: input.createdAt, updatedAt: input.createdAt,
      };
      repository.seed(habit);
      return habit;
    },
  };
});
