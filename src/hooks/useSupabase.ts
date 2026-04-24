'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const useSupabase = () => {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const getHistory = async () => {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const subscribeToAnalyses = (callback: (payload: any) => void) => {
    return supabase
      .channel('analyses-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'analyses' },
        (payload) => callback(payload)
      )
      .subscribe();
  };

  return { session, getHistory, subscribeToAnalyses, supabase };
};
