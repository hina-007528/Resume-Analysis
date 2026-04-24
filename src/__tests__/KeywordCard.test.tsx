import { render, screen } from "@testing-library/react";

import { KeywordCard } from "@/components/analyzer/KeywordCard";

describe("KeywordCard", () => {
  it("renders matched keyword styling", () => {
    const { container } = render(<KeywordCard keyword="python" isMatched={true} />);
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(container.querySelector(".text-green-400")).toBeTruthy();
  });

  it("renders missing keyword styling", () => {
    const { container } = render(<KeywordCard keyword="aws" isMatched={false} />);
    expect(screen.getByText("aws")).toBeInTheDocument();
    expect(container.querySelector(".text-red-400")).toBeTruthy();
  });
});
