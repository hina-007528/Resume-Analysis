import { act, renderHook } from "@testing-library/react";
import axios from "axios";
import { vi } from "vitest";

import { useAnalyzer } from "@/hooks/useAnalyzer";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("axios");
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}));

describe("useAnalyzer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("transitions idle -> success", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: { analysis_id: "abc", match_score: 80 },
    });

    const { result } = renderHook(() => useAnalyzer());
    const file = new File(["%PDF"], "resume.pdf", { type: "application/pdf" });
    act(() => {
      result.current.setFile(file);
      result.current.setJobDescription("x".repeat(80));
    });

    await act(async () => {
      await result.current.handleAnalyze("guest");
    });

    expect(result.current.status).toBe("success");
    expect(push).toHaveBeenCalledWith("/results/abc");
  });

  it("transitions idle -> error on api failure", async () => {
    (axios.post as any).mockRejectedValueOnce({
      response: { data: { detail: "Backend down" } },
    });

    const { result } = renderHook(() => useAnalyzer());
    const file = new File(["%PDF"], "resume.pdf", { type: "application/pdf" });
    act(() => {
      result.current.setFile(file);
      result.current.setJobDescription("x".repeat(80));
    });

    await act(async () => {
      await result.current.handleAnalyze("guest");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toContain("Backend down");
  });
});
