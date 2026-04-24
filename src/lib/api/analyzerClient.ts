import axios from "axios";

export interface AnalyzePayload {
  resumeFile: File;
  jobDescription: string;
  userId?: string;
}

export const analyzeResume = async ({ resumeFile, jobDescription, userId = "guest" }: AnalyzePayload) => {
  const formData = new FormData();
  formData.append("resume_file", resumeFile);
  formData.append("job_description", jobDescription);
  formData.append("user_id", userId);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_API_URL
    : `https://${process.env.NEXT_PUBLIC_API_URL}`;

  const response = await axios.post(`${apiUrl}/api/v1/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
