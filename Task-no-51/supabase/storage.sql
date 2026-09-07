-- Run once in the Supabase SQL editor. This bucket is private.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/webp'])
on conflict (id) do nothing;
-- No client write policies are needed: the authenticated Express API uses
-- a server-only service-role key and derives object paths from verified users.
