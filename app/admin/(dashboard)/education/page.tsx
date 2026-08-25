import { createClient } from '@/lib/supabase/server';
import { EducationManager } from './education-manager';

export const dynamic = 'force-dynamic';

export default async function AdminEducationPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase.from('education').select('*').order('display_order');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Education</h1>
      <p className="mt-1 text-slate-400">Manage your education history.</p>
      <div className="mt-8">
        <EducationManager education={entries ?? []} />
      </div>
    </div>
  );
}
