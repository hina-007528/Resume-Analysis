import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { ScoreDisplay } from "@/components/analyzer/ScoreDisplay";

vi.mock("gsap", () => ({
  default: {
    fromTo: vi.fn(),
  },
}));

describe("ScoreDisplay", () => {
  it("renders score and label", () => {
    render(<ScoreDisplay score={85} label="Excellent Match" />);
    expect(screen.getByText("Excellent Match")).toBeInTheDocument();
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it("applies low-score color class", () => {
    const { container } = render(<ScoreDisplay score={20} label="Low Match" />);
    expect(container.querySelector(".text-red-500")).toBeTruthy();
  });
});
