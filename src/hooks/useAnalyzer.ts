import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export interface AnalysisResult {
  analysis_id: string;
  match_score: number;
  score_label: string;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
  entities: Record<string, string[]>;
  word_count: number;
  processing_time_ms: number;

}

export const useAnalyzer = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleAnalyze = async (userId: string = 'guest') => {
    if (!file || jobDescription.length < 50) {
      setError('Please provide a valid resume and job description (min 50 chars).');
      return;
    }

    setStatus('loading');
    setError(null);

    const formData = new FormData();
    formData.append('resume_file', file);
    formData.append('job_description', jobDescription);
    let resolvedUserId = userId;
    if (resolvedUserId === 'guest') {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user?.id) {
          resolvedUserId = data.user.id;
        }
      } catch {
        // Keep guest fallback if auth lookup fails.
      }
    }
    formData.append('user_id', resolvedUserId);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_URL
        : `https://${process.env.NEXT_PUBLIC_API_URL}`;

      const response = await axios.post(`${apiUrl}/api/v1/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
      setStatus('success');
      
      // Redirect to results page after success
      router.push(`/results/${response.data.analysis_id}`);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setStatus('error');
      const message = err.response?.data?.detail 
        || err.message 
        || 'Connection to Neural Engine failed. Please ensure the backend is running.';
      setError(message);
    }

  };

  return {
    status,
    file,
    setFile,
    jobDescription,
    setJobDescription,
    result,
    error,
    handleAnalyze
  };
};
