import { createClient } from '@/lib/supabase/server';
import { SocialLinksManager } from './social-links-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSocialLinksPage() {
  const supabase = await createClient();
  const { data: links } = await supabase.from('social_links').select('*').order('display_order');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Social Links</h1>
      <p className="mt-1 text-slate-400">Shown in your site footer and navigation.</p>
      <div className="mt-8">
        <SocialLinksManager links={links ?? []} />
      </div>
    </div>
  );
}
