import { createClient } from '@/lib/supabase/server';
import { ProjectForm } from '../project-form';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('project_categories').select('*').order('display_order');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Add Project</h1>
      <p className="mt-1 text-slate-400">Basic details take about a minute. Everything else is optional.</p>
      <div className="mt-8 max-w-2xl">
        <ProjectForm categories={categories ?? []} />
      </div>
    </div>
  );
}
