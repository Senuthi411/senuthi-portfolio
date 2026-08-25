import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/types/supabase';
import { STATUS_LABELS } from '@/lib/utils';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/5 bg-base-800 transition hover:border-accent-500/40">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-base-700">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No cover image</div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-base-950/80 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      <div className="p-6">
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span key={tech.id} className="rounded-full bg-base-700 px-2.5 py-0.5 text-xs text-slate-300">
                {tech.name}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-display text-xl font-bold text-white">{project.title}</h3>
        {project.short_description && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-400">{project.short_description}</p>
        )}

        {(project.project_role || project.team_details) && (
          <div className="mt-4 flex gap-8 text-sm">
            {project.project_role && (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Role</div>
                <div className="text-slate-300">{project.project_role}</div>
              </div>
            )}
          </div>
        )}

        <Link
          href={`/projects/${project.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-400 transition hover:text-accent-500"
        >
          View Case Study
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
