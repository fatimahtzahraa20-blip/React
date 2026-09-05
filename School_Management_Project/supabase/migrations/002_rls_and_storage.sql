-- Authorization helpers
create or replace function public.has_role(requested_role public.app_role)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = auth.uid() and r.name = requested_role
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.has_role('super_admin') or public.has_role('admin');
$$;

grant execute on function public.has_role(public.app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.courses enable row level security;
alter table public.batches enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_batches enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_files enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.submission_files enable row level security;
alter table public.attendance enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

create policy "roles readable by authenticated" on public.roles for select to authenticated using (true);
create policy "roles managed by super admin" on public.roles for all to authenticated using (public.has_role('super_admin')) with check (public.has_role('super_admin'));

create policy "profiles visible to authenticated" on public.profiles for select to authenticated using (true);
create policy "own profile editable" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles managed by admins" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "own roles visible" on public.profile_roles for select to authenticated using (profile_id = auth.uid() or public.is_admin());
create policy "roles assigned by admins" on public.profile_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "courses readable" on public.courses for select to authenticated using (true);
create policy "courses managed by admins" on public.courses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "batches readable" on public.batches for select to authenticated using (true);
create policy "batches managed by admins" on public.batches for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "students visible to staff or self" on public.students for select to authenticated
using (public.is_admin() or public.has_role('teacher') or profile_id = auth.uid());
create policy "students managed by admins" on public.students for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "teachers visible to authenticated" on public.teachers for select to authenticated using (true);
create policy "teachers managed by admins" on public.teachers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "teacher batches readable" on public.teacher_batches for select to authenticated using (true);
create policy "teacher batches managed by admins" on public.teacher_batches for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "published assignments visible" on public.assignments for select to authenticated
using (status = 'published' or public.is_admin() or created_by = auth.uid());
create policy "assignments created by staff" on public.assignments for insert to authenticated
with check ((public.is_admin() or public.has_role('teacher')) and created_by = auth.uid());
create policy "assignments updated by owner or admin" on public.assignments for update to authenticated
using (created_by = auth.uid() or public.is_admin()) with check (created_by = auth.uid() or public.is_admin());
create policy "assignments deleted by owner or admin" on public.assignments for delete to authenticated
using (created_by = auth.uid() or public.is_admin());
create policy "assignment files readable" on public.assignment_files for select to authenticated using (true);
create policy "assignment files managed by staff" on public.assignment_files for all to authenticated
using (public.is_admin() or public.has_role('teacher')) with check (public.is_admin() or public.has_role('teacher'));

create policy "submissions visible to owner and staff" on public.assignment_submissions for select to authenticated
using (
  public.is_admin() or public.has_role('teacher') or
  exists(select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid())
);
create policy "students create own submissions" on public.assignment_submissions for insert to authenticated
with check (exists(select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid()));
create policy "submissions updated by owner or staff" on public.assignment_submissions for update to authenticated
using (
  public.is_admin() or public.has_role('teacher') or
  exists(select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid())
);
create policy "submission files follow submission access" on public.submission_files for select to authenticated
using (exists(select 1 from public.assignment_submissions sub where sub.id = submission_id));
create policy "submission files created by students" on public.submission_files for insert to authenticated
with check (exists(select 1 from public.assignment_submissions sub join public.students s on s.id = sub.student_id where sub.id = submission_id and s.profile_id = auth.uid()));

create policy "attendance visible to staff or student" on public.attendance for select to authenticated
using (
  public.is_admin() or public.has_role('teacher') or
  exists(select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid())
);
create policy "attendance marked by staff" on public.attendance for insert to authenticated
with check ((public.is_admin() or public.has_role('teacher')) and marked_by = auth.uid());
create policy "attendance updated by staff" on public.attendance for update to authenticated
using (public.is_admin() or public.has_role('teacher')) with check (public.is_admin() or public.has_role('teacher'));

create policy "own notifications visible" on public.notifications for select to authenticated using (recipient_id = auth.uid());
create policy "own notifications updateable" on public.notifications for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create policy "notifications created by staff" on public.notifications for insert to authenticated with check (public.is_admin() or public.has_role('teacher'));
create policy "activity visible to admins" on public.activity_logs for select to authenticated using (public.is_admin());
create policy "activity created by authenticated" on public.activity_logs for insert to authenticated with check (actor_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('assignment-files', 'assignment-files', false, 15728640, array['application/pdf','image/jpeg','image/png','image/webp']),
  ('submission-files', 'submission-files', false, 15728640, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "avatar images public" on storage.objects for select using (bucket_id = 'avatars');
create policy "users manage own avatar" on storage.objects for all to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assignment files readable by authenticated" on storage.objects for select to authenticated using (bucket_id = 'assignment-files');
create policy "staff manage assignment files" on storage.objects for all to authenticated
using (bucket_id = 'assignment-files' and (public.is_admin() or public.has_role('teacher')))
with check (bucket_id = 'assignment-files' and (public.is_admin() or public.has_role('teacher')));
create policy "submission files readable by authenticated" on storage.objects for select to authenticated using (bucket_id = 'submission-files');
create policy "students upload own submission files" on storage.objects for insert to authenticated
with check (bucket_id = 'submission-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "students manage own submission files" on storage.objects for update to authenticated
using (bucket_id = 'submission-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "students delete own submission files" on storage.objects for delete to authenticated
using (bucket_id = 'submission-files' and (storage.foldername(name))[1] = auth.uid()::text);
