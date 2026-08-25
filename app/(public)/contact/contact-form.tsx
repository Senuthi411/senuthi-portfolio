'use client';

import { useActionState } from 'react';
import { submitContactMessage, type ContactActionState } from './actions';

const initialState: ContactActionState = { success: false };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-6 text-center">
        <p className="font-medium text-white">Message sent</p>
        <p className="mt-1 text-sm text-slate-400">Thanks for reaching out — I&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Honeypot — hidden from real users via CSS, not display:none, to fool simpler bots less easily. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company_website">Company Website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-accent-500"
        />
        {state.fieldErrors?.name && <p className="mt-1 text-sm text-red-400">{state.fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-accent-500"
        />
        {state.fieldErrors?.email && <p className="mt-1 text-sm text-red-400">{state.fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-slate-300">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-accent-500"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-300">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-accent-500"
        />
        {state.fieldErrors?.message && <p className="mt-1 text-sm text-red-400">{state.fieldErrors.message}</p>}
      </div>

      {state.error && !state.fieldErrors && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
