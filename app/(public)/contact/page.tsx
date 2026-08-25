import type { Metadata } from 'next';
import { getProfile } from '@/lib/data/public';
import { SectionHeading } from '@/components/public/section-heading';
import { ContactForm } from './contact-form';
import { Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = { title: 'Contact' };
export const revalidate = 0;

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Contact" title="Get In Touch" description="Have a question or want to collaborate? Send a message." />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <ContactForm />
        </div>

        <div className="space-y-4">
          {profile?.public_email && (
            <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-base-800 p-5">
              <Mail size={18} className="mt-0.5 text-accent-400" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                <a href={`mailto:${profile.public_email}`} className="text-slate-200 hover:text-white">
                  {profile.public_email}
                </a>
              </div>
            </div>
          )}
          {profile?.location && (
            <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-base-800 p-5">
              <MapPin size={18} className="mt-0.5 text-accent-400" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
                <p className="text-slate-200">{profile.location}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
