import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./habit-catalog", () => ({ default: ({ ownerId, onHabitsChanged }: { ownerId: string; onHabitsChanged: () => void }) => <button type="button" data-owner={ownerId} onClick={onHabitsChanged}>changed</button> }));
vi.mock("./habit-agenda", () => ({ default: ({ ownerId, refreshKey }: { ownerId: string; refreshKey: number }) => <p data-testid="agenda" data-owner={ownerId}>{refreshKey}</p> }));

import DashboardHabits from "./dashboard-habits";

afterEach(cleanup);

describe("dashboard habits wiring", () => {
  it("bumps the agenda refreshKey each time the catalog reports a change", async () => {
    render(<DashboardHabits ownerId="u1" />);
    expect(screen.getByTestId("agenda")).toHaveTextContent("0");
    expect(screen.getByTestId("agenda")).toHaveAttribute("data-owner", "u1");
    await userEvent.click(screen.getByRole("button", { name: "changed" }));
    expect(screen.getByTestId("agenda")).toHaveTextContent("1");
    await userEvent.click(screen.getByRole("button", { name: "changed" }));
    expect(screen.getByTestId("agenda")).toHaveTextContent("2");
  });
});
