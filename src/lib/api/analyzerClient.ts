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

  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
