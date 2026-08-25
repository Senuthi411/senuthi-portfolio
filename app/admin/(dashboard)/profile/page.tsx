import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('*').limit(1).maybeSingle();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
      <p className="mt-1 text-slate-400">Manage your public portfolio identity.</p>
      <div className="mt-8 max-w-2xl">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
