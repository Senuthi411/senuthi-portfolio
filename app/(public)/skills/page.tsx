import type { Metadata } from 'next';
import { getVisibleSkills } from '@/lib/data/public';
import { SectionHeading } from '@/components/public/section-heading';
import { EmptyState } from '@/components/public/empty-state';

export const metadata: Metadata = { title: 'Skills' };
export const revalidate = 0;

export default async function SkillsPage() {
  const groups = await getVisibleSkills();

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Skills" title="Skills & Tools" />

      {groups.length === 0 ? (
        <EmptyState title="No skills listed yet" description="Skills added from the admin dashboard will appear here." />
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-white/5 bg-base-800 p-6">
              <h3 className="font-display text-lg font-bold text-white">{group.name}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li key={skill.id} className="rounded-full bg-base-700 px-3 py-1 text-sm text-slate-300">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
