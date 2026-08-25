import { createClient } from '@/lib/supabase/server';
import { CategoriesManager } from './categories-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('project_categories').select('*').order('display_order');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Project Categories</h1>
      <p className="mt-1 text-slate-400">Organize projects into categories. Future categories are created here, not in code.</p>
      <div className="mt-8">
        <CategoriesManager initialCategories={categories ?? []} />
      </div>
    </div>
  );
}
