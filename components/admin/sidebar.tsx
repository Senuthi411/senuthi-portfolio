'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, User, FolderKanban, Sparkles, GraduationCap,
  Award, Share2, Settings, Menu, X, ExternalLink, LogOut, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/admin/(auth)/login/actions';

const NAV = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/skills', label: 'Skills', icon: Sparkles },
  { href: '/admin/education', label: 'Education', icon: GraduationCap },
  { href: '/admin/certifications', label: 'Certifications', icon: Award },
  { href: '/admin/social-links', label: 'Social Links', icon: Share2 },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/settings/sections', label: 'Settings', icon: Settings },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <p className="font-display text-lg font-bold text-white">SY. Admin</p>
        <p className="text-xs text-slate-500">Portfolio Manager</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-base-800 hover:text-white',
                active && 'bg-base-800 text-white'
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/5 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-base-800 hover:text-white"
        >
          <ExternalLink size={17} />
          View Live Site
        </a>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-base-800 hover:text-white"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-base-900 px-4 py-3 lg:hidden">
        <p className="font-display font-bold text-white">SY. Admin</p>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-slate-300">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-base-900">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 text-slate-300">
              <X size={20} />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-base-900 lg:block">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}
