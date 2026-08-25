import Link from 'next/link';
import Image from 'next/image';
import { getProfile, getSectionSettings, isSectionEnabled, getFeaturedProject, getVisibleEducation } from '@/lib/data/public';
import { ProjectCard } from '@/components/public/project-card';
import { EmptyState } from '@/components/public/empty-state';

export default async function HomePage() {
  const [profile, sections, featuredProject, education] = await Promise.all([
    getProfile(),
    getSectionSettings(),
    getFeaturedProject(),
    getVisibleEducation(),
  ]);

  const heroEnabled = isSectionEnabled(sections, 'hero');
  const aboutEnabled = isSectionEnabled(sections, 'about');
  const projectsEnabled = isSectionEnabled(sections, 'projects');

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const currentEducation = education.find((e) => e.currently_studying) ?? education[0];

  return (
    <>
      {heroEnabled && (
        <section className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            {profile?.badge_text && (
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-base-800 px-4 py-1.5 text-sm text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                {profile.badge_text}
              </span>
            )}

            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Hi, I&apos;m <span className="text-accent-400">{firstName}</span> <span aria-hidden="true">👋</span>
              <br />
              {profile?.title}
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-400">{profile?.hero_description}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="rounded-lg bg-accent-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-600"
              >
                View My Project
              </Link>
              {profile?.resume_url && (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-base-800"
                >
                  View Resume
                </a>
              )}
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-base-800">
            {profile?.profile_photo_url ? (
              <Image src={profile.profile_photo_url} alt={profile.full_name} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-600">No photo set</div>
            )}
          </div>
        </section>
      )}

      {aboutEnabled && profile && (
        <section className="border-t border-white/5 bg-base-900/40 py-16">
          <div className="container-page grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-bold text-white">About Me</h2>
              <h3 className="mt-6 text-lg font-semibold text-white">Problem Solver &amp; Builder</h3>
              {profile.biography && <p className="mt-3 text-slate-400">{profile.biography}</p>}
            </div>
            <dl className="grid grid-cols-2 gap-6 content-start lg:grid-cols-1">
              {currentEducation && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Education</dt>
                  <dd className="mt-1 text-slate-200">{currentEducation.degree}</dd>
                </div>
              )}
              {profile.current_status && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
                  <dd className="mt-1 text-slate-200">{profile.current_status}</dd>
                </div>
              )}
              {profile.location && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Location</dt>
                  <dd className="mt-1 text-slate-200">{profile.location}</dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      )}

      {projectsEnabled && (
        <section className="container-page py-16">
          <h2 className="font-display text-2xl font-bold text-white">Featured Project</h2>
          <div className="mt-8 max-w-xl">
            {featuredProject ? (
              <ProjectCard project={featuredProject} />
            ) : (
              <EmptyState title="No featured project yet" description="Mark a project as featured from the admin dashboard." />
            )}
          </div>
        </section>
      )}
    </>
  );
}
