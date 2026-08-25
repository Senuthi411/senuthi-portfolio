import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectForm } from '../../project-form';
import { GalleryManager } from './gallery-manager';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: categories }, { data: technologies }, { data: images }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).maybeSingle(),
    supabase.from('project_categories').select('*').order('display_order'),
    supabase.from('project_technologies').select('technology:technologies(*)').eq('project_id', id),
    supabase.from('project_images').select('*').eq('project_id', id).order('display_order'),
  ]);

  if (!project) notFound();

  const projectWithTech = {
    ...project,
    technologies: (technologies ?? []).map((t: any) => t.technology).filter(Boolean),
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Edit: {project.title}</h1>
      <div className="mt-8 max-w-2xl space-y-10">
        <ProjectForm project={projectWithTech} categories={categories ?? []} />
        <div className="border-t border-white/5 pt-8">
          <h2 className="font-semibold text-white">Gallery</h2>
          <p className="mt-1 text-sm text-slate-500">Upload additional project images shown on the case study page.</p>
          <div className="mt-4">
            <GalleryManager projectId={project.id} images={images ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
