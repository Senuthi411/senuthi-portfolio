import { createClient } from '@/lib/supabase/server';
import { SkillsManager } from './skills-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSkillsPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: skills }] = await Promise.all([
    supabase.from('skill_categories').select('*').order('display_order'),
    supabase.from('skills').select('*').order('display_order'),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Skills</h1>
      <p className="mt-1 text-slate-400">Manage the skills and tools shown on your public Skills page.</p>
      <div className="mt-8">
        <SkillsManager categories={categories ?? []} skills={skills ?? []} />
      </div>
    </div>
  );
}
