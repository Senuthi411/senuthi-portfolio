import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/data/public';
import { TechnologyBadge } from '@/components/public/technology-badge';
import { STATUS_LABELS, formatDate } from '@/lib/utils';
import { Github, FileText, ExternalLink, PlayCircle } from 'lucide-react';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.short_description ?? undefined,
    openGraph: {
      title: project.title,
      description: project.short_description ?? undefined,
      images: project.cover_image_url ? [project.cover_image_url] : undefined,
    },
  };
}

/** Renders a labeled section only if it has content — no empty headings on the public site. */
function CaseStudySection({ number, title, children }: { number?: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/5 pt-8">
      <h2 className="font-display text-xl font-bold text-white">
        {number && <span className="mr-2 text-accent-400">{number}.</span>}
        {title}
      </h2>
      <div className="mt-4 whitespace-pre-line leading-relaxed text-slate-400">{children}</div>
    </div>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const sections: { number: string; title: string; content: string | null }[] = [
    { number: '1', title: 'Overview', content: project.full_description },
    { number: '2', title: 'The Problem', content: project.problem },
    { number: '3', title: 'Goal', content: project.goal },
    { number: '4', title: 'Solution', content: project.solution },
    { number: '5', title: 'How It Works', content: project.how_it_works },
    { number: '6', title: 'Hardware Components', content: project.hardware_components },
    { number: '7', title: 'Software & Technologies', content: project.software_technologies },
    { number: '8', title: 'Architecture', content: project.architecture_description },
    { number: '9', title: 'Development Process', content: project.development_process },
    { number: '10', title: 'Challenges', content: project.challenges },
    { number: '11', title: 'What I Learned', content: project.lessons_learned },
    { number: '12', title: 'Future Improvements', content: project.future_improvements },
  ].filter((s) => s.content && s.content.trim().length > 0);

  const links = [
    { href: project.github_url, label: 'View Source', icon: Github },
    { href: project.documentation_url, label: 'Read Docs', icon: FileText },
    { href: project.demo_url, label: 'Live Demo', icon: ExternalLink },
    { href: project.video_url, label: 'Watch Video', icon: PlayCircle },
  ].filter((l) => l.href);

  return (
    <article>
      <section className="container-page py-16">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-base-800 px-3 py-1 text-slate-300">{STATUS_LABELS[project.status]}</span>
          {project.project_date && (
            <span className="text-slate-500">Completed: {formatDate(project.project_date, { monthYearOnly: true })}</span>
          )}
        </div>

        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{project.title}</h1>
        {project.short_description && (
          <p className="mt-5 max-w-2xl text-lg text-slate-400">{project.short_description}</p>
        )}

        {links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-base-800"
              >
                <link.icon size={16} />
                {link.label}
              </a>
            ))}
          </div>
        )}

        {project.cover_image_url && (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/5 bg-base-800">
            <Image src={project.cover_image_url} alt={project.title} fill className="object-cover" priority />
          </div>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <TechnologyBadge key={t.id} name={t.name} />
            ))}
          </div>
        )}
      </section>

      {sections.length > 0 && (
        <section className="container-page space-y-8 pb-16">{sections.map((s) => (
          <CaseStudySection key={s.title} number={s.number} title={s.title}>
            {s.content}
          </CaseStudySection>
        ))}</section>
      )}

      {project.images && project.images.length > 0 && (
        <section className="container-page border-t border-white/5 py-16">
          <h2 className="font-display text-xl font-bold text-white">Gallery</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.images.map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-base-800">
                <Image src={img.image_url} alt={img.alt_text ?? project.title} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {(project.circuit_diagram_url || project.wiring_image_url || project.architecture_image_url) && (
        <section className="container-page border-t border-white/5 py-16">
          <h2 className="font-display text-xl font-bold text-white">Diagrams</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[project.architecture_image_url, project.circuit_diagram_url, project.wiring_image_url]
              .filter((src): src is string => Boolean(src))
              .map((src) => (
                <div key={src} className="relative aspect-video overflow-hidden rounded-xl border border-white/5 bg-base-800">
                  <Image src={src} alt="Project diagram" fill className="object-contain" />
                </div>
              ))}
          </div>
        </section>
      )}
    </article>
  );
}
