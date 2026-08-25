'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';

const initialState: LoginState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo ?? '/admin/dashboard'} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white focus:border-accent-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white focus:border-accent-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
