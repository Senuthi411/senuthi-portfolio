import type { Metadata } from 'next';
import { getPublishedProjects } from '@/lib/data/public';
import { ProjectCard } from '@/components/public/project-card';
import { EmptyState } from '@/components/public/empty-state';

export const metadata: Metadata = { title: 'Projects' };
export const revalidate = 0;

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <section className="container-page py-16">
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">My Projects</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Projects created through learning, experimentation, academic work, and practical development.
      </p>

      {projects.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No published projects yet" description="Check back soon." />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
