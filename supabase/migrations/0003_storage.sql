-- ============================================================================
-- Storage buckets. All buckets are public-read (portfolio images need to be
-- viewable by anyone) but writes are restricted to authenticated admin.
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('profile-images', 'profile-images', true),
  ('project-covers', 'project-covers', true),
  ('project-gallery', 'project-gallery', true),
  ('certificates', 'certificates', true),
  ('resume', 'resume', true),
  ('diagrams', 'diagrams', true)
on conflict (id) do nothing;

-- Public read on every bucket above
create policy "public read profile-images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'profile-images');
create policy "public read project-covers"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'project-covers');
create policy "public read project-gallery"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'project-gallery');
create policy "public read certificates"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'certificates');
create policy "public read resume"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'resume');
create policy "public read diagrams"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'diagrams');

-- Authenticated admin can write/update/delete in every bucket above
create policy "admin write profile-images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-images');
create policy "admin update profile-images"
  on storage.objects for update to authenticated
  using (bucket_id = 'profile-images');
create policy "admin delete profile-images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'profile-images');

create policy "admin write project-covers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-covers');
create policy "admin update project-covers"
  on storage.objects for update to authenticated
  using (bucket_id = 'project-covers');
create policy "admin delete project-covers"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-covers');

create policy "admin write project-gallery"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-gallery');
create policy "admin update project-gallery"
  on storage.objects for update to authenticated
  using (bucket_id = 'project-gallery');
create policy "admin delete project-gallery"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-gallery');

create policy "admin write certificates"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'certificates');
create policy "admin update certificates"
  on storage.objects for update to authenticated
  using (bucket_id = 'certificates');
create policy "admin delete certificates"
  on storage.objects for delete to authenticated
  using (bucket_id = 'certificates');

create policy "admin write resume"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'resume');
create policy "admin update resume"
  on storage.objects for update to authenticated
  using (bucket_id = 'resume');
create policy "admin delete resume"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resume');

create policy "admin write diagrams"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'diagrams');
create policy "admin update diagrams"
  on storage.objects for update to authenticated
  using (bucket_id = 'diagrams');
create policy "admin delete diagrams"
  on storage.objects for delete to authenticated
  using (bucket_id = 'diagrams');
