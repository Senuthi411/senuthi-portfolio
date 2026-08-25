import { createClient } from '@/lib/supabase/server';
import { SectionToggleList } from './section-toggle-list';

export const dynamic = 'force-dynamic';

export default async function AdminSectionSettingsPage() {
  const supabase = await createClient();
  const { data: sections } = await supabase.from('section_settings').select('*').order('display_order');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Section Settings</h1>
      <p className="mt-1 text-slate-400">Turn public sections on or off without touching any code.</p>
      <div className="mt-8 max-w-lg">
        <SectionToggleList sections={sections ?? []} />
      </div>
    </div>
  );
}
