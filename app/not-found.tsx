import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-950 px-6 text-center">
      <p className="font-display text-6xl font-bold text-white">404</p>
      <p className="mt-3 text-slate-400">This page doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600">
        Back to Home
      </Link>
    </div>
  );
}
