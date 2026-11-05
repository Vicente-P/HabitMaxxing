import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AuthShell from "./auth-shell";
import AuthField from "./auth-field";

describe("AuthShell", () => {
  it("renders the form content next to a decorative brand panel with a 26x7 heatmap", () => {
    render(<AuthShell mode="login"><p>form content</p></AuthShell>);
    expect(screen.getByText("form content")).toBeInTheDocument();
    const panel = screen.getByTestId("auth-brand-panel");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel.querySelectorAll("[data-heat]")).toHaveLength(182);
  });

  it("uses mockup copy per mode", () => {
    const { rerender } = render(<AuthShell mode="login">x</AuthShell>);
    expect(screen.getByTestId("auth-brand-panel")).toHaveTextContent("Tu racha te espera");
    rerender(<AuthShell mode="register">x</AuthShell>);
    expect(screen.getByTestId("auth-brand-panel")).toHaveTextContent("Empieza hoy");
  });

  it("draws heatmap cells only with design-token classes", () => {
    render(<AuthShell mode="login">x</AuthShell>);
    const cells = Array.from(screen.getByTestId("auth-brand-panel").querySelectorAll("[data-heat]"));
    for (const cell of cells) expect(cell.className).toMatch(/bg-hm-heat-[0-4]/);
    expect(new Set(cells.map((cell) => cell.getAttribute("data-heat"))).size).toBeGreaterThan(1);
  });
});

describe("AuthField", () => {
  it("links the label, error and invalid state to the input", () => {
    render(<AuthField id="email" label="Correo electrónico" icon="mail" error="Introduce un email válido" />);
    const input = screen.getByLabelText("Correo electrónico");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
    expect(screen.getByText("Introduce un email válido")).toHaveAttribute("id", "email-error");
  });

  it("is valid without an error", () => {
    render(<AuthField id="name" label="Nombre" icon="user" />);
    expect(screen.getByLabelText("Nombre")).not.toHaveAttribute("aria-invalid", "true");
  });
});
