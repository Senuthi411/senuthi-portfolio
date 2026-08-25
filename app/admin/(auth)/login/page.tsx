import { LoginForm } from './login-form';
export const dynamic = 'force-dynamic';

// No public signup exists anywhere in this app — this admin is
// provisioned for a single owner via the Supabase dashboard.
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-6">
      <div className="w-full max-w-sm">
        <p className="mb-1 font-display text-xl font-bold text-white">SY. Admin</p>
        <p className="mb-8 text-sm text-slate-500">Sign in to manage your portfolio.</p>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
