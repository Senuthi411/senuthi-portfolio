import { Navbar } from '@/components/public/navbar';
import { Footer } from '@/components/public/footer';
import { getProfile, getEnabledSocialLinks } from '@/lib/data/public';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [profile, socialLinks] = await Promise.all([getProfile(), getEnabledSocialLinks()]);

  const initials =
    profile?.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() + '.' || 'SY.';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar initials={initials} resumeUrl={profile?.resume_url} />
      <main className="flex-1">{children}</main>
      <Footer fullName={profile?.full_name ?? 'Senuthi Yuhansa'} socialLinks={socialLinks} />
    </div>
  );
}
