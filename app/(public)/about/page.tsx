import type { Metadata } from 'next';
import { getProfile } from '@/lib/data/public';
import { SectionHeading } from '@/components/public/section-heading';

export const metadata: Metadata = { title: 'About' };
export const revalidate = 0;

export default async function AboutPage() {
  const profile = await getProfile();

  const fields = [
    { label: 'Degree', value: profile?.degree },
    { label: 'University', value: profile?.university },
    { label: 'Current Focus', value: profile?.current_focus },
    { label: 'Interests', value: profile?.interests },
    { label: 'Location', value: profile?.location },
    { label: 'Availability', value: profile?.availability },
  ].filter((f) => f.value);

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="About" title={`About ${profile?.full_name ?? ''}`} />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {profile?.biography ? (
            <p className="whitespace-pre-line text-lg leading-relaxed text-slate-300">{profile.biography}</p>
          ) : (
            <p className="text-slate-500">Biography coming soon.</p>
          )}
        </div>

        {fields.length > 0 && (
          <dl className="space-y-6 rounded-2xl border border-white/5 bg-base-800 p-6 h-fit">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs uppercase tracking-wide text-slate-500">{f.label}</dt>
                <dd className="mt-1 text-slate-200">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
