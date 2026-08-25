import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: totalProjects }, { count: publishedProjects }, { count: skillsCount }, { count: unreadMessages }, { data: profile }] =
    await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false),
      supabase.from('profiles').select('full_name, biography, profile_photo_url').maybeSingle(),
    ]);

  const draftProjects = (totalProjects ?? 0) - (publishedProjects ?? 0);

  const profileFields = [profile?.full_name, profile?.biography, profile?.profile_photo_url];
  const profileCompletion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  const stats = [
    { label: 'Total Projects', value: totalProjects ?? 0 },
    { label: 'Published', value: publishedProjects ?? 0 },
    { label: 'Drafts', value: draftProjects },
    { label: 'Skills Tracked', value: skillsCount ?? 0 },
    { label: 'Unread Messages', value: unreadMessages ?? 0 },
    { label: 'Profile Completion', value: `${profileCompletion}%` },
  ];

  const quickActions = [
    { href: '/admin/profile', label: 'Edit Profile' },
    { href: '/admin/projects', label: 'Manage Projects' },
    { href: '/admin/projects/new', label: 'Add Project' },
    { href: '/admin/messages', label: 'View Messages' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">
        Good to see you, {profile?.full_name?.split(' ')[0] ?? 'there'} <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-1 text-slate-400">Here&apos;s what&apos;s happening with your portfolio.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/5 bg-base-800 p-5">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-slate-300">Quick Actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-xl border border-white/5 bg-base-800 p-4 text-sm text-slate-200 transition hover:border-accent-500/40 hover:bg-base-700"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
