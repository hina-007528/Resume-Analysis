import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, ChevronRight, Calendar, BarChart2, PlusCircle } from 'lucide-react';

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to login with return URL
    redirect('/login?next=/history');
  }

  const { data: analyses, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl mb-2">Neural <span className="text-[var(--secondary)]">Archive</span></h1>
            <p className="text-gray-400 font-[family-name:var(--font-instrument)]">Vault of your past resume intelligence reports.</p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase tracking-widest">Total Reports</div>
            <div className="text-2xl font-bold">{analyses?.length || 0}</div>
          </div>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 mb-8 font-[family-name:var(--font-jetbrains)] text-sm">
            Error loading archive data: {error.message}
          </div>
        )}

        <div className="space-y-4">
          {analyses?.map((analysis) => (
            <Link 
              key={analysis.id} 
              href={`/results/${analysis.id}`}
              className="block glass-card p-6 hover:border-[var(--primary)] transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0 p-4 rounded-xl bg-white/5 group-hover:bg-[var(--primary)]/10 transition-colors">
                  <FileText className="w-8 h-8 text-[var(--primary)]" />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg truncate">{analysis.resume_filename || 'Untitled Resume'}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      parseFloat(analysis.match_score) >= 70 
                        ? 'bg-green-500/20 text-green-400' 
                        : parseFloat(analysis.match_score) >= 50
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-[var(--accent)]/20 text-[var(--accent)]'
                    }`}>
                      {parseFloat(analysis.match_score).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate max-w-2xl font-[family-name:var(--font-instrument)]">
                    {analysis.job_description_snippet}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2 text-xs font-[family-name:var(--font-jetbrains)] text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-3 h-3" />
                    {analysis.score_label}
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[var(--primary)] transition-colors hidden md:block" />
              </div>
            </Link>
          ))}
          
          {(!analyses || analyses.length === 0) && (
            <div className="text-center py-20 glass-card">
              <PlusCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 mb-6 font-[family-name:var(--font-instrument)]">
                Your archive is empty. Only analyses performed while signed in are saved to your permanent history.
              </p>
              <Link href="/analyze" className="btn-primary px-8 py-3 inline-flex items-center gap-2 text-sm">
                <PlusCircle className="w-4 h-4" />
                Run First Analysis
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
