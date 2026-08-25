import { createClient } from '@/lib/supabase/server';
import { MessagesList } from './messages-list';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Messages</h1>
      <p className="mt-1 text-slate-400">Submissions from your public Contact form.</p>
      <div className="mt-8 max-w-2xl">
        <MessagesList messages={messages ?? []} />
      </div>
    </div>
  );
}
