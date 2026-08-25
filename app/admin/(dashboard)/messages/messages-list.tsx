'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Mail, MailOpen } from 'lucide-react';

import { markMessageRead, deleteMessage } from './actions';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/public/empty-state';

import type { Database } from '@/types/supabase';

type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];

export function MessagesList({
  messages,
}: {
  messages: ContactMessage[];
}) {
  const [items, setItems] = useState<ContactMessage[]>(messages);
  const [openId, setOpenId] = useState<string | null>(null);

  async function handleOpen(msg: ContactMessage) {
    const nowOpen =
      openId === msg.id ? null : msg.id;

    setOpenId(nowOpen);

    if (nowOpen && !msg.read) {
      setItems((previousItems) =>
        previousItems.map((message) =>
          message.id === msg.id
            ? {
                ...message,
                read: true,
              }
            : message
        )
      );

      await markMessageRead(msg.id, true);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No messages yet"
        description="Submissions from your Contact page will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((msg: ContactMessage) => (
        <div
          key={msg.id}
          className="rounded-xl border border-white/5 bg-base-800"
        >
          <button
            type="button"
            onClick={() => handleOpen(msg)}
            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {msg.read ? (
                <MailOpen
                  size={16}
                  className="shrink-0 text-slate-500"
                />
              ) : (
                <Mail
                  size={16}
                  className="shrink-0 text-accent-400"
                />
              )}

              <div className="overflow-hidden">
                <p
                  className={`truncate text-sm ${
                    msg.read
                      ? 'text-slate-300'
                      : 'font-semibold text-white'
                  }`}
                >
                  {msg.subject || '(No subject)'}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {msg.name} · {msg.email}
                </p>
              </div>
            </div>

            <span className="shrink-0 text-xs text-slate-500">
              {new Date(
                msg.created_at
              ).toLocaleDateString()}
            </span>
          </button>

          {openId === msg.id && (
            <div className="border-t border-white/5 px-4 py-4">
              <p className="whitespace-pre-line text-sm text-slate-300">
                {msg.message}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <a
                  href={`mailto:${msg.email}`}
                  className="text-sm text-accent-400 hover:text-accent-500"
                >
                  Reply by Email
                </a>

                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  }
                  title="Delete this message?"
                  description="This can't be undone."
                  onConfirm={async () => {
                    await deleteMessage(msg.id);

                    setItems(
                      (previousItems) =>
                        previousItems.filter(
                          (message) =>
                            message.id !== msg.id
                        )
                    );

                    toast.success(
                      'Message deleted'
                    );
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}