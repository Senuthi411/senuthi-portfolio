'use client';

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="font-display text-2xl font-bold text-white">Something went wrong</p>
      <p className="mt-2 text-slate-400">Please try again in a moment.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
      >
        Try Again
      </button>
    </div>
  );
}
