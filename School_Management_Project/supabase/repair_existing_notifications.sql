-- Compatibility repair for an existing legacy public.notifications table.
-- Existing rows and legacy columns are preserved.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid()
);

alter table public.notifications
  add column if not exists recipient_id uuid;
alter table public.notifications
  add column if not exists title text;
alter table public.notifications
  add column if not exists message text;
alter table public.notifications
  add column if not exists link text;
alter table public.notifications
  add column if not exists read_at timestamptz;
alter table public.notifications
  add column if not exists created_at timestamptz not null default now();

-- Copy a legacy user_id column when it exists and is UUID-compatible.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notifications'
      and column_name = 'user_id'
      and data_type = 'uuid'
  ) then
    execute '
      update public.notifications
      set recipient_id = user_id
      where recipient_id is null
    ';
  end if;
end;
$$;

-- Convert a legacy is_read flag to a timestamp without removing the old field.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notifications'
      and column_name = 'is_read'
      and data_type = 'boolean'
  ) then
    execute '
      update public.notifications
      set read_at = coalesce(read_at, created_at, now())
      where is_read = true and read_at is null
    ';
  end if;
end;
$$;

update public.notifications
set title = 'Notification'
where title is null or btrim(title) = '';

update public.notifications
set message = 'No additional details'
where message is null or btrim(message) = '';

alter table public.notifications alter column title set not null;
alter table public.notifications alter column message set not null;

-- Add the profile foreign key only once.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_recipient_id_fkey'
      and conrelid = 'public.notifications'::regclass
  ) then
    alter table public.notifications
      add constraint notifications_recipient_id_fkey
      foreign key (recipient_id)
      references public.profiles(id)
      on delete cascade
      not valid;
  end if;
end;
$$;

create index if not exists notifications_recipient_idx
  on public.notifications(recipient_id, created_at desc);
