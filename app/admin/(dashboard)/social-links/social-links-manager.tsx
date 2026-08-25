'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import {
  upsertSocialLink,
  deleteSocialLink,
} from './actions';

import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/public/empty-state';

import type { Database } from '@/types/supabase';

type SocialLink =
  Database['public']['Tables']['social_links']['Row'];

const PLATFORMS = [
  'GitHub',
  'LinkedIn',
  'Medium',
  'YouTube',
  'Website',
  'Other',
];

function LinkModal({
  link,
  onClose,
}: {
  link?: SocialLink;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);

    if (link) {
      formData.set('id', link.id);
    }

    const result = await upsertSocialLink(formData);

    setPending(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Social link saved');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <form
        action={handleSubmit}
        className="relative w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-base-900 p-6"
      >
        <h3 className="font-semibold text-white">
          {link ? 'Edit Link' : 'Add Social Link'}
        </h3>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Platform
          </label>

          <select
            name="platform"
            defaultValue={
              link?.platform ?? PLATFORMS[0].toLowerCase()
            }
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          >
            {PLATFORMS.map((platform) => (
              <option
                key={platform}
                value={platform.toLowerCase()}
              >
                {platform}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            URL
          </label>

          <input
            name="url"
            type="url"
            required
            defaultValue={link?.url ?? ''}
            placeholder="https://"
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Display Order
          </label>

          <input
            name="display_order"
            type="number"
            defaultValue={link?.display_order ?? 0}
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={link?.enabled ?? true}
            className="h-4 w-4 rounded border-white/20 bg-base-800"
          />

          Enabled
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-base-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function SocialLinksManager({
  links,
}: {
  links: SocialLink[];
}) {
  const [modal, setModal] = useState<{
    open: boolean;
    link?: SocialLink;
  }>({
    open: false,
  });

  function refresh() {
    window.location.reload();
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          <Plus size={16} />
          Add Link
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {links.length === 0 ? (
          <EmptyState title="No social links yet" />
        ) : (
          links.map((link: SocialLink) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-base-800 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium capitalize text-white">
                  {link.platform}
                </p>

                <p className="max-w-sm truncate text-sm text-slate-400">
                  {link.url}
                  {!link.enabled && ' · disabled'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      open: true,
                      link,
                    })
                  }
                  className="text-slate-400 hover:text-white"
                  aria-label={`Edit ${link.platform}`}
                >
                  <Pencil size={16} />
                </button>

                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-400"
                      aria-label={`Delete ${link.platform}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  }
                  title="Delete this link?"
                  description="This can't be undone."
                  onConfirm={async () => {
                    const result = await deleteSocialLink(
                      link.id
                    );

                    if (result?.error) {
                      toast.error(result.error);
                      return;
                    }

                    toast.success('Link deleted');
                    refresh();
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {modal.open && (
        <LinkModal
          link={modal.link}
          onClose={() => {
            setModal({ open: false });
            refresh();
          }}
        />
      )}
    </div>
  );
}