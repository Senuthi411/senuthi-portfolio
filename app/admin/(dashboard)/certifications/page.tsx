import { createClient } from '@/lib/supabase/server';
import { CertificationsManager } from './certifications-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCertificationsPage() {
  const supabase = await createClient();
  const { data: certifications } = await supabase.from('certifications').select('*').order('display_order');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Certifications</h1>
      <p className="mt-1 text-slate-400">No certificates yet? The public section stays hidden until you add one.</p>
      <div className="mt-8">
        <CertificationsManager certifications={certifications ?? []} />
      </div>
    </div>
  );
}
