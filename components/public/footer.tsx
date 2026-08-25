import Link from 'next/link';
import type { SocialLink } from '@/types/database';
import { Github, Linkedin, Youtube, Globe, ExternalLink } from 'lucide-react';

const ICONS: Record<string, any> = {
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
  medium: ExternalLink,
  website: Globe,
};

export function Footer({ fullName, socialLinks }: { fullName: string; socialLinks: SocialLink[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-base-950">
      <div className="container-page flex flex-col items-center gap-4 py-10 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/projects" className="hover:text-white">Projects</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          {socialLinks.map((link) => {
            const Icon = ICONS[link.platform.toLowerCase()] ?? ExternalLink;
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="text-slate-400 transition hover:text-white"
              >
                <Icon size={18} />
              </a>
            );
          })}
        </div>

        <p className="text-xs text-slate-500">
          © {year} {fullName}. Built with technical precision.
        </p>
      </div>
    </footer>
  );
}
