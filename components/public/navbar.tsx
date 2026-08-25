'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/skills', label: 'Skills' },
  { href: '/education', label: 'Education' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar({ initials, resumeUrl }: { initials: string; resumeUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-base-950/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold text-white">
          {initials}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'border-b-2 border-transparent pb-1 text-sm text-slate-300 transition hover:text-white',
                  active && 'border-accent-500 text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-base-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-base-600"
            >
              Resume
            </a>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-base-950 md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col gap-1 py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-base-800 hover:text-white',
                  pathname === link.href && 'bg-base-800 text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-lg bg-base-700 px-3 py-2.5 text-center text-sm font-medium text-white"
              >
                Resume
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
