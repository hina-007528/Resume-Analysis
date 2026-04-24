import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { analyzeResume } from "@/lib/api/analyzerClient";

const server = setupServer(
  http.post("http://localhost:8000/api/v1/analyze", async () => {
    return HttpResponse.json({ analysis_id: "msw-1", match_score: 77.5 });
  }),
);

describe("analyzerClient", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
    server.listen();
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("posts form-data and returns API payload", async () => {
    const file = new File(["%PDF"], "resume.pdf", { type: "application/pdf" });
    const result = await analyzeResume({
      resumeFile: file,
      jobDescription: "Need python react fastapi engineer",
      userId: "guest",
    });
    expect(result.analysis_id).toBe("msw-1");
  });
});
