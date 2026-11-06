import { beforeEach, describe, expect, it } from "vitest";
import type { Habit, HabitType } from "../domain/habit";
import type { HabitRepository } from "./habit-repository";

export type SeedHabitInput = {
  id: string;
  ownerId: string;
  frequency: number[];
  createdAt: Date;
  name?: string;
  type?: HabitType;
  unit?: string | null;
};

/** What each implementation provides so the same cases run against it. */
export type HabitRepositoryHarness = {
  repository: HabitRepository;
  /** Makes an owner that exists in the implementation (a real User row for Prisma) and returns its id. */
  createOwner(): Promise<string>;
  /** Stores a habit with a fixed id and createdAt, bypassing `repository.create`, to control ordering. */
  seedHabit(input: SeedHabitInput): Promise<Habit>;
};

/** Behavioural contract every HabitRepository implementation must satisfy. A fresh harness is built per test. */
export function describeHabitRepositoryContract(
  name: string,
  factory: () => HabitRepositoryHarness | Promise<HabitRepositoryHarness>,
) {
  describe(`HabitRepository contract: ${name}`, () => {
    let harness: HabitRepositoryHarness;
    let repository: HabitRepository;
    let owner: string;

    beforeEach(async () => {
      harness = await factory();
      repository = harness.repository;
      owner = await harness.createOwner();
    });

    const seed = (id: string, createdAt: number, frequency: number[] = [0], ownerId = owner) =>
      harness.seedHabit({ id, ownerId, frequency, createdAt: new Date(createdAt) });

    describe("create", () => {
      it("persists a binary habit with a null unit for the owner", async () => {
        const created = await repository.create({ name: "Read", type: "BINARY", unit: null, frequency: [1, 3], ownerId: owner });
        expect(created).toMatchObject({ name: "Read", type: "BINARY", unit: null, frequency: [1, 3], userId: owner });
        expect(created.id).toEqual(expect.any(String));
        expect(created.createdAt).toBeInstanceOf(Date);
        expect(await repository.findById(created.id)).toEqual(created);
      });

      it("persists a numeric habit with its unit", async () => {
        const created = await repository.create({ name: "Run", type: "NUMERIC", unit: "km", frequency: [0], ownerId: owner });
        expect(created).toMatchObject({ type: "NUMERIC", unit: "km" });
      });
    });

    describe("listByOwner", () => {
      it("returns an empty list for an owner without habits", async () => {
        expect(await repository.listByOwner(owner)).toEqual([]);
      });

      it("returns only the habits of the owner", async () => {
        const other = await harness.createOwner();
        await seed("mine", 1000);
        await seed("foreign", 2000, [0], other);
        expect((await repository.listByOwner(owner)).map((h) => h.id)).toEqual(["mine"]);
        expect((await repository.listByOwner(other)).map((h) => h.id)).toEqual(["foreign"]);
      });

      it("orders newest first, then by id ascending on ties", async () => {
        await seed("b", 1000);
        await seed("c", 2000);
        await seed("a", 1000);
        expect((await repository.listByOwner(owner)).map((h) => h.id)).toEqual(["c", "a", "b"]);
      });
    });

    describe("listScheduledForDay", () => {
      it("returns only habits scheduled on the weekday, including Sunday = 0", async () => {
        await seed("sunday", 1000, [0]);
        await seed("midweek", 2000, [1, 3]);
        await seed("weekend", 3000, [0, 6]);
        expect((await repository.listScheduledForDay(owner, 0, "2026-05-24")).map((h) => h.id)).toEqual(["weekend", "sunday"]);
        expect((await repository.listScheduledForDay(owner, 3, "2026-05-20")).map((h) => h.id)).toEqual(["midweek"]);
        expect(await repository.listScheduledForDay(owner, 2, "2026-05-19")).toEqual([]);
      });

      it("scopes to the owner", async () => {
        const other = await harness.createOwner();
        await seed("mine", 1000, [2]);
        await seed("foreign", 2000, [2], other);
        expect((await repository.listScheduledForDay(owner, 2, "2026-05-19")).map((h) => h.id)).toEqual(["mine"]);
      });

      it("attaches only the log of the requested date, or null", async () => {
        await seed("h", 1000, [3]);
        await repository.upsertBinaryLog("h", "2026-05-19", true);
        const saved = await repository.upsertBinaryLog("h", "2026-05-20", true);
        const [withLog] = await repository.listScheduledForDay(owner, 3, "2026-05-20");
        expect(withLog.log).toEqual({ id: saved.id, completed: true, value: null, date: "2026-05-20" });
        const [withoutLog] = await repository.listScheduledForDay(owner, 3, "2026-05-21");
        expect(withoutLog.log).toBeNull();
      });

      it("orders newest first, then by id ascending on ties", async () => {
        await seed("b", 1000, [4]);
        await seed("c", 2000, [4]);
        await seed("a", 1000, [4]);
        expect((await repository.listScheduledForDay(owner, 4, "2026-05-21")).map((h) => h.id)).toEqual(["c", "a", "b"]);
      });
    });

    describe("findById", () => {
      it("returns a habit regardless of its owner", async () => {
        const other = await harness.createOwner();
        await seed("foreign", 1000, [0], other);
        expect(await repository.findById("foreign")).toMatchObject({ id: "foreign", userId: other });
      });

      it("returns null when the habit does not exist", async () => {
        expect(await repository.findById("missing")).toBeNull();
      });
    });

    describe("upsertBinaryLog", () => {
      it("creates a log with the given completion", async () => {
        await seed("h", 1000);
        const saved = await repository.upsertBinaryLog("h", "2026-05-20", true);
        expect(saved).toMatchObject({ habitId: "h", date: "2026-05-20", completed: true, value: null });
        expect(saved.id).toEqual(expect.any(String));
        expect(saved.createdAt).toBeInstanceOf(Date);
      });

      it("updates the same row when reverting and never deletes it", async () => {
        await seed("h", 1000, [3]);
        const first = await repository.upsertBinaryLog("h", "2026-05-20", true);
        const reverted = await repository.upsertBinaryLog("h", "2026-05-20", false);
        expect(reverted).toMatchObject({ id: first.id, completed: false });
        const [scheduled] = await repository.listScheduledForDay(owner, 3, "2026-05-20");
        expect(scheduled.log).toEqual({ id: first.id, completed: false, value: null, date: "2026-05-20" });
      });

      it("keeps one row per habit and day while distinct days get distinct rows", async () => {
        await seed("h", 1000);
        const a = await repository.upsertBinaryLog("h", "2026-05-20", true);
        const again = await repository.upsertBinaryLog("h", "2026-05-20", true);
        const next = await repository.upsertBinaryLog("h", "2026-05-21", true);
        expect(again.id).toBe(a.id);
        expect(next.id).not.toBe(a.id);
      });
    });

    describe("upsertNumericLog", () => {
      it("creates a completed log with the value", async () => {
        await seed("h", 1000);
        const saved = await repository.upsertNumericLog("h", "2026-05-20", 12.5);
        expect(saved).toMatchObject({ habitId: "h", date: "2026-05-20", completed: true, value: 12.5 });
      });

      it("replaces the value of the same day in the same row", async () => {
        await seed("h", 1000, [3]);
        const first = await repository.upsertNumericLog("h", "2026-05-20", 3);
        const second = await repository.upsertNumericLog("h", "2026-05-20", 8);
        expect(second).toMatchObject({ id: first.id, completed: true, value: 8 });
        const [scheduled] = await repository.listScheduledForDay(owner, 3, "2026-05-20");
        expect(scheduled.log).toEqual({ id: first.id, completed: true, value: 8, date: "2026-05-20" });
      });
    });

    describe("dates", () => {
      it.each(["2026-01-01", "2026-12-31", "2028-02-29"])("returns %s without time zone shift", async (date) => {
        await seed("h", 1000);
        expect((await repository.upsertBinaryLog("h", date, true)).date).toBe(date);
        expect((await repository.upsertNumericLog("h", date, 1)).date).toBe(date);
      });
    });
  });
}
