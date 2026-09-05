-- User preferences and automatic operational notifications/activity.

create table if not exists public.user_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email_notifications boolean not null default true,
  assignment_notifications boolean not null default true,
  attendance_notifications boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "users read own preferences" on public.user_preferences;
create policy "users read own preferences"
on public.user_preferences for select to authenticated
using (profile_id = auth.uid());

drop policy if exists "users create own preferences" on public.user_preferences;
create policy "users create own preferences"
on public.user_preferences for insert to authenticated
with check (profile_id = auth.uid());

drop policy if exists "users update own preferences" on public.user_preferences;
create policy "users update own preferences"
on public.user_preferences for update to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

drop trigger if exists user_preferences_updated on public.user_preferences;
create trigger user_preferences_updated
before update on public.user_preferences
for each row execute function public.set_updated_at();

insert into public.user_preferences (profile_id)
select id from public.profiles
on conflict (profile_id) do nothing;

create or replace function public.create_default_preferences()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_preferences(profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created_preferences on public.profiles;
create trigger on_profile_created_preferences
after insert on public.profiles
for each row execute function public.create_default_preferences();

create or replace function public.notify_assignment_published()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    insert into public.notifications(recipient_id, title, message, link)
    select
      student.profile_id,
      'New assignment: ' || new.title,
      'A new assignment is due on ' || to_char(new.due_at, 'Mon DD, YYYY HH12:MI AM'),
      '/assignments'
    from public.students as student
    left join public.user_preferences as preference on preference.profile_id = student.profile_id
    where student.batch_id = new.batch_id
      and coalesce(preference.assignment_notifications, true);
  end if;
  return new;
end;
$$;

drop trigger if exists assignments_publish_notifications on public.assignments;
create trigger assignments_publish_notifications
after insert or update of status on public.assignments
for each row execute function public.notify_assignment_published();

create or replace function public.notify_assignment_submission()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  assignment_owner uuid;
  assignment_title text;
begin
  select created_by, title into assignment_owner, assignment_title
  from public.assignments where id = new.assignment_id;
  insert into public.notifications(recipient_id, title, message, link)
  values (assignment_owner, 'Assignment submitted', assignment_title || ' has a new submission.', '/assignments');
  return new;
end;
$$;

drop trigger if exists assignment_submission_notifications on public.assignment_submissions;
create trigger assignment_submission_notifications
after insert on public.assignment_submissions
for each row execute function public.notify_assignment_submission();

create or replace function public.log_assignment_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.activity_logs(actor_id, action, entity_type, entity_id)
  values (
    auth.uid(),
    case when tg_op = 'INSERT' then 'assignment_created'
         when tg_op = 'UPDATE' then 'assignment_updated'
         else 'assignment_deleted' end,
    'assignment',
    coalesce(new.id, old.id)
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists assignments_activity on public.assignments;
create trigger assignments_activity
after insert or update or delete on public.assignments
for each row execute function public.log_assignment_activity();
