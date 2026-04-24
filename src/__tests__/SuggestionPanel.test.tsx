import { render, screen } from "@testing-library/react";

import { SuggestionPanel } from "@/components/analyzer/SuggestionPanel";

describe("SuggestionPanel", () => {
  it("renders all suggestions", () => {
    const suggestions = ["Add AWS", "Quantify achievements", "Improve summary"];
    render(<SuggestionPanel suggestions={suggestions} />);
    suggestions.forEach((s) => {
      expect(screen.getByText(s)).toBeInTheDocument();
    });
  });
});
