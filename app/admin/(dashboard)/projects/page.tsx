import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DataTable } from '@/components/admin/data-table';
import { EmptyState } from '@/components/public/empty-state';
import { STATUS_LABELS } from '@/lib/utils';
import { ProjectRowActions } from './project-row-actions';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('*, category:project_categories(name)')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-slate-400">Manage the projects shown on your public site.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          <Plus size={16} />
          Add Project
        </Link>
      </div>

      <div className="mt-8">
        {!projects || projects.length === 0 ? (
          <EmptyState title="No projects yet" description="Click “Add Project” to create your first one." />
        ) : (
          <DataTable headers={['Project', 'Category', 'Status', 'Published', 'Updated', '']}>
            {projects.map((p: any) => (
              <tr key={p.id}>
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-base-800">
                    {p.cover_image_url && <Image src={p.cover_image_url} alt="" fill className="object-cover" />}
                  </div>
                  <span className="font-medium text-white">{p.title}</span>
                  {p.is_featured && <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-[10px] text-accent-400">Featured</span>}
                </td>
                <td className="px-4 py-3 text-slate-400">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400">{STATUS_LABELS[p.status]}</td>
                <td className="px-4 py-3">
                  <span className={p.is_published ? 'text-emerald-400' : 'text-slate-500'}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(p.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <ProjectRowActions id={p.id} slug={p.slug} isPublished={p.is_published} />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
