'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { updateProfile, type ProfileActionState } from './actions';
import { ImageUploader } from '@/components/admin/image-uploader';
import { STORAGE_BUCKETS, uploadFile } from '@/lib/supabase/storage';
import type { Profile } from '@/types/supabase';

const initialState: ProfileActionState = {};

function Field({
  label, name, defaultValue, type = 'text', textarea = false, error,
}: {
  label: string; name: string; defaultValue?: string | null; type?: string; textarea?: boolean; error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue ?? ''}
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white focus:border-accent-500"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue ?? ''}
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white focus:border-accent-500"
        />
      )}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [photoUrl, setPhotoUrl] = useState(profile?.profile_photo_url ?? '');
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url ?? '');
  const [resumeUploading, setResumeUploading] = useState(false);

  // Side effects belong in useEffect, not render — calling toast() directly
  // in the render body would re-fire on every subsequent re-render once
  // state.success is true, not just once after an actual save.
  const hasToasted = useRef(false);
  useEffect(() => {
    if (state.success && !hasToasted.current) {
      toast.success('Profile updated successfully');
      hasToasted.current = true;
    }
    if (!state.success) {
      hasToasted.current = false;
    }
  }, [state]);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    try {
      const { publicUrl } = await uploadFile(STORAGE_BUCKETS.resume, file, { kind: 'document' });
      setResumeUrl(publicUrl);
      toast.success('Resume uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setResumeUploading(false);
      e.target.value = '';
    }
  }

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="profile_photo_url" value={photoUrl} />
      <input type="hidden" name="resume_url" value={resumeUrl} />

      <section className="space-y-5">
        <h2 className="font-semibold text-white">Basic Information</h2>
        <ImageUploader
          bucket={STORAGE_BUCKETS.profile}
          value={photoUrl}
          onChange={setPhotoUrl}
          label="Profile Photo"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name" name="full_name" defaultValue={profile?.full_name} error={state.fieldErrors?.full_name} />
          <Field label="Professional Title" name="title" defaultValue={profile?.title} error={state.fieldErrors?.title} />
        </div>
        <Field label="Badge / Eyebrow Text" name="badge_text" defaultValue={profile?.badge_text} />
        <Field label="Hero Heading" name="hero_heading" defaultValue={profile?.hero_heading} />
        <Field label="Hero Description" name="hero_description" defaultValue={profile?.hero_description} textarea />
      </section>

      <section className="space-y-5 border-t border-white/5 pt-8">
        <h2 className="font-semibold text-white">About Me</h2>
        <Field label="Biography" name="biography" defaultValue={profile?.biography} textarea />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Location" name="location" defaultValue={profile?.location} />
          <Field label="Current Status" name="current_status" defaultValue={profile?.current_status} />
          <Field label="Current Focus" name="current_focus" defaultValue={profile?.current_focus} />
          <Field label="Interests" name="interests" defaultValue={profile?.interests} />
          <Field label="Degree" name="degree" defaultValue={profile?.degree} />
          <Field label="University" name="university" defaultValue={profile?.university} />
          <Field label="Public Email" name="public_email" type="email" defaultValue={profile?.public_email} error={state.fieldErrors?.public_email} />
          <Field label="Availability" name="availability" defaultValue={profile?.availability} />
        </div>
      </section>

      <section className="space-y-3 border-t border-white/5 pt-8">
        <h2 className="font-semibold text-white">Resume</h2>
        <div className="flex items-center gap-4">
          {resumeUrl ? (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-400 hover:text-accent-500">
              View current resume
            </a>
          ) : (
            <span className="text-sm text-slate-500">No resume uploaded</span>
          )}
          <label className="cursor-pointer text-sm text-slate-300 hover:text-white">
            {resumeUploading ? 'Uploading…' : resumeUrl ? 'Replace' : 'Upload PDF'}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} disabled={resumeUploading} />
          </label>
        </div>
      </section>

      {state.error && !state.fieldErrors && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="sticky bottom-0 -mx-5 border-t border-white/5 bg-base-950/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
