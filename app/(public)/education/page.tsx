import type { Metadata } from 'next';
import { getVisibleEducation, getVisibleCertifications } from '@/lib/data/public';
import { SectionHeading } from '@/components/public/section-heading';
import { EmptyState } from '@/components/public/empty-state';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Education' };
export const revalidate = 0;

export default async function EducationPage() {
  const [education, certifications] = await Promise.all([getVisibleEducation(), getVisibleCertifications()]);

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Education" title="Education & Certifications" />

      <div className="space-y-4">
        {education.length === 0 ? (
          <EmptyState title="No education entries yet" />
        ) : (
          education.map((edu) => (
            <div key={edu.id} className="rounded-2xl border border-white/5 bg-base-800 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-white">{edu.degree}</h3>
                <span className="text-sm text-slate-500">
                  {formatDate(edu.start_date, { monthYearOnly: true })}
                  {' – '}
                  {edu.currently_studying ? 'Present' : formatDate(edu.end_date, { monthYearOnly: true })}
                </span>
              </div>
              <p className="mt-1 text-slate-400">{edu.institution}</p>
              {edu.description && <p className="mt-3 text-sm text-slate-400">{edu.description}</p>}
            </div>
          ))
        )}
      </div>

      {certifications.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold text-white">Certifications</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <div key={cert.id} className="rounded-2xl border border-white/5 bg-base-800 p-5">
                <h3 className="font-semibold text-white">{cert.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{cert.organization}</p>
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-accent-400 hover:text-accent-500">
                    View Credential →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
