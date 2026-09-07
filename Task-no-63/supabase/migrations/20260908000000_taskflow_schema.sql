create extension if not exists "pgcrypto";

create type public.task_priority as enum ('low', 'medium', 'high');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  initials text generated always as (upper(left(regexp_replace(display_name, '[^A-Za-z ]', '', 'g'), 1))) stored,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'editor', 'member')),
  joined_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  color text not null default '#a7a8aa',
  position numeric not null default 0,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete restrict,
  assignee_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  priority public.task_priority not null default 'medium',
  due_date date,
  completed_at timestamptz,
  position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index boards_owner_id_idx on public.boards(owner_id);
create index board_members_user_id_idx on public.board_members(user_id);
create index lists_board_id_position_idx on public.lists(board_id, position);
create index tasks_list_id_position_idx on public.tasks(list_id, position);
create index tasks_assignee_id_idx on public.tasks(assignee_id);

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;
alter table public.lists enable row level security;
alter table public.tasks enable row level security;

create policy "Users can view their profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id);
create policy "Members can view boards" on public.boards for select using (owner_id = auth.uid() or exists (select 1 from public.board_members where board_id = boards.id and user_id = auth.uid()));
create policy "Owners can manage boards" on public.boards for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Members can view board membership" on public.board_members for select using (user_id = auth.uid() or exists (select 1 from public.boards where id = board_id and owner_id = auth.uid()));
create policy "Editors can manage lists" on public.lists for all using (exists (select 1 from public.boards b left join public.board_members bm on bm.board_id = b.id and bm.user_id = auth.uid() where b.id = lists.board_id and (b.owner_id = auth.uid() or bm.role in ('owner', 'editor')))) with check (exists (select 1 from public.boards b left join public.board_members bm on bm.board_id = b.id and bm.user_id = auth.uid() where b.id = lists.board_id and (b.owner_id = auth.uid() or bm.role in ('owner', 'editor'))));
create policy "Members can view tasks" on public.tasks for select using (exists (select 1 from public.lists l join public.boards b on b.id = l.board_id left join public.board_members bm on bm.board_id = b.id and bm.user_id = auth.uid() where l.id = tasks.list_id and (b.owner_id = auth.uid() or bm.user_id = auth.uid())));
create policy "Editors can manage tasks" on public.tasks for all using (exists (select 1 from public.lists l join public.boards b on b.id = l.board_id left join public.board_members bm on bm.board_id = b.id and bm.user_id = auth.uid() where l.id = tasks.list_id and (b.owner_id = auth.uid() or bm.role in ('owner', 'editor')))) with check (exists (select 1 from public.lists l join public.boards b on b.id = l.board_id left join public.board_members bm on bm.board_id = b.id and bm.user_id = auth.uid() where l.id = tasks.list_id and (b.owner_id = auth.uid() or bm.role in ('owner', 'editor'))));

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger boards_updated_at before update on public.boards for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
